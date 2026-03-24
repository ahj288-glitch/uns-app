import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFetchWithAuth } from "@/lib/api";
import { Brain, Save, Shield, Settings2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = "/api";

const configSchema = z.object({
  defaultDialect: z.enum(["gulf", "levant", "egyptian", "maghrebi", "msa"]),
  toneIntensity: z.enum(["formal", "semi-formal", "casual"]),
  spiritualLayerEnabled: z.boolean(),
  crisisThreshold: z.enum(["conservative", "standard", "sensitive"]),
  familyModeEnabled: z.boolean(),
  modelTier: z.enum(["gpt-4o", "gpt-4o-mini"]),
  systemPromptSuffix: z.string().optional(),
});

type ConfigForm = z.infer<typeof configSchema>;

export default function AiConfig() {
  const { fetchWithAuth } = useFetchWithAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
  });

  useEffect(() => {
    setIsLoading(true);
    fetchWithAuth(`${BASE}/admin/ai-config`)
      .then(r => r.json())
      .then(d => reset(d as ConfigForm))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const spiritualLayer = watch("spiritualLayerEnabled");
  const familyMode = watch("familyModeEnabled");
  const modelTier = watch("modelTier");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const onSubmit = async (data: ConfigForm) => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`${BASE}/admin/ai-config`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({
          title: "Configuration Saved",
          description: "AI Companion settings have been updated successfully.",
        });
      } else {
        throw new Error("save failed");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          AI Companion Configuration
        </h1>
        <p className="text-muted-foreground mt-2">Adjust personality, safety rails, and base models for the companion.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Core Personality */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-border flex items-center gap-3 bg-muted/10">
            <Settings2 className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Core Personality</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">Default Dialect</label>
              <select {...register("defaultDialect")} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 appearance-none">
                <option value="gulf">Gulf (Khaleeji)</option>
                <option value="levant">Levant (Shami)</option>
                <option value="egyptian">Egyptian (Masri)</option>
                <option value="maghrebi">Maghrebi (Darija)</option>
                <option value="msa">Modern Standard Arabic (Fusha)</option>
              </select>
              <p className="text-xs text-muted-foreground">Fallback when user dialect is unknown.</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">Tone Intensity</label>
              <div className="flex gap-2 p-1 bg-background border border-border rounded-xl">
                {["formal", "semi-formal", "casual"].map(tone => (
                  <label key={tone} className="flex-1">
                    <input type="radio" value={tone} {...register("toneIntensity")} className="peer sr-only" />
                    <div className="text-center py-2 rounded-lg cursor-pointer text-sm font-medium text-muted-foreground peer-checked:bg-secondary peer-checked:text-foreground transition-all capitalize">
                      {tone.replace('-', ' ')}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Culture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-border flex items-center gap-3 bg-muted/10">
              <Shield className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-bold">Safety Bounds</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">Crisis Threshold</label>
                <select {...register("crisisThreshold")} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 appearance-none">
                  <option value="sensitive">Sensitive (Alerts easily)</option>
                  <option value="standard">Standard (Balanced)</option>
                  <option value="conservative">Conservative (Fewer false positives)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                <div>
                  <div className="font-bold text-sm">Family Mode</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-[200px]">Strictly filters out romantic relationship topics.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setValue("familyModeEnabled", !familyMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${familyMode ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${familyMode ? 'left-6' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-border flex items-center gap-3 bg-muted/10">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Cultural Alignment</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div>
                  <div className="font-bold text-sm text-primary">Spiritual Layer</div>
                  <div className="text-xs text-primary/80 mt-1 max-w-[200px]">Enables natural use of Dua and Quranic wisdom when comforting.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setValue("spiritualLayerEnabled", !spiritualLayer)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${spiritualLayer ? 'bg-primary' : 'bg-muted/50 border border-primary/20'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${spiritualLayer ? 'left-6' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Engine & Prompts */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-border flex items-center gap-3 bg-muted/10">
            <Brain className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Engine Configuration</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">Model Tier</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${modelTier === 'gpt-4o' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                  <input type="radio" value="gpt-4o" {...register("modelTier")} className="sr-only" />
                  <div className="font-bold text-lg">GPT-4o</div>
                  <div className="text-xs text-muted-foreground mt-1">Maximum empathy & reasoning. Higher cost.</div>
                </label>
                <label className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${modelTier === 'gpt-4o-mini' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                  <input type="radio" value="gpt-4o-mini" {...register("modelTier")} className="sr-only" />
                  <div className="font-bold text-lg">GPT-4o Mini</div>
                  <div className="text-xs text-muted-foreground mt-1">Faster response. Lower cost. Good for standard chat.</div>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">System Prompt Suffix (Optional)</label>
              <textarea 
                {...register("systemPromptSuffix")} 
                rows={4} 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none" 
                placeholder="Append custom instructions to the base system prompt..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 btn-gradient rounded-xl text-lg disabled:opacity-50 disabled:transform-none"
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
