import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: mocks.getUser }, from: mocks.from },
}));
import { accountQuery } from "@/lib/account";

describe("Staff account request reuse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "staff-id" } }, error: null });
    mocks.from.mockImplementation((table: string) => ({
      select: () => ({
        eq: () => table === "profiles"
          ? { maybeSingle: async () => ({ data: { status: "approved" }, error: null }) }
          : Promise.resolve({ data: [{ role: "super_admin" }], error: null }),
      }),
    }));
  });

  it("shares the verified account between the guard and repeated staff renders", async () => {
    const client = new QueryClient();
    const account = await client.fetchQuery(accountQuery);
    await client.fetchQuery(accountQuery);
    expect(mocks.getUser).toHaveBeenCalledTimes(1);
    expect(mocks.from).toHaveBeenCalledTimes(2);
    expect(account?.roles).toEqual(["super_admin"]);
    client.clear();
  });

  it("rechecks the account after invalidation instead of reusing obsolete access", async () => {
    const client = new QueryClient();
    await client.fetchQuery(accountQuery);
    await client.invalidateQueries({ queryKey: ["account"] });
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await client.fetchQuery(accountQuery)).toBeNull();
    expect(mocks.getUser).toHaveBeenCalledTimes(2);
    client.clear();
  });
});