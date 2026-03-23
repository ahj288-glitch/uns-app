import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface NetworkBannerProps {
  offline: boolean;
  reconnecting?: boolean;
}

export default function NetworkBanner({ offline, reconnecting }: NetworkBannerProps) {
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: offline ? 0 : -60,
      useNativeDriver: true,
      tension: 80,
      friction: 14,
    }).start();
  }, [offline]);

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }] }]}
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
            ? "جارٍ إعادة الاتصال..."
            : "لا يوجد اتصال — سيتم الإرسال تلقائياً عند عودة الاتصال"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: Platform.OS === "web" ? 60 : 0,
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
