import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Youtube } from "lucide-react";
import { useSite } from "@/lib/queries";
import { HoursList } from "./site-ui";
import { NAV } from "./SiteHeader";

export function SiteFooter() {
  const { clinic, content } = useSite();
  const socials = [
    { url: clinic.socials?.instagram, Icon: Instagram, label: "Instagram" },
    { url: clinic.socials?.facebook, Icon: Facebook, label: "Facebook" },
    { url: clinic.socials?.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url && /^https?:\/\//.test(s.url));
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">{clinic.name}</p>
          <p className="mt-3 max-w-sm text-sm opacity-80">{content.footer_text}</p>
          <p className="mt-4 flex max-w-sm gap-2 text-sm opacity-80"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />{clinic.address}</p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map(({ url, Icon, label }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-full border border-current/30 opacity-80 hover:opacity-100">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-1">
            {NAV.filter((n) => content.nav?.[n.key] !== false).map((n) => (
              <li key={n.key}><Link to={n.to} className="opacity-80 hover:opacity-100">{n.label}</Link></li>
            ))}
            <li><Link to="/book" className="opacity-80 hover:opacity-100">Book Appointment</Link></li>
          </ul>
        </div>
        <div className="[&_.text-muted-foreground]:text-footer-foreground/70">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Hours</p>
          <div className="mt-4"><HoursList /></div>
        </div>
      </div>
      <div className="border-t border-current/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs opacity-70 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {clinic.name}</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:opacity-100">Privacy Policy</Link>
            <Link to="/appointment-policy" className="hover:opacity-100">Appointment Policy</Link>
            <Link to="/auth" className="hover:opacity-100">Staff login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
