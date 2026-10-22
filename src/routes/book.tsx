import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { dentistsQuery, servicesQuery, useSite } from "@/lib/queries";
import { addDays, availableSlots, fmtTime, todayInClinic } from "@/lib/time";
import { PageHeader } from "@/components/site/site-ui";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>) => ({ service: typeof s["service"] === "string" ? s["service"] : undefined }),
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(servicesQuery), q.ensureQueryData(dentistsQuery)]),
  head: () => ({
    meta: [
      { title: "Book an Appointment | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Request a dental appointment online at M'brace Multi Speciality Dental Clinic." },
      { property: "og:title", content: "Book an Appointment | M'brace Dental Clinic" },
      { property: "og:description", content: "Choose a service, date and time." },
    ],
  }),
  component: Book,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, "Please enter a valid phone number"),
  message: z.string().max(1000).optional(),
});

function Book() {
  const search = Route.useSearch();
  const { booking } = useSite();
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: dentists } = useSuspenseQuery(dentistsQuery);
  const [service, setService] = useState(search.service ?? "");
  const [dentist, setDentist] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const today = todayInClinic();

  const booked = useQuery({
    queryKey: ["booked", date, dentist],
    enabled: !!date,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_booked_slots", { p_date: date, p_dentist: dentist || undefined });
      if (error) throw error;
      return (data ?? []).map((r: { start_time: string }) => r.start_time);
    },
  });
  const slots = date && booked.data ? availableSlots(booking, date, booked.data) : [];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check the form"); return; }
    if (!date || !time) { toast.error("Please choose a date and time"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("book_appointment", {
      p_service: service || undefined, p_dentist: dentist || undefined, p_date: date, p_time: time,
      p_name: parsed.data.name, p_email: parsed.data.email, p_phone: parsed.data.phone, p_message: parsed.data.message ?? "",
    } as never);
    setBusy(false);
    if (error) { toast.error(error.message); booked.refetch(); return; }
    setDone(true);
  }

  if (done) {
    return (
      <section className="section-y container-page max-w-xl text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h1 className="mt-4 text-3xl">Request received</h1>
        <p className="mt-3 text-muted-foreground">Your appointment request for {date} at {fmtTime(time)} is <strong>pending</strong>. The clinic will contact you to confirm.</p>
      </section>
    );
  }

  const sel = "mt-1.5 h-10 w-full rounded-md border border-border bg-card px-3 text-sm";
  return (
    <>
      <PageHeader eyebrow="Appointments" title="Book an appointment" text="No account needed. Your request stays pending until the clinic confirms it." />
      <section className="section-y container-page max-w-3xl">
        <form onSubmit={submit} className="card-surface grid gap-4 p-6 sm:grid-cols-2 md:p-8">
          <div><Label htmlFor="b-svc">Service</Label>
            <select id="b-svc" className={sel} value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">Not sure / general check-up</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select></div>
          <div><Label htmlFor="b-den">Dentist</Label>
            <select id="b-den" className={sel} value={dentist} onChange={(e) => { setDentist(e.target.value); setTime(""); }}>
              <option value="">No preference</option>
              {dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <div className="sm:col-span-2"><Label htmlFor="b-date">Date</Label>
            <Input id="b-date" type="date" min={today} max={addDays(today, booking.max_days_ahead ?? 60)} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} className="mt-1.5" /></div>
          {date && (
            <div className="sm:col-span-2">
              <p className="text-sm font-medium">Available times</p>
              {booked.isLoading ? <p className="mt-2 text-sm text-muted-foreground">Loading…</p> : slots.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No times available on this date. Please choose another day.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button key={s} type="button" onClick={() => setTime(s)} aria-pressed={time === s}
                      className={time === s ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm text-primary-foreground" : "rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-accent"}>{fmtTime(s)}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div><Label htmlFor="b-name">Full name</Label><Input id="b-name" name="name" autoComplete="name" required className="mt-1.5" /></div>
          <div><Label htmlFor="b-phone">Phone</Label><Input id="b-phone" name="phone" type="tel" autoComplete="tel" required className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label htmlFor="b-email">Email</Label><Input id="b-email" name="email" type="email" autoComplete="email" required className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label htmlFor="b-msg">Message (optional)</Label><Textarea id="b-msg" name="message" rows={3} maxLength={1000} className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Button type="submit" variant="hero" size="lg" disabled={busy}>{busy ? "Submitting…" : "Request appointment"}</Button></div>
        </form>
      </section>
    </>
  );
}
