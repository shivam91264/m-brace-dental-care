import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { dentistsQuery, faqsQuery, galleryQuery, useSite } from "@/lib/queries";
import { EmptyState, PageHeader, SectionTitle } from "@/components/site/site-ui";
import { DentistCard } from "@/components/site/cards";

export const Route = createFileRoute("/about")({
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(dentistsQuery), q.ensureQueryData(galleryQuery), q.ensureQueryData(faqsQuery)]),
  head: () => ({
    meta: [
      { title: "About Us | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Learn about M'brace Multi Speciality Dental Clinic — our mission, approach, hygiene standards and team." },
      { property: "og:title", content: "About M'brace Multi Speciality Dental Clinic" },
      { property: "og:description", content: "Our mission, approach and the team behind your care." },
    ],
  }),
  component: About,
});

function About() {
  const { content } = useSite();
  const { data: dentists } = useSuspenseQuery(dentistsQuery);
  const { data: gallery } = useSuspenseQuery(galleryQuery);
  const { data: faqs } = useSuspenseQuery(faqsQuery);
  return (
    <>
      <PageHeader eyebrow="About us" title={content.about_title} text={content.about_text}>
        <Button asChild variant="hero" size="lg"><Link to="/book">Book Appointment</Link></Button>
        <Button asChild variant="heroOutline" size="lg"><Link to="/contact">Contact</Link></Button>
      </PageHeader>
      <section className="section-y container-page grid gap-10 lg:grid-cols-2">
        <img src={content.about_image || "/images/clinic.jpg"} alt="Treatment room at the clinic" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
        <div className="space-y-8">
          {[["Our mission", content.mission], ["Our approach", content.approach], ["Facilities & hygiene", content.hygiene]].filter(([, t]) => t).map(([h, t]) => (
            <div key={h}>
              <h2 className="text-2xl">{h}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{t}</p>
            </div>
          ))}
        </div>
      </section>
      {dentists.length > 0 && (
        <section className="section-y bg-muted">
          <div className="container-page">
            <SectionTitle eyebrow="Team" title="Our dentists" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{dentists.map((d) => <DentistCard key={d.id} d={d} />)}</div>
          </div>
        </section>
      )}
      {gallery.length > 0 && (
        <section className="section-y container-page">
          <SectionTitle eyebrow="Photos" title="Our clinic" />
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.filter((g) => g.category !== "before-after").slice(0, 6).map((g) => (
              <img key={g.id} src={g.image_url} alt={g.alt || g.title} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
            ))}
          </div>
        </section>
      )}
      <section className="section-y bg-muted" id="faq">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionTitle eyebrow="FAQ" title="Frequently asked questions" />
            <p className="mt-3 text-muted-foreground">Still have a question?</p>
            <Button asChild variant="hero" className="mt-3"><Link to="/contact">Contact us</Link></Button>
          </div>
          {faqs.length === 0 ? <EmptyState title="FAQs coming soon" /> : (
            <Accordion type="single" collapsible className="card-surface px-6">
              {faqs.map((f) => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger className="text-left text-base">{f.question}</AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-muted-foreground">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </>
  );
}
