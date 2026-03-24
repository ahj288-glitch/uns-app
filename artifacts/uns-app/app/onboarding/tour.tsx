import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

const SLIDES: { icon: FeatherIconName; headline: string; description: string }[] = [
  {
    icon: "message-circle",
    headline: "المحادثة",
    description: "رفيق يسمع ويتذكر",
  },
  {
    icon: "wind",
    headline: "التنفس",
    description: "لحظات هدوء موجّهة لإعادة التوازن",
  },
  {
    icon: "bar-chart-2",
    headline: "الرؤى",
    description: "افهم مشاعرك وأنماطك",
  },
  {
    icon: "map",
    headline: "الرحلة",
    description: "تتبّع نموّك خطوة بخطوة",
  },
  {
    icon: "share-2",
    headline: "البصمة",
    description: "شارك ما أنت عليه بأناقة",
  },
];

function Slide({ icon, headline, description }: (typeof SLIDES)[0]) {
  return (
    <View style={styles.slide}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={48} color={Colors.accent} />
      </View>
      <Text style={styles.slideHeadline}>{headline}</Text>
      <Text style={styles.slideDescription}>{description}</Text>
    </View>
  );
}

export default function TourScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  function goNext() {
    if (isLast) {
      router.replace("/(tabs)");
      return;
    }
    const next = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
  }

  function handleSkip() {
    router.replace("/(tabs)");
  }

  return (
    <LinearGradient
      colors={[Colors.surface, "#FAF3EB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
                i < currentIndex && styles.dotDone,
              ]}
            />
          ))}
        </View>
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>تخطي</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <Slide {...item} />}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        style={styles.flatList}
      />

      <View style={styles.footer}>
        <Pressable
          style={{ borderRadius: 999, overflow: "hidden" }}
          onPress={goNext}
        >
          <LinearGradient
            colors={["#74C69D", "#1B4332"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? "ابدأ رحلتك مع أُنْس ←" : "التالي ←"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.accent,
  },
  dotDone: {
    backgroundColor: Colors.primaryContainer,
  },
  skipBtn: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  slideHeadline: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 32,
    color: Colors.onSurface,
    textAlign: "center",
  },
  slideDescription: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 18,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 30,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nextBtn: {
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  nextBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    color: Colors.surface,
  },
});
