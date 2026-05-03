import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

function TabIcon({ name, color, focused }: { name: FeatherIconName; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name} size={20} color={focused ? Colors.surface : color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { authToken, isReady } = useSession();

  useEffect(() => {
    if (isReady && !authToken) {
      router.replace("/");
    }
  }, [isReady, authToken]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  // ── Tab order — Arabic-first RTL ────────────────────────────────────
  // React Native renders tabs left-to-right in source order. With the
  // device's I18nManager set to RTL for Arabic, that physical order
  // flips on screen — so the FIRST tab declared appears on the FAR
  // RIGHT, which is what an Arabic UX expects:
  //
  //   visual order (what the user sees, right→left):
  //     الرئيسية | أُنس | رحلتي | الرؤى | حسابي
  //
  //   code order (declaration order, top→bottom):
  //     index → chat → journey → insights → profile
  //
  // Note: أُنس (chat) is the product's core feature. A raised/prominent
  // visual treatment was originally proposed (ChatTabIcon component
  // with chatIconOuter / chatIconInner styles) but was deferred —
  // see docs/audit-fixes-status.md "Tab bar visual prominence" entry.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isWeb ? Colors.surfaceContainer : "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS !== "web" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(4,23,16,0.88)" }]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "BeVietnamPro_500Medium",
          fontSize: 10,
          marginTop: 2,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "أُنس",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="message-circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: "رحلتي",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "الرؤى",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart-2" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "حسابي",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="share" options={{ href: null }} />
      <Tabs.Screen name="mood" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="programs" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: Colors.accent,
  },
});
