import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/queries";
import { PageHeader, Paragraphs } from "@/components/site/site-ui";

export const Route = createFileRoute("/appointment-policy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Appointment & Cancellation Policy | M'brace Dental Clinic" },
      { name: "description", content: "Booking, rescheduling and cancellation guidelines for M'brace Dental Clinic." },
      { property: "og:title", content: "Appointment Policy | M'brace Dental Clinic" },
      { property: "og:description", content: "Booking and cancellation guidelines." },
    ],
  }),
  component: () => {
    const { content } = useSite();
    return (
      <>
        <PageHeader eyebrow="Policy" title="Appointment & Cancellation Policy" />
        <section className="section-y container-page max-w-3xl"><Paragraphs text={content.appointment_policy} /></section>
      </>
    );
  },
});
