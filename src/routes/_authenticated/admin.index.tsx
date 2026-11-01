import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, Clock, MessageSquare, Star, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery } from "@/lib/account";
import { MODULES, canManage } from "@/lib/admin-config";
import { todayInClinic, fmtTime } from "@/lib/time";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { name: "description", content: "Clinic appointments and staff overview at M'brace." },
      { property: "og:title", content: "Staff Overview | M'brace Dental Clinic" },
      { property: "og:description", content: "Clinic appointments and staff overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Staff Dashboard | M'brace Dental Clinic" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overview,
});

const count = async (table: string, filter?: (q: any) => any) => {
  let q = supabase.from(table as never).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
};

function Overview() {
  const { data: a } = useSuspenseQuery(accountQuery);
  const roles = a?.roles ?? [];
  const today = todayInClinic();

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats", today],
    queryFn: async () => {
      const [total, todayCount, pending, confirmed, patients, enquiries, pendingUsers, pendingReviews] = await Promise.all([
        count("appointments"),
        count("appointments", (q) => q.eq("appointment_date", today)),
        count("appointments", (q) => q.eq("status", "pending")),
        count("appointments", (q) => q.eq("status", "confirmed")),
        count("patients"),
        count("enquiries", (q) => q.eq("status", "new")),
        count("profiles", (q) => q.eq("status", "pending")),
        count("testimonials", (q) => q.eq("status", "pending")),
      ]);
      return { total, todayCount, pending, confirmed, patients, enquiries, pendingUsers, pendingReviews };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin", "recent-appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id,name,appointment_date,start_time,status")
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Total appointments", value: stats?.total, icon: CalendarCheck },
    { label: "Today's appointments", value: stats?.todayCount, icon: CalendarCheck },
    { label: "Pending requests", value: stats?.pending, icon: Clock },
    { label: "Confirmed", value: stats?.confirmed, icon: CalendarCheck },
    { label: "Patient records", value: stats?.patients, icon: Users },
    { label: "New enquiries", value: stats?.enquiries, icon: MessageSquare },
    { label: "Users awaiting approval", value: stats?.pendingUsers, icon: Users },
    { label: "Reviews awaiting approval", value: stats?.pendingReviews, icon: Star },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Welcome{a?.profile?.full_name ? `, ${a.profile.full_name}` : ""}</h1>
        <p className="mt-1 text-muted-foreground">Clinic overview for {today}.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-surface flex items-center gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><c.icon className="size-5" /></span>
            <div>
              <p className="text-2xl font-semibold text-heading">{c.value ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Recent appointments</h2>
            {canManage(roles, MODULES["appointments"]!) && (
              <Button asChild variant="link" className="px-0"><Link to="/admin/$section" params={{ section: "appointments" }}>Manage <ArrowRight /></Link></Button>
            )}
          </div>
          {recent && recent.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground">{r.appointment_date} · {fmtTime(r.start_time)}</span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{r.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No appointments yet.</p>
          )}
        </section>
        <section className="card-surface p-6">
          <h2 className="text-xl">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {canManage(roles, MODULES["appointments"]!) && <Button asChild variant="outline"><Link to="/admin/$section" params={{ section: "appointments" }}>Appointments</Link></Button>}
            {canManage(roles, MODULES["enquiries"]!) && <Button asChild variant="outline"><Link to="/admin/$section" params={{ section: "enquiries" }}>Enquiries</Link></Button>}
            {canManage(roles, MODULES["testimonials"]!) && <Button asChild variant="outline"><Link to="/admin/$section" params={{ section: "testimonials" }}>Reviews</Link></Button>}
            {roles.includes("super_admin") && <Button asChild variant="outline"><Link to="/admin/$section" params={{ section: "users" }}>User approvals</Link></Button>}
            {roles.includes("super_admin") && <Button asChild variant="outline"><Link to="/admin/$section" params={{ section: "content" }}>Website content</Link></Button>}
          </div>
        </section>
      </div>
    </div>
  );
}
