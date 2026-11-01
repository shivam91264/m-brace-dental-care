import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, CheckCircle2, MapPin, Navigation, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { dentistsQuery, faqsQuery, galleryQuery, servicesQuery, testimonialsQuery, useSite } from "@/lib/queries";
import { ContactDetails, SectionTitle } from "@/components/site/site-ui";
import { DentistCard, ServiceCard } from "@/components/site/cards";
import { TestimonialCarousel } from "@/components/site/TestimonialCarousel";
import { TestimonialForm } from "@/components/site/TestimonialForm";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient: q } }) =>
    Promise.all([q.ensureQueryData(servicesQuery), q.ensureQueryData(dentistsQuery), q.ensureQueryData(testimonialsQuery), q.ensureQueryData(galleryQuery), q.ensureQueryData(faqsQuery)]),
  head: () => ({
    meta: [
      { title: "M'brace Dental Clinic Bhiwandi | Confident Smiles Begin With Exceptional Care" },
      { name: "description", content: "Gentle, modern multi speciality dental care in Bhiwandi — cleanings, root canals, implants, braces and more. Book your appointment online." },
      { property: "og:title", content: "M'brace Multi Speciality Dental Clinic, Bhiwandi" },
      { property: "og:description", content: "Confident smiles begin with exceptional care. Book a dental appointment online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const icons = [Sparkles, ShieldCheck, MapPin, CheckCircle2];

function Home() {
  const { clinic, content } = useSite();
  const show = (k: string) => content.sections?.[k] !== false;
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: dentists } = useSuspenseQuery(dentistsQuery);
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);
  const { data: gallery } = useSuspenseQuery(galleryQuery);
  const { data: faqs } = useSuspenseQuery(faqsQuery);
  const featured = services.filter((s) => s.featured).slice(0, 6);
  const featuredServices = featured.length ? featured : services.slice(0, 6);
  const homeTestimonials = testimonials.some((t) => t.featured) ? testimonials.filter((t) => t.featured) : testimonials;
  const homeDentists = dentists.filter((d) => d.featured).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="fade-up">
            <p className="eyebrow"><span className="size-1.5 rounded-full bg-primary" />Multi Speciality Dental Clinic · Bhiwandi</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.05] md:text-6xl">{content.hero_title}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{content.hero_text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/book"><CalendarCheck />Book Appointment</Link></Button>
              <Button asChild variant="heroOutline" size="lg"><Link to="/contact">Contact Us</Link></Button>
            </div>
            {clinic.rating_note && (
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-warning text-warning" aria-hidden />)}</span>
                {clinic.rating_note}
              </p>
            )}
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-accent" aria-hidden />
            <img src={content.hero_image || "/images/hero.jpg"} alt="Smiling patient in a modern dental clinic" width={1600} height={1104} fetchPriority="high" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-soft" />
          </div>
        </div>
      </section>

      {show("highlights") && content.highlights?.length > 0 && (
        <section className="container-page pb-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {content.highlights.map((h, i) => {
               const Icon = icons[i % icons.length] ?? Sparkles;
              return (
                <div key={i} className="card-surface flex items-center gap-4 p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></span>
                  <div><p className="font-semibold text-heading">{h.title}</p><p className="text-sm text-muted-foreground">{h.text}</p></div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {show("services") && featuredServices.length > 0 && (
        <section className="section-y container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="Treatments" title="Care for every smile" text="From preventive check-ups to complete smile makeovers." />
            <Button asChild variant="outline" className="rounded-full"><Link to="/services">All services <ArrowRight /></Link></Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s) => <ServiceCard key={s.id} s={s} />)}
          </div>
        </section>
      )}

      {show("about") && (
        <section className="section-y bg-muted">
          <div className="container-page grid items-center gap-12 lg:grid-cols-2">
            <img src={content.about_image || "/images/clinic.jpg"} alt="Clean, modern treatment room at the clinic" loading="lazy" width={1200} height={912} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
            <div>
              <SectionTitle eyebrow="About the clinic" title={content.about_title} />
              <p className="mt-4 leading-relaxed text-muted-foreground">{content.about_text}</p>
              <Button asChild variant="link" className="mt-4 px-0"><Link to="/about">More about us <ArrowRight /></Link></Button>
            </div>
          </div>
        </section>
      )}

      {show("dentists") && homeDentists.length > 0 && (
        <section className="section-y container-page">
          <SectionTitle eyebrow="Meet the team" title="Your dentists" center />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeDentists.map((d) => <DentistCard key={d.id} d={d} />)}
          </div>
        </section>
      )}

      {show("why") && content.why_us?.length > 0 && (
        <section className="section-y container-page">
          <SectionTitle eyebrow="Why choose us" title="Thoughtful care, from the first visit" center />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.why_us.map((w, i) => (
              <div key={i} className="card-surface hover-lift p-6">
                <span className="font-display text-3xl text-primary">0{i + 1}</span>
                <h3 className="mt-3 font-sans text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {show("testimonials") && (
        <section id="testimonials" className="section-y scroll-mt-24 bg-muted">
          <div className="container-page">
            <SectionTitle eyebrow="Patient stories" title="Testimonials" center />
            <div className="mt-10">
              {homeTestimonials.length > 0 ? <TestimonialCarousel items={homeTestimonials} autoplay={content.carousel?.autoplay !== false} interval={content.carousel?.interval ?? 6} /> : <p className="text-center text-muted-foreground">No patient reviews published yet.</p>}
            </div>
            <div className="mt-10"><TestimonialForm /></div>
          </div>
        </section>
      )}

      {show("gallery") && gallery.length > 0 && (
        <section className="section-y container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="Gallery" title="Inside the clinic" />
            <Button asChild variant="outline" className="rounded-full"><Link to="/gallery">View gallery <ArrowRight /></Link></Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.slice(0, 6).map((g) => (
              <img key={g.id} src={g.image_url} alt={g.alt || g.title} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
            ))}
          </div>
        </section>
      )}

      {show("faq") && faqs.length > 0 && (
        <section className="section-y bg-muted">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionTitle eyebrow="FAQ" title="Common questions" />
              <Button asChild variant="link" className="mt-3 px-0"><Link to="/about" hash="faq">See all FAQs <ArrowRight /></Link></Button>
            </div>
            <Accordion type="single" collapsible className="card-surface px-6">
              {faqs.slice(0, 5).map((f) => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger className="text-left text-base">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {show("contact") && (
        <section className="section-y container-page">
          <div className="grid gap-8 overflow-hidden rounded-3xl bg-secondary p-8 text-secondary-foreground md:p-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl text-secondary-foreground md:text-4xl">Ready for a healthier smile?</h2>
              <p className="mt-3 opacity-85">Request an appointment online and our team will confirm your visit.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full"><Link to="/book">Book Appointment</Link></Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-current/40 bg-transparent text-secondary-foreground hover:bg-card/10 hover:text-secondary-foreground">
                  <a href={clinic.maps_url} target="_blank" rel="noopener noreferrer"><Navigation />Get directions</a>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl bg-card p-6 text-foreground"><ContactDetails /></div>
          </div>
        </section>
      )}
    </>
  );
}
