import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessToken, getRefreshToken, setAccessToken } from "@/lib/secureTokens";
import type { Gender } from "@/lib/gender";

import { API_BASE, apiFetch, healthCheck } from "@/lib/api";

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
  isOffline: boolean;
  isReconnecting: boolean;
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
  isOffline: false,
  isReconnecting: false,
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
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const authTokenRef = useRef<string | null>(null);
  const isOfflineRef = useRef(false);
  const recoveryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  // ─── Offline recovery polling ─────────────────────────────────────────────
  // When a network failure is detected, poll every 5 s until the server responds.
  // On recovery: briefly show "reconnecting" before clearing the banner.
  useEffect(() => {
    if (!isOffline) {
      if (recoveryTimerRef.current) {
        clearInterval(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
      }
      return;
    }

    recoveryTimerRef.current = setInterval(async () => {
      const ok = await healthCheck();
      if (ok && mountedRef.current) {
        clearInterval(recoveryTimerRef.current!);
        recoveryTimerRef.current = null;
        isOfflineRef.current = false;
        setIsReconnecting(true);
        setIsOffline(false);
        setTimeout(() => {
          if (mountedRef.current) setIsReconnecting(false);
        }, 2000);
      }
    }, 5000);

    return () => {
      if (recoveryTimerRef.current) {
        clearInterval(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
      }
    };
  }, [isOffline]);

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

    let res: Response;
    try {
      // apiFetch retries network-level failures (TypeError) up to 2×
      res = await apiFetch(url, { ...init, headers });
    } catch (err) {
      // Only mark offline for network-level failures (TypeError).
      // AbortError = intentional timeout (e.g. 12 s chat timeout) — not an offline signal.
      const isNetworkFailure = err instanceof TypeError;
      if (isNetworkFailure && !isOfflineRef.current && mountedRef.current) {
        console.error("[session] authFetch: network unreachable, marking offline", { url });
        isOfflineRef.current = true;
        setIsOffline(true);
      }
      throw err;
    }

    // Successful response → ensure we're marked online
    if (isOfflineRef.current && mountedRef.current) {
      isOfflineRef.current = false;
      setIsOffline(false);
    }

    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        try {
          return await apiFetch(url, { ...init, headers });
        } catch (err) {
          const isNetworkFailure = err instanceof TypeError;
          if (isNetworkFailure && !isOfflineRef.current && mountedRef.current) {
            console.error("[session] authFetch: 401-retry network error", { url });
            isOfflineRef.current = true;
            setIsOffline(true);
          }
          throw err;
        }
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
        isOffline,
        isReconnecting,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
