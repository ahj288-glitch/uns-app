import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Fix 2 — JWTs go to the OS keychain, not plaintext AsyncStorage.
import { setAccessToken, setRefreshToken } from "@/lib/secureTokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

import { API_BASE } from "@/lib/api";

const BASE = API_BASE;

// ── Feature flag (mirrors register.tsx) ───────────────────────────────────────
const IS_VERIFICATION_ENABLED = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = useCallback((): boolean => {
    if (!email) {
      setEmailError("البريد الإلكتروني مطلوب");
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError("تنسيق البريد الإلكتروني غير صحيح");
      return false;
    }
    setEmailError("");
    return true;
  }, [email]);

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(`${BASE}/auth/login-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "USER_NOT_FOUND") {
          setApiError("لا يوجد حساب بهذا البريد. يمكنك إنشاء حساب جديد.");
        } else if (data.code === "RATE_LIMITED") {
          setApiError("محاولات كثيرة. حاول مجدداً بعد قليل.");
        } else if (data.code === "INVALID_EMAIL") {
          setEmailError("تنسيق البريد الإلكتروني غير صحيح");
        } else {
          setApiError("حدث خطأ غير متوقع، حاول مجدداً");
        }
        return;
      }

      if (__DEV__) console.log("[login] IS_VERIFICATION_ENABLED:", IS_VERIFICATION_ENABLED, "verified:", data.verified);

      // Bypass branch: server returned tokens directly
      if (!IS_VERIFICATION_ENABLED || data.accessToken) {
        await Promise.all([
          AsyncStorage.setItem("uns_session_id", data.sessionId),
          setAccessToken(data.accessToken),
          setRefreshToken(data.refreshToken ?? ""),
          AsyncStorage.setItem("@uns_onboarding_complete", "1"),
          AsyncStorage.setItem("@uns_gender", data.gender ?? "female"),
          AsyncStorage.removeItem("@uns_pending_userId"),
          AsyncStorage.removeItem("@uns_pending_email"),
          AsyncStorage.removeItem("@uns_pending_gender"),
        ]);
        if (__DEV__) console.log("[login] isAuthenticated: true — routing to tabs");
        router.replace("/(tabs)");
        return;
      }

      // OTP branch: hand off to verify with isLogin flag
      await Promise.all([
        AsyncStorage.setItem("@uns_pending_userId", data.userId),
        AsyncStorage.setItem("@uns_pending_email", data.email),
        AsyncStorage.setItem("@uns_pending_gender", data.gender ?? "female"),
      ]);

      router.push({
        pathname: "/onboarding/verify",
        params: {
          userId: data.userId,
          email: data.email,
          gender: data.gender ?? "female",
          isLogin: "1",
        },
      });
    } catch {
      setApiError("تعذّر الاتصال بالخادم، تحقق من اتصالك وحاول مجدداً");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="رجوع">
        <Feather name="arrow-right" size={22} color={Colors.onSurface} />
      </Pressable>

      <Text style={styles.title}>أهلاً بعودتك</Text>
      <Text style={styles.subtitle}>
        أدخل بريدك الإلكتروني للمتابعة إلى حسابك في أُنْس.
      </Text>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
          <View
            style={[
              styles.inputWrap,
              emailError ? styles.inputWrapError : null,
              !emailError && validateEmail(email) ? styles.inputWrapValid : null,
            ]}
          >
            <Feather name="mail" size={16} color={Colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(""); if (apiError) setApiError(""); }}
              placeholder="name@example.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
              editable={!loading}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
          </View>
          {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}
        </View>
      </View>

      {!!apiError && (
        <View style={styles.apiErrorBox}>
          <Text style={styles.apiErrorText}>{apiError}</Text>
        </View>
      )}

      <View style={styles.submitWrap}>
        <LinearGradient
          colors={[Colors.accent, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.submitBtn}
        >
          <Pressable
            style={styles.submitBtnInner}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityLabel="تسجيل الدخول"
          >
            {loading
              ? <ActivityIndicator color={Colors.surface} />
              : <Text style={styles.submitBtnText}>تسجيل الدخول</Text>
            }
          </Pressable>
        </LinearGradient>
      </View>

      <Pressable
        onPress={() => router.push("/onboarding/register")}
        style={styles.registerLinkRow}
        accessibilityLabel="ليس لديك حساب؟ أنشئ حساباً"
      >
        <Text style={styles.registerLinkText}>ليس لديك حساب؟ </Text>
        <Text style={styles.registerLinkAccent}>أنشئ حساباً</Text>
      </Pressable>
    </ScrollView>
  );
}

// ── Styles (mirror register.tsx) ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 28,
    lineHeight: 52,
    color: Colors.onSurface,
    textAlign: "right",
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    lineHeight: 28,
    color: Colors.muted,
    textAlign: "right",
    marginBottom: 32,
  },
  form: {
    gap: 24,
    marginBottom: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 14,
    lineHeight: 26,
    color: Colors.onSurface,
    textAlign: "right",
  },
  fieldError: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    lineHeight: 22,
    color: Colors.error,
    textAlign: "right",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ghostBorder,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  inputWrapError: {
    borderColor: Colors.error,
    backgroundColor: "rgba(192,57,43,0.04)",
  },
  inputWrapValid: {
    borderColor: Colors.accent,
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    lineHeight: Platform.OS === "ios" ? 0 : 28,
    color: Colors.onSurface,
    textAlign: "right",
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  apiErrorBox: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  apiErrorText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    lineHeight: 24,
    color: Colors.onSurface,
    textAlign: "center",
  },
  submitWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  submitBtn: {
    borderRadius: 16,
  },
  submitBtnInner: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
  },
  submitBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    lineHeight: 30,
    color: Colors.surface,
    textAlign: "center",
  },
  registerLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 8,
  },
  registerLinkText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    lineHeight: 24,
    color: Colors.muted,
    textAlign: "center",
  },
  registerLinkAccent: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 14,
    lineHeight: 24,
    color: Colors.accent,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
