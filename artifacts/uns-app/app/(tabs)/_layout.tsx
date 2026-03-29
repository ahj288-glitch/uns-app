import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

// Regular tab icon — small pill background when focused
function TabIcon({ name, color, focused }: { name: FeatherIconName; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name} size={20} color={focused ? Colors.surface : color} />
    </View>
  );
}

// Center chat tab — larger, raised, always prominent
function ChatTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.chatIconOuter, focused && styles.chatIconOuterActive]}>
      <View style={[styles.chatIconInner, focused && styles.chatIconInnerActive]}>
        <Feather
          name="message-circle"
          size={24}
          color={focused ? Colors.surface : Colors.accent}
        />
      </View>
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
          paddingTop: 6,
        },
        tabBarBackground: () =>
          Platform.OS !== "web" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(4,23,16,0.90)" }]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Tajawal_400Regular",
          fontSize: 11,
          marginTop: 1,
        },
        tabBarShowLabel: true,
      }}
    >
      {/* Tab 1 — Journey */}
      <Tabs.Screen
        name="journey"
        options={{
          title: "رحلتي",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map" color={color} focused={focused} />
          ),
        }}
      />

      {/* Tab 2 — Chat (center, primary action) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "أُنس",
          tabBarLabelStyle: {
            fontFamily: "Tajawal_700Bold",
            fontSize: 11,
            marginTop: 1,
            color: Colors.accent,
          },
          tabBarIcon: ({ focused }) => <ChatTabIcon focused={focused} />,
        }}
      />

      {/* Tab 3 — Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="feather" color={color} focused={focused} />
          ),
        }}
      />

      {/* Hidden tabs — accessible via router.push but not shown in bar */}
      <Tabs.Screen name="insights"   options={{ href: null }} />
      <Tabs.Screen name="share"      options={{ href: null }} />
      <Tabs.Screen name="mood"       options={{ href: null }} />
      <Tabs.Screen name="community"  options={{ href: null }} />
      <Tabs.Screen name="programs"   options={{ href: null }} />
      <Tabs.Screen name="profile"    options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Standard tab icons
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
  // Center chat tab
  chatIconOuter: {
    width: 52,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4, // Raise above tab bar baseline
  },
  chatIconOuterActive: {
    // No outer background when active — inner handles it
  },
  chatIconInner: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: "transparent",
  },
  chatIconInnerActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
});
