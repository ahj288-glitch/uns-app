import { type Request, type Response, type NextFunction } from "express";
import { verifyJwt } from "../lib/jwt.js";
import pino from "pino";

const logger = pino({ name: "auth-middleware" });

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sessionId: string;
        role: string;
      };
    }
  }
}

const ADMIN_COOKIE = "uns_admin_token";

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  // 1. Try Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyJwt(token);
      req.auth = { sessionId: payload.sub, role: payload.role };
      return next();
    } catch {
      // Bearer token invalid — fall through to cookie check
    }
  }

  // 2. Try httpOnly admin cookie (browser-based admin panel sends this automatically)
  // req.cookies may be undefined if cookieParser middleware is not mounted (e.g. unit tests).
  const cookieToken = (req.cookies as Record<string, string | undefined> | undefined)?.[ADMIN_COOKIE];
  if (cookieToken) {
    try {
      const payload = verifyJwt(cookieToken);
      if (payload.role === "admin") {
        req.auth = { sessionId: payload.sub, role: payload.role };
        return next();
      }
    } catch {
      // Cookie token invalid — fall through to reject
    }
  }

  logger.warn(
    { method: req.method, path: req.path },
    "[auth] 401 — no valid Bearer token or admin cookie"
  );
  res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.role !== "admin") {
    logger.warn(
      { method: req.method, path: req.path, role: req.auth?.role ?? "none" },
      "[auth] 403 — admin role required"
    );
    res.status(403).json({ error: "Forbidden", code: "FORBIDDEN" });
    return;
  }
  next();
}
