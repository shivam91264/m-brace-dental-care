import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Img = { id: string; image_url: string; alt: string; title: string };

export function Lightbox({ images, index, onChange }: { images: Img[]; index: number | null; onChange: (i: number | null) => void }) {
  const img = index === null ? null : images[index];
  useEffect(() => {
    if (index === null) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onChange((index + 1) % images.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [index, images.length, onChange]);
  return (
    <Dialog open={!!img} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="max-w-4xl border-0 bg-card p-2 sm:p-3">
        <DialogTitle className="sr-only">{img?.title || "Image"}</DialogTitle>
        {img && (
          <figure>
            <img src={img.image_url} alt={img.alt || img.title} className="max-h-[75vh] w-full rounded-xl object-contain" />
            <figcaption className="flex items-center justify-between gap-3 px-2 pt-3 text-sm">
              <span>{img.title}</span>
              {images.length > 1 && (
                <span className="flex gap-2">
                  <button type="button" aria-label="Previous image" onClick={() => onChange((index! - 1 + images.length) % images.length)} className="grid size-9 place-items-center rounded-full border border-border hover:bg-accent"><ChevronLeft className="size-4" /></button>
                  <button type="button" aria-label="Next image" onClick={() => onChange((index! + 1) % images.length)} className="grid size-9 place-items-center rounded-full border border-border hover:bg-accent"><ChevronRight className="size-4" /></button>
                </span>
              )}
            </figcaption>
          </figure>
        )}
      </DialogContent>
    </Dialog>
  );
}
