// ═══════════════════════════════════════════════════════════════════════════
// UNS | أُنْس — Unified Error Taxonomy
// Every error in the product has a home here. Arabic-first, human-centered.
// ═══════════════════════════════════════════════════════════════════════════

export type ErrorSeverity = "info" | "warning" | "limit" | "error" | "critical" | "safety";
export type UITreatment = "inline" | "toast" | "banner" | "modal" | "blocking" | "silent";
export type RetryBehavior = "none" | "user" | "auto" | "auto-then-user" | "redirect";
export type ErrorDomain =
  | "validation"
  | "limit"
  | "permission"
  | "auth"
  | "network"
  | "ai"
  | "system"
  | "feature"
  | "safety"
  | "config"
  | "rate"
  | "subscription";

export interface ErrorDef {
  code: string;
  domain: ErrorDomain;
  severity: ErrorSeverity;
  ui: UITreatment;
  retry: RetryBehavior;
  ar: string;
  en: string;
  adminNote: string;
  log: boolean;
  alert: boolean;
  analyticsEvent?: string;
}

// ─── Limits (configurable from admin) ─────────────────────────────────────
export const LIMITS = {
  CHAT_MAX_DAILY_MESSAGES: 30,
  CHAT_WARN_AT_MESSAGES: 24,
  CHAT_MAX_CHARS: 500,
  CHAT_WARN_AT_CHARS: 400,
  CHAT_RATE_LIMIT_SECONDS: 3,
  CHAT_COOLDOWN_AFTER_RAPID: 30,
  CHAT_RAPID_THRESHOLD: 5,
  MOOD_NOTES_MAX_CHARS: 300,
  MOOD_NOTES_WARN_AT_CHARS: 240,
  SESSION_MAX_MINUTES: 90,
  SESSION_WARN_AT_MINUTES: 80,
} as const;

// ─── Error Registry ────────────────────────────────────────────────────────
export const ERRORS: Record<string, ErrorDef> = {

  // ── Validation ──────────────────────────────────────────────────────────
  EMPTY_MESSAGE: {
    code: "E-VAL-001",
    domain: "validation",
    severity: "info",
    ui: "inline",
    retry: "user",
    ar: "اكتب شيئاً ما — حتى كلمة واحدة تكفي.",
    en: "Write something — even a single word is enough.",
    adminNote: "User attempted to submit an empty message.",
    log: false,
    alert: false,
  },

  MESSAGE_TOO_LONG: {
    code: "E-VAL-002",
    domain: "validation",
    severity: "warning",
    ui: "inline",
    retry: "user",
    ar: "رسالتك طويلة قليلاً — اختصرها لتتمكن من الإرسال.",
    en: "Your message is a little too long — shorten it to continue.",
    adminNote: "Message exceeded maximum character limit.",
    log: false,
    alert: false,
    analyticsEvent: "validation_message_too_long",
  },

  NOTES_TOO_LONG: {
    code: "E-VAL-003",
    domain: "validation",
    severity: "warning",
    ui: "inline",
    retry: "user",
    ar: "ملاحظتك طويلة — اختصرها قليلاً.",
    en: "Your note is too long — shorten it slightly.",
    adminNote: "Mood notes exceeded character limit.",
    log: false,
    alert: false,
  },

  MOOD_NOT_SELECTED: {
    code: "E-VAL-004",
    domain: "validation",
    severity: "info",
    ui: "inline",
    retry: "user",
    ar: "اختر حالتك أولاً — حتى لو لم تكن متأكداً.",
    en: "Select your mood first — even if you're not sure.",
    adminNote: "User tried to submit mood check-in without selecting mood.",
    log: false,
    alert: false,
  },

  UNSAFE_INPUT: {
    code: "E-VAL-005",
    domain: "validation",
    severity: "warning",
    ui: "inline",
    retry: "user",
    ar: "يبدو أن الرسالة تحتوي على محتوى غير مناسب. يمكنك تعديلها والمحاولة مجدداً.",
    en: "Your message may contain unsuitable content. You can edit it and try again.",
    adminNote: "Input failed client-side safety filter before submission.",
    log: true,
    alert: false,
    analyticsEvent: "validation_unsafe_input",
  },

  // ── Usage Limits ────────────────────────────────────────────────────────
  DAILY_LIMIT_REACHED: {
    code: "E-LIM-001",
    domain: "limit",
    severity: "limit",
    ui: "blocking",
    retry: "none",
    ar: "وصلت لحد رسائل اليوم. يمكنك الاستمرار غداً — أو جرّب تمرين تنفس الآن.",
    en: "You've reached today's message limit. Continue tomorrow — or try a breathing exercise now.",
    adminNote: "User has reached their configured daily message quota.",
    log: true,
    alert: false,
    analyticsEvent: "limit_daily_messages_reached",
  },

  DAILY_LIMIT_WARNING: {
    code: "E-LIM-002",
    domain: "limit",
    severity: "warning",
    ui: "toast",
    retry: "none",
    ar: "اقتربت من حد الرسائل اليومية — بقي لك {remaining} رسائل.",
    en: "You're nearing today's message limit — {remaining} messages left.",
    adminNote: "User has passed the warning threshold for daily messages.",
    log: false,
    alert: false,
    analyticsEvent: "limit_daily_messages_warning",
  },

  RATE_LIMIT: {
    code: "E-LIM-003",
    domain: "rate",
    severity: "warning",
    ui: "inline",
    retry: "auto",
    ar: "خذ لحظة — انتظر {seconds} ثوانٍ قبل الرسالة التالية.",
    en: "Take a moment — wait {seconds} seconds before your next message.",
    adminNote: "User hit message rate limit.",
    log: false,
    alert: false,
  },

  RAPID_FIRE_COOLDOWN: {
    code: "E-LIM-004",
    domain: "rate",
    severity: "warning",
    ui: "banner",
    retry: "auto",
    ar: "يبدو أنك ترسل رسائل بسرعة كبيرة — أعطِ نفسك لحظة للتنفس.",
    en: "You're sending messages quickly — give yourself a moment to breathe.",
    adminNote: "User triggered rapid-fire rate limiter.",
    log: true,
    alert: false,
    analyticsEvent: "rate_rapid_fire_triggered",
  },

  SESSION_EXPIRING_SOON: {
    code: "E-LIM-005",
    domain: "limit",
    severity: "info",
    ui: "toast",
    retry: "none",
    ar: "جلستك تقترب من نهايتها — بقيت {minutes} دقائق.",
    en: "Your session is nearing its end — {minutes} minutes left.",
    adminNote: "Session approaching maximum duration limit.",
    log: false,
    alert: false,
  },

  SESSION_EXPIRED: {
    code: "E-LIM-006",
    domain: "limit",
    severity: "limit",
    ui: "modal",
    retry: "redirect",
    ar: "انتهت هذه الجلسة — يمكنك بدء جلسة جديدة في أي وقت.",
    en: "This session has ended — you can start a new one anytime.",
    adminNote: "Session reached maximum allowed duration.",
    log: true,
    alert: false,
    analyticsEvent: "limit_session_expired",
  },

  // ── AI Provider Errors ──────────────────────────────────────────────────
  AI_TIMEOUT: {
    code: "E-AI-001",
    domain: "ai",
    severity: "error",
    ui: "toast",
    retry: "auto-then-user",
    ar: "استغرق الرد وقتاً أطول من المعتاد — جارٍ المحاولة مرة أخرى.",
    en: "The response took longer than usual — trying again.",
    adminNote: "AI provider request timed out. Auto-retry triggered.",
    log: true,
    alert: true,
    analyticsEvent: "ai_timeout",
  },

  AI_PROVIDER_ERROR: {
    code: "E-AI-002",
    domain: "ai",
    severity: "error",
    ui: "toast",
    retry: "auto-then-user",
    ar: "واجهنا مشكلة مؤقتة في إكمال الرد — نحاول مجدداً.",
    en: "We hit a brief issue completing that response — trying again.",
    adminNote: "AI provider returned an error response. Check provider logs.",
    log: true,
    alert: true,
    analyticsEvent: "ai_provider_error",
  },

  AI_FALLBACK_ACTIVATED: {
    code: "E-AI-003",
    domain: "ai",
    severity: "info",
    ui: "silent",
    retry: "none",
    ar: "أُنْس معك — قد تختلف طريقة الرد قليلاً الآن.",
    en: "أُنْس is with you — responses may differ slightly right now.",
    adminNote: "Primary AI provider failed. Switched to fallback provider.",
    log: true,
    alert: true,
    analyticsEvent: "ai_fallback_activated",
  },

  AI_ALL_PROVIDERS_DOWN: {
    code: "E-AI-004",
    domain: "ai",
    severity: "critical",
    ui: "modal",
    retry: "user",
    ar: "المرافق غير متاح في الوقت الحالي — نعمل على الإصلاح. يمكنك المحاولة بعد قليل.",
    en: "The companion isn't available right now — we're working on it. Try again in a moment.",
    adminNote: "All AI providers are unavailable. Immediate attention required.",
    log: true,
    alert: true,
    analyticsEvent: "ai_all_providers_down",
  },

  AI_INVALID_RESPONSE: {
    code: "E-AI-005",
    domain: "ai",
    severity: "error",
    ui: "toast",
    retry: "user",
    ar: "لم يصل الرد بشكل صحيح — حاول مرة أخرى.",
    en: "The response didn't arrive correctly — please try again.",
    adminNote: "AI returned malformed or empty response.",
    log: true,
    alert: false,
    analyticsEvent: "ai_invalid_response",
  },

  // ── Network Errors ──────────────────────────────────────────────────────
  NETWORK_OFFLINE: {
    code: "E-NET-001",
    domain: "network",
    severity: "error",
    ui: "banner",
    retry: "auto",
    ar: "لا يوجد اتصال بالإنترنت — سيتم الإرسال تلقائياً عند عودة الاتصال.",
    en: "No internet connection — your message will send automatically when reconnected.",
    adminNote: "Device lost internet connectivity.",
    log: false,
    alert: false,
  },

  NETWORK_UNSTABLE: {
    code: "E-NET-002",
    domain: "network",
    severity: "warning",
    ui: "toast",
    retry: "auto",
    ar: "الاتصال غير مستقر — نحاول الإرسال.",
    en: "Connection is unstable — retrying.",
    adminNote: "Network request failed due to unstable connection.",
    log: false,
    alert: false,
  },

  NETWORK_FAILED_RETRY: {
    code: "E-NET-003",
    domain: "network",
    severity: "error",
    ui: "toast",
    retry: "user",
    ar: "لم نتمكن من الإرسال — تحقق من الاتصال وحاول مجدداً.",
    en: "We couldn't send — check your connection and try again.",
    adminNote: "Network request failed after all retry attempts.",
    log: true,
    alert: false,
    analyticsEvent: "network_failed_all_retries",
  },

  SERVER_UNAVAILABLE: {
    code: "E-NET-004",
    domain: "network",
    severity: "error",
    ui: "banner",
    retry: "auto",
    ar: "الخدمة غير متاحة مؤقتاً — نعمل على إعادتها في أقرب وقت.",
    en: "The service is temporarily unavailable — we're working to restore it.",
    adminNote: "Backend server returned 503 or is unreachable.",
    log: true,
    alert: true,
    analyticsEvent: "server_unavailable",
  },

  // ── Auth / Session ──────────────────────────────────────────────────────
  SESSION_INVALID: {
    code: "E-AUTH-001",
    domain: "auth",
    severity: "error",
    ui: "modal",
    retry: "redirect",
    ar: "انتهت صلاحية الجلسة — يرجى فتح التطبيق من جديد.",
    en: "Your session has expired — please reopen the app.",
    adminNote: "Session token is invalid or expired.",
    log: true,
    alert: false,
  },

  UNAUTHORIZED: {
    code: "E-AUTH-002",
    domain: "auth",
    severity: "error",
    ui: "modal",
    retry: "redirect",
    ar: "لا يمكن الوصول لهذا القسم — يرجى فتح التطبيق من جديد.",
    en: "This section can't be accessed — please reopen the app.",
    adminNote: "Unauthorized request. Token may be missing or malformed.",
    log: true,
    alert: false,
    analyticsEvent: "auth_unauthorized",
  },

  // ── Permission / Feature ────────────────────────────────────────────────
  FEATURE_NOT_AVAILABLE: {
    code: "E-FEAT-001",
    domain: "feature",
    severity: "info",
    ui: "toast",
    retry: "none",
    ar: "هذه الميزة غير متاحة حالياً — نعمل على إطلاقها قريباً.",
    en: "This feature isn't available yet — we're working on launching it soon.",
    adminNote: "User attempted to access a feature that is disabled via feature flag.",
    log: true,
    alert: false,
    analyticsEvent: "feature_unavailable",
  },

  PLAN_RESTRICTION: {
    code: "E-FEAT-002",
    domain: "subscription",
    severity: "info",
    ui: "modal",
    retry: "none",
    ar: "هذا القسم غير متاح في مستوى وصولك الحالي.",
    en: "This section isn't available for your current access level.",
    adminNote: "User tried to access a premium-only feature.",
    log: true,
    alert: false,
    analyticsEvent: "plan_restriction",
  },

  // ── Safety & Moderation ─────────────────────────────────────────────────
  MODERATION_BLOCK: {
    code: "E-SAF-001",
    domain: "safety",
    severity: "safety",
    ui: "modal",
    retry: "user",
    ar: "لم يتمكن أُنْس من إكمال هذا الطلب — يرجى التعديل والمحاولة مجدداً.",
    en: "أُنْس couldn't complete this request — please adjust and try again.",
    adminNote: "Message blocked by AI safety filter or moderation layer.",
    log: true,
    alert: true,
    analyticsEvent: "safety_moderation_block",
  },

  CRISIS_DETECTED: {
    code: "E-SAF-002",
    domain: "safety",
    severity: "critical",
    ui: "modal",
    retry: "none",
    ar: "أُنْس معك تماماً — إذا كنت بحاجة لدعم عاجل، يرجى التواصل مع أحد هذه الأرقام.",
    en: "أُنْس is fully with you — if you need urgent support, please reach out to one of these numbers.",
    adminNote: "Crisis signal detected in user message. Escalation protocols active.",
    log: true,
    alert: true,
    analyticsEvent: "safety_crisis_detected",
  },

  COMMUNITY_ACTION_BLOCKED: {
    code: "E-SAF-003",
    domain: "safety",
    severity: "safety",
    ui: "toast",
    retry: "none",
    ar: "هذا الإجراء غير متاح في المساحة الآمنة حالياً.",
    en: "This action isn't available in the Safe Space right now.",
    adminNote: "Community moderation blocked the action.",
    log: true,
    alert: false,
  },

  // ── Duplicate / Idempotency ─────────────────────────────────────────────
  DUPLICATE_SUBMISSION: {
    code: "E-SYS-001",
    domain: "system",
    severity: "info",
    ui: "silent",
    retry: "none",
    ar: "",
    en: "",
    adminNote: "Duplicate request detected and silently discarded.",
    log: false,
    alert: false,
  },

  // ── System / Unknown ────────────────────────────────────────────────────
  UNKNOWN_ERROR: {
    code: "E-SYS-002",
    domain: "system",
    severity: "error",
    ui: "toast",
    retry: "user",
    ar: "حدث شيء غير متوقع — نحن نعمل على حله. حاول مرة أخرى.",
    en: "Something unexpected happened — we're working on it. Please try again.",
    adminNote: "Unclassified error. Check logs for full stack trace.",
    log: true,
    alert: true,
    analyticsEvent: "system_unknown_error",
  },

  MAINTENANCE_MODE: {
    code: "E-SYS-003",
    domain: "system",
    severity: "info",
    ui: "blocking",
    retry: "none",
    ar: "أُنْس في صيانة مجدولة — سنعود قريباً. شكراً على صبرك.",
    en: "أُنْس is undergoing scheduled maintenance — we'll be back soon. Thank you for your patience.",
    adminNote: "System is in maintenance mode.",
    log: false,
    alert: false,
  },

  APP_UPDATE_REQUIRED: {
    code: "E-SYS-004",
    domain: "system",
    severity: "warning",
    ui: "modal",
    retry: "none",
    ar: "يتوفر تحديث جديد لأُنْس — يرجى التحديث للاستمرار.",
    en: "A new update for أُنْس is available — please update to continue.",
    adminNote: "Client version is below the minimum required version.",
    log: true,
    alert: false,
  },

  // ── Admin Config Errors ─────────────────────────────────────────────────
  CONFIG_INVALID_VALUE: {
    code: "E-CFG-001",
    domain: "config",
    severity: "error",
    ui: "inline",
    retry: "user",
    ar: "القيمة المدخلة غير صالحة لهذا النوع.",
    en: "The value entered is not valid for this type.",
    adminNote: "Admin entered a value that doesn't match the config key's declared type.",
    log: true,
    alert: false,
  },

  CONFIG_DEPENDENCY_CONFLICT: {
    code: "E-CFG-002",
    domain: "config",
    severity: "warning",
    ui: "modal",
    retry: "user",
    ar: "هناك تعارض مع إعداد مرتبط — راجع القيم قبل النشر.",
    en: "There's a conflict with a related setting — review values before publishing.",
    adminNote: "Config value conflicts with another dependent config key.",
    log: true,
    alert: false,
  },

  CONFIG_UNSAFE_PUBLISH: {
    code: "E-CFG-003",
    domain: "config",
    severity: "error",
    ui: "modal",
    retry: "user",
    ar: "لا يمكن نشر هذا الإعداد — يحتوي على قيمة خارج النطاق الآمن.",
    en: "This config can't be published — it contains a value outside the safe range.",
    adminNote: "Admin attempted to publish a config value that violates safety constraints.",
    log: true,
    alert: true,
  },

  PROVIDER_TEST_FAILED: {
    code: "E-CFG-004",
    domain: "config",
    severity: "error",
    ui: "toast",
    retry: "user",
    ar: "فشل اختبار الاتصال — تحقق من المفتاح والإعدادات.",
    en: "Connection test failed — check the API key and settings.",
    adminNote: "AI provider API key test returned an error.",
    log: true,
    alert: false,
  },

  FLAG_ROLLBACK_FAILED: {
    code: "E-CFG-005",
    domain: "config",
    severity: "critical",
    ui: "modal",
    retry: "user",
    ar: "فشل الرجوع للإصدار السابق — يرجى التدخل اليدوي.",
    en: "Rollback failed — manual intervention required.",
    adminNote: "Feature flag rollback operation failed. Config may be in inconsistent state.",
    log: true,
    alert: true,
  },
};

// ─── Helper: format template strings ──────────────────────────────────────
export function formatError(
  error: ErrorDef,
  vars: Record<string, string | number> = {},
  lang: "ar" | "en" = "ar"
): string {
  let msg = lang === "ar" ? error.ar : error.en;
  Object.entries(vars).forEach(([key, val]) => {
    msg = msg.replace(`{${key}}`, String(val));
  });
  return msg;
}

// ─── Helper: look up error by code ────────────────────────────────────────
export function getErrorByCode(code: string): ErrorDef | undefined {
  return Object.values(ERRORS).find(e => e.code === code);
}
