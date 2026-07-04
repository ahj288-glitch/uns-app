import { describe, it, expect, vi, beforeEach } from "vitest";

// Fix 6 verification — createUserSession() must ALWAYS bind a session to a userId.
// We mock @workspace/db so the drizzle insert chain is a spy: no real Postgres is
// needed, and we can assert exactly what gets written to companion_sessions.
const { insertCalls } = vi.hoisted(() => ({ insertCalls: [] as Array<Record<string, unknown>> }));

vi.mock("@workspace/db", () => ({
  db: {
    insert: () => ({
      values: (v: Record<string, unknown>) => {
        insertCalls.push(v);
        // Echo the written row back, mimicking Drizzle's .returning().
        return { returning: async () => [{ sessionId: "sess-test-0001", ...v }] };
      },
    }),
  },
}));

// Imported AFTER the mock is registered (vi.mock is hoisted above imports).
const { createUserSession } = await import("../routes/auth.js");

beforeEach(() => {
  insertCalls.length = 0;
});

describe("Fix 6 — createUserSession() links sessions to a userId", () => {
  it("writes the userId (and default dialect) onto the inserted session", async () => {
    const session = await createUserSession("user-abc-123");
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0]).toEqual({ dialect: "gulf", userId: "user-abc-123" });
    expect(session).toMatchObject({ userId: "user-abc-123", sessionId: "sess-test-0001" });
  });

  it("honors a custom dialect while still binding the userId", async () => {
    await createUserSession("user-xyz-789", "egyptian");
    expect(insertCalls[0]).toEqual({ dialect: "egyptian", userId: "user-xyz-789" });
  });

  it("throws instead of creating an orphaned session when userId is empty", async () => {
    await expect(createUserSession("")).rejects.toThrow(/valid userId is required/);
    expect(insertCalls).toHaveLength(0);
  });

  it("throws when userId is missing/undefined", async () => {
    // @ts-expect-error — deliberately passing an invalid userId to exercise the guard
    await expect(createUserSession(undefined)).rejects.toThrow(/valid userId is required/);
    expect(insertCalls).toHaveLength(0);
  });
});
