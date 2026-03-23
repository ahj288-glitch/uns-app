import { useState } from "react";
import { Plus, Bell, Clock, Target, TrendingUp, Zap, Edit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NudgeTrigger = "mood_drop" | "streak_risk" | "inactivity" | "milestone" | "time_based" | "crisis_adjacent";
type NudgeChannel = "push" | "in-app" | "both";

interface Nudge {
  id: string;
  name: string;
  trigger: NudgeTrigger;
  channel: NudgeChannel;
  enabled: boolean;
  message: string;
  messageEn: string;
  deliveries: number;
  openRate: number;
  condition: string;
  delay: string;
}

const NUDGES: Nudge[] = [
  {
    id: "1", name: "حارس السلسلة", trigger: "streak_risk", channel: "push", enabled: true,
    message: "لم تتحقق من حالتك اليوم — سلسلتك لن تنتظر ✨",
    messageEn: "You haven't checked in today — your streak won't wait",
    deliveries: 18203, openRate: 62, condition: "لا تسجيل دخول خلال ٢٠ ساعة من الموعد المعتاد",
    delay: "تأخير ذكي",
  },
  {
    id: "2", name: "رفيق الهبوط العاطفي", trigger: "mood_drop", channel: "in-app", enabled: true,
    message: "لاحظت أن حالتك اليوم ثقيلة قليلاً — أنا هنا معك 💚",
    messageEn: "I noticed today feels a little heavy — I'm here with you",
    deliveries: 4829, openRate: 78, condition: "انخفاض المزاج > نقطتين خلال ٢٤ ساعة",
    delay: "فوري",
  },
  {
    id: "3", name: "مرشد الذكرى السنوية", trigger: "milestone", channel: "both", enabled: true,
    message: "أسبوع كامل من الاهتمام بنفسك! أنت تستحق لحظة احتفال 🌿",
    messageEn: "One full week of self-care! You deserve a moment of celebration",
    deliveries: 12847, openRate: 85, condition: "إكمال ٧ أيام متتالية",
    delay: "فور الإكمال",
  },
  {
    id: "4", name: "تسجيل الصباح الهادئ", trigger: "time_based", channel: "push", enabled: true,
    message: "كيف حالك هذا الصباح؟ دقيقة واحدة تكفي لتبدأ يومك بوعي.",
    messageEn: "How are you this morning? One minute is enough to start your day mindfully.",
    deliveries: 38291, openRate: 54, condition: "٨:٣٠ صباحاً بالتوقيت المحلي",
    delay: "ذكي حسب النوم",
  },
  {
    id: "5", name: "جسر غياب الأسبوع", trigger: "inactivity", channel: "push", enabled: false,
    message: "افتقدناك. عندما تكون مستعداً — نحن هنا، بلا ضغط.",
    messageEn: "We missed you. When you're ready — we're here, no pressure.",
    deliveries: 2134, openRate: 41, condition: "٧ أيام بدون تسجيل دخول",
    delay: "تأخير ٧ أيام",
  },
  {
    id: "6", name: "رفيق ما قبل الأزمة", trigger: "crisis_adjacent", channel: "in-app", enabled: true,
    message: "أشعر أن شيئاً يثقل عليك — هل تريد أن تتحدث؟ أنا أسمعك.",
    messageEn: "I sense something is weighing on you — do you want to talk? I'm listening.",
    deliveries: 891, openRate: 91, condition: "مؤشر الضائقة > ٠.٦ (دون عتبة الأزمة)",
    delay: "فوري بعد التحليل",
  },
];

const TRIGGER_CONFIG: Record<NudgeTrigger, { label: string; color: string; icon: typeof Bell }> = {
  mood_drop: { label: "هبوط المزاج", color: "text-amber-400 bg-amber-400/10", icon: TrendingUp },
  streak_risk: { label: "خطر السلسلة", color: "text-orange-400 bg-orange-400/10", icon: Zap },
  inactivity: { label: "غياب", color: "text-muted-foreground bg-muted/10", icon: Clock },
  milestone: { label: "إنجاز", color: "text-[#74C69D] bg-[#74C69D]/10", icon: Target },
  time_based: { label: "وقت محدد", color: "text-sky-400 bg-sky-400/10", icon: Clock },
  crisis_adjacent: { label: "قرب أزمة", color: "text-destructive bg-destructive/10", icon: Bell },
};

const CHANNEL_LABELS: Record<NudgeChannel, string> = {
  push: "إشعار خارجي",
  "in-app": "داخل التطبيق",
  both: "الاثنان",
};

export default function Nudges() {
  const [nudges, setNudges] = useState<Nudge[]>(NUDGES);
  const [preview, setPreview] = useState<string | null>(null);

  const toggle = (id: string) => {
    setNudges(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const totalDeliveries = nudges.reduce((s, n) => s + n.deliveries, 0);
  const avgOpenRate = Math.round(nudges.reduce((s, n) => s + n.openRate, 0) / nudges.length);
  const activeNudges = nudges.filter(n => n.enabled).length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-arabic">التدخلات السلوكية</h1>
          <p className="text-muted-foreground font-arabic text-sm mt-1">رسائل استباقية مدركة عاطفياً — لا إزعاج، بل رفيق ذكي</p>
        </div>
        <Button className="btn-gradient gap-2">
          <Plus className="w-4 h-4" />
          <span className="font-arabic">تدخل جديد</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "التدخلات النشطة", value: `${activeNudges} / ${nudges.length}`, icon: Bell, color: "text-[#74C69D]" },
          { label: "إجمالي التوصيلات", value: (totalDeliveries / 1000).toFixed(0) + "k", icon: Send, color: "text-primary" },
          { label: "متوسط معدل الفتح", value: `${avgOpenRate}٪`, icon: Target, color: "text-amber-400" },
          { label: "تغطية قرب الأزمة", value: "٩١٪", icon: Zap, color: "text-destructive" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl p-5 text-right border border-[rgba(116,198,157,0.15)]">
            <stat.icon className={cn("w-5 h-5 mb-3 mr-auto", stat.color)} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-arabic mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Nudge Cards */}
      <div className="space-y-3">
        {nudges.map(nudge => {
          const tc = TRIGGER_CONFIG[nudge.trigger];
          const TIcon = tc.icon;
          const isPreview = preview === nudge.id;

          return (
            <div key={nudge.id} className="bg-card rounded-2xl border border-[rgba(116,198,157,0.15)] overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <Switch
                    checked={nudge.enabled}
                    onCheckedChange={() => toggle(nudge.id)}
                    className="shrink-0 mt-1"
                  />
                  <div className="flex-1 text-right space-y-2">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background/40 font-arabic text-muted-foreground">
                        {CHANNEL_LABELS[nudge.channel]}
                      </span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", tc.color)}>
                        <TIcon className="w-3 h-3" />
                        <span className="font-arabic">{tc.label}</span>
                      </span>
                      <h3 className="font-semibold font-arabic">{nudge.name}</h3>
                    </div>

                    <p className="text-sm font-arabic text-foreground/90 leading-relaxed">"{nudge.message}"</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPreview(isPreview ? null : nudge.id)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-arabic"
                        >
                          <Edit2 className="w-3 h-3" />
                          تعديل
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-arabic">
                        <span className="text-[#74C69D] font-medium">{nudge.openRate}٪ فتح</span>
                        <span>{nudge.deliveries.toLocaleString()} توصيل</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Condition Bar */}
              <div className="px-5 py-3 bg-background/30 border-t border-[rgba(116,198,157,0.08)] flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-arabic">{nudge.delay}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-arabic">{nudge.condition}</span>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
