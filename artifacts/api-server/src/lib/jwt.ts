import jwt from "jsonwebtoken";

export type TokenRole = "user" | "admin";

export interface TokenPayload {
  sub: string;
  role: TokenRole;
  exp?: number;
  iat?: number;
}

function getSecret(): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function generateToken(
  payload: { sub: string; role: TokenRole },
  expiresIn: string | number,
): string {
  const secret = getSecret();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign({ sub: payload.sub, role: payload.role }, secret, {
    algorithm: "HS256",
    expiresIn: expiresIn as any,
  });
}

export function generateAccessToken(sub: string, role: TokenRole): string {
  return generateToken({ sub, role }, "15m");
}

export function generateAdminToken(): string {
  return generateToken({ sub: "admin", role: "admin" }, "24h");
}

export function generateRefreshToken(sub: string): string {
  return generateToken({ sub, role: "user" }, "7d");
}

export function verifyJwt(token: string): TokenPayload {
  const secret = getSecret();
  const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as TokenPayload;
  return decoded;
}
