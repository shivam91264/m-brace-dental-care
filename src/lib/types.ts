import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type Service = T["services"]["Row"];
export type Dentist = T["dentists"]["Row"];
export type Faq = T["faqs"]["Row"];
export type BlogPost = T["blog_posts"]["Row"];
export type GalleryImage = T["gallery_images"]["Row"];
export type Testimonial = T["testimonials"]["Row"];
export type Appointment = T["appointments"]["Row"];
export type Enquiry = T["enquiries"]["Row"];
export type Patient = T["patients"]["Row"];
export type Profile = T["profiles"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

export type ClinicSettings = {
  name: string;
  short_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  maps_url: string;
  hours_note: string;
  rating_note: string;
  socials: { instagram: string; facebook: string; youtube: string };
};

export type ContentSettings = {
  hero_title: string;
  hero_text: string;
  hero_image: string;
  about_title: string;
  about_text: string;
  mission: string;
  approach: string;
  hygiene: string;
  about_image: string;
  footer_text: string;
  why_us: { title: string; text: string }[];
  highlights: { title: string; text: string }[];
  sections: Record<string, boolean>;
  nav: Record<string, boolean>;
  carousel: { autoplay: boolean; interval: number };
  privacy_policy: string;
  appointment_policy: string;
};

export type DayHours = { open: boolean; start: string; end: string };
export type BookingSettings = {
  slot_minutes: number;
  max_days_ahead: number;
  hours_confirmed: boolean;
  hours: Record<string, DayHours>;
  holidays: string[];
  blocked: { date: string; start: string; end: string }[];
};

export const DAYS = [
  ["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"],
  ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"],
] as const;

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  receptionist: "Receptionist",
  dentist: "Dentist",
  content_manager: "Content Manager",
};
