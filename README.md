# M’brace Dental Care

Build a Complete, Lightweight, Premium Dental Clinic Website

Act as an expert full-stack developer and UI/UX designer. Build a complete, functional, modern, premium, and responsive website for M'brace Multi Speciality Dental Clinic.

I want a useful, lightweight website with all essential features. Do not overcomplicate the project or add unnecessary modules.

IMPORTANT: Complete the entire project using this single prompt. Do not stop after creating the homepage, do not provide only a plan, and do not ask me to provide follow-up prompts to finish missing features. Implement all the requirements below in this task, using sensible defaults wherever details are missing.

If a particular external integration requires credentials or manual configuration, complete everything possible, clearly identify the required configuration, and implement a graceful fallback.

1. MOST IMPORTANT: IMPLEMENTATION ORDER

Follow this order while building the application.

Step 1: Complete the entire frontend first

Build all public website pages, admin dashboard pages, forms, navigation, responsive layouts, animations, carousels, dialogs, and frontend interactions.

Use centralized sample data temporarily where needed.

Complete the following before backend integration:

All public pages.

All admin pages.

Login and registration interfaces.

Forgot Password and Reset Password interfaces.

Appointment booking interface.

User management interface.

Website content management interface.

Website appearance customization interface.

Responsive navigation.

Loading, empty, success, and error states.

Delete confirmation dialogs.

Light and dark themes.

Automatically scrolling testimonial carousel.

Do not begin configuring the database or authentication before completing the frontend.

Step 2: Connect the backend

After completing the entire frontend, connect Supabase for authentication, database storage, and the required backend functionality.

Replace mock data with real database data wherever applicable.

Step 3: Test and finish

Test the main workflows, fix errors, verify responsive behavior, and ensure that all buttons and forms perform their intended actions.

Do not stop after Step 1. Complete Steps 1, 2, and 3 within this task.

If a provider requires credentials that I have not supplied, implement the integration and provide clear setup instructions instead of pretending it works.

2. TECHNOLOGY STACK

Use a simple, maintainable stack:

React.

TypeScript.

Vite.

Tailwind CSS.

shadcn/ui for useful UI components.

Lucide React for icons.

React Router for routing.

Supabase for PostgreSQL database and authentication.

Supabase Storage for images if appropriate and available.

CSS transitions for lightweight animations.

Use only the dependencies you genuinely need.

Do not add a separate Flask or Node.js backend unless a specific requirement cannot be implemented safely using the selected architecture.

Use Supabase features and server-side functions where appropriate.

Do not expose privileged API keys in frontend code.

Cost requirements

My goal is to spend money only on purchasing the domain name.

Therefore:

Avoid paid SMS services.

Do not implement SMS OTP.

Avoid paid authentication services.

Avoid paid AI APIs.

Avoid paid UI libraries.

Avoid paid image assets.

Avoid unnecessary paid integrations.

Use free and open-source tools wherever practical.

Do not introduce a paid service without explaining why it is necessary.

Use free service tiers where available, but do not assume that hosting, databases, image storage, email delivery, or backups are unlimited or permanently free.

Keep the application portable so it can be moved to another suitable provider if necessary.

3. CLINIC INFORMATION

Use the following initial information.

Clinic name: M'brace Multi Speciality Dental Clinic

Address: Shop No. 110, First Floor, Moti Mahal, near Dhange Hospital, Chudi Mohalla, Bhiwandi, Maharashtra 421308, India.

Timezone: Asia/Kolkata.

Initial opening-time reference: 10:30 AM.

The supplied clinic screenshot shows the clinic opening at 10:30 AM. Do not invent the complete weekly schedule. Make the opening and closing times editable from the admin dashboard.

The screenshot also displays a 5.0 rating based on 13 reviews. Treat these as reference details, not independently verified live information. Do not fabricate reviews or claim that a live Google rating is connected.

Do not invent:

Phone numbers.

Email addresses.

Dentist names.

Qualifications.

Registration numbers.

Service prices.

Exact weekly opening hours.

Allow the Super Admin to add these details later.

Use the clinic name as a temporary logo if no actual logo is provided. Use replaceable, royalty-free dental images if genuine clinic photographs are unavailable.

4. DESIGN: MODERN, PREMIUM, AND LIGHTWEIGHT

Create a professional dental website with a calm, clean, trustworthy visual identity.

Use this initial color palette:

Primary teal: #087F8C.

Dark teal: #075E68.

Soft mint: #DDF5F0.

Background: #F8FBFC.

Main text: #202B33.

Secondary text: #64727C.

White: #FFFFFF.

Border: #E3EAED.

These must be editable through the admin dashboard.

Design guidelines:

Clean typography.

Generous whitespace.

High-quality images.

Consistent spacing.

Attractive buttons.

Rounded cards.

Subtle shadows.

Clean navigation.

Simple icons.

Clear calls to action.

Responsive layouts.

Consistent styling across all pages.

Avoid heavy animations, large background videos, unnecessary 3D effects, excessive gradients, excessive glassmorphism, and large UI libraries.

Use subtle fade-ins, hover effects, and short transitions.

Respect reduced-motion preferences.

The website must load quickly and work well on mid-range mobile phones.

5. PUBLIC WEBSITE PAGES

Build these pages completely.

A. Home Page

Include:

Responsive header and navigation.

Clinic logo and name.

Hero section with a dental image.

Headline: "Confident Smiles Begin With Exceptional Care".

Editable introduction.

Book Appointment button.

Contact button.

Clinic highlights.

Featured dental services.

Dentist introduction.

About clinic section.

Why Choose Us section.

Automatically scrolling testimonials.

Clinic image gallery preview.

FAQ preview.

Clinic address and opening hours.

Directions link.

Contact call to action.

Footer with useful links.

Every section should use real database content after backend integration.

Allow the Super Admin to edit or hide optional homepage sections.

B. About Page

Include:

Clinic introduction.

Mission and approach.

Dentist information.

Clinic photographs.

Facilities and hygiene information when supplied.

Contact and appointment buttons.

All content must be editable.

C. Services Page

Create a responsive list of dental services.

Suggested examples:

Teeth Cleaning.

Teeth Whitening.

Root Canal Treatment.

Dental Implants.

Braces and Aligners.

Dental Crowns.

Tooth Extraction.

Pediatric Dentistry.

Gum Treatment.

Cosmetic Dentistry.

These are examples only. Let the Super Admin decide which services the clinic actually offers.

Each service should support a title, image, short description, full description, optional price, optional duration, publication status, and display order.

Create individual service detail pages using dynamic routes.

Include an appointment button on each service page.

D. Our Dentists Page

Display dentist profiles containing:

Name.

Photograph.

Designation.

Qualifications.

Specialization.

Biography.

Languages, if provided.

Available consultation hours.

Do not invent professional credentials.

E. Gallery Page

Include:

Clinic photographs.

Team photographs.

Facilities.

Approved before-and-after treatment images.

Add category filters and a lightweight image lightbox.

Only publish identifiable patient photographs with appropriate consent.

F. Testimonials Page

Display approved testimonials.

Include:

Patient display name.

Review text.

Optional rating.

Optional date.

Do not publish unapproved testimonials.

Do not create fake production reviews.

G. Contact Page

Include:

Clinic address.

Phone number if configured.

Email if configured.

Opening hours.

Directions link.

Contact form.

Contact form fields:

Name.

Email.

Optional phone.

Message.

Save enquiries to the database.

Validate input and show clear success and error messages.

H. FAQ Section

Create an accessible accordion containing frequently asked questions.

Allow the Super Admin to add, edit, reorder, publish, and delete FAQs.

I. Blog

Create a simple blog listing and individual article pages.

Allow the admin to create, edit, publish, unpublish, and delete articles.

Do not make the blog unnecessarily complex.

J. Privacy Policy

Create an editable privacy policy page and a basic appointment/cancellation policy page.

Use sensible draft content that the clinic owner can review.

6. APPOINTMENT BOOKING

Implement a functional appointment request system.

Patients should be able to:

Select a dental service.

Select a dentist if applicable.

Choose a date.

Choose an available time.

Enter their name.

Enter their email and phone number.

Add an optional message.

Submit the request.

See a confirmation or pending-status message.

Store appointments in the database.

Appointment statuses:

Pending.

Confirmed.

Completed.

Cancelled.

Rejected.

No-show.

The admin must be able to:

View appointments.

Search appointments.

Filter by date and status.

Confirm requests.

Reject requests.

Reschedule appointments.

Cancel appointments.

Mark appointments completed.

Mark no-shows.

Delete eligible records.

Allow the admin to configure opening hours, appointment duration, holidays, and blocked time slots.

Prevent double booking using backend/database checks, not just frontend validation.

Use the Asia/Kolkata timezone.

Do not require patient registration to submit a basic appointment request.

7. ADMIN DASHBOARD

Create a secure /admin area with a responsive sidebar.

The dashboard should display real statistics after backend integration.

Summary cards:

Total Appointments.

Today's Appointments.

Pending Appointments.

Confirmed Appointments.

Total Patient Records.

New Enquiries.

Pending User Approvals.

Testimonials Awaiting Review.

Include:

Recent appointments.

Upcoming appointments.

Recent enquiries.

Recent testimonials.

Quick actions.

Use real database data.

Use sample data only during frontend development.

Keep the dashboard clean and lightweight.

8. ADMIN MANAGEMENT PAGES

Create the following functional management pages.

A. Appointments

View, search, filter, confirm, reject, reschedule, cancel, complete, and delete eligible appointment records.

B. Patients

View patient contact details and appointment history.

Restrict access to authorized staff.

Do not build an unnecessarily complicated electronic medical record system.

C. Dentists

Add, edit, publish, hide, and delete dentist profiles.

Manage photographs, qualifications, services, and availability.

D. Services

Add, edit, reorder, publish, unpublish, and delete services.

E. Testimonials

Approve, reject, edit where appropriate, feature, publish, unpublish, and delete testimonials.

Only approved and published testimonials may appear on the public website.

F. Gallery

Upload, replace, reorder, publish, hide, and delete images.

Delete stored image files only when they are no longer referenced.

G. Enquiries

View, search, filter, update status, add notes, resolve, and delete eligible enquiries.

H. Blog

Create, edit, preview, publish, unpublish, and delete posts.

I. FAQs

Add, edit, reorder, publish, hide, and delete FAQs.

J. User Management

Allow the Super Admin to:

View users.

Approve registrations.

Reject registrations.

Suspend accounts.

Reactivate accounts.

Assign permitted roles.

Delete users.

K. Website Content

Allow the Super Admin to edit:

Homepage heading and description.

Hero image.

About content.

Contact details.

Footer.

Clinic timings.

Featured services.

Featured dentists.

Testimonials displayed on the homepage.

FAQs.

Social links.

Navigation visibility.

Section visibility.

Changes must persist and appear on the public website.

9. AUTHENTICATION WITHOUT PAID SMS

Use Supabase Authentication where appropriate.

Implement:

Registration.

Login.

Logout.

Forgot Password.

Reset Password.

Change Password.

Current user profile.

Protected admin routes.

Account approval.

Role-based permissions.

Do not use SMS OTP.

Use email and password.

Registration

Fields:

Name.

Email.

Password.

Confirm password.

New staff accounts should have a PENDING status.

Do not let users choose their own privileged role.

Super Admin

Create the first Super Admin through a secure setup procedure.

Do not create a public endpoint that allows anyone to become Super Admin.

Never expose privileged database keys.

User approval

The Super Admin approves or rejects newly registered staff accounts.

Pending accounts must not access the admin dashboard or protected APIs.

Forgot Password

Use email-based password recovery.

The user enters their email and receives a secure reset link through the configured email delivery service.

Implement token expiration, single-use reset tokens, rate limiting, and safe error messages.

If Supabase Authentication is used, prefer its supported password-reset workflow rather than implementing an unnecessary custom authentication system.

Configure the correct application URL and allowed redirect URLs.

Do not claim email recovery is operational until email delivery has been configured and tested.

Use a free email option where practical, subject to provider limits.

For local development, provide a safe development-only method to test password recovery.

Do not reveal reset tokens in production.

Security

Use server-side authorization and secure session management.

Do not rely only on frontend route protection.

10. USER ROLES

Implement these roles:

SUPER_ADMIN.

ADMIN.

RECEPTIONIST.

DENTIST.

CONTENT_MANAGER.

For the initial release, prioritize SUPER_ADMIN and ADMIN. Support the remaining roles without adding unnecessary complexity.

The Super Admin has full control.

The Admin manages clinic operations according to assigned permissions.

The Receptionist manages appointments and relevant contact details.

The Dentist accesses assigned appointments and permitted patient information.

The Content Manager manages public website content but cannot access private patient information or user administration by default.

Enforce all permissions in the database policies and trusted backend operations.

Do not trust role values supplied by the frontend.

11. WEBSITE COLOR AND THEME CUSTOMIZATION

Create a dedicated Website Appearance page in the admin dashboard.

The Super Admin must be able to change:

Primary color.

Secondary color.

Accent color.

Background color.

Heading color.

Body text color.

Secondary text color.

Button background.

Button text.

Header background.

Footer background.

Footer text.

Border color.

Include:

Color picker.

Hexadecimal color input.

Live preview.

Save Changes.

Cancel.

Reset to Default.

Also support a small set of theme presets:

Dental Teal.

Medical Blue.

Fresh Mint.

Elegant Neutral.

Add light and dark themes.

Allow the Super Admin to configure the default public theme.

Save settings to the database.

Apply saved settings across all public pages using CSS custom properties.

Do not hardcode colors independently in every component.

Validate theme values.

Do not allow arbitrary CSS or JavaScript injection.

12. AUTOMATICALLY SCROLLING TESTIMONIALS

Create a smooth testimonial carousel on the homepage.

Requirements:

Automatic scrolling.

Smooth transitions.

Responsive cards.

Previous and next buttons.

Pause on hover.

Pause when keyboard focus enters.

Touch-friendly interaction.

Accessible controls.

Reduced-motion support.

Configurable scrolling speed.

Ability to disable automatic scrolling.

The Super Admin should be able to select which approved testimonials appear.

Do not make the carousel too fast.

Support optional carousels for services or gallery previews, but do not add automatic scrolling everywhere unnecessarily.

A static grid is preferable when it is simpler and more usable.

13. DELETE FUNCTIONALITY

Add deletion functionality to every appropriate management page.

The Super Admin must be able to delete:

Users.

Testimonials.

Services.

Dentist profiles.

Gallery images.

Blog posts.

FAQs.

Enquiries.

Eligible notifications.

Other appropriate content records.

Every delete action must show a confirmation dialog.

The dialog should identify the record and explain the consequences.

After confirmation:

Verify permissions on the backend.

Perform the appropriate deletion.

Clean up associated files when safe.

Update the UI.

Show success or error feedback.

Important deletion rules

Do not allow deletion of the final active Super Admin.

Revoke access immediately when a user is deleted.

Invalidate relevant sessions.

Do not delete shared images still used elsewhere.

Do not accidentally delete unrelated records.

Do not automatically erase appointment history or patient records without considering retention requirements.

Prefer cancellation, archival, or anonymization where permanent deletion is inappropriate.

Use a consistent deletion pattern across the admin panel.

14. DATABASE AND STORAGE

Use a clean relational database structure.

Create only the tables required for the actual features.

Suggested entities:

profiles.

dentists.

services.

patients.

appointments.

testimonials.

gallery_images.

enquiries.

faqs.

blog_posts.

website_settings.

clinic_settings.

notifications.

audit_logs, where appropriate.

Use appropriate relationships, indexes, and constraints.

Use Row Level Security for sensitive Supabase tables.

Public visitors may read published services, approved testimonials, published blog posts, and public clinic settings.

Public visitors must not read patient records, private enquiries, or administrative data.

Pending users must not access protected admin information.

Do not expose service-role keys.

Use safe image uploads and appropriate storage policies.

Delete unreferenced files when safe.

Do not store large image files directly in database records.

15. CONTACT AND EMAIL

Store contact enquiries in the database.

Provide an email-notification integration point for new appointment requests and enquiries.

Use a suitable free email service where possible.

Keep email configuration replaceable.

If the email provider is not configured, still save the enquiry or appointment and show the correct submission status.

Do not claim an email was sent when it was not.

Do not require paid SMS.

Use environment variables for email configuration.

Provide clear setup instructions for any credentials that must be supplied.

16. RESPONSIVE DESIGN

Ensure every public and admin page works on:

Mobile phones.

Tablets.

Laptops.

Desktop computers.

Pay particular attention to:

Mobile navigation.

Booking forms.

Admin tables.

Sidebar behavior.

Modals.

Color pickers.

Image galleries.

Testimonial carousels.

Avoid horizontal scrolling.

Use touch-friendly buttons.

Use responsive layouts and readable font sizes.

17. PERFORMANCE

Keep the application lightweight.

Implement:

Lazy-loaded images.

Responsive image sizes.

Minimal dependencies.

Efficient database queries.

Pagination for large lists.

Lightweight CSS animations.

Optimized production builds.

Minimal unnecessary re-renders.

Reusable components.

Proper loading states.

Avoid:

Heavy animation libraries for simple effects.

Large video backgrounds.

Unnecessary charts.

Duplicate dependencies.

Loading all gallery images at once.

Unnecessary real-time subscriptions.

Excessive polling.

The application should remain responsive on ordinary mobile devices.

18. SEO AND ACCESSIBILITY

Implement:

Page titles.

Meta descriptions.

Open Graph metadata.

Semantic HTML.

Proper heading hierarchy.

Descriptive image alt text.

Sitemap and robots.txt where supported.

Search-friendly service URLs.

Local business structured data using verified information.

Accessible forms.

Keyboard navigation.

Visible focus indicators.

Proper color contrast.

Reduced-motion support.

Do not invent business credentials or fake reviews.

19. FINAL TESTING

Before finishing, verify:

Every public page opens correctly.

Every navigation link works.

Every admin route exists.

Every major button performs its intended action.

Appointment requests save correctly.

Double bookings are prevented.

Login works.

Registration works.

Pending users cannot access the admin dashboard.

Password recovery works when email is configured.

User approval works.

Role-based permissions work.

Testimonials require approval.

Theme changes persist after refreshing.

Light and dark themes work.

Delete confirmations work.

Unauthorized users cannot delete records.

Patient information remains private.

Images load correctly.

Missing contact information is handled gracefully.

Mobile layouts do not overflow.

There are no avoidable build or runtime errors.

Use real database data after backend integration.

Do not leave core modules connected to mock data.

Do not leave buttons that only show fake success messages.

If a feature depends on external configuration that cannot be completed automatically, document exactly what is missing and implement everything else.

FINAL INSTRUCTION

Build the complete application from this single prompt.

First, finish all public pages, admin pages, styling, responsive layouts, carousels, and frontend interactions.

Then connect Supabase and implement authentication, database operations, user approval, appointment management, theme persistence, content management, and deletion functionality.

Finally, test the entire application and fix the issues you can resolve within this task.

Keep the project simple, premium, lightweight, and maintainable.

Do not add unnecessary features.

Do not stop after the homepage.

Do not stop after creating the admin dashboard.

Do not ask me to provide another prompt to implement the remaining requirements.

Use sensible defaults for missing information, keep the clinic's details editable, and clearly identify any external configuration that requires my involvement.

The final result must be a complete, functional dental clinic website with a professional design and the lowest practical operating cost.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2d0417d5-e25e-4d92-ab20-0f757a747104).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
