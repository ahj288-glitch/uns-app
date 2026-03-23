import { useState } from "react";
import { Feather } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface LimitConfig {
  key: string;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  draft?: number;
}

interface ErrorLog {
  id: string;
  code: string;
  domain: string;
  count24h: number;
  countWeek: number;
  severity: "info" | "warning" | "error" | "critical" | "safety";
  lastSeen: string;
  trend: "up" | "down" | "stable";
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const INITIAL_LIMITS: LimitConfig[] = [
  {
    key: "chat_max_daily_messages",
    label: "الحد الأقصى للرسائل اليومية",
    description: "عدد الرسائل المسموح بها لكل مستخدم يومياً في محادثة أُنْس",
    value: 30,
    min: 5,
    max: 100,
    unit: "رسالة",
  },
  {
    key: "chat_warn_at_messages",
    label: "تحذير عند بلوغ عدد الرسائل",
    description: "يظهر تحذير للمستخدم عند وصوله لهذا العدد من الرسائل",
    value: 24,
    min: 1,
    max: 99,
    unit: "رسالة",
  },
  {
    key: "chat_max_chars",
    label: "الحد الأقصى لطول الرسالة",
    description: "عدد الأحرف المسموح بها في رسالة واحدة",
    value: 500,
    min: 100,
    max: 2000,
    unit: "حرف",
  },
  {
    key: "chat_rate_limit_seconds",
    label: "فترة الانتظار بين الرسائل",
    description: "الحد الأدنى للوقت بين رسالة وأخرى",
    value: 3,
    min: 1,
    max: 30,
    unit: "ثانية",
  },
  {
    key: "ai_timeout_ms",
    label: "مهلة انتظار الذكاء الاصطناعي",
    description: "المدة القصوى قبل اعتبار طلب الذكاء الاصطناعي منتهي المهلة",
    value: 12000,
    min: 3000,
    max: 30000,
    unit: "ms",
  },
  {
    key: "mood_notes_max_chars",
    label: "الحد الأقصى لملاحظات المزاج",
    description: "عدد الأحرف المسموح بها في حقل ملاحظات حالة المزاج",
    value: 300,
    min: 50,
    max: 1000,
    unit: "حرف",
  },
  {
    key: "session_max_minutes",
    label: "الحد الأقصى لمدة الجلسة",
    description: "المدة القصوى لجلسة المحادثة قبل انتهائها تلقائياً",
    value: 90,
    min: 15,
    max: 240,
    unit: "دقيقة",
  },
];

const ERROR_LOGS: ErrorLog[] = [
  { id: "1", code: "E-AI-001", domain: "ai", count24h: 47, countWeek: 312, severity: "error", lastSeen: "منذ 3 دقائق", trend: "up" },
  { id: "2", code: "E-LIM-001", domain: "limit", count24h: 1203, countWeek: 8241, severity: "info", lastSeen: "منذ دقيقة", trend: "stable" },
  { id: "3", code: "E-NET-001", domain: "network", count24h: 23, countWeek: 89, severity: "warning", lastSeen: "منذ 7 دقائق", trend: "down" },
  { id: "4", code: "E-SAF-001", domain: "safety", count24h: 5, countWeek: 31, severity: "safety", lastSeen: "منذ 22 دقيقة", trend: "down" },
  { id: "5", code: "E-AI-002", domain: "ai", count24h: 18, countWeek: 74, severity: "error", lastSeen: "منذ 9 دقائق", trend: "up" },
  { id: "6", code: "E-VAL-002", domain: "validation", count24h: 340, countWeek: 1820, severity: "info", lastSeen: "منذ دقيقة", trend: "stable" },
  { id: "7", code: "E-AI-004", domain: "ai", count24h: 1, countWeek: 3, severity: "critical", lastSeen: "منذ 4 ساعات", trend: "down" },
];

const SEVERITY_COLORS: Record<string, string> = {
  info: "#74C69D",
  warning: "#F4B942",
  error: "#ef4444",
  critical: "#dc2626",
  safety: "#a855f7",
};

const DOMAIN_LABELS: Record<string, string> = {
  ai: "الذكاء الاصطناعي",
  limit: "الحدود",
  network: "الشبكة",
  safety: "السلامة",
  validation: "التحقق",
  auth: "الجلسة",
  system: "النظام",
  config: "الإعدادات",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ErrorsConfig() {
  const [limits, setLimits] = useState<LimitConfig[]>(INITIAL_LIMITS);
  const [draftCount, setDraftCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"limits" | "logs" | "copy">("limits");
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [validationError, setValidationError] = useState<Record<string, string>>({});

  function handleValueChange(key: string, raw: string) {
    const num = Number(raw);
    setLimits(prev =>
      prev.map(l => {
        if (l.key !== key) return l;
        const errors: Record<string, string> = { ...validationError };

        if (isNaN(num) || raw === "") {
          errors[key] = ERRORS_COPY.CONFIG_INVALID_VALUE;
        } else if (num < l.min) {
          errors[key] = `القيمة أدنى من الحد المسموح به (${l.min})`;
        } else if (num > l.max) {
          errors[key] = `القيمة أعلى من الحد المسموح به (${l.max})`;
        } else {
          delete errors[key];
        }

        setValidationError(errors);
        const hasDraft = l.draft !== undefined ? l.draft !== l.value : num !== l.value;
        if (hasDraft && !isNaN(num)) setDraftCount(c => c + (l.draft === undefined ? 1 : 0));
        return { ...l, draft: isNaN(num) ? l.draft : num };
      })
    );
  }

  function handlePublish() {
    if (Object.keys(validationError).length > 0) {
      return;
    }
    setLimits(prev => prev.map(l => ({ ...l, value: l.draft ?? l.value, draft: undefined })));
    setDraftCount(0);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e8f5ee] font-tajawal">إدارة الأخطاء والحدود</h1>
          <p className="text-sm text-[#4a7a5e] mt-1">
            تحكم في حدود الاستخدام ورسائل الأخطاء ومعدلات الحدوث
          </p>
        </div>
        {draftCount > 0 && (
          <button
            onClick={handlePublish}
            disabled={Object.keys(validationError).length > 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              bg-[#1B4332] text-[#74C69D] hover:bg-[#22543d] transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Feather name="upload" size={14} />
            نشر {draftCount} تغييرات
          </button>
        )}
      </div>

      {/* Publish success notice */}
      {publishSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1B4332] text-[#74C69D] text-sm">
          <Feather name="check-circle" size={14} />
          تم نشر التغييرات بنجاح — الحدود محدّثة
        </div>
      )}

      {/* Validation error banner */}
      {Object.keys(validationError).length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/20 text-red-400 text-sm">
          <Feather name="alert-triangle" size={14} />
          يوجد {Object.keys(validationError).length} أخطاء في القيم — يجب تصحيحها قبل النشر
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#10231c] rounded-xl p-1 w-fit">
        {(["limits", "logs", "copy"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab
                ? "bg-[#1B4332] text-[#74C69D] font-medium"
                : "text-[#4a7a5e] hover:text-[#a5d0b9]"
            }`}
          >
            {tab === "limits" ? "الحدود" : tab === "logs" ? "سجل الأخطاء" : "نصوص الأخطاء"}
          </button>
        ))}
      </div>

      {/* ── Tab: Limits ──────────────────────────────────────────────────── */}
      {activeTab === "limits" && (
        <div className="space-y-3">
          {limits.map(limit => {
            const isDirty = limit.draft !== undefined && limit.draft !== limit.value;
            const hasError = !!validationError[limit.key];
            const displayVal = limit.draft !== undefined ? limit.draft : limit.value;
            const pct = Math.min(100, Math.max(0, ((displayVal - limit.min) / (limit.max - limit.min)) * 100));

            return (
              <div
                key={limit.key}
                className={`bg-[#10231c] rounded-2xl p-5 border transition-colors ${
                  hasError
                    ? "border-red-500/40"
                    : isDirty
                    ? "border-[#74C69D]/30"
                    : "border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#e8f5ee] font-medium text-sm">{limit.label}</span>
                      {isDirty && !hasError && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#1B4332] text-[#74C69D]">
                          مسودة
                        </span>
                      )}
                      {hasError && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-900/30 text-red-400 flex items-center gap-1">
                          <Feather name="alert-circle" size={10} />
                          خطأ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4a7a5e] leading-relaxed">{limit.description}</p>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-[#1a2e26] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: hasError ? "#ef4444" : "#74C69D",
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-[#4a7a5e]">{limit.min}</span>
                      <span className="text-[10px] text-[#4a7a5e]">{limit.max} {limit.unit}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={displayVal}
                        min={limit.min}
                        max={limit.max}
                        onChange={e => handleValueChange(limit.key, e.target.value)}
                        className={`w-24 text-center px-3 py-2 rounded-xl text-sm font-mono transition-colors
                          bg-[#1a2e26] outline-none focus:ring-1 ${
                          hasError
                            ? "text-red-400 ring-red-500/40 focus:ring-red-500/60"
                            : "text-[#74C69D] ring-[#74C69D]/20 focus:ring-[#74C69D]/40"
                        }`}
                        aria-label={limit.label}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `err-${limit.key}` : undefined}
                      />
                      <span className="text-xs text-[#4a7a5e] w-12">{limit.unit}</span>
                    </div>
                    {isDirty && !hasError && (
                      <span className="text-[10px] text-[#4a7a5e]">
                        كان: {limit.value}
                      </span>
                    )}
                  </div>
                </div>
                {hasError && (
                  <p
                    id={`err-${limit.key}`}
                    className="mt-2 text-xs text-red-400 flex items-center gap-1"
                    role="alert"
                  >
                    <Feather name="alert-circle" size={11} />
                    {validationError[limit.key]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Error Logs ──────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4 mb-2">
            {[
              { label: "أخطاء حرجة", value: "1", color: "#dc2626" },
              { label: "أخطاء ذكاء اصطناعي", value: "66", color: "#ef4444" },
              { label: "تجاوز الحدود", value: "1,203", color: "#F4B942" },
              { label: "أخطاء الشبكة", value: "23", color: "#74C69D" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#10231c] rounded-2xl p-4 text-right">
                <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs text-[#4a7a5e] mt-1">{stat.label}</div>
                <div className="text-[10px] text-[#4a7a5e]">آخر 24 ساعة</div>
              </div>
            ))}
          </div>

          <div className="bg-[#10231c] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-4 py-3 text-xs text-[#4a7a5e] bg-[#0d1e17]">
              <span className="col-span-2">الكود</span>
              <span>النطاق</span>
              <span className="text-center">24 ساعة</span>
              <span className="text-center">الأسبوع</span>
              <span className="text-center">الاتجاه</span>
            </div>
            {ERROR_LOGS.map(log => (
              <div
                key={log.id}
                className="grid grid-cols-6 gap-2 px-4 py-3 items-center hover:bg-[#1a2e26] transition-colors"
              >
                <div className="col-span-2 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SEVERITY_COLORS[log.severity] }}
                  />
                  <span className="font-mono text-sm text-[#e8f5ee]">{log.code}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-[#1B4332] text-[#74C69D] w-fit">
                  {DOMAIN_LABELS[log.domain] ?? log.domain}
                </span>
                <span className="text-center font-mono text-sm text-[#e8f5ee]">{log.count24h.toLocaleString("ar")}</span>
                <span className="text-center font-mono text-xs text-[#4a7a5e]">{log.countWeek.toLocaleString("ar")}</span>
                <div className="flex justify-center">
                  {log.trend === "up" ? (
                    <Feather name="trending-up" size={14} className="text-red-400" color="#ef4444" />
                  ) : log.trend === "down" ? (
                    <Feather name="trending-down" size={14} color="#74C69D" />
                  ) : (
                    <Feather name="minus" size={14} color="#4a7a5e" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#4a7a5e] text-center">آخر تحديث: منذ دقيقة</p>
        </div>
      )}

      {/* ── Tab: Copy Standards ──────────────────────────────────────────── */}
      {activeTab === "copy" && (
        <div className="space-y-4">
          <div className="bg-[#10231c] rounded-2xl p-5 space-y-4">
            <h3 className="text-[#e8f5ee] font-medium">معايير كتابة الأخطاء</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <Feather name="x-circle" size={12} /> تجنّب
                </p>
                {[
                  "طلب غير صالح",
                  "فشلت العملية",
                  "خطأ غير متوقع",
                  "إدخال سيء",
                  "الوصول مرفوض",
                  "غير مسموح لك",
                ].map(t => (
                  <div key={t} className="px-3 py-2 rounded-lg bg-red-900/15 text-red-400 text-sm">
                    {t}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#74C69D] font-medium flex items-center gap-1">
                  <Feather name="check-circle" size={12} /> استخدم
                </p>
                {[
                  "رسالتك طويلة قليلاً — اختصرها لتتمكن من الإرسال.",
                  "وصلت لحد اليوم — يمكنك الاستمرار غداً.",
                  "واجهنا مشكلة مؤقتة — حاول مجدداً.",
                  "هذا القسم غير متاح لمستوى وصولك الحالي.",
                  "اكتب شيئاً ما — حتى كلمة واحدة تكفي.",
                  "انتظر {ثوانٍ} قبل الرسالة التالية.",
                ].map(t => (
                  <div key={t} className="px-3 py-2 rounded-lg bg-[#1B4332]/50 text-[#a5d0b9] text-sm leading-relaxed">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#10231c] rounded-2xl p-5 space-y-3">
            <h3 className="text-[#e8f5ee] font-medium">قواعد النبرة</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "هادئة", icon: "wind" },
                { label: "محترمة", icon: "heart" },
                { label: "قابلة للتنفيذ", icon: "arrow-right-circle" },
                { label: "محددة", icon: "target" },
                { label: "غير عقابية", icon: "shield" },
                { label: "متسقة", icon: "layers" },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1a2e26] text-sm text-[#a5d0b9]">
                  <Feather name={r.icon as any} size={13} color="#74C69D" />
                  {r.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ERRORS_COPY = {
  CONFIG_INVALID_VALUE: "القيمة المدخلة غير صالحة — أدخل رقماً ضمن النطاق المسموح به.",
};
