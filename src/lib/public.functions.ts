import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const db = async () => (await import("./public-client.server")).publicClient();

export const fetchSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (await db()).from("settings").select("key,value");
  if (error) throw new Error(error.message);
  const out: Record<string, unknown> = {};
  for (const r of data ?? []) out[r.key] = r.value;
  return out as Record<"clinic" | "content" | "theme" | "booking", any>;
});

export const fetchServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (await db()).from("services").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data;
});

export const fetchService = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await (await db()).from("services").select("*").eq("slug", data.slug).maybeSingle();
    return row;
  });

export const fetchDentists = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (await db()).from("dentists").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data;
});

export const fetchTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (await db())
    .from("testimonials").select("id,name,content,rating,review_date,featured,sort_order")
    .order("sort_order").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data;
});

export const fetchGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (await db()).from("gallery_images").select("id,title,alt,category,image_url,sort_order").order("sort_order").limit(200);
  if (error) throw new Error(error.message);
  return data;
});

export const fetchFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (await db()).from("faqs").select("id,question,answer").order("sort_order");
  if (error) throw new Error(error.message);
  return data;
});

export const fetchPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (await db())
    .from("blog_posts").select("id,slug,title,excerpt,cover_image,published_at")
    .order("published_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return data;
});

export const fetchPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(160) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await (await db()).from("blog_posts").select("*").eq("slug", data.slug).maybeSingle();
    return row;
  });
