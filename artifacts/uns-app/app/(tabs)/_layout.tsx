import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("@uns_onboarding_complete"),
      AsyncStorage.getItem("uns_access_token"),
    ]).then(([onboardingComplete, accessToken]) => {
      if (!onboardingComplete || !accessToken) {
        router.replace("/onboarding");
      } else {
        setChecking(false);
      }
    }).catch(() => {
      router.replace("/onboarding");
    });
  }, []);

  if (checking) {
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
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="trending-up" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="message-circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="feather" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: "Share",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="share-2" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="mood" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="programs" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
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
