import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery } from "@/lib/account";
import { MODULES, canDelete, canManage, type Field, type Module } from "@/lib/admin-config";
import { COLOR_KEYS, DEFAULT_THEME, PRESETS, isHex, sanitizeTheme, themeToCss, type Palette, type ThemeSettings } from "@/lib/theme";
import { settingsQuery } from "@/lib/queries";
import { DAYS, ROLE_LABELS, type AppRole, type BookingSettings, type ClinicSettings, type ContentSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/$section")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard | M'brace Dental Clinic" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSection,
});

function NoAccess() {
  return <p className="card-surface p-8 text-muted-foreground">You do not have access to this section.</p>;
}

function AdminSection() {
  const { section } = Route.useParams();
  const { data: a } = useSuspenseQuery(accountQuery);
  const roles = a?.roles ?? [];
  if (section === "content") return roles.includes("super_admin") ? <ContentSection /> : <NoAccess />;
  if (section === "appearance") return roles.includes("super_admin") ? <AppearanceSection /> : <NoAccess />;
  if (section === "schedule") return roles.some((r) => ["super_admin", "admin"].includes(r)) ? <ScheduleSection /> : <NoAccess />;
  if (section === "account") return <AccountSection />;
  const m = MODULES[section];
  if (!m || !canManage(roles, m)) return <NoAccess />;
  return <ModulePage key={section} module={m} roles={roles} />;
}

/* ---------------- Generic module (CRUD) ---------------- */

type Row = Record<string, any>;

function FieldInput({ f, row }: { f: Field; row: Row | null }) {
  const v = row?.[f.key];
  if (f.type === "textarea")
    return <Textarea id={f.key} name={f.key} defaultValue={v ?? ""} required={f.required} rows={4} maxLength={8000} />;
  if (f.type === "checkbox")
    return (
      <label className="flex items-center gap-2 text-sm">
        <Checkbox id={f.key} name={f.key} defaultChecked={Boolean(v)} /> Enabled
      </label>
    );
  if (f.options)
    return (
      <Select name={f.key} {...(v ? { defaultValue: String(v) } : {})}>
        <SelectTrigger id={f.key}><SelectValue placeholder="Select…" /></SelectTrigger>
        <SelectContent>{f.options.map((o) => <SelectItem key={o} value={o}>{o.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
      </Select>
    );
  if (f.type === "image") return <ImageInput name={f.key} value={v ? String(v) : ""} />;
  return (
    <Input
      id={f.key}
      name={f.key}
      type={f.type ?? "text"}
      defaultValue={f.type === "datetime-local" && v ? String(v).slice(0, 16) : (v ?? "")}
      required={f.required}
      maxLength={2000}
    />
  );
}

function ImageInput({ name, value }: { name: string; value: string }) {
  const [url, setUrl] = useState(value);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  async function upload(file: File) {
    setBusy(true);
    try {
      const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000" });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setUrl(data.publicUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <Input id={name} name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL" />
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          <Upload /> {busy ? "Uploading…" : "Upload image"}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        {url && <img src={url} alt="" className="size-12 rounded-lg object-cover" />}
      </div>
    </div>
  );
}

function ModulePage({ module: m, roles }: { module: Module; roles: string[] }) {
  const q = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["admin", m.table],
    queryFn: async () => {
      const { data, error } = await supabase.from(m.table).select("*").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const filtered = (rows ?? []).filter((r) =>
    !search || Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(search.toLowerCase())),
  );

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const row: Row = {};
    for (const f of m.fields) {
      if (f.type === "checkbox") row[f.key] = d.get(f.key) === "on";
      else if (f.type === "number") { const v = String(d.get(f.key) ?? ""); row[f.key] = v === "" ? null : Number(v); }
      else { const v = String(d.get(f.key) ?? "").trim(); row[f.key] = v === "" ? null : v; }
    }
    setBusy(true);
    try {
      if (editing && editing !== "new" && editing["id"]) {
        const { error } = await supabase.from(m.table).update(row as never).eq("id", editing["id"]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(m.table).insert(row as never);
        if (error) throw error;
      }
      toast.success("Saved");
      setEditing(null);
      await q.invalidateQueries({ queryKey: ["admin", m.table] });
      await q.invalidateQueries({ queryKey: ["public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      const { error } = await supabase.from(m.table).delete().eq("id", deleting["id"]);
      if (error) throw error;
      toast.success("Deleted");
      setDeleting(null);
      await q.invalidateQueries({ queryKey: ["admin", m.table] });
      await q.invalidateQueries({ queryKey: ["public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{m.title}</h1>
        {m.create && <Button onClick={() => setEditing("new")}><Plus /> Add</Button>}
      </div>
      <Input placeholder={`Search ${m.title.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Details</th>
              <th className="px-5 py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r["id"]}>
                <td className="px-5 py-3 font-medium">{String(r[m.label] ?? "—")}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {m.table === "appointments" && `${r["appointment_date"]} ${String(r["start_time"] ?? "").slice(0, 5)} · ${r["status"]}`}
                  {m.table === "testimonials" && `${r["status"]}${r["published"] ? " · published" : ""}`}
                  {m.table === "profiles" && String(r["status"] ?? "")}
                  {!["appointments", "testimonials", "profiles"].includes(m.table) && (r["published"] === false ? "Hidden" : "Published")}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(r)}><Pencil className="size-4" /></Button>
                    {canDelete(roles, m, r) && (
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setDeleting(r)}><Trash2 className="size-4 text-destructive" /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">Nothing found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogTitle>{editing === "new" ? `Add ${m.title}` : `Edit ${m.title}`}</DialogTitle>
          <form onSubmit={save} className="mt-2 space-y-4">
            {m.fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                {f.type !== "checkbox" && <Label htmlFor={f.key}>{f.label}{f.required ? " *" : ""}</Label>}
                <FieldInput f={f} row={editing === "new" ? (m.table === "testimonials" ? { status: "pending", sort_order: 0 } : null) : editing} />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              “{String(deleting?.[m.label] ?? "")}” will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {busy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------- Website content ---------------- */

function ContentSection() {
  const q = useQueryClient();
  const { data } = useSuspenseQuery(settingsQuery);
  const clinic = (data.clinic ?? {}) as ClinicSettings;
  const content = (data.content ?? {}) as ContentSettings;
  const [busy, setBusy] = useState(false);

  const SECTION_KEYS = ["highlights", "services", "about", "dentists", "why", "testimonials", "gallery", "faq", "contact"];
  const NAV_KEYS = ["about", "services", "dentists", "gallery", "blog", "contact"];

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const s = (k: string) => String(d.get(k) ?? "").trim();
    const lines = (k: string) => s(k).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [title = "", text = ""] = l.split("|").map((x) => x.trim());
      return { title, text };
    });
    const nextClinic: ClinicSettings = {
      ...clinic,
      name: s("name"), short_name: s("short_name"), address: s("address"), phone: s("phone"),
      whatsapp: s("whatsapp"), email: s("email"), maps_url: s("maps_url"), hours_note: s("hours_note"),
      rating_note: s("rating_note"),
      socials: { instagram: s("instagram"), facebook: s("facebook"), youtube: s("youtube") },
    };
    const nextContent: ContentSettings = {
      ...content,
      hero_title: s("hero_title"), hero_text: s("hero_text"), hero_image: s("hero_image"),
      about_title: s("about_title"), about_text: s("about_text"), mission: s("mission"),
      approach: s("approach"), hygiene: s("hygiene"), about_image: s("about_image"),
      footer_text: s("footer_text"), privacy_policy: s("privacy_policy"), appointment_policy: s("appointment_policy"),
      highlights: lines("highlights"), why_us: lines("why_us"),
      sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, d.get(`sec_${k}`) === "on"])),
      nav: Object.fromEntries(NAV_KEYS.map((k) => [k, d.get(`nav_${k}`) === "on"])),
      carousel: { autoplay: d.get("carousel_autoplay") === "on", interval: Number(d.get("carousel_interval") ?? 6) || 6 },
    };
    setBusy(true);
    try {
      const r1 = await supabase.from("settings").upsert({ key: "clinic", value: nextClinic } as never);
      if (r1.error) throw r1.error;
      const r2 = await supabase.from("settings").upsert({ key: "content", value: nextContent } as never);
      if (r2.error) throw r2.error;
      toast.success("Website content saved");
      await q.invalidateQueries({ queryKey: ["public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const text = (id: string, label: string, value: string | undefined, area = false) => (
    <div className="space-y-1.5" key={id}>
      <Label htmlFor={id}>{label}</Label>
      {area ? <Textarea id={id} name={id} defaultValue={value ?? ""} rows={4} maxLength={20000} /> : <Input id={id} name={id} defaultValue={value ?? ""} maxLength={2000} />}
    </div>
  );
  const toLines = (items?: { title: string; text: string }[]) => (items ?? []).map((i) => `${i.title} | ${i.text}`).join("\n");

  return (
    <form onSubmit={save} className="space-y-8">
      <h1 className="text-3xl">Website content</h1>
      <section className="card-surface space-y-4 p-6">
        <h2 className="text-xl">Clinic details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("name", "Clinic name", clinic.name)}
          {text("short_name", "Short name", clinic.short_name)}
          {text("phone", "Phone", clinic.phone)}
          {text("whatsapp", "WhatsApp", clinic.whatsapp)}
          {text("email", "Email", clinic.email)}
          {text("maps_url", "Google Maps link", clinic.maps_url)}
          {text("hours_note", "Opening hours note", clinic.hours_note)}
          {text("rating_note", "Rating note", clinic.rating_note)}
          {text("instagram", "Instagram link", clinic.socials?.instagram)}
          {text("facebook", "Facebook link", clinic.socials?.facebook)}
        </div>
        {text("address", "Address", clinic.address, true)}
      </section>
      <section className="card-surface space-y-4 p-6">
        <h2 className="text-xl">Homepage</h2>
        {text("hero_title", "Hero heading", content.hero_title)}
        {text("hero_text", "Hero introduction", content.hero_text, true)}
        {text("hero_image", "Hero image URL", content.hero_image)}
        {text("highlights", "Highlights (one per line: Title | Text)", toLines(content.highlights), true)}
        {text("why_us", "Why choose us (one per line: Title | Text)", toLines(content.why_us), true)}
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="carousel_autoplay" defaultChecked={content.carousel?.autoplay !== false} /> Testimonials auto-scroll
          </label>
          <div className="flex items-center gap-2 text-sm">
            <Label htmlFor="carousel_interval">Seconds per review</Label>
            <Input id="carousel_interval" name="carousel_interval" type="number" min={3} max={30} defaultValue={content.carousel?.interval ?? 6} className="w-20" />
          </div>
        </div>
      </section>
      <section className="card-surface space-y-4 p-6">
        <h2 className="text-xl">About page</h2>
        {text("about_title", "About heading", content.about_title)}
        {text("about_text", "About text", content.about_text, true)}
        {text("mission", "Mission", content.mission, true)}
        {text("approach", "Approach", content.approach, true)}
        {text("hygiene", "Facilities & hygiene", content.hygiene, true)}
        {text("about_image", "About image URL", content.about_image)}
      </section>
      <section className="card-surface space-y-4 p-6">
        <h2 className="text-xl">Policies & footer</h2>
        {text("footer_text", "Footer text", content.footer_text, true)}
        {text("privacy_policy", "Privacy policy", content.privacy_policy, true)}
        {text("appointment_policy", "Appointment & cancellation policy", content.appointment_policy, true)}
      </section>
      <section className="card-surface space-y-4 p-6">
        <h2 className="text-xl">Homepage sections</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {SECTION_KEYS.map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm capitalize">
              <Checkbox name={`sec_${k}`} defaultChecked={content.sections?.[k] !== false} /> {k.replace("_", " ")}
            </label>
          ))}
        </div>
        <h2 className="pt-2 text-xl">Navigation links</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {NAV_KEYS.map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm capitalize">
              <Checkbox name={`nav_${k}`} defaultChecked={content.nav?.[k] !== false} /> {k}
            </label>
          ))}
        </div>
      </section>
      <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}

/* ---------------- Appearance ---------------- */

function AppearanceSection() {
  const q = useQueryClient();
  const { data } = useSuspenseQuery(settingsQuery);
  const [theme, setTheme] = useState<ThemeSettings>(() => sanitizeTheme(data.theme));
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [busy, setBusy] = useState(false);

  const setColor = (k: string, v: string) => {
    if (!isHex(v)) return;
    setTheme((t) => ({ ...t, [mode]: { ...t[mode], [k]: v } }));
  };

  async function save() {
    setBusy(true);
    try {
      const { error } = await supabase.from("settings").upsert({ key: "theme", value: sanitizeTheme(theme) } as never);
      if (error) throw error;
      toast.success("Appearance saved");
      await q.invalidateQueries({ queryKey: ["public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const palette = theme[mode];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Appearance</h1>
      <section className="card-surface space-y-4 p-6">
        <h2 className="text-xl">Theme presets</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([k, p]) => (
            <Button key={k} type="button" variant="outline" onClick={() => setTheme({ default_mode: theme.default_mode, light: p.light, dark: p.dark })}>
              {p.label}
            </Button>
          ))}
          <Button type="button" variant="ghost" onClick={() => setTheme(DEFAULT_THEME)}>Reset to default</Button>
        </div>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Label htmlFor="default_mode">Default public theme</Label>
            <Select value={theme.default_mode} onValueChange={(v) => setTheme((t) => ({ ...t, default_mode: v as "light" | "dark" }))}>
              <SelectTrigger id="default_mode" className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Label>Editing</Label>
            <Button type="button" size="sm" variant={mode === "light" ? "default" : "outline"} onClick={() => setMode("light")}>Light</Button>
            <Button type="button" size="sm" variant={mode === "dark" ? "default" : "outline"} onClick={() => setMode("dark")}>Dark</Button>
          </div>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-6">
          <h2 className="text-xl">Colors ({mode})</h2>
          <div className="mt-4 space-y-3">
            {COLOR_KEYS.map(([k, label]) => (
              <div key={k} className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label={label}
                  value={palette[k]}
                  onChange={(e) => setColor(k, e.target.value)}
                  className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent"
                />
                <span className="w-40 text-sm">{label}</span>
                <Input value={palette[k]} onChange={(e) => setColor(k, e.target.value)} className="w-28 font-mono text-xs" maxLength={7} />
              </div>
            ))}
          </div>
        </section>
        <section className="card-surface p-6">
          <h2 className="text-xl">Live preview</h2>
          <style>{themeToCss(theme, "#theme-preview")}</style>
          <div id="theme-preview" className={mode === "dark" ? "dark" : ""}>
            <div className="mt-4 rounded-2xl border border-border bg-background p-6">
              <p className="eyebrow">Preview</p>
              <h3 className="mt-2 text-2xl">A calm, confident smile</h3>
              <p className="mt-2 text-sm text-muted-foreground">This is how your chosen colors look on the website.</p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-button px-4 py-2 text-sm font-medium text-button-foreground">Book Appointment</span>
                <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-heading">Contact</span>
              </div>
              <div className="mt-4 rounded-xl bg-header p-3 text-sm text-heading">Header</div>
              <div className="mt-2 rounded-xl bg-footer p-3 text-sm text-footer-foreground">Footer</div>
            </div>
          </div>
        </section>
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        <Button variant="outline" onClick={() => setTheme(sanitizeTheme(data.theme))}>Cancel</Button>
      </div>
    </div>
  );
}

/* ---------------- Opening hours & booking ---------------- */

function ScheduleSection() {
  const q = useQueryClient();
  const { data } = useSuspenseQuery(settingsQuery);
  const booking = (data.booking ?? {}) as BookingSettings;
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const hours: BookingSettings["hours"] = {};
    for (const [k] of DAYS) {
      hours[k] = {
        open: d.get(`open_${k}`) === "on",
        start: String(d.get(`start_${k}`) ?? "10:30"),
        end: String(d.get(`end_${k}`) ?? "19:00"),
      };
    }
    const next: BookingSettings = {
      slot_minutes: Number(d.get("slot_minutes")) || 30,
      max_days_ahead: Number(d.get("max_days_ahead")) || 60,
      hours_confirmed: d.get("hours_confirmed") === "on",
      hours,
      holidays: String(d.get("holidays") ?? "").split("\n").map((x) => x.trim()).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)),
      blocked: String(d.get("blocked") ?? "").split("\n").map((x) => x.trim()).filter(Boolean).map((l) => {
        const [date = "", start = "", end = ""] = l.split(/\s+/);
        return { date, start, end };
      }).filter((b) => /^\d{4}-\d{2}-\d{2}$/.test(b.date) && b.start && b.end),
    };
    setBusy(true);
    try {
      const { error } = await supabase.from("settings").upsert({ key: "booking", value: next } as never);
      if (error) throw error;
      toast.success("Opening hours saved");
      await q.invalidateQueries({ queryKey: ["public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="text-3xl">Opening hours & booking</h1>
        <p className="mt-1 text-muted-foreground">These times control which appointment slots patients can book.</p>
      </div>
      <section className="card-surface space-y-4 p-6">
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="slot_minutes">Appointment length (minutes)</Label>
            <Input id="slot_minutes" name="slot_minutes" type="number" min={10} max={120} step={5} defaultValue={booking.slot_minutes ?? 30} className="w-28" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max_days_ahead">Book up to (days ahead)</Label>
            <Input id="max_days_ahead" name="max_days_ahead" type="number" min={1} max={180} defaultValue={booking.max_days_ahead ?? 60} className="w-28" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <Checkbox name="hours_confirmed" defaultChecked={booking.hours_confirmed === true} /> Hours confirmed by the clinic
          </label>
        </div>
      </section>
      <section className="card-surface p-6">
        <h2 className="text-xl">Weekly hours</h2>
        <div className="mt-4 space-y-3">
          {DAYS.map(([k, label]) => {
            const day = booking.hours?.[k];
            return (
              <div key={k} className="flex flex-wrap items-center gap-3">
                <label className="flex w-36 items-center gap-2 text-sm font-medium">
                  <Checkbox name={`open_${k}`} defaultChecked={day?.open !== false} /> {label}
                </label>
                <Input name={`start_${k}`} type="time" defaultValue={day?.start ?? "10:30"} className="w-32" aria-label={`${label} opens`} />
                <span className="text-muted-foreground">to</span>
                <Input name={`end_${k}`} type="time" defaultValue={day?.end ?? "19:00"} className="w-32" aria-label={`${label} closes`} />
              </div>
            );
          })}
        </div>
      </section>
      <section className="card-surface grid gap-4 p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="holidays">Holidays (one date per line, YYYY-MM-DD)</Label>
          <Textarea id="holidays" name="holidays" rows={5} defaultValue={(booking.holidays ?? []).join("\n")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="blocked">Blocked times (one per line: YYYY-MM-DD HH:MM HH:MM)</Label>
          <Textarea id="blocked" name="blocked" rows={5} defaultValue={(booking.blocked ?? []).map((b) => `${b.date} ${b.start} ${b.end}`).join("\n")} />
        </div>
      </section>
      <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}

/* ---------------- My account ---------------- */

function AccountSection() {
  const { data: a } = useSuspenseQuery(accountQuery);
  const [busy, setBusy] = useState(false);

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const password = String(d.get("password") ?? "");
    if (password !== d.get("confirm")) { toast.error("Passwords do not match"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-3xl">My account</h1>
      <section className="card-surface space-y-2 p-6">
        <p className="font-medium text-heading">{a?.profile?.full_name}</p>
        <p className="text-sm text-muted-foreground">{a?.user?.email}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {(a?.roles ?? []).map((r) => (
            <span key={r} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {ROLE_LABELS[r as AppRole] ?? r}
            </span>
          ))}
        </div>
      </section>
      <section className="card-surface p-6">
        <h2 className="text-xl">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" />
          </div>
          <Button type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
        </form>
      </section>
    </div>
  );
}
