import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { dentistsQuery } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/site/site-ui";
import { DentistCard } from "@/components/site/cards";

export const Route = createFileRoute("/dentists")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dentistsQuery),
  head: () => ({
    meta: [
      { title: "Our Dentists | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Meet the dentists at M'brace Multi Speciality Dental Clinic in Bhiwandi." },
      { property: "og:title", content: "Our Dentists | M'brace Dental Clinic" },
      { property: "og:description", content: "Meet the team caring for your smile." },
    ],
  }),
  component: Dentists,
});

function Dentists() {
  const { data } = useSuspenseQuery(dentistsQuery);
  return (
    <>
      <PageHeader eyebrow="Our team" title="Meet our dentists" text="Experienced, caring professionals focused on your comfort.">
        <Button asChild variant="hero" size="lg"><Link to="/book">Book Appointment</Link></Button>
      </PageHeader>
      <section className="section-y container-page">
        {data.length === 0 ? (
          <EmptyState title="Dentist profiles coming soon" text="Our team details will be published here shortly." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((d) => <DentistCard key={d.id} d={d} full />)}</div>
        )}
      </section>
    </>
  );
}
