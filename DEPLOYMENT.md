# Deployment Guide — M'brace Multi Speciality Dental Clinic Website

This guide explains how to put the website live and keep it running.

---

## 1. Publish from Lovable (recommended)

1. Open the project in Lovable.
2. Click **Publish** (top-right on desktop; bottom-right in Preview mode on mobile).
3. Click **Publish changes**. The site goes live at a `*.lovable.app` address.
4. Every time you change the website, click **Publish → Publish changes** again.
   The live site only updates when you publish.

**What updates immediately, without publishing**
- Content saved in the staff dashboard (services, dentists, gallery, FAQs, blog,
  testimonials, opening hours, colours, website text). These are stored in the
  database and appear on the live site straight away.
- Appointments and enquiries submitted by patients.

**What needs a publish**
- Changes to the website's design or code.

## 2. Connect your own domain (optional, paid Lovable plan)

1. Go to **Project Settings → Domains** (or **Publish → Add custom domain**).
2. Enter your domain, e.g. `mbracedental.in`.
3. Add the DNS records Lovable shows you at your domain registrar
   (GoDaddy, Hostinger, Namecheap, etc.).
4. Wait for DNS to update (from minutes up to 48 hours). HTTPS is set up automatically.
5. Publish the project — a connected domain shows nothing until it is published.

## 3. First steps after going live

1. Sign in at `/auth` with the Super Admin account.
2. In the dashboard, enter the **real** clinic details:
   - **Website content**: phone number, email, introduction text, hero photo.
   - **Opening hours**: confirmed weekly hours, appointment length, holidays.
   - **Dentists**: names, photos and qualifications (only verified details).
   - **Services**: the services the clinic actually offers (prices optional).
3. Review the **Privacy policy** and **Appointment policy** drafts and edit them.
4. Approve new staff accounts under **Users** and give each one a role.
5. Make a test booking on `/book` and confirm it appears under **Appointments**.

## 4. Email (password reset)

Password-reset links need an email sender. Until a sender domain is set up,
reset emails may not arrive reliably. To set it up, ask in the Lovable chat:
"Set up email sending for password reset" and follow the steps shown
(you will need access to your domain's DNS settings).

Appointments and enquiries are always saved in the dashboard, even when no
email is configured — the site never claims an email was sent when it wasn't.

## 5. Search engines

- Each page already has its own title and description.
- After publishing with your domain, add the site to
  [Google Search Console](https://search.google.com/search-console) and
  submit the homepage address.
- Update your Google Business Profile with the new website link.

## 6. Self-hosting (advanced, optional)

The site can be hosted outside Lovable (e.g. Cloudflare Workers). This needs a
developer:

1. Export the code to GitHub from Lovable (**GitHub → Connect**).
2. Install dependencies: `bun install`
3. Build: `bun run build`
4. Deploy the built worker output to Cloudflare (or another supported host),
   providing the public backend address and publishable key as environment
   variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`).
5. Never put private/service keys in the browser code or in public repositories.

Full guide: https://docs.lovable.dev/tips-tricks/self-hosting

## 7. Checklist before announcing the site

- [ ] Real phone, email and opening hours entered
- [ ] Dentist profiles and services added and published
- [ ] Policies reviewed by the clinic
- [ ] Test appointment booked and confirmed in the dashboard
- [ ] Test enquiry sent from the Contact page
- [ ] Site checked on a mobile phone
- [ ] Custom domain connected (if used) and published
