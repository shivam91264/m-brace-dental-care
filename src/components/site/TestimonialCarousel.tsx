import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Item = { id: string; name: string; content: string; rating: number | null; review_date: string | null };

export function TestimonialCarousel({ items, autoplay = true, interval = 6 }: { items: Item[]; autoplay?: boolean; interval?: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = (card?.offsetWidth ?? el.clientWidth) + 24;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir === -1 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * w, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!autoplay || paused || reduced || items.length < 2) return;
    const id = window.setInterval(() => step(1), Math.max(3, interval) * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, paused, reduced, interval, items.length, step]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Patient testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div ref={track} className="-mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((t, i) => (
          <figure
            key={t.id}
            data-card
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="card-surface flex w-[85%] shrink-0 snap-start flex-col p-7 sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
          >
            <Quote className="size-7 text-primary/40" aria-hidden />
            {t.rating ? (
              <div className="mt-3 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={s < (t.rating ?? 0) ? "size-4 fill-warning text-warning" : "size-4 text-border"} aria-hidden />
                ))}
              </div>
            ) : null}
            <blockquote className="mt-4 flex-1 leading-relaxed">“{t.content}”</blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="font-semibold text-heading">{t.name}</span>
              {t.review_date && <span className="text-muted-foreground"> · {new Date(t.review_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-3">
          <Button type="button" variant="outline" size="icon" onClick={() => step(-1)} aria-label="Previous testimonial"><ChevronLeft className="size-5" /></Button>
          <Button type="button" variant="outline" size="icon" onClick={() => step(1)} aria-label="Next testimonial"><ChevronRight className="size-5" /></Button>
        </div>
      )}
    </div>
  );
}
