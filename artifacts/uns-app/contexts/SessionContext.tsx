import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Gender } from "@/lib/gender";

const BASE = `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`;

interface SessionContextType {
  sessionId: string | null;
  dialect: string;
  greeting: string;
  gender: Gender;
  setDialect: (d: string) => void;
  setGender: (g: Gender) => void;
  isReady: boolean;
  initError: string | null;
  retryInit: () => void;
  lastMoodWord: string | null;
  setLastMoodWord: (m: string | null) => void;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  dialect: "gulf",
  greeting: "هلا وغلا!",
  gender: "female",
  setDialect: () => {},
  setGender: () => {},
  isReady: false,
  initError: null,
  retryInit: () => {},
  lastMoodWord: null,
  setLastMoodWord: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dialect, setDialectState] = useState("gulf");
  const [greeting, setGreeting] = useState("هلا وغلا!");
  const [gender, setGenderState] = useState<Gender>("female");
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [lastMoodWord, setLastMoodWordState] = useState<string | null>(null);

  // Track mount state to prevent setState after unmount
  const mountedRef = useRef(true);
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

  async function initSession(signal: AbortSignal) {
    if (!mountedRef.current) return;
    setInitError(null);

    try {
      const [storedId, storedDialect, storedGender, storedMood] = await Promise.all([
        AsyncStorage.getItem("uns_session_id"),
        AsyncStorage.getItem("uns_dialect"),
        AsyncStorage.getItem("uns_gender"),
        AsyncStorage.getItem("uns_last_mood"),
      ]);

      if (signal.aborted || !mountedRef.current) return;

      const resolvedDialect = storedDialect ?? "gulf";
      const resolvedGender = (storedGender as Gender) ?? "female";
      setDialectState(resolvedDialect);
      setGenderState(resolvedGender);
      if (storedMood) setLastMoodWordState(storedMood);

      if (storedId) {
        setSessionId(storedId);
        setIsReady(true);
        return;
      }

      // No stored session — create one server-side
      const res = await fetch(`${BASE}/api/companion/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dialect: resolvedDialect }),
        signal,
      });

      if (signal.aborted || !mountedRef.current) return;
      if (!res.ok) throw new Error(`Session creation failed (${res.status})`);

      const data = await res.json();
      if (signal.aborted || !mountedRef.current) return;

      await AsyncStorage.setItem("uns_session_id", data.sessionId);
      setSessionId(data.sessionId);
      setGreeting(data.greeting);
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      if (!mountedRef.current) return;
      // Surface error so UI can show a recovery option
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
    await AsyncStorage.setItem("uns_gender", g);
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
        setDialect,
        setGender,
        isReady,
        initError,
        retryInit,
        lastMoodWord,
        setLastMoodWord,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
