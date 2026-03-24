import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTokens } from "@/constants/colors";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface EmptyStateProps {
  icon: FeatherIconName;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export default function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: EmptyStateProps) {
  const T = useTokens();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: T.primaryContainer }]}>
        <Feather name={icon} size={36} color={T.accent} />
      </View>
      <Text style={[styles.title, { color: T.onSurface }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: T.muted }]}>{subtitle}</Text>
      ) : null}
      {ctaLabel && onCta ? (
        <Pressable
          style={[styles.ctaBtn, { backgroundColor: T.accent }]}
          onPress={onCta}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          <Text style={styles.ctaBtnText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
    gap: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    textAlign: "center",
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  ctaBtn: {
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 8,
  },
  ctaBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
