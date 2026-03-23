import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface LimitBlockerProps {
  title: string;
  message: string;
  resetLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Feather.glyphMap;
}

export default function LimitBlocker({
  title,
  message,
  resetLabel,
  actionLabel,
  onAction,
  icon = "moon",
}: LimitBlockerProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.container}
      accessibilityRole="alert"
    >
      <View style={styles.iconCircle}>
        <Feather name={icon} size={28} color={Colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {resetLabel ? (
        <View style={styles.resetRow}>
          <Feather name="clock" size={13} color={Colors.muted} />
          <Text style={styles.resetText}>{resetLabel}</Text>
        </View>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 16,
    paddingBottom: Platform.OS === "web" ? 80 : 40,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    color: Colors.onSurface,
    textAlign: "center",
  },
  message: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.primary,
    textAlign: "center",
    lineHeight: 26,
  },
  resetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resetText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.muted,
  },
  actionBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 8,
  },
  actionBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 15,
    color: Colors.accent,
  },
});
