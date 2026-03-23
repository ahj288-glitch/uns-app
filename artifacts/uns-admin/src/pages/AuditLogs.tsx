import { useState } from "react";
import { Search, Filter, Download, Shield, User, Settings, Bell, Flag, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LogAction = "create" | "update" | "delete" | "login" | "publish" | "disable" | "escalate";
type LogModule = "users" | "ai_config" | "feature_flags" | "config_engine" | "safety" | "nudges" | "team" | "community";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: LogAction;
  module: LogModule;
  target: string;
  details: string;
  ip: string;
  severity: "info" | "warning" | "critical";
}

const LOGS: AuditEntry[] = [
  { id: "1", timestamp: "٢٠٢٦/٠٣/٢٣ ١٤:٣٢", actor: "نورة المنصور", actorRole: "مدير", action: "publish", module: "feature_flags", target: "share_your_state", details: "نشر راية ميزة المشاركة العاطفية — إطلاق ٢٥٪", ip: "192.168.1.1", severity: "info" },
  { id: "2", timestamp: "٢٠٢٦/٠٣/٢٣ ١٤:١٨", actor: "خالد العمري", actorRole: "مسؤول سلامة", action: "update", module: "ai_config", target: "safety.crisis_threshold", details: "تعديل عتبة الأزمة من ٠.٨٠ إلى ٠.٨٥", ip: "192.168.1.45", severity: "warning" },
  { id: "3", timestamp: "٢٠٢٦/٠٣/٢٣ ١٣:٥٥", actor: "أحمد الرشيد", actorRole: "مدير عام", action: "escalate", module: "safety", target: "مستخدم #٤٨٢١", details: "تصعيد حالة أزمة إلى دعم بشري — مستوى عالٍ", ip: "192.168.1.2", severity: "critical" },
  { id: "4", timestamp: "٢٠٢٦/٠٣/٢٣ ١٣:٢٠", actor: "سارة الزهراني", actorRole: "محرر محتوى", action: "create", module: "community", target: "دائرة الدعم الجديدة", details: "إنشاء دائرة 'القلق والهدوء' — ٥٠ مقعداً", ip: "192.168.1.78", severity: "info" },
  { id: "5", timestamp: "٢٠٢٦/٠٣/٢٣ ١٢:٤٠", actor: "نورة المنصور", actorRole: "مدير", action: "disable", module: "feature_flags", target: "community_v2", details: "تعطيل ميزة المجتمع الإصدار الثاني مؤقتاً", ip: "192.168.1.1", severity: "warning" },
  { id: "6", timestamp: "٢٠٢٦/٠٣/٢٣ ١٢:١٠", actor: "فيصل البراك", actorRole: "محلل", action: "login", module: "users", target: "لوحة التحكم", details: "تسجيل دخول ناجح من جهاز جديد", ip: "10.0.0.89", severity: "info" },
  { id: "7", timestamp: "٢٠٢٦/٠٣/٢٣ ١١:٣٠", actor: "خالد العمري", actorRole: "مسؤول سلامة", action: "update", module: "nudges", target: "رفيق ما قبل الأزمة", details: "تعديل رسالة التدخل السلوكي قرب الأزمة", ip: "192.168.1.45", severity: "info" },
  { id: "8", timestamp: "٢٠٢٦/٠٣/٢٣ ١٠:٥٠", actor: "أحمد الرشيد", actorRole: "مدير عام", action: "create", module: "team", target: "هند القحطاني", details: "إضافة عضو فريق جديد بدور المشرف", ip: "192.168.1.2", severity: "info" },
  { id: "9", timestamp: "٢٠٢٦/٠٣/٢٣ ١٠:٢٠", actor: "نورة المنصور", actorRole: "مدير", action: "update", module: "config_engine", target: "ai.max_tokens", details: "تغيير الحد الأقصى للرموز من ١٠٢٤ إلى ٢٠٤٨", ip: "192.168.1.1", severity: "info" },
  { id: "10", timestamp: "٢٠٢٦/٠٣/٢٣ ٠٩:٤٥", actor: "النظام", actorRole: "آلي", action: "escalate", module: "safety", target: "مستخدم #٣٩١٢", details: "كشف تلقائي عن أزمة — توجيه للدعم الإنساني", ip: "internal", severity: "critical" },
];

const ACTION_CONFIG: Record<LogAction, { label: string; color: string }> = {
  create: { label: "إنشاء", color: "text-[#74C69D] bg-[#74C69D]/10" },
  update: { label: "تعديل", color: "text-sky-400 bg-sky-400/10" },
  delete: { label: "حذف", color: "text-destructive bg-destructive/10" },
  login: { label: "دخول", color: "text-muted-foreground bg-muted/10" },
  publish: { label: "نشر", color: "text-violet-400 bg-violet-400/10" },
  disable: { label: "تعطيل", color: "text-amber-400 bg-amber-400/10" },
  escalate: { label: "تصعيد", color: "text-destructive bg-destructive/10" },
};

const MODULE_ICONS: Record<LogModule, typeof Shield> = {
  users: User,
  ai_config: Settings,
  feature_flags: Flag,
  config_engine: Database,
  safety: Shield,
  nudges: Bell,
  team: User,
  community: User,
};

const MODULE_LABELS: Record<LogModule, string> = {
  users: "المستخدمون",
  ai_config: "إعدادات AI",
  feature_flags: "رايات الميزات",
  config_engine: "محرك الإعدادات",
  safety: "السلامة",
  nudges: "التدخلات",
  team: "الفريق",
  community: "المجتمع",
};

const SEVERITY_COLORS = {
  info: "text-muted-foreground",
  warning: "text-amber-400",
  critical: "text-destructive",
};

export default function AuditLogs() {
  const [severityFilter, setSeverityFilter] = useState<"all" | "info" | "warning" | "critical">("all");
  const [search, setSearch] = useState("");

  const filtered = LOGS.filter(log =>
    (severityFilter === "all" || log.severity === severityFilter) &&
    (search === "" || log.actor.includes(search) || log.target.includes(search) || log.details.includes(search))
  );

  const criticalCount = LOGS.filter(l => l.severity === "critical").length;
  const warningCount = LOGS.filter(l => l.severity === "warning").length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-arabic">سجل المراجعة</h1>
          <p className="text-muted-foreground font-arabic text-sm mt-1">تتبع كامل لكل إجراء في النظام مع التوقيت والمسؤول</p>
        </div>
        <Button variant="outline" className="gap-2 border-[rgba(116,198,157,0.2)] font-arabic text-sm">
          <Download className="w-4 h-4" />
          تصدير CSV
        </Button>
      </div>

      {/* Alert banners */}
      {criticalCount > 0 && (
        <div className="bg-destructive/8 border border-destructive/20 rounded-2xl px-5 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive font-arabic text-xs">عرض الحوادث</Button>
          <div className="flex items-center gap-2 text-destructive">
            <p className="font-arabic text-sm">{criticalCount} أحداث حرجة في آخر ٢٤ ساعة تستوجب المراجعة</p>
            <Shield className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث في السجلات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-card border border-[rgba(116,198,157,0.15)] rounded-xl pr-9 pl-4 py-2 text-sm font-arabic text-right w-64 focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "critical", "warning", "info"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-arabic transition-colors",
                severityFilter === s
                  ? s === "critical" ? "bg-destructive/20 text-destructive"
                    : s === "warning" ? "bg-amber-400/20 text-amber-400"
                    : "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-white/5"
              )}
            >
              {s === "all" ? "الكل" : s === "critical" ? "حرج" : s === "warning" ? "تحذير" : "معلومة"}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="space-y-1">
        {filtered.map((log, i) => {
          const actionCfg = ACTION_CONFIG[log.action];
          const ModuleIcon = MODULE_ICONS[log.module];

          return (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-4 px-5 py-4 rounded-xl hover:bg-white/3 transition-colors",
                log.severity === "critical" && "bg-destructive/5 hover:bg-destructive/8",
                log.severity === "warning" && "bg-amber-400/3 hover:bg-amber-400/6"
              )}
            >
              {/* Icon */}
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", SEVERITY_COLORS[log.severity])}>
                <ModuleIcon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-arabic">{log.ip}</span>
                  <span className="text-xs text-muted-foreground font-arabic">·</span>
                  <span className="text-xs text-muted-foreground font-arabic">{log.actorRole}</span>
                  <span className="font-medium text-sm font-arabic">{log.actor}</span>
                </div>
                <p className="text-sm font-arabic text-foreground/85 mt-0.5 leading-relaxed">{log.details}</p>
                <div className="flex items-center justify-end gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground font-arabic">{MODULE_LABELS[log.module]}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-arabic", actionCfg.color)}>{actionCfg.label}</span>
                  <code className="text-xs text-muted-foreground/70 bg-background/40 px-1.5 py-0.5 rounded">{log.target}</code>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-muted-foreground font-arabic shrink-0 text-right mt-1">{log.timestamp}</div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="ghost" className="font-arabic text-muted-foreground text-sm">
          تحميل المزيد
        </Button>
      </div>
    </div>
  );
}
