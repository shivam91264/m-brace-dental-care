import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { postsQuery } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/site/site-ui";

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dental Health Blog | M'brace Dental Clinic" },
      { name: "description", content: "Practical dental health tips and clinic news from M'brace Multi Speciality Dental Clinic." },
      { property: "og:title", content: "Blog | M'brace Dental Clinic" },
      { property: "og:description", content: "Dental tips and clinic news." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { data } = useSuspenseQuery(postsQuery);
  return (
    <>
      <PageHeader eyebrow="Blog" title="Smile notes" text="Simple, practical advice for healthier teeth." />
      <section className="section-y container-page">
        {data.length === 0 ? <EmptyState title="No articles yet" /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="card-surface hover-lift overflow-hidden">
                {p.cover_image ? <img src={p.cover_image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" /> : <div className="grid aspect-[16/10] place-items-center bg-accent text-accent-foreground"><BookOpen className="size-8" /></div>}
                <div className="p-6">
                  {p.published_at && <p className="text-xs text-muted-foreground">{new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
                  <h2 className="mt-2 font-sans text-lg font-semibold">{p.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
