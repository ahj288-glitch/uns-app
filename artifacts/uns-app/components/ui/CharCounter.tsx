import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Colors from "@/constants/colors";

interface CharCounterProps {
  current: number;
  max: number;
  warnAt?: number;
}

export default function CharCounter({ current, max, warnAt }: CharCounterProps) {
  const remaining = max - current;
  const isWarning = warnAt !== undefined ? current >= warnAt : remaining <= 80;
  const isDanger = remaining <= 40;
  const isVisible = isWarning;

  if (!isVisible) return null;

  const color = isDanger ? Colors.error : "#F4B942";

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.container}
      accessibilityLabel={`${remaining} حرف متبقٍ من ${max}`}
    >
      <View style={[styles.pill, { borderColor: color + "44", backgroundColor: color + "14" }]}>
        <Text style={[styles.text, { color }]}>
          {remaining}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    paddingHorizontal: 18,
    paddingBottom: 4,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
