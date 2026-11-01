import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSite } from "@/lib/queries";
import { Logo, ThemeToggle } from "./site-ui";

export const NAV = [
  { key: "home", to: "/", label: "Home" },
  { key: "about", to: "/about", label: "About" },
  { key: "services", to: "/services", label: "Services" },
  { key: "dentists", to: "/dentists", label: "Dentists" },
  { key: "gallery", to: "/gallery", label: "Gallery" },
  { key: "blog", to: "/blog", label: "Blog" },
  { key: "contact", to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { content } = useSite();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.key === "home" || content.nav?.[n.key] !== false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">Skip to content</a>
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {items.map((n) => (
            <Link key={n.key} to={n.to} activeOptions={{ exact: n.to === "/" }} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:underline focus-visible:underline underline-offset-8 decoration-2" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:grid" />
          <Button asChild variant="hero" className="hidden sm:inline-flex"><Link to="/book">Book Appointment</Link></Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm bg-card">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                {items.map((n) => (
                  <Link key={n.key} to={n.to} activeOptions={{ exact: n.to === "/" }} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent hover:underline focus-visible:underline underline-offset-8 decoration-2" activeProps={{ className: "text-primary" }}>
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex items-center gap-3 px-3">
                <Button asChild variant="hero" className="flex-1"><Link to="/book" onClick={() => setOpen(false)}>Book Appointment</Link></Button>
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
