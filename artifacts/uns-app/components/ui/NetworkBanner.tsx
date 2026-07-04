import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface NetworkBannerProps {
  offline: boolean;
  reconnecting?: boolean;
}

export default function NetworkBanner({ offline, reconnecting }: NetworkBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: offline || reconnecting ? 0 : -80,
      useNativeDriver: true,
      tension: 80,
      friction: 14,
    }).start();
  }, [offline, reconnecting]);

  // On native: sit directly below the status bar.
  // On web: push down past the fixed header (~60 px).
  const topOffset = Platform.OS === "web" ? 60 : insets.top;

  return (
    <Animated.View
      style={[styles.banner, { top: topOffset, transform: [{ translateY }] }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.row}>
        <Feather
          name={reconnecting ? "refresh-cw" : "wifi-off"}
          size={14}
          color={reconnecting ? Colors.accent : "#F4B942"}
        />
        <Text style={[styles.text, { color: reconnecting ? Colors.accent : "#F4B942" }]}>
          {reconnecting
            ? "عاد الاتصال — جارٍ المزامنة…"
            : "يبدو أن الاتصال هادئ الآن… سنحاول مجدداً خلال لحظات"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 900,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  text: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
});
