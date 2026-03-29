import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "../../../../lib/api-client-react/src/custom-fetch";
import {
  getStoredToken,
  storeToken,
  clearToken,
  registerUnauthorizedHandler,
  clearUnauthorizedHandler,
} from "@/lib/authSession";

const API_BASE = "/api";

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad === 2) base64 += "==";
    else if (pad === 3) base64 += "=";
    const payload = atob(base64);
    return JSON.parse(payload) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
}

setAuthTokenGetter(() => {
  const token = getStoredToken();
  return isTokenValid(token) ? token : null;
});

export function useAdminAuth() {
  const [, navigate] = useLocation();
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const stored = getStoredToken();
    return isTokenValid(stored) ? stored : null;
  });

  const isAuthenticated = isTokenValid(accessToken);

  const logout = useCallback(async () => {
    // Tell the server to clear the httpOnly cookie.
    // Fire-and-forget — we navigate away regardless of outcome.
    try {
      await fetch(`${API_BASE}/auth/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Network failure on logout is non-fatal; local state is still cleared.
    }
    clearToken();
    setAccessToken(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    registerUnauthorizedHandler(logout);
    return () => {
      clearUnauthorizedHandler();
    };
  }, [logout]);

  const login = useCallback(async (secret: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // allows the server to set the httpOnly admin cookie
      body: JSON.stringify({ secret }),
    });

    if (!res.ok) {
      throw new Error("unauthorized");
    }

    const data = await res.json() as { accessToken: string };
    storeToken(data.accessToken);
    setAccessToken(data.accessToken);
  }, []);

  const getAuthHeader = useCallback((): { Authorization: string } | Record<string, never> => {
    if (!accessToken || !isTokenValid(accessToken)) return {};
    return { Authorization: `Bearer ${accessToken}` };
  }, [accessToken]);

  return { accessToken, isAuthenticated, login, logout, getAuthHeader };
}
