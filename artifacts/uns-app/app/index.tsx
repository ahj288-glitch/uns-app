import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

const KEYS = {
  onboarding: "@uns_onboarding_complete",
  accessToken: "uns_access_token",
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
            AsyncStorage.getItem(KEYS.accessToken),
            AsyncStorage.getItem(KEYS.pendingUserId),
            AsyncStorage.getItem(KEYS.pendingEmail),
            AsyncStorage.getItem(KEYS.pendingGender),
          ]);

        if (cancelled) return;

        console.log("[RouterGuard] onboarding:", onboarding, "token:", token ? "present" : "null", "pendingUserId:", pendingUserId);

        if (!onboarding) {
          router.replace("/onboarding");
          return;
        }

        if (!token) {
          if (pendingUserId && pendingEmail) {
            router.replace({
              pathname: "/onboarding/verify",
              params: {
                userId: pendingUserId,
                email: pendingEmail,
                gender: pendingGender ?? "female",
              },
            });
          } else {
            router.replace("/onboarding/register");
          }
          return;
        }

        router.replace("/(tabs)");
      } catch (err) {
        console.warn("[RouterGuard] error reading storage, defaulting to onboarding:", err);
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
