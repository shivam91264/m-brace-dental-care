import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { servicesQuery } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/site/site-ui";
import { ServiceCard } from "@/components/site/cards";

export const Route = createFileRoute("/services/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "Dental Services | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Explore dental treatments at M'brace: cleaning, whitening, root canal, implants, braces, crowns, pediatric and cosmetic dentistry." },
      { property: "og:title", content: "Dental Services at M'brace, Bhiwandi" },
      { property: "og:description", content: "Comprehensive dental treatments under one roof." },
    ],
  }),
  component: Services,
});

function Services() {
  const { data } = useSuspenseQuery(servicesQuery);
  return (
    <>
      <PageHeader eyebrow="Services" title="Dental treatments" text="Explore the care we offer. Every treatment begins with a careful examination and a clear explanation." />
      <section className="section-y container-page">
        {data.length === 0 ? <EmptyState title="Services will be listed soon" /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
        )}
      </section>
    </>
  );
}
