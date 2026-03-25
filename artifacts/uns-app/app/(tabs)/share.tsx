import React, { useRef, useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTokens } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/layout";
import { useEmotionalFingerprint, type FingerprintResult } from "@/hooks/useEmotionalFingerprint";
import FingerprintCard from "@/components/FingerprintCard";

function downloadFingerprintCardPng(fp: FingerprintResult) {
  const CARD_W = 450;
  const CARD_H = 800;
  const PAD = 28;

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const [c1, c2] = fp.gradientColors;
  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  const R = 24;
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(0, 0, CARD_W, CARD_H, R);
  } else {
    ctx.beginPath();
    ctx.moveTo(R, 0);
    ctx.lineTo(CARD_W - R, 0);
    ctx.quadraticCurveTo(CARD_W, 0, CARD_W, R);
    ctx.lineTo(CARD_W, CARD_H - R);
    ctx.quadraticCurveTo(CARD_W, CARD_H, CARD_W - R, CARD_H);
    ctx.lineTo(R, CARD_H);
    ctx.quadraticCurveTo(0, CARD_H, 0, CARD_H - R);
    ctx.lineTo(0, R);
    ctx.quadraticCurveTo(0, 0, R, 0);
    ctx.closePath();
  }
  ctx.fill();

  ctx.textAlign = "right";
  ctx.direction = "rtl";

  ctx.font = "bold 14px Tajawal, sans-serif";
  ctx.fillStyle = fp.accentColor + "b3";
  ctx.fillText("أُنْس", CARD_W - PAD, PAD + 14);

  const orbCX = CARD_W / 2;
  const orbCY = CARD_H * 0.38;
  const orbR = 70;
  const orbGlow = ctx.createRadialGradient(orbCX, orbCY, 0, orbCX, orbCY, orbR);
  orbGlow.addColorStop(0, fp.accentColor + "30");
  orbGlow.addColorStop(1, "transparent");
  ctx.fillStyle = orbGlow;
  ctx.beginPath();
  ctx.arc(orbCX, orbCY, orbR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = fp.accentColor + "40";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(orbCX, orbCY, 55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = "bold 28px Tajawal, sans-serif";
  ctx.fillStyle = fp.accentColor;
  ctx.fillText(fp.labelAr, CARD_W - PAD, CARD_H - 180);

  ctx.font = "18px Tajawal, sans-serif";
  ctx.fillStyle = "rgba(232, 245, 238, 0.9)";
  const maxW = CARD_W - PAD * 2;
  const words = `"${fp.quote}"`.split(" ");
  let line = "";
  let y = CARD_H - 130;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, CARD_W - PAD, y);
      line = w;
      y += 28;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, CARD_W - PAD, y);

  ctx.fillStyle = fp.accentColor + "60";
  ctx.fillRect(PAD, CARD_H - 60, CARD_W * 0.6, 1);

  ctx.font = "12px Tajawal, sans-serif";
  ctx.fillStyle = "rgba(116,198,157,0.5)";
  ctx.fillText("اكتشف بصمتك العاطفية", CARD_W - PAD, CARD_H - 36);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "بصمتي-العاطفية.png";
  a.click();
}

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const T = useTokens();
  const styles = makeStyles(T);
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const fingerprint = useEmotionalFingerprint();
  const cardRef = useRef<View>(null);
  const isEmptyState = fingerprint.key === "growing_calm" && !fingerprint.hasData;

  const handleRegenerate = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    fingerprint.regenerate();
  }, [fingerprint]);

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (Platform.OS === "web") {
      downloadFingerprintCardPng(fingerprint);
      return;
    }

    try {
      const { captureRef } = await import("react-native-view-shot");
      const uri = await captureRef(cardRef, { format: "png", quality: 1.0 });
      await Share.share({ url: uri, title: "بصمتي العاطفية | أُنْس" });
    } catch {
      try {
        await Share.share({
          message: `"${fingerprint.quote}"\n\n— ${fingerprint.labelAr} • من أُنْس`,
          title: "بصمتي العاطفية | أُنْس",
        });
      } catch {}
    }
  }, [fingerprint]);

  return (
    <LinearGradient
      colors={T.bg}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: webBottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: webTop + Spacing.md }]}>
          <Text style={styles.logo}>أُنْس</Text>
          <Text style={styles.headerTitle}>بصمتك</Text>
          <Pressable style={styles.menuBtn}>
            <Feather name="menu" size={20} color={T.onSurface} />
          </Pressable>
        </View>

        <View style={styles.cardWrap}>
          <FingerprintCard
            ref={cardRef}
            labelAr={fingerprint.labelAr}
            quote={fingerprint.quote}
            gradientColors={fingerprint.gradientColors}
            accentColor={fingerprint.accentColor}
          />
        </View>

        <View style={styles.labelRow}>
          <Pressable onPress={handleRegenerate} style={styles.regenIcon}>
            <Feather name="refresh-cw" size={16} color={T.accent} />
          </Pressable>
          <Text style={styles.labelText}>
            بصمتك اليوم:{" "}
            <Text style={[styles.labelBold, { color: fingerprint.accentColor }]}>
              {fingerprint.labelAr}
            </Text>
          </Text>
        </View>

        {isEmptyState && (
          <Text style={[styles.emptyStateNote, { color: T.muted }]}>
            بصمتك ستتشكّل مع كل يوم تسجّل فيه حالتك
          </Text>
        )}

        <View style={styles.actionsRow}>
          <Pressable style={[styles.outlineBtn, { borderColor: T.accent + "60" }]} onPress={handleRegenerate}>
            <Feather name="refresh-cw" size={15} color={T.accent} style={{ marginLeft: Spacing.xs }} />
            <Text style={[styles.outlineBtnText, { color: T.accent }]}>ولّد بصمة جديدة</Text>
          </Pressable>

          <Pressable style={styles.fillBtnWrap} onPress={handleShare}>
            <LinearGradient
              colors={[fingerprint.accentColor, fingerprint.gradientColors[0]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fillBtn}
            >
              <Feather name="share-2" size={15} color="#fff" style={{ marginLeft: Spacing.xs }} />
              <Text style={styles.fillBtnText}>شارك البطاقة</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={[styles.privacyNote, { color: T.muted }]}>
          لا تُكشف أي بيانات شخصية عند المشاركة.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    logo: {
      ...Typography.h2,
      color: T.accent,
    },
    headerTitle: {
      ...Typography.h3,
      color: T.onSurface,
    },
    menuBtn: {
      padding: Spacing.xs,
    },
    cardWrap: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    regenIcon: {
      padding: Spacing.xs,
    },
    labelText: {
      ...Typography.body,
      color: T.onSurface,
      textAlign: "right",
    },
    labelBold: {
      ...Typography.body,
      fontFamily: "Tajawal_700Bold",
    },
    emptyStateNote: {
      ...Typography.bodySmall,
      textAlign: "center",
      paddingHorizontal: Spacing.xxl,
      marginBottom: Spacing.md,
      opacity: 0.7,
    },
    actionsRow: {
      flexDirection: "row",
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    outlineBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
      borderRadius: Radius.lg,
      borderWidth: 1,
      gap: Spacing.xs,
    },
    outlineBtnText: {
      ...Typography.h3,
    },
    fillBtnWrap: {
      flex: 1,
      borderRadius: Radius.lg,
      overflow: "hidden",
    },
    fillBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
      gap: Spacing.xs,
    },
    fillBtnText: {
      ...Typography.h3,
      color: "#fff",
    },
    privacyNote: {
      ...Typography.caption,
      textAlign: "center",
      paddingHorizontal: Spacing.lg,
      opacity: 0.6,
    },
  });
}
