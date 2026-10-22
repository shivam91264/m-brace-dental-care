import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck, Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serviceQuery } from "@/lib/queries";
import { ContactDetails, Paragraphs } from "@/components/site/site-ui";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const s = await context.queryClient.ensureQueryData(serviceQuery(params.slug));
    if (!s) throw notFound();
    return { title: s.title, desc: s.short_description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} in Bhiwandi | M'brace Dental Clinic` },
          { name: "description", content: loaderData.desc },
          { property: "og:title", content: `${loaderData.title} | M'brace Dental Clinic` },
          { property: "og:description", content: loaderData.desc },
        ]
      : [{ title: "Service unavailable" }, { name: "robots", content: "noindex" }],
  }),
  component: ServicePage,
});

function ServicePage() {
  const { slug } = Route.useParams();
  const { data: s } = useSuspenseQuery(serviceQuery(slug));
  if (!s) return null;
  return (
    <article className="container-page section-y">
      <Link to="/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />All services</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="eyebrow">Treatment</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{s.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{s.short_description}</p>
          {s.image_url && <img src={s.image_url} alt={s.title} className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover" />}
          <Paragraphs text={s.description} className="mt-8" />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-6">
            {(s.price || s.duration) && (
              <ul className="mb-5 space-y-2 text-sm">
                {s.price && <li className="flex items-center gap-2"><IndianRupee className="size-4 text-primary" />{s.price}</li>}
                {s.duration && <li className="flex items-center gap-2"><Clock className="size-4 text-primary" />{s.duration}</li>}
              </ul>
            )}
            <Button asChild variant="hero" size="lg" className="w-full"><Link to="/book" search={{ service: s.id }}><CalendarCheck />Book this treatment</Link></Button>
          </div>
          <div className="card-surface p-6"><ContactDetails /></div>
        </aside>
      </div>
    </article>
  );
}
