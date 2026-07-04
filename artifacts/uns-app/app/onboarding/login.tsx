import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAccessToken, setRefreshToken } from "@/lib/secureTokens";
import Colors from "@/constants/colors";
import { API_BASE } from "@/lib/api";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = validateEmail(email.trim()) && !loading;

  async function handleLogin() {
    setError("");
    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      setError("تنسيق البريد الإلكتروني غير صحيح");
      return;
    }

    setLoading(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "USER_NOT_FOUND") {
          setError("لا يوجد حساب بهذا البريد الإلكتروني. هل تريد إنشاء حساب جديد؟");
        } else {
          setError("حدث خطأ، حاول مجدداً");
        }
        return;
      }

      // Verification disabled (MVP/staging): tokens returned directly — no OTP step
      if (data.accessToken && data.sessionId) {
        await Promise.all([
          AsyncStorage.setItem("uns_session_id", data.sessionId),
          setAccessToken(data.accessToken),
          setRefreshToken(data.refreshToken ?? ""),
          AsyncStorage.setItem("@uns_onboarding_complete", "1"),
        ]);
        router.replace("/(tabs)");
        return;
      }

      // Verification enabled: navigate to verify screen with returned userId
      router.push({
        pathname: "/onboarding/verify",
        params: { userId: data.userId, email: data.email },
      });
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مجدداً.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 },
      ]}
    >
      <Pressable
        onPress={() => router.canGoBack() ? router.back() : router.replace("/onboarding")}
        style={styles.backBtn}
        hitSlop={8}
      >
        <Feather name="arrow-right" size={22} color={Colors.onSurface} />
      </Pressable>

      <Text style={styles.title}>مرحباً من جديد</Text>
      <Text style={styles.subtitle}>أدخل بريدك الإلكتروني وسنرسل لك رمز للدخول</Text>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="بريدك الإلكتروني"
          placeholderTextColor={Colors.muted}
          value={email}
          onChangeText={t => { setEmail(t); setError(""); }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textAlign="right"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          {error.includes("إنشاء حساب") && (
            <Pressable
              onPress={() => router.replace("/onboarding/register")}
              style={styles.registerLink}
            >
              <Text style={styles.registerLinkText}>إنشاء حساب جديد</Text>
              <Feather name="arrow-left" size={13} color={Colors.accent} />
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.submitWrap}>
        <Pressable
          style={{ borderRadius: 16, overflow: "hidden", opacity: canSubmit ? 1 : 0.4 }}
          onPress={handleLogin}
          disabled={!canSubmit}
        >
          <LinearGradient
            colors={["#74C69D", "#1B4332"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.submitBtnText}>إرسال رمز الدخول ←</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.replace("/onboarding/register")}
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryBtnText}>ليس لديّ حساب — أنشئ حساباً</Text>
      </Pressable>
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
  inputWrap: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ghostBorder,
    paddingHorizontal: 14,
    minHeight: 54,
    justifyContent: "center",
    marginBottom: 12,
  },
  input: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    lineHeight: Platform.OS === "ios" ? 0 : 28,
    color: Colors.onSurface,
    textAlign: "right",
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  errorBox: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    lineHeight: 22,
    color: Colors.onSurface,
    textAlign: "right",
  },
  registerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  registerLinkText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    lineHeight: 22,
    color: Colors.accent,
    textDecorationLine: "underline",
  },
  submitWrap: {
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtn: {
    borderRadius: 16,
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
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textDecorationLine: "underline",
  },
});
