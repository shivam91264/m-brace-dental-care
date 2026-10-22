import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Navigation } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSite } from "@/lib/queries";
import { ContactDetails, PageHeader } from "@/components/site/site-ui";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Find M'brace Multi Speciality Dental Clinic near Dhange Hospital, Bhiwandi. Send us a message or get directions." },
      { property: "og:title", content: "Contact M'brace Dental Clinic" },
      { property: "og:description", content: "Address, timings, directions and contact form." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).regex(/^[0-9+\-\s()]*$/, "Please enter a valid phone number").optional(),
  message: z.string().trim().min(5, "Please write a short message").max(2000),
});

function Contact() {
  const { clinic } = useSite();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("enquiries").insert({ ...parsed.data, phone: parsed.data.phone || null });
    setBusy(false);
    if (error) { toast.error(error.message.includes("Too many") ? error.message : "Sorry, your message could not be sent. Please try again."); return; }
    setSent(true);
  }

  const field = (name: string, label: string, el: React.ReactNode) => (
    <div>
      <Label htmlFor={`c-${name}`}>{label}</Label>
      <div className="mt-1.5">{el}</div>
      {errors[name] && <p id={`c-${name}-err`} className="mt-1 text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you" text="Send a message and the clinic team will get back to you." />
      <section className="section-y container-page grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <div className="card-surface p-6"><ContactDetails /></div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero"><a href={clinic.maps_url} target="_blank" rel="noopener noreferrer"><Navigation />Get directions</a></Button>
            <Button asChild variant="heroOutline"><Link to="/book">Book Appointment</Link></Button>
          </div>
          {!clinic.phone && !clinic.email && <p className="text-sm text-muted-foreground">Phone and email details will be added soon. Please use the form to reach us.</p>}
        </div>
        <div className="card-surface p-6 md:p-8">
          {sent ? (
            <div className="py-10 text-center" role="status">
              <CheckCircle2 className="mx-auto size-10 text-success" />
              <h2 className="mt-4 text-2xl">Message received</h2>
              <p className="mt-2 text-muted-foreground">Thank you for contacting us. The clinic will reply as soon as possible.</p>
              <Button variant="outline" className="mt-6 rounded-full" onClick={() => setSent(false)}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              {field("name", "Name", <Input id="c-name" name="name" autoComplete="name" maxLength={100} aria-invalid={!!errors["name"]} />)}
              {field("email", "Email", <Input id="c-email" name="email" type="email" autoComplete="email" maxLength={255} aria-invalid={!!errors["email"]} />)}
              <div className="sm:col-span-2">{field("phone", "Phone (optional)", <Input id="c-phone" name="phone" type="tel" autoComplete="tel" maxLength={20} />)}</div>
              <div className="sm:col-span-2">{field("message", "Message", <Textarea id="c-message" name="message" rows={6} maxLength={2000} aria-invalid={!!errors["message"]} />)}</div>
              <div className="sm:col-span-2"><Button type="submit" variant="hero" size="lg" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button></div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
