import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAccessToken, setRefreshToken } from "@/lib/secureTokens";
import Colors from "@/constants/colors";

import { API_BASE } from "@/lib/api";

const BASE = API_BASE;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}

export default function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const { userId, email, gender } = useLocalSearchParams<{ userId: string; email: string; gender: string }>();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const submittedRef = useRef(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const submitOtp = useCallback(async (otpDigits: string[]) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLoading(true);
    setError("");
    setHasError(false);

    const otp = otpDigits.join("");
    try {
      const res = await fetch(`${BASE}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setHasError(true);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[OTP_LENGTH - 1]?.focus();
        if (data.code === "OTP_EXPIRED") {
          setError("انتهت صلاحية الرمز، أعد إرساله");
        } else {
          setError("الرمز غير صحيح، تحقق وأعد المحاولة");
        }
        submittedRef.current = false;
        return;
      }

      await Promise.all([
        AsyncStorage.setItem("uns_session_id", data.sessionId),
        setAccessToken(data.accessToken),
        setRefreshToken(data.refreshToken),
        AsyncStorage.setItem("@uns_onboarding_complete", "1"),
        AsyncStorage.setItem("@uns_gender", gender ?? "female"),
        AsyncStorage.removeItem("@uns_pending_userId"),
        AsyncStorage.removeItem("@uns_pending_email"),
        AsyncStorage.removeItem("@uns_pending_gender"),
      ]);

      if (data.restored) {
        // Returning user — skip the tour, go directly to the app
        if (__DEV__) console.log("[verify] login success — session restored, navigating to tabs");
        router.replace("/(tabs)");
      } else {
        // New user — show the onboarding tour
        if (__DEV__) console.log("[verify] register success — onboarding complete, navigating to tour");
        router.replace("/onboarding/tour");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setHasError(false);
      submittedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  function handleDigitChange(index: number, value: string) {
    setHasError(false);
    setError("");

    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const newDigits = [...digits];
      for (let i = 0; i < OTP_LENGTH; i++) {
        newDigits[i] = cleaned[i] ?? "";
      }
      setDigits(newDigits);
      const nextEmpty = newDigits.findIndex(d => !d);
      const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
      inputRefs.current[focusIdx]?.focus();
      if (newDigits.every(d => d)) {
        submittedRef.current = false;
        submitOtp(newDigits);
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d)) {
      submittedRef.current = false;
      submitOtp(newDigits);
    }
  }

  function handleKeyPress(index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await fetch(`${BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setCountdown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    } catch {
      setError("تعذّر إعادة الإرسال");
    } finally {
      setResending(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Feather name="arrow-right" size={22} color={Colors.onSurface} />
      </Pressable>

      <Text style={styles.title}>تحقق من بريدك</Text>
      <Text style={styles.subtitle}>
        أرسلنا رمزاً إلى{" "}
        <Text style={styles.emailHighlight}>{maskEmail(email ?? "")}</Text>
      </Text>

      <View style={styles.otpRow}>
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <TextInput
            key={i}
            ref={ref => { inputRefs.current[i] = ref; }}
            style={[
              styles.otpBox,
              digits[i] ? styles.otpBoxFilled : null,
              hasError ? styles.otpBoxError : null,
            ]}
            value={digits[i]}
            onChangeText={v => handleDigitChange(i, v)}
            onKeyPress={e => handleKeyPress(i, e)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
            editable={!loading}
          />
        ))}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.resendRow}>
        {countdown > 0 ? (
          <Text style={styles.countdownText}>
            أعد الإرسال بعد {countdown}ث
          </Text>
        ) : (
          <Pressable onPress={handleResend} disabled={resending}>
            {resending ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <Text style={styles.resendText}>أعد إرسال الرمز</Text>
            )}
          </Pressable>
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 30,
    color: Colors.onSurface,
    textAlign: "right",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.muted,
    textAlign: "right",
    lineHeight: 24,
    marginBottom: 40,
  },
  emailHighlight: {
    color: Colors.accent,
    fontFamily: "Tajawal_700Bold",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  otpBox: {
    width: 48,
    height: 60,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1.5,
    borderColor: Colors.ghostBorder,
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: "center",
  },
  otpBoxFilled: {
    borderColor: Colors.accent,
    backgroundColor: Colors.primaryContainer,
  },
  otpBoxError: {
    borderColor: Colors.error,
    backgroundColor: "rgba(192,57,43,0.06)",
  },
  errorText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 8,
  },
  resendRow: {
    alignItems: "center",
    marginTop: 8,
  },
  countdownText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
  },
  resendText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 15,
    color: Colors.accent,
    textDecorationLine: "underline",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(242,237,228,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
