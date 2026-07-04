import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessToken } from "@/lib/secureTokens";
import Colors from "@/constants/colors";

// ── Feature flag — must match register.tsx ────────────────────────────────────
// false = MVP mode: no OTP screen ever shown, register returns tokens directly.
// true  = full verification: OTP screen is part of the flow.
// Controlled at build time via EXPO_PUBLIC_VERIFICATION_ENABLED so the same
// binary can ship MVP (off) or full-verification (on) without a code change.
const IS_VERIFICATION_ENABLED = process.env["EXPO_PUBLIC_VERIFICATION_ENABLED"] === "true";

const KEYS = {
  onboarding: "@uns_onboarding_complete",
  pendingUserId: "@uns_pending_userId",
  pendingEmail: "@uns_pending_email",
  pendingGender: "@uns_pending_gender",
} as const;

export default function RouterGuard() {
  useEffect(() => {
    let cancelled = false;

    async function decide() {
      try {
        const [onboarding, token, pendingUserId, pendingEmail, pendingGender] =
          await Promise.all([
            AsyncStorage.getItem(KEYS.onboarding),
            getAccessToken(),
            AsyncStorage.getItem(KEYS.pendingUserId),
            AsyncStorage.getItem(KEYS.pendingEmail),
            AsyncStorage.getItem(KEYS.pendingGender),
          ]);

        if (cancelled) return;

        if (__DEV__) {
          console.log(
            "[RouterGuard] IS_VERIFICATION_ENABLED:", IS_VERIFICATION_ENABLED,
            "| hasCompletedOnboarding:", !!onboarding,
            "| isAuthenticated:", !!token,
            "| isEmailVerified:", IS_VERIFICATION_ENABLED ? "pending" : "bypassed",
            "| pendingUserId:", pendingUserId ?? "none"
          );
        }

        if (!onboarding) {
          if (__DEV__) console.log("[RouterGuard] → /onboarding (first time user)");
          router.replace("/onboarding");
          return;
        }

        if (!token) {
          if (IS_VERIFICATION_ENABLED && pendingUserId && pendingEmail) {
            // Mid-registration recovery: user registered but closed app before verifying
            if (__DEV__) console.log("[RouterGuard] → /onboarding/verify (mid-registration recovery)");
            router.replace({
              pathname: "/onboarding/verify",
              params: {
                userId: pendingUserId,
                email: pendingEmail,
                gender: pendingGender ?? "female",
              },
            });
          } else {
            // No token and not in a mid-verification state → go to register
            if (__DEV__) console.log("[RouterGuard] → /onboarding/register (needs auth)");
            router.replace("/onboarding/register");
          }
          return;
        }

        if (__DEV__) console.log("[RouterGuard] → /(tabs) (authenticated)");
        router.replace("/(tabs)");
      } catch (err) {
        if (__DEV__) console.warn("[RouterGuard] storage error — defaulting to /onboarding:", err);
        if (!cancelled) router.replace("/onboarding");
      }
    }

    decide();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={Colors.accent} />
    </View>
  );
}
