import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Gender } from "@/lib/gender";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface SessionContextType {
  sessionId: string | null;
  dialect: string;
  greeting: string;
  gender: Gender;
  setDialect: (d: string) => void;
  setGender: (g: Gender) => void;
  isReady: boolean;
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
  lastMoodWord: null,
  setLastMoodWord: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dialect, setDialectState] = useState("gulf");
  const [greeting, setGreeting] = useState("هلا وغلا!");
  const [gender, setGenderState] = useState<Gender>("female");
  const [isReady, setIsReady] = useState(false);
  const [lastMoodWord, setLastMoodWordState] = useState<string | null>(null);

  useEffect(() => {
    initSession();
  }, []);

  async function initSession() {
    try {
      const [storedId, storedDialect, storedGender, storedMood] = await Promise.all([
        AsyncStorage.getItem("uns_session_id"),
        AsyncStorage.getItem("uns_dialect"),
        AsyncStorage.getItem("uns_gender"),
        AsyncStorage.getItem("uns_last_mood"),
      ]);

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

      const res = await fetch(`${BASE}/api/companion/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dialect: resolvedDialect }),
      });

      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();

      await AsyncStorage.setItem("uns_session_id", data.sessionId);
      setSessionId(data.sessionId);
      setGreeting(data.greeting);
    } catch (e) {
      console.error("Session init error:", e);
    } finally {
      setIsReady(true);
    }
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
