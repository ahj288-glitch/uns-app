import { useState } from "react";
import { Plus, Flag, Users, Percent, FlaskConical, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FlagType = "release" | "experiment" | "ops" | "permission";
type RolloutType = "everyone" | "percentage" | "segment" | "internal";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  type: FlagType;
  enabled: boolean;
  rollout: RolloutType;
  rolloutValue?: number;
  segment?: string;
  description: string;
  variants?: { name: string; weight: number }[];
  tags: string[];
}

const FLAGS: FeatureFlag[] = [
  {
    id: "1", name: "بطاقة المشاركة العاطفية", key: "share_your_state", type: "release",
    enabled: true, rollout: "percentage", rolloutValue: 25,
    description: "تمكين شاشة مشاركة البصمة العاطفية للمستخدمين المختارين",
    tags: ["mobile", "viral", "social"],
  },
  {
    id: "2", name: "وضع رمضان", key: "ramadan_mode", type: "release",
    enabled: true, rollout: "everyone",
    description: "تفعيل تجربة رمضان الخاصة مع الأذكار والتأملات اليومية",
    tags: ["seasonal", "spiritual"],
  },
  {
    id: "3", name: "تجربة AI محسّنة (A/B)", key: "enhanced_ai_v2", type: "experiment",
    enabled: true, rollout: "percentage", rolloutValue: 50,
    description: "اختبار نموذج استجابة AI الجديد مقابل الحالي",
    variants: [
      { name: "التحكم (GPT-4o)", weight: 50 },
      { name: "التجريبي (Claude)", weight: 50 },
    ],
    tags: ["ai", "experiment", "core"],
  },
  {
    id: "4", name: "إشعارات ذكية", key: "smart_nudges", type: "release",
    enabled: false, rollout: "segment", segment: "المستخدمون المميزون",
    description: "إشعارات استباقية مدعومة بالذكاء الاصطناعي بناءً على أنماط المزاج",
    tags: ["notifications", "premium"],
  },
  {
    id: "5", name: "مجتمع الدعم المتبادل", key: "community_v2", type: "release",
    enabled: false, rollout: "internal",
    description: "الإصدار الثاني من المجتمع مع الدوائر وردود الفعل العاطفية",
    tags: ["community", "beta"],
  },
  {
    id: "6", name: "نظام الأوراق والنمو", key: "growth_system", type: "release",
    enabled: true, rollout: "everyone",
    description: "نظام المكافآت والتطور العاطفي بالـ XP والمستويات",
    tags: ["gamification", "engagement"],
  },
];

const TYPE_CONFIG: Record<FlagType, { label: string; icon: typeof Flag; color: string }> = {
  release: { label: "إصدار", icon: Flag, color: "text-[#74C69D] bg-[#74C69D]/10" },
  experiment: { label: "تجربة", icon: FlaskConical, color: "text-violet-400 bg-violet-400/10" },
  ops: { label: "تشغيل", icon: AlertCircle, color: "text-amber-400 bg-amber-400/10" },
  permission: { label: "صلاحية", icon: Users, color: "text-sky-400 bg-sky-400/10" },
};

const ROLLOUT_LABELS: Record<RolloutType, string> = {
  everyone: "للجميع",
  percentage: "نسبة مئوية",
  segment: "شريحة محددة",
  internal: "داخلي فقط",
};

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(FLAGS);
  const [typeFilter, setTypeFilter] = useState<FlagType | "all">("all");

  const toggle = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const filtered = flags.filter(f => typeFilter === "all" || f.type === typeFilter);
  const enabledCount = flags.filter(f => f.enabled).length;
  const experimentsCount = flags.filter(f => f.type === "experiment").length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-arabic">رايات الميزات</h1>
          <p className="text-muted-foreground font-arabic text-sm mt-1">تحكم دقيق في الإصدارات التدريجية والتجارب وصلاحيات المستخدمين</p>
        </div>
        <Button className="btn-gradient gap-2">
          <Plus className="w-4 h-4" />
          <span className="font-arabic">راية جديدة</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "الرايات النشطة", value: `${enabledCount} / ${flags.length}`, icon: Flag, color: "text-[#74C69D]" },
          { label: "التجارب الجارية", value: experimentsCount, icon: FlaskConical, color: "text-violet-400" },
          { label: "الإطلاق الجزئي", value: "٢٥٪ متوسط", icon: Percent, color: "text-amber-400" },
          { label: "الشرائح المستهدفة", value: "٣ شرائح", icon: Users, color: "text-sky-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl p-5 text-right border border-[rgba(116,198,157,0.15)]">
            <stat.icon className={cn("w-5 h-5 mb-3 mr-auto", stat.color)} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-arabic mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 justify-end">
        {(["all", "release", "experiment", "ops", "permission"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full font-arabic transition-colors",
              typeFilter === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5"
            )}
          >
            {t === "all" ? "الكل" : TYPE_CONFIG[t as FlagType]?.label || t}
          </button>
        ))}
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {filtered.map(flag => {
          const typeConfig = TYPE_CONFIG[flag.type];
          const TypeIcon = typeConfig.icon;

          return (
            <div key={flag.id} className="bg-card rounded-2xl border border-[rgba(116,198,157,0.15)] p-5">
              <div className="flex items-start gap-4">
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={() => toggle(flag.id)}
                  className="shrink-0 mt-1"
                />
                <div className="flex-1 text-right space-y-3">
                  <div>
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {flag.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground font-mono">
                          {tag}
                        </span>
                      ))}
                      <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", typeConfig.color)}>
                        <TypeIcon className="w-3 h-3" />
                        <span className="font-arabic">{typeConfig.label}</span>
                      </span>
                      <h3 className="font-semibold font-arabic">{flag.name}</h3>
                    </div>
                    <code className="text-xs text-muted-foreground font-mono">{flag.key}</code>
                  </div>
                  <p className="text-sm text-muted-foreground font-arabic">{flag.description}</p>

                  {/* Rollout indicator */}
                  <div className="flex items-center justify-end gap-3">
                    {flag.rollout === "percentage" && flag.rolloutValue !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-arabic">{flag.rolloutValue}٪</span>
                        <div className="w-24 h-1.5 bg-background/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${flag.rolloutValue}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {flag.rollout === "segment" && flag.segment && (
                      <span className="text-xs text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full font-arabic">
                        {flag.segment}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground font-arabic bg-background/40 px-2 py-0.5 rounded-full">
                      {ROLLOUT_LABELS[flag.rollout]}
                    </span>
                  </div>

                  {/* A/B Test Variants */}
                  {flag.variants && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {flag.variants.map(v => (
                        <div key={v.name} className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">{v.weight}٪</span>
                          <div className="w-32 h-1.5 bg-background/50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-violet-400" style={{ width: `${v.weight}%` }} />
                          </div>
                          <span className="text-xs font-arabic text-foreground/80">{v.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
