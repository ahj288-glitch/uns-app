import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { API_BASE } from "@/lib/api";

interface NetworkContextValue {
  offline: boolean;
  reconnecting: boolean;
  checkNow: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue>({
  offline: false,
  reconnecting: false,
  checkNow: async () => {},
});

const POLL_INTERVAL_MS = 5000;
const RECONNECT_FLASH_MS = 2000;
const REQUEST_TIMEOUT_MS = 4000;

async function pingHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const offlineRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkNow = useCallback(async () => {
    const ok = await pingHealth();
    if (ok) {
      if (offlineRef.current) {
        offlineRef.current = false;
        setOffline(false);
        setReconnecting(true);
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(
          () => setReconnecting(false),
          RECONNECT_FLASH_MS
        );
      }
    } else {
      if (!offlineRef.current) {
        offlineRef.current = true;
        setOffline(true);
        setReconnecting(false);
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const interval = setInterval(checkNow, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [checkNow]);

  return (
    <NetworkContext.Provider value={{ offline, reconnecting, checkNow }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}
