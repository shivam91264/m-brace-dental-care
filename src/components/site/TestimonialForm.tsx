import { Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter a display name").max(80),
  content: z.string().trim().min(10, "Please write at least a few words").max(1500),
});

export function TestimonialForm() {
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(fd);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    const { error } = await supabase.from("testimonials").insert({ ...parsed.data, rating, review_date: new Date().toISOString().slice(0, 10) });
    setBusy(false);
    if (error) { toast.error(error.message.includes("Too many") ? error.message : "Could not submit your review. Please try again."); return; }
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-xl border-t border-border pt-8">
      <h3 className="text-2xl">Share your experience</h3>
          {done ? (
            <p className="mt-4 rounded-xl bg-accent p-4 text-sm text-accent-foreground">Thank you! Your review has been received and will appear after the clinic reviews it.</p>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div><Label htmlFor="t-name">Display name</Label><Input id="t-name" name="name" maxLength={80} required className="mt-1.5" /></div>
              <fieldset>
                <legend className="text-sm font-medium">Rating</legend>
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button variant="ghost" size="icon" key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n}>
                      <Star className={n <= rating ? "size-6 fill-warning text-warning" : "size-6 text-border"} />
                    </Button>
                  ))}
                </div>
              </fieldset>
              <div><Label htmlFor="t-content">Your review</Label><Textarea id="t-content" name="content" rows={5} maxLength={1500} required className="mt-1.5" /></div>
              <p className="text-xs text-muted-foreground">Please don't include medical or personal details you don't want published.</p>
              <Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? "Submitting…" : "Submit review"}</Button>
            </form>
          )}
    </div>
  );
}
