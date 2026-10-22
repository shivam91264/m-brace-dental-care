import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/queries";
import { PageHeader, Paragraphs } from "@/components/site/site-ui";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | M'brace Dental Clinic" },
      { name: "description", content: "How M'brace Multi Speciality Dental Clinic collects, uses and protects your information." },
      { property: "og:title", content: "Privacy Policy | M'brace Dental Clinic" },
      { property: "og:description", content: "How we handle your information." },
    ],
  }),
  component: () => {
    const { content } = useSite();
    return (
      <>
        <PageHeader eyebrow="Legal" title="Privacy Policy" />
        <section className="section-y container-page max-w-3xl"><Paragraphs text={content.privacy_policy} /></section>
      </>
    );
  },
});
