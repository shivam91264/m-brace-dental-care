import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postQuery } from "@/lib/queries";
import { Paragraphs } from "@/components/site/site-ui";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!p) throw notFound();
    return { title: p.title, desc: p.excerpt, image: p.cover_image };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { name: "twitter:card", content: "summary_large_image" },
          ...(loaderData.image?.startsWith("https://") ? [{ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image }] : []),
          { title: `${loaderData.title} | M'brace Dental Blog` },
          { name: "description", content: loaderData.desc },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.desc },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Article unavailable" }, { name: "robots", content: "noindex" }],
  }),
  component: Post,
});

function Post() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(postQuery(slug));
  if (!p) return null;
  return (
    <article className="container-page section-y max-w-3xl">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />All articles</Link>
      <h1 className="mt-6 text-4xl md:text-5xl">{p.title}</h1>
      {p.published_at && <p className="mt-3 text-sm text-muted-foreground">{new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
      {p.cover_image && <img src={p.cover_image} alt="" className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover" />}
      <Paragraphs text={p.content} className="mt-8 text-lg" />
      <div className="card-surface mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="font-semibold text-heading">Have a question about your teeth?</p>
        <Button asChild variant="hero"><Link to="/book">Book Appointment</Link></Button>
      </div>
    </article>
  );
}
