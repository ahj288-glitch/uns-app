import React, { useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const BASE = `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<{ month: string; year: string }>({ month: "", year: "" });
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors["name"] = "الاسم مطلوب";
    if (!email || !validateEmail(email)) newErrors["email"] = "البريد الإلكتروني غير صحيح";
    if (!dob.month || !dob.year) {
      newErrors["dob"] = "تاريخ الميلاد مطلوب";
    } else {
      const m = parseInt(dob.month);
      const y = parseInt(dob.year);
      if (isNaN(m) || m < 1 || m > 12) newErrors["dob"] = "الشهر غير صحيح (١-١٢)";
      else if (isNaN(y) || y < 1920 || y > new Date().getFullYear() - 10) {
        newErrors["dob"] = "السنة غير صحيحة";
      }
    }
    if (!gender) newErrors["gender"] = "الجنس مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError("");

    const month = dob.month.padStart(2, "0");
    const dobString = `${dob.year}-${month}`;

    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase(), dob: dobString, gender }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setApiError("هذا البريد الإلكتروني مسجّل مسبقاً");
        } else {
          setApiError("حدث خطأ، حاول مجدداً");
        }
        return;
      }

      await Promise.all([
        AsyncStorage.setItem("@uns_pending_userId", data.userId),
        AsyncStorage.setItem("@uns_pending_email", data.email),
        AsyncStorage.setItem("@uns_pending_gender", gender),
      ]);

      router.push({
        pathname: "/onboarding/verify",
        params: { userId: data.userId, email: data.email, gender },
      });
    } catch {
      setApiError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Feather name="arrow-right" size={22} color={Colors.onSurface} />
      </Pressable>

      <Text style={styles.title}>أنشئ حسابك</Text>
      <Text style={styles.subtitle}>أربعة حقول فقط — لا أكثر</Text>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>اسمك</Text>
          <TextInput
            style={[styles.input, errors["name"] ? styles.inputError : null]}
            placeholder="ما اسمك؟"
            placeholderTextColor={Colors.muted}
            value={name}
            onChangeText={t => { setName(t); setErrors(e => ({ ...e, name: "" })); }}
            textAlign="right"
            returnKeyType="next"
          />
          {!!errors["name"] && <Text style={styles.errorText}>{errors["name"]}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={[styles.input, errors["email"] ? styles.inputError : null]}
            placeholder="بريدك الإلكتروني"
            placeholderTextColor={Colors.muted}
            value={email}
            onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: "" })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="right"
          />
          {!!errors["email"] && <Text style={styles.errorText}>{errors["email"]}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>تاريخ الميلاد</Text>
          <View style={styles.dobRow}>
            <TextInput
              style={[styles.dobInput, errors["dob"] ? styles.inputError : null]}
              placeholder="السنة"
              placeholderTextColor={Colors.muted}
              value={dob.year}
              onChangeText={t => { setDob(d => ({ ...d, year: t.replace(/\D/g, "") })); setErrors(e => ({ ...e, dob: "" })); }}
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
            />
            <TextInput
              style={[styles.dobInput, errors["dob"] ? styles.inputError : null]}
              placeholder="الشهر"
              placeholderTextColor={Colors.muted}
              value={dob.month}
              onChangeText={t => { setDob(d => ({ ...d, month: t.replace(/\D/g, "") })); setErrors(e => ({ ...e, dob: "" })); }}
              keyboardType="number-pad"
              maxLength={2}
              textAlign="center"
            />
          </View>
          {!!errors["dob"] && <Text style={styles.errorText}>{errors["dob"]}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>الجنس</Text>
          <View style={styles.genderRow}>
            <Pressable
              style={[styles.genderPill, gender === "female" && styles.genderPillActive]}
              onPress={() => { setGender("female"); setErrors(e => ({ ...e, gender: "" })); }}
            >
              <Text style={[styles.genderPillText, gender === "female" && styles.genderPillTextActive]}>
                أنثى
              </Text>
            </Pressable>
            <Pressable
              style={[styles.genderPill, gender === "male" && styles.genderPillActive]}
              onPress={() => { setGender("male"); setErrors(e => ({ ...e, gender: "" })); }}
            >
              <Text style={[styles.genderPillText, gender === "male" && styles.genderPillTextActive]}>
                ذكر
              </Text>
            </Pressable>
          </View>
          {!!errors["gender"] && <Text style={styles.errorText}>{errors["gender"]}</Text>}
        </View>
      </View>

      {!!apiError && (
        <View style={styles.apiErrorBox}>
          <Text style={styles.apiErrorText}>{apiError}</Text>
        </View>
      )}

      <Pressable
        style={{ borderRadius: 999, overflow: "hidden", marginTop: 8, opacity: loading ? 0.7 : 1 }}
        onPress={handleSubmit}
        disabled={loading}
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
            <Text style={styles.submitBtnText}>التالي ←</Text>
          )}
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

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
    marginBottom: 8,
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 30,
    color: Colors.onSurface,
    textAlign: "right",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.muted,
    textAlign: "right",
    marginBottom: 28,
  },
  form: {
    gap: 20,
    marginBottom: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 14,
    color: Colors.onSurface,
    textAlign: "right",
  },
  input: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.ghostBorder,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.error,
    textAlign: "right",
  },
  dobRow: {
    flexDirection: "row",
    gap: 12,
  },
  dobInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.ghostBorder,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderPill: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.ghostBorder,
  },
  genderPillActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.accent,
  },
  genderPillText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: Colors.muted,
  },
  genderPillTextActive: {
    color: Colors.accent,
  },
  apiErrorBox: {
    backgroundColor: "rgba(192,57,43,0.08)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  apiErrorText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
  },
  submitBtn: {
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  submitBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    color: Colors.surface,
  },
});
