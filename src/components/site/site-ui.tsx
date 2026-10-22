import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Moon, Phone, Smile, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSite } from "@/lib/queries";
import { DAYS } from "@/lib/types";
import { fmtTime } from "@/lib/time";

export function Logo({ compact = false }: { compact?: boolean }) {
  const { clinic } = useSite();
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${clinic.name} home`}>
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Smile className="size-5" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-xl text-heading">{clinic.short_name || "M'brace"}</span>
        {!compact && <span className="block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">Multi Speciality Dental Clinic</span>}
      </span>
    </Link>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme-mode", next ? "dark" : "light"); } catch { /* ignore */ }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn("grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground", className)}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function PageHeader({ eyebrow, title, text, children }: { eyebrow?: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-border bg-muted">
      <div className="container-page py-14 md:py-20 fade-up">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{text}</p>}
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, text, center }: { eyebrow?: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}

export function Paragraphs({ text, className }: { text?: string | null; className?: string }) {
  if (!text) return null;
  return (
    <div className={cn("space-y-4 leading-relaxed", className)}>
      {text.split(/\n{2,}/).map((p, i) => {
        const lines = p.split("\n");
        if (lines.length > 1 && lines[0]!.length < 60) {
          return (
            <div key={i}>
              <h3 className="font-sans text-base font-semibold text-heading">{lines[0]}</h3>
              <p className="mt-1">{lines.slice(1).join(" ")}</p>
            </div>
          );
        }
        return <p key={i}>{p}</p>;
      })}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="card-surface mx-auto max-w-lg p-10 text-center">
      <Smile className="mx-auto size-8 text-primary" aria-hidden />
      <p className="mt-3 font-semibold text-heading">{title}</p>
      {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function HoursList() {
  const { booking, clinic } = useSite();
  if (!booking.hours_confirmed) {
    return <p className="text-sm text-muted-foreground">{clinic.hours_note || "Opens at 10:30 AM."}</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {DAYS.map(([k, label]) => {
        const d = booking.hours?.[k];
        return (
          <li key={k} className="flex justify-between gap-6">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{d?.open ? `${fmtTime(d.start)} – ${fmtTime(d.end)}` : "Closed"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ContactDetails() {
  const { clinic } = useSite();
  return (
    <ul className="space-y-4 text-sm">
      <li className="flex gap-3">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>{clinic.address}</span>
      </li>
      {clinic.phone && (
        <li className="flex gap-3">
          <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <a href={`tel:${clinic.phone.replace(/\s/g, "")}`} className="hover:text-primary">{clinic.phone}</a>
        </li>
      )}
      {clinic.email && (
        <li className="flex gap-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <a href={`mailto:${clinic.email}`} className="hover:text-primary">{clinic.email}</a>
        </li>
      )}
      <li className="flex gap-3">
        <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div className="flex-1"><HoursList /></div>
      </li>
    </ul>
  );
}
