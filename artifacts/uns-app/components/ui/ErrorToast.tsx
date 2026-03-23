import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ErrorSeverity } from "@/constants/errors";

interface ErrorToastProps {
  message: string;
  severity?: ErrorSeverity;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  duration?: number;
  visible: boolean;
}

const SEVERITY_COLORS: Record<ErrorSeverity, string> = {
  info: Colors.accent,
  warning: "#F4B942",
  limit: "#F4B942",
  error: Colors.error,
  critical: Colors.error,
  safety: Colors.error,
};

const SEVERITY_ICONS: Record<ErrorSeverity, keyof typeof Feather.glyphMap> = {
  info: "info",
  warning: "alert-triangle",
  limit: "clock",
  error: "alert-circle",
  critical: "alert-octagon",
  safety: "shield",
};

export default function ErrorToast({
  message,
  severity = "error",
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
  visible,
}: ErrorToastProps) {
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const color = SEVERITY_COLORS[severity];
  const icon = SEVERITY_ICONS[severity];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0 && !actionLabel) {
        timerRef.current = setTimeout(() => {
          dismiss();
        }, duration);
      }
    } else {
      dismiss();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 120,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss?.());
  }

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.iconWrap}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={styles.message} numberOfLines={3}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable style={[styles.actionBtn, { borderColor: color + "55" }]} onPress={onAction}>
          <Text style={[styles.actionText, { color }]}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.dismissBtn} onPress={dismiss} accessibilityLabel="إغلاق">
          <Feather name="x" size={14} color={Colors.muted} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 120 : 110,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 0,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 4,
    marginRight: 2,
  },
  iconWrap: {
    width: 32,
    alignItems: "center",
  },
  message: {
    flex: 1,
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 22,
    textAlign: "right",
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 4,
  },
  actionText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
});
