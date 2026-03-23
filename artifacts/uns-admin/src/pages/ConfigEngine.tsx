import { useState } from "react";
import { Plus, Upload, RotateCcw, Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ConfigType = "string" | "number" | "boolean" | "json";
type ConfigEnv = "production" | "staging" | "development";

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  type: ConfigType;
  env: ConfigEnv;
  description: string;
  updatedAt: string;
  updatedBy: string;
  isDraft: boolean;
}

const CONFIGS: ConfigItem[] = [
  { id: "1", key: "ai.max_tokens", value: "2048", type: "number", env: "production", description: "الحد الأقصى لرموز استجابة الذكاء الاصطناعي لكل رسالة", updatedAt: "منذ ٣ ساعات", updatedBy: "م. الإدارة", isDraft: false },
  { id: "2", key: "ai.temperature", value: "0.72", type: "number", env: "production", description: "درجة إبداعية استجابات المرافق — قيمة أعلى = أكثر تنوعاً", updatedAt: "منذ يوم", updatedBy: "م. الإدارة", isDraft: false },
  { id: "3", key: "feature.ramadan_mode", value: "true", type: "boolean", env: "production", description: "تفعيل التجربة الخاصة برمضان مع أذكار وتذكيرات", updatedAt: "منذ ٥ أيام", updatedBy: "م. النظام", isDraft: false },
  { id: "4", key: "onboarding.welcome_message", value: "أهلاً بك في أُنْس — رفيقك العاطفي", type: "string", env: "production", description: "رسالة الترحيب في شاشة الإعداد الأولى", updatedAt: "منذ أسبوعين", updatedBy: "م. المحتوى", isDraft: false },
  { id: "5", key: "safety.crisis_threshold", value: "0.85", type: "number", env: "production", description: "حد نقاط التصنيف لتشغيل بروتوكول الأزمات", updatedAt: "منذ ساعة", updatedBy: "م. السلامة", isDraft: true },
  { id: "6", key: "gamification.xp_multiplier", value: "{ \"streak_7\": 1.5, \"streak_30\": 2.0 }", type: "json", env: "production", description: "معاملات مضاعفة XP حسب مدة السلسلة", updatedAt: "منذ ٣ أيام", updatedBy: "م. الإدارة", isDraft: false },
  { id: "7", key: "notification.quiet_hours", value: "23:00-07:00", type: "string", env: "staging", description: "نافذة الصمت التلقائي للإشعارات (ساعة محلية)", updatedAt: "منذ ٢ ساعات", updatedBy: "م. التطوير", isDraft: true },
];

const TYPE_COLORS: Record<ConfigType, string> = {
  string: "text-sky-400 bg-sky-400/10",
  number: "text-violet-400 bg-violet-400/10",
  boolean: "text-[#74C69D] bg-[#74C69D]/10",
  json: "text-amber-400 bg-amber-400/10",
};

const ENV_COLORS: Record<ConfigEnv, string> = {
  production: "text-[#74C69D] bg-[#74C69D]/10",
  staging: "text-amber-400 bg-amber-400/10",
  development: "text-sky-400 bg-sky-400/10",
};

const HISTORY = [
  { time: "منذ ١ ساعة", key: "safety.crisis_threshold", change: "0.80 → 0.85 (مسودة)", by: "م. السلامة" },
  { time: "منذ ٣ ساعات", key: "ai.max_tokens", change: "1024 → 2048", by: "م. الإدارة" },
  { time: "منذ يوم", key: "ai.temperature", change: "0.65 → 0.72", by: "م. الإدارة" },
  { time: "منذ ٣ أيام", key: "gamification.xp_multiplier", change: "تحديث كائن JSON", by: "م. الإدارة" },
];

export default function ConfigEngine() {
  const [envFilter, setEnvFilter] = useState<ConfigEnv | "all">("all");
  const [showDraftsOnly, setShowDraftsOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = CONFIGS.filter(c =>
    (envFilter === "all" || c.env === envFilter) &&
    (!showDraftsOnly || c.isDraft) &&
    (c.key.toLowerCase().includes(search.toLowerCase()) || c.description.includes(search))
  );

  const draftCount = CONFIGS.filter(c => c.isDraft).length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-arabic">محرك الإعدادات</h1>
          <p className="text-muted-foreground font-arabic text-sm mt-1">إدارة إعدادات النظام بنوع محدد مع إصدارات ودعم المسودات</p>
        </div>
        <div className="flex gap-2">
          {draftCount > 0 && (
            <Button variant="outline" className="gap-2 border-[rgba(116,198,157,0.2)] font-arabic text-sm">
              <Upload className="w-4 h-4" />
              نشر {draftCount} مسودة
            </Button>
          )}
          <Button className="btn-gradient gap-2">
            <Plus className="w-4 h-4" />
            <span className="font-arabic">إضافة إعداد</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-arabic text-muted-foreground">المسودات فقط</span>
          <Switch checked={showDraftsOnly} onCheckedChange={setShowDraftsOnly} />
        </div>
        <div className="flex gap-2">
          {(["all", "production", "staging", "development"] as const).map(e => (
            <button
              key={e}
              onClick={() => setEnvFilter(e)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-arabic transition-colors",
                envFilter === e ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              {e === "all" ? "الكل" : e}
            </button>
          ))}
        </div>
      </div>

      {/* Config Table */}
      <div className="bg-card rounded-2xl border border-[rgba(116,198,157,0.15)] overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-xs text-muted-foreground font-arabic border-b border-[rgba(116,198,157,0.08)]">
          <div className="col-span-4 text-right">المفتاح</div>
          <div className="col-span-3 text-right">القيمة</div>
          <div className="col-span-2 text-center">النوع</div>
          <div className="col-span-2 text-center">البيئة</div>
          <div className="col-span-1" />
        </div>
        {filtered.map((config, i) => (
          <div
            key={config.id}
            className={cn(
              "grid grid-cols-12 px-5 py-4 items-center hover:bg-white/3 transition-colors",
              i < filtered.length - 1 && "border-b border-[rgba(116,198,157,0.05)]"
            )}
          >
            <div className="col-span-4 text-right">
              <div className="flex items-center justify-end gap-2">
                {config.isDraft && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-arabic">مسودة</span>
                )}
                <span className="font-mono text-sm text-foreground">{config.key}</span>
              </div>
              <p className="text-xs text-muted-foreground font-arabic mt-0.5 truncate">{config.description}</p>
              <p className="text-xs text-muted-foreground/60 font-arabic mt-0.5">{config.updatedAt} · {config.updatedBy}</p>
            </div>
            <div className="col-span-3 text-right">
              <code className="text-sm bg-background/50 px-2 py-0.5 rounded text-primary/90 truncate block max-w-full">
                {config.value}
              </code>
            </div>
            <div className="col-span-2 flex justify-center">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-mono", TYPE_COLORS[config.type])}>
                {config.type}
              </span>
            </div>
            <div className="col-span-2 flex justify-center">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-arabic", ENV_COLORS[config.env])}>
                {config.env}
              </span>
            </div>
            <div className="col-span-1 flex justify-center">
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Audit History */}
      <div>
        <h2 className="font-arabic font-semibold text-right mb-4">سجل التغييرات</h2>
        <div className="space-y-2">
          {HISTORY.map((h, i) => (
            <div key={i} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-[rgba(116,198,157,0.1)]">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-arabic">{h.time}</span>
                <span className="text-xs text-muted-foreground font-arabic">بواسطة {h.by}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-primary">{h.key}</span>
                <span className="text-xs text-muted-foreground font-arabic mr-2">{h.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
