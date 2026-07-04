/**
 * Shared in-memory AI configuration store.
 * Loaded at startup. PUT /admin/ai-config updates this at runtime.
 * Persists for server lifetime — replaced by a DB table in production.
 */
export interface AiConfig {
  defaultDialect: string;
  toneIntensity: string;
  spiritualLayerEnabled: boolean;
  crisisThreshold: string;
  familyModeEnabled: boolean;
  modelTier: string;
  systemPromptSuffix: string;
}

export const aiConfig: AiConfig = {
  defaultDialect: "gulf",
  toneIntensity: "semi-formal",
  spiritualLayerEnabled: true,
  crisisThreshold: "standard",
  familyModeEnabled: false,
  modelTier: "llama-3.3-70b-versatile",
  systemPromptSuffix: "",
};
