
create type public.app_role as enum ('super_admin','admin','receptionist','dentist','content_manager');
create type public.account_status as enum ('pending','approved','rejected','suspended');
create type public.appointment_status as enum ('pending','confirmed','completed','cancelled','rejected','no_show');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  status public.account_status not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.is_staff(_uid uuid, _roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r join public.profiles p on p.id = r.user_id
    where r.user_id = _uid and p.status = 'approved' and r.role = any(_roles)
  )
$$;
create or replace function public.is_content_staff(_uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff(_uid, array['super_admin','admin','content_manager']::public.app_role[]) $$;
create or replace function public.is_ops_staff(_uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff(_uid, array['super_admin','admin','receptionist']::public.app_role[]) $$;
create or replace function public.is_super_admin(_uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff(_uid, array['super_admin']::public.app_role[]) $$;

create policy "own or admins read profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid(), array['super_admin','admin']::public.app_role[]));
create policy "own or super admin update profiles" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_super_admin(auth.uid()))
  with check (id = auth.uid() or public.is_super_admin(auth.uid()));

create policy "own or super admin read roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin(auth.uid()));
create policy "super admin insert roles" on public.user_roles for insert to authenticated with check (public.is_super_admin(auth.uid()));
create policy "super admin update roles" on public.user_roles for update to authenticated using (public.is_super_admin(auth.uid()));
create policy "super admin delete roles" on public.user_roles for delete to authenticated using (public.is_super_admin(auth.uid()));

-- guard profile changes
create or replace function public.guard_profile_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_super_admin(auth.uid()) then
    new.status := old.status; new.email := old.email;
  end if;
  if old.status = 'approved' and new.status <> 'approved'
     and exists (select 1 from public.user_roles where user_id = old.id and role = 'super_admin')
     and not exists (select 1 from public.user_roles r join public.profiles p on p.id = r.user_id
                     where r.role = 'super_admin' and p.status = 'approved' and r.user_id <> old.id) then
    raise exception 'Cannot deactivate the last active Super Admin';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles for each row execute function public.guard_profile_update();

create or replace function public.guard_role_delete() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'super_admin' and exists (select 1 from public.profiles where id = old.user_id)
     and not exists (select 1 from public.user_roles r join public.profiles p on p.id = r.user_id
       where r.role = 'super_admin' and p.status = 'approved' and r.user_id <> old.user_id) then
    raise exception 'Cannot remove the last active Super Admin';
  end if;
  return old;
end $$;
create trigger user_roles_guard before delete on public.user_roles for each row execute function public.guard_role_delete();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name', ''), 120), coalesce(new.email, ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- First super admin setup: works only while no super admin exists
create or replace function public.claim_first_super_admin() returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from public.user_roles where role = 'super_admin') then
    raise exception 'Setup already completed';
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'super_admin');
  update public.profiles set status = 'approved' where id = auth.uid();
  return true;
end $$;
create or replace function public.setup_available() returns boolean language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.user_roles where role = 'super_admin') $$;
revoke execute on function public.claim_first_super_admin() from anon, public;
grant execute on function public.claim_first_super_admin() to authenticated;

-- SETTINGS (key/value, all public-readable)
create table public.settings (
  key text primary key check (key in ('clinic','content','theme','booking')),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.settings to anon;
grant select, insert, update on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);
create policy "staff write settings" on public.settings for update to authenticated using (
  case key when 'theme' then public.is_super_admin(auth.uid())
           when 'booking' then public.is_staff(auth.uid(), array['super_admin','admin']::public.app_role[])
           else public.is_content_staff(auth.uid()) end);
create policy "staff insert settings" on public.settings for insert to authenticated with check (public.is_super_admin(auth.uid()));

-- CONTENT TABLES
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null, image_url text, short_description text not null default '',
  description text not null default '', price text, duration text,
  published boolean not null default true, featured boolean not null default false,
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.dentists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, name text not null, photo_url text, designation text, qualifications text,
  specialization text, bio text, languages text, consultation_hours text,
  published boolean not null default true, featured boolean not null default true,
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null, answer text not null,
  published boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null, excerpt text not null default '', content text not null default '',
  cover_image text, published boolean not null default false, published_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null default '', alt text not null default '',
  category text not null default 'clinic' check (category in ('clinic','team','facilities','before-after')),
  image_url text not null, storage_path text, consent_confirmed boolean not null default false,
  published boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 80),
  content text not null check (length(content) between 5 and 1500),
  rating int check (rating between 1 and 5), review_date date,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  published boolean not null default false, featured boolean not null default false,
  sort_order int not null default 0, created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['services','dentists','faqs','blog_posts','gallery_images','testimonials'] loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "content staff manage" on public.%I for all to authenticated using (public.is_content_staff(auth.uid())) with check (public.is_content_staff(auth.uid()))', t);
  end loop;
end $$;
grant insert on public.testimonials to anon;
create policy "public read" on public.services for select to anon, authenticated using (published);
create policy "public read" on public.dentists for select to anon, authenticated using (published);
create policy "public read" on public.faqs for select to anon, authenticated using (published);
create policy "public read" on public.blog_posts for select to anon, authenticated using (published);
create policy "public read" on public.gallery_images for select to anon, authenticated using (published);
create policy "public read" on public.testimonials for select to anon, authenticated using (published and status = 'approved');
create policy "public submit" on public.testimonials for insert to anon, authenticated
  with check (status = 'pending' and published = false and featured = false);

-- PATIENTS / APPOINTMENTS
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null unique, phone text not null default '',
  created_at timestamptz not null default now()
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  dentist_id uuid references public.dentists(id) on delete set null,
  appointment_date date not null, start_time time not null,
  status public.appointment_status not null default 'pending',
  name text not null, email text not null, phone text not null, message text,
  admin_notes text, created_at timestamptz not null default now()
);
create unique index appointments_no_double_booking on public.appointments
  (appointment_date, start_time, coalesce(dentist_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where status in ('pending','confirmed');
create index appointments_date_idx on public.appointments (appointment_date);
create index appointments_status_idx on public.appointments (status);

grant select, update, delete on public.patients to authenticated;
grant select, update, delete on public.appointments to authenticated;
grant all on public.patients, public.appointments to service_role;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
create policy "ops read patients" on public.patients for select to authenticated using (
  public.is_ops_staff(auth.uid()) or exists (select 1 from public.appointments a join public.dentists d on d.id = a.dentist_id
   where a.patient_id = patients.id and d.user_id = auth.uid() and public.is_staff(auth.uid(), array['dentist']::public.app_role[])));
create policy "ops update patients" on public.patients for update to authenticated using (public.is_ops_staff(auth.uid()));
create policy "super admin delete patients" on public.patients for delete to authenticated using (public.is_super_admin(auth.uid()));
create policy "ops read appointments" on public.appointments for select to authenticated using (
  public.is_ops_staff(auth.uid()) or (public.is_staff(auth.uid(), array['dentist']::public.app_role[])
   and exists (select 1 from public.dentists d where d.id = appointments.dentist_id and d.user_id = auth.uid())));
create policy "ops update appointments" on public.appointments for update to authenticated using (public.is_ops_staff(auth.uid()));
create policy "admins delete closed appointments" on public.appointments for delete to authenticated using (
  public.is_staff(auth.uid(), array['super_admin','admin']::public.app_role[]) and status in ('cancelled','rejected'));

-- ENQUIRIES
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 255),
  phone text check (phone is null or length(phone) <= 20),
  message text not null check (length(message) between 5 and 2000),
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  notes text, created_at timestamptz not null default now()
);
grant insert on public.enquiries to anon;
grant select, insert, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "public submit enquiry" on public.enquiries for insert to anon, authenticated with check (status = 'new' and notes is null);
create policy "ops read enquiries" on public.enquiries for select to authenticated using (public.is_ops_staff(auth.uid()));
create policy "ops update enquiries" on public.enquiries for update to authenticated using (public.is_ops_staff(auth.uid()));
create policy "admins delete enquiries" on public.enquiries for delete to authenticated using (public.is_staff(auth.uid(), array['super_admin','admin']::public.app_role[]));

create or replace function public.limit_submissions() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'enquiries' and (select count(*) from public.enquiries where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many submissions. Please try again later.';
  end if;
  if tg_table_name = 'testimonials' and (select count(*) from public.testimonials where created_at > now() - interval '1 hour' and status = 'pending') >= 30 then
    raise exception 'Too many submissions. Please try again later.';
  end if;
  return new;
end $$;
create trigger enquiries_limit before insert on public.enquiries for each row execute function public.limit_submissions();
create trigger testimonials_limit before insert on public.testimonials for each row execute function public.limit_submissions();

-- BOOKING HELPERS
create or replace function public.kolkata_now() returns timestamp language sql stable as $$ select (now() at time zone 'Asia/Kolkata') $$;

create or replace function public.validate_slot(p_date date, p_time time) returns void language plpgsql stable security definer set search_path = public as $$
declare b jsonb; d jsonb; slot int; dkey text; st time; en time;
begin
  select value into b from public.settings where key = 'booking';
  slot := coalesce((b->>'slot_minutes')::int, 30);
  if p_date < public.kolkata_now()::date then raise exception 'Please choose a future date'; end if;
  if p_date > public.kolkata_now()::date + coalesce((b->>'max_days_ahead')::int, 60) then raise exception 'That date is too far ahead'; end if;
  if p_date + p_time <= public.kolkata_now() then raise exception 'That time has already passed'; end if;
  dkey := lower(to_char(p_date, 'dy'));
  d := b->'hours'->dkey;
  if d is null or coalesce((d->>'open')::boolean, false) = false then raise exception 'The clinic is closed on that day'; end if;
  st := (d->>'start')::time; en := (d->>'end')::time;
  if p_time < st or p_time + make_interval(mins => slot) > en then raise exception 'That time is outside opening hours'; end if;
  if (extract(epoch from (p_time - st))::int / 60) % slot <> 0 then raise exception 'Invalid time slot'; end if;
  if coalesce(b->'holidays', '[]'::jsonb) ? p_date::text then raise exception 'The clinic is closed on that date'; end if;
  if exists (select 1 from jsonb_array_elements(coalesce(b->'blocked','[]'::jsonb)) x
     where x->>'date' = p_date::text and p_time >= (x->>'start')::time and p_time < (x->>'end')::time) then
    raise exception 'That time slot is unavailable'; end if;
end $$;

create or replace function public.get_booked_slots(p_date date, p_dentist uuid default null)
returns table(start_time time) language sql stable security definer set search_path = public as $$
  select a.start_time from public.appointments a
  where a.appointment_date = p_date and a.status in ('pending','confirmed')
    and coalesce(a.dentist_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(p_dentist, '00000000-0000-0000-0000-000000000000'::uuid)
$$;
grant execute on function public.get_booked_slots(date, uuid) to anon, authenticated;

create or replace function public.book_appointment(p_service uuid, p_dentist uuid, p_date date, p_time time,
  p_name text, p_email text, p_phone text, p_message text)
returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid; aid uuid;
begin
  p_name := trim(coalesce(p_name,'')); p_email := lower(trim(coalesce(p_email,''))); p_phone := trim(coalesce(p_phone,''));
  if length(p_name) < 2 or length(p_name) > 100 then raise exception 'Please enter your full name'; end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(p_email) > 255 then raise exception 'Please enter a valid email'; end if;
  if p_phone !~ '^[0-9+\-\s()]{7,20}$' then raise exception 'Please enter a valid phone number'; end if;
  if length(coalesce(p_message,'')) > 1000 then raise exception 'Message is too long'; end if;
  if p_service is not null and not exists (select 1 from public.services where id = p_service and published) then raise exception 'Invalid service'; end if;
  if p_dentist is not null and not exists (select 1 from public.dentists where id = p_dentist and published) then raise exception 'Invalid dentist'; end if;
  perform public.validate_slot(p_date, p_time);
  if (select count(*) from public.appointments where email = p_email and status = 'pending' and created_at > now() - interval '1 day') >= 3 then
    raise exception 'You already have several pending requests. We will contact you shortly.'; end if;
  insert into public.patients (name, email, phone) values (p_name, p_email, p_phone)
    on conflict (email) do update set name = excluded.name, phone = excluded.phone
    returning id into pid;
  begin
    insert into public.appointments (patient_id, service_id, dentist_id, appointment_date, start_time, name, email, phone, message)
    values (pid, p_service, p_dentist, p_date, p_time, p_name, p_email, p_phone, nullif(trim(coalesce(p_message,'')), ''))
    returning id into aid;
  exception when unique_violation then
    raise exception 'Sorry, that time slot was just booked. Please choose another.';
  end;
  return aid;
end $$;
grant execute on function public.book_appointment(uuid, uuid, date, time, text, text, text, text) to anon, authenticated;

-- Admin reschedule uses the same validation
create or replace function public.reschedule_appointment(p_id uuid, p_date date, p_time time) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_ops_staff(auth.uid()) then raise exception 'Not allowed'; end if;
  perform public.validate_slot(p_date, p_time);
  begin
    update public.appointments set appointment_date = p_date, start_time = p_time where id = p_id;
  exception when unique_violation then raise exception 'That slot is already booked'; end;
end $$;
revoke execute on function public.reschedule_appointment(uuid, date, time) from anon, public;
grant execute on function public.reschedule_appointment(uuid, date, time) to authenticated;

-- SEED
insert into public.settings (key, value) values
('clinic', '{"name":"M''brace Multi Speciality Dental Clinic","short_name":"M''brace","address":"Shop No. 110, First Floor, Moti Mahal, near Dhange Hospital, Chudi Mohalla, Bhiwandi, Maharashtra 421308, India","phone":"","whatsapp":"","email":"","maps_url":"https://www.google.com/maps/search/?api=1&query=M%27brace+Multi+Speciality+Dental+Clinic+Bhiwandi","hours_note":"Opens at 10:30 AM. Full weekly timings will be updated soon.","rating_note":"Rated 5.0 from 13 reviews on Google (reference, not live)","socials":{"instagram":"","facebook":"","youtube":""}}'),
('content', '{"hero_title":"Confident Smiles Begin With Exceptional Care","hero_text":"Gentle, modern dentistry for the whole family in Bhiwandi — from routine check-ups to complete smile makeovers.","hero_image":"/images/hero.jpg","about_title":"Care that puts you at ease","about_text":"M''brace Multi Speciality Dental Clinic offers thoughtful, unhurried dental care in a clean and calm environment. We explain every step, respect your time, and focus on treatment that lasts.","mission":"Our mission is simple: honest advice, careful treatment, and a comfortable experience for every patient.","approach":"We begin with a thorough examination, talk you through your options, and plan treatment that fits your needs and budget.","hygiene":"We follow strict sterilisation and infection-control practices for every patient.","about_image":"/images/clinic.jpg","footer_text":"Modern, gentle dental care in Bhiwandi.","why_us":[{"title":"Gentle approach","text":"Comfort-first care for anxious patients and children."},{"title":"Clear explanations","text":"Know your options before any treatment begins."},{"title":"Hygiene first","text":"Strict sterilisation for every instrument, every visit."},{"title":"Modern dentistry","text":"Contemporary techniques for lasting results."}],"highlights":[{"title":"Multi-speciality care","text":"Many treatments under one roof"},{"title":"Family friendly","text":"Care for kids, adults and seniors"},{"title":"Easy to reach","text":"Near Dhange Hospital, Bhiwandi"}],"sections":{"highlights":true,"services":true,"dentists":true,"about":true,"why":true,"testimonials":true,"gallery":true,"faq":true,"contact":true},"nav":{"about":true,"services":true,"dentists":true,"gallery":true,"testimonials":true,"blog":true,"faq":true,"contact":true},"carousel":{"autoplay":true,"interval":6},"privacy_policy":"This privacy policy explains how M''brace Multi Speciality Dental Clinic collects and uses your information.\n\nInformation we collect\nWhen you book an appointment or contact us, we collect your name, email address, phone number and any message you choose to share.\n\nHow we use it\nWe use this information only to respond to you, manage your appointments and provide dental care. We do not sell your information.\n\nStorage and security\nYour information is stored securely and accessed only by authorised clinic staff.\n\nYour choices\nYou may ask us to update or delete your contact details at any time by contacting the clinic.\n\nThis is a draft policy and should be reviewed by the clinic owner.","appointment_policy":"Appointment requests\nSubmitting a request online does not guarantee a slot. Our team will confirm your appointment.\n\nRescheduling and cancellation\nPlease let us know at least 24 hours in advance if you need to reschedule or cancel.\n\nLate arrivals\nIf you arrive late, we may need to shorten or reschedule your visit.\n\nThis is a draft policy and should be reviewed by the clinic owner."}'),
('theme', '{"default_mode":"light","light":{"primary":"#087F8C","secondary":"#075E68","accent":"#DDF5F0","background":"#F8FBFC","heading":"#202B33","text":"#202B33","muted":"#64727C","button_bg":"#087F8C","button_text":"#FFFFFF","header_bg":"#FFFFFF","footer_bg":"#075E68","footer_text":"#FFFFFF","border":"#E3EAED"},"dark":{"primary":"#3FBAC6","secondary":"#7FD4DC","accent":"#123B40","background":"#0E171B","heading":"#EEF5F7","text":"#DCE6EA","muted":"#93A3AC","button_bg":"#3FBAC6","button_text":"#0E171B","header_bg":"#121E23","footer_bg":"#0A1215","footer_text":"#DCE6EA","border":"#24343B"}}'),
('booking', '{"slot_minutes":30,"max_days_ahead":60,"hours_confirmed":false,"hours":{"mon":{"open":true,"start":"10:30","end":"19:00"},"tue":{"open":true,"start":"10:30","end":"19:00"},"wed":{"open":true,"start":"10:30","end":"19:00"},"thu":{"open":true,"start":"10:30","end":"19:00"},"fri":{"open":true,"start":"10:30","end":"19:00"},"sat":{"open":true,"start":"10:30","end":"19:00"},"sun":{"open":false,"start":"10:30","end":"14:00"}},"holidays":[],"blocked":[]}');

insert into public.services (slug, title, short_description, description, featured, sort_order, image_url) values
('teeth-cleaning','Teeth Cleaning','Professional scaling and polishing for a fresher, healthier mouth.','A professional cleaning removes plaque and tartar that brushing can''t reach, helping prevent gum disease and decay. We finish with polishing for a smooth, clean feel.', true, 1, null),
('teeth-whitening','Teeth Whitening','Brighten your smile safely under professional supervision.','Professional whitening lightens stains from tea, coffee and age. We assess your teeth first to recommend the safest option for you.', true, 2, null),
('root-canal-treatment','Root Canal Treatment','Relieve tooth pain and save your natural tooth.','Root canal treatment removes infected pulp, cleans the canals and seals the tooth, relieving pain while preserving your natural tooth.', true, 3, null),
('dental-implants','Dental Implants','A long-lasting, natural-looking replacement for missing teeth.','Implants replace missing teeth with a sturdy root and a natural-looking crown, restoring comfort while eating and speaking.', true, 4, null),
('braces-and-aligners','Braces and Aligners','Straighten teeth with braces or discreet clear aligners.','Orthodontic treatment corrects crowding, gaps and bite issues. We discuss braces and clear aligner options suited to you.', true, 5, null),
('dental-crowns','Dental Crowns','Protect and restore weak or damaged teeth.','Crowns cover and strengthen teeth that are cracked, heavily filled or root-canal treated, restoring shape and function.', true, 6, null),
('tooth-extraction','Tooth Extraction','Gentle removal when a tooth cannot be saved.','When a tooth is badly damaged or impacted, we remove it gently with careful numbing and clear aftercare advice.', false, 7, null),
('pediatric-dentistry','Pediatric Dentistry','Friendly, patient care for children''s growing smiles.','We help children feel at ease with gentle check-ups, preventive care and treatment for young teeth.', false, 8, null),
('gum-treatment','Gum Treatment','Treat bleeding or swollen gums and protect your teeth.','Gum treatment ranges from deep cleaning to managing advanced gum disease, helping keep your teeth firmly in place.', false, 9, null),
('cosmetic-dentistry','Cosmetic Dentistry','Smile enhancements including veneers and bonding.','Cosmetic treatments improve the colour, shape and alignment of your teeth for a smile you''re confident sharing.', false, 10, null);

insert into public.faqs (question, answer, sort_order) values
('How do I book an appointment?','Use the Book Appointment page to choose a service, date and time. Our team will confirm your request.',1),
('Is my appointment confirmed when I submit the form?','Your request is received as pending. The clinic will confirm or suggest another time.',2),
('Do you treat children?','Yes, we offer gentle dental care for children as well as adults.',3),
('How often should I visit the dentist?','Most people benefit from a check-up and cleaning every six months, but your dentist will advise what suits you.',4),
('Where is the clinic located?','Shop No. 110, First Floor, Moti Mahal, near Dhange Hospital, Chudi Mohalla, Bhiwandi.',5);

insert into public.gallery_images (title, alt, category, image_url, sort_order) values
('Treatment room','Bright, clean dental treatment room','clinic','/images/clinic.jpg',1),
('Modern care','Dentist examining a patient in a modern clinic','facilities','/images/care.jpg',2),
('Welcoming smile','Smiling patient after a dental visit','clinic','/images/hero.jpg',3);

insert into public.blog_posts (slug, title, excerpt, content, published, published_at) values
('simple-daily-habits-for-healthy-teeth','Simple daily habits for healthy teeth','Small, consistent habits make the biggest difference to your oral health.','Brush twice a day for two minutes with a fluoride toothpaste.\n\nClean between your teeth daily using floss or interdental brushes.\n\nLimit sugary snacks and drinks, especially between meals.\n\nVisit your dentist regularly so small problems can be caught early.', true, now());
