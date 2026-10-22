import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, UserRound } from "lucide-react";
import type { Dentist, Service } from "@/lib/types";

export function ServiceCard({ s }: { s: Pick<Service, "slug" | "title" | "short_description" | "image_url" | "price" | "duration"> }) {
  return (
    <Link to="/services/$slug" params={{ slug: s.slug }} className="card-surface hover-lift group flex flex-col overflow-hidden">
      {s.image_url ? (
        <img src={s.image_url} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
      ) : (
        <div className="grid aspect-[16/10] place-items-center bg-accent text-accent-foreground"><Sparkles className="size-8" aria-hidden /></div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-sans text-lg font-semibold">{s.title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.short_description}</p>
        {(s.price || s.duration) && (
          <p className="mt-3 text-xs text-muted-foreground">{[s.price, s.duration].filter(Boolean).join(" · ")}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

export function DentistCard({ d, full = false }: { d: Dentist; full?: boolean }) {
  return (
    <article className="card-surface overflow-hidden">
      {d.photo_url ? (
        <img src={d.photo_url} alt={`Portrait of ${d.name}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-accent text-accent-foreground"><UserRound className="size-12" aria-hidden /></div>
      )}
      <div className="p-6">
        <h3 className="font-sans text-lg font-semibold">{d.name}</h3>
        {d.designation && <p className="text-sm text-primary">{d.designation}</p>}
        {d.qualifications && <p className="mt-1 text-sm text-muted-foreground">{d.qualifications}</p>}
        {full && (
          <dl className="mt-4 space-y-2 text-sm">
            {d.specialization && <div><dt className="font-medium text-heading">Specialization</dt><dd className="text-muted-foreground">{d.specialization}</dd></div>}
            {d.languages && <div><dt className="font-medium text-heading">Languages</dt><dd className="text-muted-foreground">{d.languages}</dd></div>}
            {d.consultation_hours && <div><dt className="font-medium text-heading">Consultation hours</dt><dd className="text-muted-foreground">{d.consultation_hours}</dd></div>}
          </dl>
        )}
        {full && d.bio && <p className="mt-4 text-sm leading-relaxed">{d.bio}</p>}
      </div>
    </article>
  );
}
