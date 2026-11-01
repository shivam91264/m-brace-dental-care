import { describe, expect, it } from "vitest";
import { MODULES, canManage } from "@/lib/admin-config";

describe("Testimonial management", () => {
  it("allows a super admin to create testimonials", () => {
    const module = MODULES.testimonials;
    expect(module?.create).toBe(true);
    if (!module) throw new Error("Missing testimonials module");
    expect(canManage(["super_admin"], module)).toBe(true);
  });
});