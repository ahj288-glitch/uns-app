import { describe, it, expect, beforeAll } from "vitest";
import express, { type Express } from "express";
import supertest from "supertest";
import { generateAccessToken, generateRefreshToken, generateToken, verifyJwt } from "../lib/jwt.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

process.env["JWT_SECRET"] = "test-secret-for-unit-tests";
process.env["ADMIN_SECRET"] = "test-admin-secret";

function buildTestApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/protected", verifyToken, (req, res) => {
    res.json({ ok: true, auth: req.auth });
  });

  app.get("/admin-only", verifyToken, requireAdmin, (req, res) => {
    res.json({ ok: true });
  });

  return app;
}

describe("generateToken / verifyJwt roundtrip", () => {
  it("signs and verifies a user token", () => {
    const token = generateAccessToken("session-123", "user");
    const payload = verifyJwt(token);
    expect(payload.sub).toBe("session-123");
    expect(payload.role).toBe("user");
  });

  it("signs and verifies an admin token", () => {
    const token = generateToken({ sub: "admin", role: "admin" }, "24h");
    const payload = verifyJwt(token);
    expect(payload.sub).toBe("admin");
    expect(payload.role).toBe("admin");
  });

  it("throws on tampered token", () => {
    const token = generateAccessToken("session-abc", "user");
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(() => verifyJwt(tampered)).toThrow();
  });

  it("throws on expired token", async () => {
    const token = generateToken({ sub: "session-xyz", role: "user" }, "0s");
    await new Promise((r) => setTimeout(r, 50));
    expect(() => verifyJwt(token)).toThrow();
  });
});

describe("verifyToken middleware", () => {
  const app = buildTestApp();

  it("passes with valid token", async () => {
    const token = generateAccessToken("session-valid", "user");
    const res = await supertest(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.auth.sessionId).toBe("session-valid");
  });

  it("returns 401 with no token", async () => {
    const res = await supertest(app).get("/protected");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 with expired token", async () => {
    const token = generateToken({ sub: "session-exp", role: "user" }, "0s");
    await new Promise((r) => setTimeout(r, 50));
    const res = await supertest(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 with tampered token", async () => {
    const token = generateAccessToken("session-tamper", "user");
    const tampered = token.slice(0, -5) + "XXXXX";
    const res = await supertest(app)
      .get("/protected")
      .set("Authorization", `Bearer ${tampered}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });
});

describe("requireAdmin middleware", () => {
  const app = buildTestApp();

  it("passes for admin role", async () => {
    const token = generateToken({ sub: "admin", role: "admin" }, "1h");
    const res = await supertest(app)
      .get("/admin-only")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("returns 403 for user role", async () => {
    const token = generateAccessToken("session-user", "user");
    const res = await supertest(app)
      .get("/admin-only")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});

describe("POST /api/auth/admin", () => {
  let authApp: Express;

  beforeAll(async () => {
    authApp = express();
    authApp.use(express.json());
    const { default: authRouter } = await import("../routes/auth.js");
    authApp.use("/api", authRouter);
  });

  it("returns 200 with correct secret", async () => {
    const res = await supertest(authApp)
      .post("/api/auth/admin")
      .send({ secret: "test-admin-secret" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("returns 401 with wrong secret", async () => {
    const res = await supertest(authApp)
      .post("/api/auth/admin")
      .send({ secret: "wrong-secret" });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 with missing secret", async () => {
    const res = await supertest(authApp)
      .post("/api/auth/admin")
      .send({});
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });
});
