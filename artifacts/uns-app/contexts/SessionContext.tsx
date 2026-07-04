import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Fix 2 — JWTs live in the OS keychain via secure-store, never plaintext AsyncStorage.
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  deleteAccessToken,
  deleteRefreshToken,
} from "@/lib/secureTokens";
import type { Gender } from "@/lib/gender";

import { API_BASE } from "@/lib/api";

const BASE = API_BASE;

// Keys used in @-prefixed form (onboarding) and non-prefixed form (register/session)
// We read both variants for backward compatibility.
async function readKey(...candidates: string[]): Promise<string | null> {
  for (const key of candidates) {
    const v = await AsyncStorage.getItem(key);
    if (v) return v;
  }
  return null;
}

function buildGreeting(name: string): string {
  if (name.trim()) return `أهلاً ${name.trim()} 👋`;
  return "أهلاً بك في مساحتك الخاصة";
}

interface SessionContextType {
  sessionId: string | null;
  dialect: string;
  greeting: string;
  gender: Gender;
  displayName: string;
  authToken: string | null;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  setDialect: (d: string) => void;
  setGender: (g: Gender) => void;
  setDisplayName: (n: string) => void;
  isReady: boolean;
  initError: string | null;
  retryInit: () => void;
  lastMoodWord: string | null;
  setLastMoodWord: (m: string | null) => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  dialect: "gulf",
  greeting: "أهلاً بك في مساحتك الخاصة",
  gender: "female",
  displayName: "",
  authToken: null,
  authFetch: (url, init) => fetch(url, init),
  setDialect: () => {},
  setGender: () => {},
  setDisplayName: () => {},
  isReady: false,
  initError: null,
  retryInit: () => {},
  lastMoodWord: null,
  setLastMoodWord: () => {},
  logout: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dialect, setDialectState] = useState("gulf");
  const [greeting, setGreeting] = useState("أهلاً بك في مساحتك الخاصة");
  const [gender, setGenderState] = useState<Gender>("female");
  const [displayName, setDisplayNameState] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [lastMoodWord, setLastMoodWordState] = useState<string | null>(null);

  const authTokenRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    initSession(controller.signal);
    return () => controller.abort();
  }, []);

  async function refreshAccessToken(): Promise<string | null> {
    try {
      const storedRefresh = await getRefreshToken();
      if (!storedRefresh) return null;
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newToken: string = data.accessToken;
      await setAccessToken(newToken);
      if (mountedRef.current) {
        setAuthToken(newToken);
        authTokenRef.current = newToken;
      }
      return newToken;
    } catch {
      return null;
    }
  }

  const authFetch = useCallback(async (url: string, init: RequestInit = {}): Promise<Response> => {
    const token = authTokenRef.current;
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...init, headers });

    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        return fetch(url, { ...init, headers });
      }
    }

    return res;
  }, []);

  async function initSession(signal: AbortSignal) {
    if (!mountedRef.current) return;
    setInitError(null);

    try {
      const [
        storedId,
        storedToken,
        storedRefreshToken,
        storedDialect,
        storedGender,
        storedMood,
        storedName,
      ] = await Promise.all([
        AsyncStorage.getItem("uns_session_id"),
        getAccessToken(),
        getRefreshToken(),
        // Read dialect from both key formats
        readKey("uns_dialect", "@uns_dialect"),
        // Read gender from both key formats (register saves @uns_gender)
        readKey("uns_gender", "@uns_gender"),
        AsyncStorage.getItem("uns_last_mood"),
        // Read display name from both key formats (onboarding saves @uns_display_name)
        readKey("uns_display_name", "@uns_display_name", "uns_name"),
      ]);

      if (signal.aborted || !mountedRef.current) return;

      const resolvedDialect = storedDialect ?? "gulf";
      const resolvedGender = (storedGender as Gender) ?? "female";
      const resolvedName = storedName ?? "";

      setDialectState(resolvedDialect);
      setGenderState(resolvedGender);
      setDisplayNameState(resolvedName);
      setGreeting(buildGreeting(resolvedName));

      if (storedMood) setLastMoodWordState(storedMood);

      if (storedId && storedToken) {
        setSessionId(storedId);
        setAuthToken(storedToken);
        authTokenRef.current = storedToken;
        setIsReady(true);
        return;
      }

      if (storedId && storedRefreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed && mountedRef.current) {
          setSessionId(storedId);
          setIsReady(true);
          return;
        }
      }

      // No stored credentials — leave sessionId null so onboarding guard redirects
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      if (!mountedRef.current) return;
      setInitError("تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مجدداً.");
    } finally {
      if (!signal.aborted && mountedRef.current) {
        setIsReady(true);
      }
    }
  }

  function retryInit() {
    setIsReady(false);
    setInitError(null);
    const controller = new AbortController();
    initSession(controller.signal);
  }

  async function setDialect(d: string) {
    setDialectState(d);
    await AsyncStorage.setItem("uns_dialect", d);
  }

  async function setGender(g: Gender) {
    setGenderState(g);
    // Write to both keys for compatibility
    await Promise.all([
      AsyncStorage.setItem("uns_gender", g),
      AsyncStorage.setItem("@uns_gender", g),
    ]);
  }

  async function setDisplayName(n: string) {
    setDisplayNameState(n);
    setGreeting(buildGreeting(n));
    await Promise.all([
      AsyncStorage.setItem("uns_display_name", n),
      AsyncStorage.setItem("@uns_display_name", n),
    ]);
  }

  // Real logout: revoke refresh token on the server, then clear all local
  // session state. Best-effort on the network call — local state is always
  // cleared so the user is logged out even if the server is unreachable.
  async function logout() {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          await fetch(`${BASE}/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
        } catch {
          // Network failure — proceed with local cleanup anyway.
        }
      }
    } finally {
      await Promise.all([
        AsyncStorage.removeItem("uns_session_id"),
        deleteAccessToken(),
        deleteRefreshToken(),
        AsyncStorage.removeItem("uns_last_mood"),
        AsyncStorage.removeItem("@uns_pending_userId"),
        AsyncStorage.removeItem("@uns_pending_email"),
        AsyncStorage.removeItem("@uns_pending_gender"),
      ]);
      if (mountedRef.current) {
        setSessionId(null);
        setAuthToken(null);
        authTokenRef.current = null;
        setLastMoodWordState(null);
      }
    }
  }

  async function setLastMoodWord(m: string | null) {
    setLastMoodWordState(m);
    if (m) await AsyncStorage.setItem("uns_last_mood", m);
    else await AsyncStorage.removeItem("uns_last_mood");
  }

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        dialect,
        greeting,
        gender,
        displayName,
        authToken,
        authFetch,
        setDialect,
        setGender,
        setDisplayName,
        isReady,
        initError,
        retryInit,
        lastMoodWord,
        setLastMoodWord,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
