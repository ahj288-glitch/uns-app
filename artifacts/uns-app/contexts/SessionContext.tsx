import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface SessionContextType {
  sessionId: string | null;
  dialect: string;
  greeting: string;
  setDialect: (d: string) => void;
  isReady: boolean;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  dialect: "gulf",
  greeting: "هلا وغلا!",
  setDialect: () => {},
  isReady: false,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dialect, setDialectState] = useState("gulf");
  const [greeting, setGreeting] = useState("هلا وغلا!");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initSession();
  }, []);

  async function initSession() {
    try {
      const storedId = await AsyncStorage.getItem("uns_session_id");
      const storedDialect = await AsyncStorage.getItem("uns_dialect");
      const resolvedDialect = storedDialect ?? "gulf";
      setDialectState(resolvedDialect);

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

  return (
    <SessionContext.Provider value={{ sessionId, dialect, greeting, setDialect, isReady }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
