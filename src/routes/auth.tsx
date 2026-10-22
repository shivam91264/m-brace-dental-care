import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/site-ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Login | M'brace Dental Clinic" },
      { name: "description", content: "Staff sign-in for M'brace Dental Clinic." },
      { property: "og:title", content: "Staff Login | M'brace Dental Clinic" },
      { property: "og:description", content: "Staff sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Staff" title="Staff login" text="The staff sign-in and admin dashboard are not finished yet." />
    </>
  ),
});
