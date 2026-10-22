import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { testimonialsQuery } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/site/site-ui";

export const Route = createFileRoute("/testimonials")({
  loader: ({ context }) => context.queryClient.ensureQueryData(testimonialsQuery),
  head: () => ({
    meta: [
      { title: "Patient Reviews | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Read approved reviews from patients of M'brace Multi Speciality Dental Clinic, or share your own experience." },
      { property: "og:title", content: "Patient Reviews | M'brace Dental Clinic" },
      { property: "og:description", content: "Approved patient testimonials." },
    ],
  }),
  component: Testimonials,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter a display name").max(80),
  content: z.string().trim().min(10, "Please write at least a few words").max(1500),
});

function Testimonials() {
  const { data } = useSuspenseQuery(testimonialsQuery);
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(fd);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("testimonials").insert({ ...parsed.data, rating, review_date: new Date().toISOString().slice(0, 10) });
    setBusy(false);
    if (error) return toast.error(error.message.includes("Too many") ? error.message : "Could not submit your review. Please try again.");
    setDone(true);
  }

  return (
    <>
      <PageHeader eyebrow="Reviews" title="Patient stories" text="Every review is checked by the clinic before it is published." />
      <section className="section-y container-page grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {data.length === 0 ? <EmptyState title="No reviews published yet" text="Be the first to share your experience." /> : (
            <div className="grid gap-6 sm:grid-cols-2">
              {data.map((t) => (
                <figure key={t.id} className="card-surface p-6">
                  {t.rating && <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, s) => <Star key={s} className={s < t.rating! ? "size-4 fill-warning text-warning" : "size-4 text-border"} aria-hidden />)}</div>}
                  <blockquote className="mt-3 leading-relaxed">“{t.content}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-heading">{t.name}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
        <aside className="card-surface h-fit p-6">
          <h2 className="text-2xl">Share your experience</h2>
          {done ? (
            <p className="mt-4 rounded-xl bg-accent p-4 text-sm text-accent-foreground">Thank you! Your review has been received and will appear after the clinic reviews it.</p>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div><Label htmlFor="t-name">Display name</Label><Input id="t-name" name="name" maxLength={80} required className="mt-1.5" /></div>
              <fieldset>
                <legend className="text-sm font-medium">Rating</legend>
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n}>
                      <Star className={n <= rating ? "size-6 fill-warning text-warning" : "size-6 text-border"} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <div><Label htmlFor="t-content">Your review</Label><Textarea id="t-content" name="content" rows={5} maxLength={1500} required className="mt-1.5" /></div>
              <p className="text-xs text-muted-foreground">Please don't include medical or personal details you don't want published.</p>
              <Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? "Submitting…" : "Submit review"}</Button>
            </form>
          )}
        </aside>
      </section>
    </>
  );
}
