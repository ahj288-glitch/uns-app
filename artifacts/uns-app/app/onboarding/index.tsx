import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[Colors.surface, "#FAF3EB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
    >
      <Animated.View entering={FadeInDown.duration(700)} style={styles.content}>
        <Text style={styles.wordmark}>أُنْس</Text>
        <Text style={styles.tagline}>رفيقك العاطفي الأول من نوعه</Text>
        <Text style={styles.subtext}>
          مساحة آمنة تستمع إليك، تتذكرك، وتنمو معك
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(200)} style={styles.footer}>
        <Pressable
          style={{ borderRadius: 999, overflow: "hidden" }}
          onPress={() => router.push("/onboarding/register")}
        >
          <LinearGradient
            colors={["#74C69D", "#1B4332"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>ابدأ رحلتك</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push("/onboarding/login")}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>لديّ حساب بالفعل</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  wordmark: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 88,
    color: Colors.accent,
    textAlign: "center",
    lineHeight: 110,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: "center",
    lineHeight: 38,
  },
  subtext: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 300,
    marginTop: 4,
  },
  footer: {
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: Colors.surface,
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.muted,
    textDecorationLine: "underline",
  },
});
