import type { BookingSettings } from "./types";

export const TZ = "Asia/Kolkata";

/** Today's date (YYYY-MM-DD) in the clinic's timezone. */
export function todayInClinic(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

export function nowMinutesInClinic(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
export const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

export function fmtTime(t: string) {
  const n = toMin(t);
  const h = Math.floor(n / 60);
  const m = n % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function fmtDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function weekdayKey(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Mirrors the database validate_slot() rules so patients only see bookable times. */
export function availableSlots(b: BookingSettings, date: string, booked: string[] = [], now = new Date()) {
  const today = todayInClinic(now);
  if (!date || date < today || date > addDays(today, b.max_days_ahead ?? 60)) return [];
  if ((b.holidays ?? []).includes(date)) return [];
  const day = b.hours?.[weekdayKey(date)];
  if (!day?.open) return [];
  const slot = b.slot_minutes || 30;
  const start = toMin(day.start);
  const end = toMin(day.end);
  const nowMin = date === today ? nowMinutesInClinic(now) : -1;
  const bookedSet = new Set(booked.map((t) => t.slice(0, 5)));
  const out: string[] = [];
  for (let t = start; t + slot <= end; t += slot) {
    const s = fromMin(t);
    if (t <= nowMin) continue;
    if (bookedSet.has(s)) continue;
    if ((b.blocked ?? []).some((x) => x.date === date && t >= toMin(x.start) && t < toMin(x.end))) continue;
    out.push(s);
  }
  return out;
}
