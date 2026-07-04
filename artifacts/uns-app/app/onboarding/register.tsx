import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

import { API_BASE } from "@/lib/api";

const BASE = API_BASE;

// ── Feature flag ──────────────────────────────────────────────────────────────
// Single-sourced with app/index.tsx via EXPO_PUBLIC_VERIFICATION_ENABLED so MVP
// vs. full-verification is a build-time env choice, not a code edit.
const IS_VERIFICATION_ENABLED = process.env["EXPO_PUBLIC_VERIFICATION_ENABLED"] === "true";

// ── Data ──────────────────────────────────────────────────────────────────────
const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const CURRENT_YEAR = new Date().getFullYear();

const DAYS = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1,
}));

const MONTHS = MONTHS_AR.map((label, i) => ({ label, value: i + 1 }));

const YEARS = Array.from(
  { length: CURRENT_YEAR - 1900 + 1 },
  (_, i) => {
    const y = CURRENT_YEAR - i;
    return { label: String(y), value: y };
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateName(name: string): "valid" | "invalid" | "idle" {
  if (!name) return "idle";
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 30) return "invalid";
  if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(trimmed)) return "invalid";
  return "valid";
}

// ── Dropdown component ────────────────────────────────────────────────────────
type Option<T> = { label: string; value: T };

function DropdownField<T extends string | number>({
  label,
  displayValue,
  placeholder,
  options,
  onSelect,
  hasError,
}: {
  label: string;
  displayValue: string;
  placeholder: string;
  options: Option<T>[];
  onSelect: (v: T) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={[styles.dropdownBtn, hasError && styles.inputError]}
        onPress={() => setOpen(true)}
      >
        <Feather name="chevron-down" size={14} color={Colors.muted} style={styles.dropdownChevron} />
        <Text
          style={[
            styles.dropdownText,
            !displayValue && styles.dropdownPlaceholder,
          ]}
        >
          {displayValue || placeholder}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              showsVerticalScrollIndicator={false}
              style={styles.modalList}
              renderItem={({ item }) => {
                const selected = item.label === displayValue;
                return (
                  <Pressable
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => { onSelect(item.value); setOpen(false); }}
                  >
                    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function FieldGroup({
  label,
  error,
  helper,
  children,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {!!error && (
        <Text style={styles.fieldError}>{error}</Text>
      )}
      {!error && !!helper && (
        <Text style={styles.fieldHelper}>{helper}</Text>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dobDay, setDobDay] = useState<number | null>(null);
  const [dobMonth, setDobMonth] = useState<number | null>(null);
  const [dobYear, setDobYear] = useState<number | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const nameStatus = validateName(name);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors["name"] = "الاسم مطلوب";
    } else if (trimmedName.length < 2) {
      newErrors["name"] = "الاسم يجب أن يكون حرفين على الأقل";
    } else if (trimmedName.length > 30) {
      newErrors["name"] = "الاسم يجب أن لا يتجاوز ٣٠ حرفاً";
    } else if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(trimmedName)) {
      newErrors["name"] = "الاسم يجب أن يحتوي على أحرف فقط";
    }

    if (!email) {
      newErrors["email"] = "البريد الإلكتروني مطلوب";
    } else if (!validateEmail(email)) {
      newErrors["email"] = "تنسيق البريد الإلكتروني غير صحيح";
    }

    if (!dobDay || !dobMonth || !dobYear) {
      newErrors["dob"] = "تاريخ الميلاد مطلوب";
    } else {
      const age = CURRENT_YEAR - dobYear;
      if (age < 13) {
        newErrors["dob"] = "يجب أن يكون عمرك ١٣ سنة على الأقل";
      }
    }

    if (!gender) {
      newErrors["gender"] = "يرجى اختيار الجنس";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, dobDay, dobMonth, dobYear, gender]);

  async function handleSubmit() {
    setEmailExistsError(false);
    setApiError("");
    if (!validate()) return;

    setLoading(true);

    const monthStr = String(dobMonth!).padStart(2, "0");
    const dayStr = String(dobDay!).padStart(2, "0");
    const dobString = `${dobYear}-${monthStr}-${dayStr}`;

    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          dob: dobString,
          gender,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setEmailExistsError(true);
        } else {
          setApiError("حدث خطأ غير متوقع، حاول مجدداً");
        }
        return;
      }

      console.log("[register] IS_VERIFICATION_ENABLED:", IS_VERIFICATION_ENABLED, "verified:", data.verified);

      if (!IS_VERIFICATION_ENABLED) {
        const trimmedName = name.trim();
        await Promise.all([
          AsyncStorage.setItem("uns_session_id", data.sessionId),
          AsyncStorage.setItem("uns_access_token", data.accessToken),
          AsyncStorage.setItem("uns_refresh_token", data.refreshToken),
          AsyncStorage.setItem("@uns_onboarding_complete", "1"),
          // Save gender with both key formats for SessionContext compatibility
          AsyncStorage.setItem("uns_gender", gender),
          AsyncStorage.setItem("@uns_gender", gender),
          // Save display name so SessionContext can build the greeting
          AsyncStorage.setItem("uns_name", trimmedName),
          AsyncStorage.setItem("uns_display_name", trimmedName),
          AsyncStorage.setItem("@uns_display_name", trimmedName),
          AsyncStorage.removeItem("@uns_pending_userId"),
          AsyncStorage.removeItem("@uns_pending_email"),
          AsyncStorage.removeItem("@uns_pending_gender"),
        ]);
        console.log("[register] isAuthenticated: true, isEmailVerified: true — routing to tour");
        router.replace("/onboarding/tour");
        return;
      }

      const trimmedName = name.trim();
      await Promise.all([
        AsyncStorage.setItem("@uns_pending_userId", data.userId),
        AsyncStorage.setItem("@uns_pending_email", data.email),
        AsyncStorage.setItem("@uns_pending_gender", gender),
        // Pre-save name and gender so they're available after verification
        AsyncStorage.setItem("uns_name", trimmedName),
        AsyncStorage.setItem("uns_display_name", trimmedName),
        AsyncStorage.setItem("@uns_display_name", trimmedName),
        AsyncStorage.setItem("uns_gender", gender),
        AsyncStorage.setItem("@uns_gender", gender),
      ]);

      router.push({
        pathname: "/onboarding/verify",
        params: { userId: data.userId, email: data.email, gender },
      });
    } catch {
      setApiError("تعذّر الاتصال بالخادم، تحقق من اتصالك وحاول مجدداً");
    } finally {
      setLoading(false);
    }
  }

  const dobDayLabel = dobDay ? String(dobDay) : "";
  const dobMonthLabel = dobMonth ? MONTHS_AR[dobMonth - 1]! : "";
  const dobYearLabel = dobYear ? String(dobYear) : "";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={() => router.canGoBack() ? router.back() : router.replace("/onboarding")}
        style={styles.backBtn}
        hitSlop={8}
      >
        <Feather name="arrow-right" size={22} color={Colors.onSurface} />
      </Pressable>

      <Text style={styles.title}>أنشئ حسابك</Text>
      <Text style={styles.subtitle}>أربعة حقول فقط — لا أكثر</Text>

      <View style={styles.form}>

        {/* Name */}
        <FieldGroup
          label="اسمك"
          error={errors["name"]}
          helper="الاسم يجب أن يكون بين ٢ و ٣٠ حرفاً"
        >
          <View style={[
            styles.inputWrap,
            errors["name"] ? styles.inputWrapError : nameStatus === "valid" ? styles.inputWrapValid : null,
          ]}>
            {nameStatus === "valid" && (
              <Feather name="check" size={16} color={Colors.accent} style={styles.inputIcon} />
            )}
            <TextInput
              style={styles.input}
              placeholder="ما اسمك؟"
              placeholderTextColor={Colors.muted}
              value={name}
              onChangeText={t => {
                setName(t);
                setErrors(e => ({ ...e, name: "" }));
              }}
              textAlign="right"
              returnKeyType="next"
              maxLength={30}
            />
          </View>
        </FieldGroup>

        {/* Email */}
        <FieldGroup label="البريد الإلكتروني" error={errors["email"]}>
          <View style={[styles.inputWrap, errors["email"] ? styles.inputWrapError : null]}>
            <TextInput
              style={styles.input}
              placeholder="بريدك الإلكتروني"
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={t => {
                setEmail(t);
                setErrors(e => ({ ...e, email: "" }));
                setEmailExistsError(false);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
            />
          </View>
          {emailExistsError && (
            <View style={styles.emailExistsBox}>
              <Text style={styles.emailExistsText}>
                يبدو أن لديك حساباً مسبقاً، يمكنك تسجيل الدخول بدلاً من ذلك
              </Text>
              <Pressable
                onPress={() => router.push("/onboarding/login")}
                style={styles.loginLink}
              >
                <Text style={styles.loginLinkText}>تسجيل الدخول</Text>
                <Feather name="arrow-left" size={13} color={Colors.accent} />
              </Pressable>
            </View>
          )}
        </FieldGroup>

        {/* Date of Birth */}
        <FieldGroup label="تاريخ الميلاد" error={errors["dob"]}>
          <View style={styles.dobRow}>
            <View style={styles.dobCell}>
              <DropdownField
                label="اليوم"
                displayValue={dobDayLabel}
                placeholder="اليوم"
                options={DAYS}
                onSelect={v => { setDobDay(v); setErrors(e => ({ ...e, dob: "" })); }}
                hasError={!!errors["dob"]}
              />
            </View>
            <View style={[styles.dobCell, styles.dobCellMid]}>
              <DropdownField
                label="الشهر"
                displayValue={dobMonthLabel}
                placeholder="الشهر"
                options={MONTHS}
                onSelect={v => { setDobMonth(v); setErrors(e => ({ ...e, dob: "" })); }}
                hasError={!!errors["dob"]}
              />
            </View>
            <View style={styles.dobCell}>
              <DropdownField
                label="السنة"
                displayValue={dobYearLabel}
                placeholder="السنة"
                options={YEARS}
                onSelect={v => { setDobYear(v); setErrors(e => ({ ...e, dob: "" })); }}
                hasError={!!errors["dob"]}
              />
            </View>
          </View>
        </FieldGroup>

        {/* Gender */}
        <FieldGroup label="الجنس" error={errors["gender"]}>
          <View style={styles.genderRow}>
            {(["female", "male"] as const).map((g) => {
              const selected = gender === g;
              const label = g === "female" ? "أنثى" : "ذكر";
              return (
                <Pressable
                  key={g}
                  style={[styles.genderPill, selected && styles.genderPillActive]}
                  onPress={() => { setGender(g); setErrors(e => ({ ...e, gender: "" })); }}
                >
                  <Text style={[styles.genderPillText, selected && styles.genderPillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FieldGroup>
      </View>

      {!!apiError && (
        <View style={styles.apiErrorBox}>
          <Text style={styles.apiErrorText}>{apiError}</Text>
        </View>
      )}

      <View style={styles.submitWrap}>
        <LinearGradient
          colors={loading ? ["#9acdaf", "#2d6147"] : ["#74C69D", "#1B4332"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtn}
        >
          <Pressable
            style={styles.submitBtnInner}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.surface} />
              : <Text style={styles.submitBtnText}>التالي ←</Text>
            }
          </Pressable>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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

  fieldHelper: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    lineHeight: 20,
    color: Colors.muted,
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

  // ── Email exists ───────────────────────────────────────────────────────────
  emailExistsBox: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },

  emailExistsText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    lineHeight: 22,
    color: Colors.onSurface,
    textAlign: "right",
  },

  loginLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },

  loginLinkText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    lineHeight: 22,
    color: Colors.accent,
    textDecorationLine: "underline",
  },

  // ── DOB ───────────────────────────────────────────────────────────────────
  dobRow: {
    flexDirection: "row",
  },

  dobCell: {
    flex: 1,
  },

  dobCellMid: {
    marginHorizontal: 8,
  },

  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ghostBorder,
    paddingHorizontal: 12,
    minHeight: 54,
    gap: 6,
  },

  dropdownText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    lineHeight: 28,
    color: Colors.onSurface,
    textAlign: "right",
    flex: 1,
  },

  dropdownPlaceholder: {
    color: Colors.muted,
  },

  dropdownChevron: {
    flexShrink: 0,
  },

  // ── Modal picker ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(4,23,16,0.5)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: "60%",
  },

  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ghostBorder,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  modalTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    lineHeight: 32,
    color: Colors.onSurface,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostBorder,
  },

  modalList: {
    paddingVertical: 8,
  },

  modalOption: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },

  modalOptionSelected: {
    backgroundColor: Colors.primaryContainer,
  },

  modalOptionText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    lineHeight: 30,
    color: Colors.onSurface,
    textAlign: "right",
  },

  modalOptionTextSelected: {
    fontFamily: "Tajawal_700Bold",
    color: Colors.accent,
  },

  // ── Gender ────────────────────────────────────────────────────────────────
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },

  genderPill: {
    flex: 1,
    minHeight: 54,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ghostBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },

  genderPillActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.accent,
  },

  genderPillText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    lineHeight: 30,
    color: Colors.muted,
    textAlign: "center",
  },

  genderPillTextActive: {
    color: Colors.accent,
  },

  // ── API error ─────────────────────────────────────────────────────────────
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

  // ── Submit button ─────────────────────────────────────────────────────────
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

  inputError: {
    borderColor: Colors.error,
    backgroundColor: "rgba(192,57,43,0.04)",
  },
});
