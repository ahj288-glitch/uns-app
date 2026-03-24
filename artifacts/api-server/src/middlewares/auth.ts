import { type Request, type Response, type NextFunction } from "express";
import { verifyJwt } from "../lib/jwt.js";

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

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyJwt(token);
    req.auth = {
      sessionId: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.role !== "admin") {
    res.status(403).json({ error: "Forbidden", code: "FORBIDDEN" });
    return;
  }
  next();
}
