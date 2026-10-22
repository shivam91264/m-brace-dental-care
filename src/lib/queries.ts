import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  fetchDentists, fetchFaqs, fetchGallery, fetchPost, fetchPosts, fetchService, fetchServices,
  fetchSettings, fetchTestimonials,
} from "./public.functions";
import { sanitizeTheme } from "./theme";
import type { BookingSettings, ClinicSettings, ContentSettings } from "./types";

const stale = 60_000;
export const settingsQuery = queryOptions({ queryKey: ["public", "settings"], queryFn: () => fetchSettings(), staleTime: stale });
export const servicesQuery = queryOptions({ queryKey: ["public", "services"], queryFn: () => fetchServices(), staleTime: stale });
export const serviceQuery = (slug: string) => queryOptions({ queryKey: ["public", "service", slug], queryFn: () => fetchService({ data: { slug } }), staleTime: stale });
export const dentistsQuery = queryOptions({ queryKey: ["public", "dentists"], queryFn: () => fetchDentists(), staleTime: stale });
export const testimonialsQuery = queryOptions({ queryKey: ["public", "testimonials"], queryFn: () => fetchTestimonials(), staleTime: stale });
export const galleryQuery = queryOptions({ queryKey: ["public", "gallery"], queryFn: () => fetchGallery(), staleTime: stale });
export const faqsQuery = queryOptions({ queryKey: ["public", "faqs"], queryFn: () => fetchFaqs(), staleTime: stale });
export const postsQuery = queryOptions({ queryKey: ["public", "posts"], queryFn: () => fetchPosts(), staleTime: stale });
export const postQuery = (slug: string) => queryOptions({ queryKey: ["public", "post", slug], queryFn: () => fetchPost({ data: { slug } }), staleTime: stale });

export function useSite() {
  const { data } = useSuspenseQuery(settingsQuery);
  return {
    clinic: (data.clinic ?? {}) as ClinicSettings,
    content: (data.content ?? {}) as ContentSettings,
    booking: (data.booking ?? {}) as BookingSettings,
    theme: sanitizeTheme(data.theme),
  };
}
