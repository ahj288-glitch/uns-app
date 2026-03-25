import React, { forwardRef, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTokens } from "@/constants/colors";

export interface FingerprintCardProps {
  labelAr: string;
  quote: string;
  gradientColors: [string, string];
  accentColor: string;
}

const FingerprintCard = forwardRef<View, FingerprintCardProps>(
  ({ labelAr, quote, gradientColors, accentColor }, ref) => {
    const T = useTokens();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 2800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }, []);

    return (
      <View ref={ref} collapsable={false}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={[styles.brand, { color: accentColor }]}>أُنْس</Text>

          <View style={styles.orbContainer}>
            <Animated.View
              style={[
                styles.orbGlow,
                {
                  backgroundColor: accentColor,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View
              style={[
                styles.orbRing,
                { borderColor: accentColor + "40" },
              ]}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={[styles.fingerprintLabel, { color: accentColor }]}>
              {labelAr}
            </Text>

            <Text style={[styles.quoteText, { color: T.onSurface }]} numberOfLines={2} ellipsizeMode="tail">
              {`"${quote}"`}
            </Text>

            <View style={[styles.accentLine, { backgroundColor: accentColor + "60" }]} />

            <Text style={[styles.caption, { color: T.muted }]}>
              اكتشف بصمتك العاطفية
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

FingerprintCard.displayName = "FingerprintCard";

export default FingerprintCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: 24,
    padding: 28,
    alignItems: "flex-end",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  brand: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 14,
    textAlign: "right",
    opacity: 0.7,
  },
  orbContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  orbGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.18,
  },
  orbRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  textBlock: {
    width: "100%",
    alignItems: "flex-end",
    gap: 12,
  },
  fingerprintLabel: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 28,
    lineHeight: 50,
    textAlign: "right",
  },
  quoteText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    lineHeight: 28,
    textAlign: "right",
    opacity: 0.9,
  },
  accentLine: {
    width: "60%",
    height: 1,
    borderRadius: 1,
  },
  caption: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    textAlign: "right",
    opacity: 0.55,
  },
});
