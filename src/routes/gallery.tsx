import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { galleryQuery } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/site/site-ui";
import { Lightbox } from "@/components/site/Lightbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: () => ({
    meta: [
      { title: "Gallery | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Photos of our clinic, team, facilities and consented before-and-after treatment results." },
      { property: "og:title", content: "Clinic Gallery | M'brace Dental Clinic" },
      { property: "og:description", content: "Take a look inside our clinic." },
    ],
  }),
  component: Gallery,
});

const CATS = [["all", "All"], ["clinic", "Clinic"], ["team", "Team"], ["facilities", "Facilities"], ["before-after", "Before & After"]] as const;
const PAGE = 12;

function Gallery() {
  const { data } = useSuspenseQuery(galleryQuery);
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const filtered = cat === "all" ? data : data.filter((g) => g.category === cat);
  const shown = filtered.slice(0, limit);
  return (
    <>
      <PageHeader eyebrow="Gallery" title="Inside M'brace" text="Patient photographs are published only with consent." />
      <section className="section-y container-page">
        <div role="tablist" aria-label="Filter images" className="flex flex-wrap gap-2">
          {CATS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={cat === k} onClick={() => { setCat(k); setLimit(PAGE); }}
              className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", cat === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent")}>
              {l}
            </button>
          ))}
        </div>
        {shown.length === 0 ? <div className="mt-10"><EmptyState title="No photos in this category yet" /></div> : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((g, i) => (
              <button key={g.id} onClick={() => setOpen(i)} className="group overflow-hidden rounded-2xl" aria-label={`Open ${g.title || "image"}`}>
                <img src={g.image_url} alt={g.alt || g.title} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </button>
            ))}
          </div>
        )}
        {filtered.length > limit && (
          <div className="mt-8 text-center"><button onClick={() => setLimit(limit + PAGE)} className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium hover:bg-accent">Load more</button></div>
        )}
        <Lightbox images={shown} index={open} onChange={setOpen} />
      </section>
    </>
  );
}
