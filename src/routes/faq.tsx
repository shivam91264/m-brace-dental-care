import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqsQuery } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/site/site-ui";

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQuery),
  head: () => ({
    meta: [
      { title: "FAQ | M'brace Dental Clinic Bhiwandi" },
      { name: "description", content: "Answers to common questions about appointments, treatments and visiting M'brace Dental Clinic." },
      { property: "og:title", content: "Frequently Asked Questions | M'brace Dental Clinic" },
      { property: "og:description", content: "Common questions about your dental visit." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data } = useSuspenseQuery(faqsQuery);
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Frequently asked questions" />
      <section className="section-y container-page max-w-3xl">
        {data.length === 0 ? <EmptyState title="FAQs coming soon" /> : (
          <Accordion type="single" collapsible className="card-surface px-6">
            {data.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left text-base">{f.question}</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground">Still have a question?</p>
          <Button asChild variant="hero" className="mt-3"><Link to="/contact">Contact us</Link></Button>
        </div>
      </section>
    </>
  );
}
