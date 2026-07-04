import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from "@expo-google-fonts/tajawal";
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from "@expo-google-fonts/be-vietnam-pro";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import { setBaseUrl } from "@workspace/api-client-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NetworkBanner from "@/components/ui/NetworkBanner";
import { NetworkProvider, useNetwork } from "@/contexts/NetworkContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

// ── API base URL guard ────────────────────────────────────────────────────────
// Fail visibly if the domain env var is missing rather than silently calling
// "https://undefined" and showing a blank app with no error.
const DOMAIN = process.env["EXPO_PUBLIC_DOMAIN"];
if (DOMAIN) {
  setBaseUrl(`https://${DOMAIN}`);
}

// ── React Query — sane global defaults ───────────────────────────────────────
// staleTime: 60s — prevents needless refetches on every window focus for data
//   that changes infrequently (mood history, gamification, daily recipe).
// gcTime: 5 min — cache is held for background refresh.
// retry: 2 — give the network two chances before surfacing an error.
// refetchOnWindowFocus: false — mobile apps focus-change constantly; avoid thrashing.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Config Error Screen ───────────────────────────────────────────────────────
function ConfigErrorScreen() {
  return (
    <View style={configStyles.container}>
      <Text style={configStyles.title}>تعذّر الاتصال</Text>
      <Text style={configStyles.body}>
        لم يتم ضبط إعدادات التطبيق بشكل صحيح. يرجى إعادة تثبيت التطبيق أو التواصل مع الدعم.
      </Text>
    </View>
  );
}

const configStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041710",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 22,
    color: "#74C69D",
    textAlign: "center",
  },
  body: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: "#e8f5ee",
    textAlign: "center",
    lineHeight: 26,
  },
});

// ── Navigation ────────────────────────────────────────────────────────────────
function RootLayoutNav() {
  const { offline, reconnecting } = useNetwork();
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <NetworkBanner offline={offline} reconnecting={reconnecting} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Fix 9 — font load failure must not leave the app on a blank splash forever.
  // Render a recoverable Arabic error screen instead of returning null.
  if (fontError) {
    return (
      <SafeAreaProvider>
        <View style={configStyles.container}>
          <Text style={configStyles.title}>فشل تحميل التطبيق</Text>
          <Text style={configStyles.body}>
            تعذّر تحميل الخطوط. يرجى إعادة تشغيل التطبيق.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!fontsLoaded && !fontError) return null;

  // Show a meaningful error screen if the API domain is not configured
  if (!DOMAIN) {
    return (
      <SafeAreaProvider>
        <ConfigErrorScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ThemeProvider>
              <NetworkProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </NetworkProvider>
            </ThemeProvider>
          </SessionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
