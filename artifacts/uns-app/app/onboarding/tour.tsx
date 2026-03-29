import { useEffect } from "react";
import { router } from "expo-router";

// Static feature slides replaced by the 3-step personalized onboarding flow.
// This screen now redirects immediately so any deep-link or recovery path is handled.
export default function TourScreen() {
  useEffect(() => { router.replace("/(tabs)"); }, []);
  return null;
}
