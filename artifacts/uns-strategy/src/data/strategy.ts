export const NAV_SECTIONS = [
  { id: "executive-summary", num: "01", title: "Executive Summary", arabic: "الملخص التنفيذي" },
  { id: "market-analysis", num: "02", title: "Market & Competitor Analysis", arabic: "تحليل السوق" },
  { id: "gap-analysis", num: "03", title: "Gap & Opportunity Analysis", arabic: "تحليل الفجوات" },
  { id: "product-definition", num: "04", title: "Final Product Definition", arabic: "تعريف المنتج" },
  { id: "positioning", num: "05", title: "Product Positioning", arabic: "تموضع المنتج" },
  { id: "feature-universe", num: "06", title: "Feature Universe", arabic: "كون الميزات" },
  { id: "ux-journey", num: "07", title: "UX & Emotional Journey", arabic: "تجربة المستخدم" },
  { id: "monetization", num: "08", title: "Monetization Strategy", arabic: "استراتيجية الإيرادات" },
  { id: "growth", num: "09", title: "Growth to 1M Users", arabic: "النمو والتوسع" },
  { id: "architecture", num: "10", title: "Technical Architecture", arabic: "البنية التقنية" },
  { id: "security", num: "11", title: "Security & Privacy", arabic: "الأمان والخصوصية" },
  { id: "admin-system", num: "12", title: "Admin System Design", arabic: "نظام الإدارة" },
  { id: "mvp", num: "13", title: "MVP Definition", arabic: "المنتج الأدنى" },
  { id: "roadmap", num: "14", title: "Phased Roadmap", arabic: "خارطة الطريق" },
  { id: "risks", num: "15", title: "Risk Analysis", arabic: "تحليل المخاطر" },
  { id: "recommendation", num: "16", title: "Final Recommendation", arabic: "التوصية الختامية" },
  { id: "design-system", num: "17", title: "Design DNA & Midnight Garden System", arabic: "الهوية التصميمية" },
  { id: "personalization", num: "18", title: "Personalization Engine", arabic: "محرك التخصيص" },
  { id: "viral-loop", num: "19", title: "Viral Loop — Share Your State", arabic: "الحلقة الفيروسية" },
];

export const COMPETITORS = [
  {
    name: "Wysa",
    type: "global",
    strengths: "Evidence-based CBT techniques, strong clinical credibility, enterprise B2B",
    weaknesses: "No Arabic, Western cultural framing, no personality memory, clinical cold feel",
    monetization: "Freemium + B2B $5-8/user/mo",
    retention: "Daily check-in streak, mood graphs",
    emotional: "Clinical ally — safe but sterile",
    whyLeave: "Feels like a form, not a friend. No cultural resonance. No memory."
  },
  {
    name: "Woebot",
    type: "global",
    strengths: "Pioneered AI mental health, large research base, CBT-driven",
    weaknesses: "Extremely scripted, no Arabic, personality doesn't evolve, no voice, feels dated",
    monetization: "B2B healthcare partnerships",
    retention: "Research-backed habit nudges",
    emotional: "Warm but mechanical — loses trust fast",
    whyLeave: "Users outgrow it in 2 weeks. Too rigid. Zero emotional depth."
  },
  {
    name: "Replika",
    type: "global",
    strengths: "Deep emotional bond, personality system, very high engagement, voice calls",
    weaknesses: "No Arabic, no cultural sensitivity, controversial relationship features, data concerns",
    monetization: "Premium $19.99/mo subscription",
    retention: "Parasocial bond, daily conversation, role-play",
    emotional: "Deeply intimate — but culturally alienating for Arab users",
    whyLeave: "Cultural mismatch. Arabic users feel judged or uncomfortable with its Western defaults."
  },
  {
    name: "Calm",
    type: "global",
    strengths: "Brand dominance, celebrity content, sleep focus, premium UX",
    weaknesses: "0% Arabic content, no AI companion, passive consumption only, no personalization",
    monetization: "$69.99/year subscription",
    retention: "Sleep stories, Breathe sessions",
    emotional: "Zen serenity — aspirational but distant",
    whyLeave: "It's content, not a companion. Arabic users have nothing to relate to."
  },
  {
    name: "Headspace",
    type: "global",
    strengths: "Strong UX, gamified habit, corporate B2B, brand trust",
    weaknesses: "No Arabic, Western mindfulness only, meditation-centric, no emotional AI",
    monetization: "$12.99/mo or $69.99/year",
    retention: "Streak gamification, animated content",
    emotional: "Friendly coach — approachable but impersonal",
    whyLeave: "Not emotionally responsive. Arabic users find content irrelevant."
  },
  {
    name: "BetterHelp",
    type: "global",
    strengths: "Real therapists, high trust, strong growth, large user base",
    weaknesses: "No AI companion, expensive, therapist matching failures, mental health stigma activator",
    monetization: "$60-100/week therapy sessions",
    retention: "Therapist relationship continuity",
    emotional: "Professional help — stigma barrier in Arab culture is massive",
    whyLeave: "Cost + stigma. Admitting you need 'therapy' is culturally loaded."
  },
  {
    name: "7cups",
    type: "global",
    strengths: "Free peer support, large community, anonymous chat",
    weaknesses: "Quality inconsistent, no AI, no Arabic, volunteer burnout, no personalization",
    monetization: "Freemium + premium therapy matching",
    retention: "Community belonging",
    emotional: "Peer empathy — but no depth or continuity",
    whyLeave: "Inconsistent quality. No cultural awareness. Privacy concerns."
  },
  {
    name: "Youper",
    type: "global",
    strengths: "AI-powered mood tracking, clean UI, clinical validation",
    weaknesses: "No Arabic, feels clinical, limited personality depth, low brand awareness",
    monetization: "Freemium $9.99/mo",
    retention: "Mood patterns, daily check-in",
    emotional: "Gentle therapist bot — accurate but emotionally flat",
    whyLeave: "No emotional bond. Users stop once curiosity fades."
  },
];

export const FEATURES = {
  p0: [
    { name: "رفيق المشاعر", nameEn: "Murafiq AI Companion", desc: "Arabic-first GPT-4o companion with dialect awareness, emotional tone, and memory. Not a chatbot — a relationship.", why: "The core value. Without this, there is no product." },
    { name: "بصمة المشاعر", nameEn: "Emotional Fingerprint", desc: "3-question onboarding conversation that builds a personality and emotional baseline. No forms, no clinical language.", why: "Personalization from day 1 drives retention." },
    { name: "تسجيل المزاج", nameEn: "Daily Mood Check-in", desc: "A 30-second daily ritual using Arabic emotional vocabulary (غم، وحشة، فرح، قلق). Beautiful micro-animation.", why: "The daily habit anchor. Habit loop starts here." },
    { name: "ذاكرة المشاعر", nameEn: "Emotional Memory", desc: "Vector-stored compressed emotional context. Companion remembers your patterns, anniversaries, recurring struggles.", why: "Memory creates intimacy. Intimacy creates trust. Trust creates retention." },
    { name: "درع الأمان", nameEn: "Crisis Detection Shield", desc: "Real-time ML classifier on conversation content. Escalates to crisis resources, hotlines, trusted contacts.", why: "Non-negotiable. This is what keeps people alive and keeps regulators satisfied." },
    { name: "خزنة الخصوصية", nameEn: "Privacy Vault", desc: "Journal entries encrypted on-device. Zero-knowledge option. No company access to emotional content.", why: "Trust is the product. Break it once, never recover." },
  ],
  p1: [
    { name: "صوت المرافق", nameEn: "Voice Interaction", desc: "Arabic TTS (ElevenLabs) + Whisper STT. Speak to your companion naturally in your dialect.", why: "Voice is the most intimate interface. Doubles engagement." },
    { name: "برامج موجهة", nameEn: "Guided Programs", desc: "Ramadan wellness, grief support, anxiety toolkit, sleep hygiene — culturally crafted, not translated.", why: "Programs drive premium upsell and demonstrate depth." },
    { name: "مفكرة ذكية", nameEn: "Smart Journaling", desc: "Free-write journaling with AI reflection after entry. Companion responds with insight, not advice.", why: "Journaling is the highest-LTV feature — users who journal stay 3x longer." },
    { name: "نبضات ذكية", nameEn: "Smart Nudges", desc: "Context-aware push notifications based on mood patterns. Never spammy. Always earned.", why: "Drives D30+ retention without dark patterns." },
    { name: "ودجة الشاشة", nameEn: "Lock Screen Widget", desc: "Daily mood word + companion micro-message on lock screen. Ambient emotional presence.", why: "Keeps UNS in daily consciousness without opening the app." },
    { name: "لوحة البصائر", nameEn: "Insights Dashboard", desc: "Beautiful mood trend visualization. Weekly/monthly emotional reports. Pattern recognition.", why: "Turns raw emotional data into self-knowledge — a premium differentiator." },
  ],
  p2: [
    { name: "أُنس للمؤسسات", nameEn: "B2B HR Portal", desc: "Aggregate wellness dashboard for HR teams. No individual data exposed. Wellness scores by department.", why: "B2B is the revenue multiplier. $6/employee/mo × 1000 employees = $6K MRR per client." },
    { name: "وضع العائلة", nameEn: "Family Safe Mode", desc: "Shared family plan with parental insights mode. Arabic family unit is the social anchor.", why: "Family plan increases ARPU and reduces churn via social dependency." },
    { name: "دوائر اجتماعية", nameEn: "Community Circles", desc: "Anonymous peer support groups by topic (grief, anxiety, new parents). Moderated by AI.", why: "Community is the network effect moat. Hard to replicate." },
    { name: "روحانية وصحة", nameEn: "Spiritual Wellness", desc: "Prayer time integration, Islamic mindfulness, Quran reflection prompts (opt-in).", why: "Deeply resonant for the majority of Arabic users. Unique differentiator." },
    { name: "لهجات المنطقة", nameEn: "Regional Dialects", desc: "Gulf → Levant → Egypt → Maghreb dialect layers. Same AI soul, regional vocabulary.", why: "Dialect is identity. Matching dialect unlocks trust in each market." },
    { name: "مدير المحتوى", nameEn: "Content Engine", desc: "Admin-configurable guided programs, seasonal content (Ramadan, Eid), crisis resource library.", why: "Enables rapid regional expansion without engineering bottleneck." },
  ]
};

export const RISKS = [
  { risk: "AI emotional hallucination", probability: "High", impact: "Critical", mitigation: "Strict safety rails, crisis classifier, human escalation paths, regular red-team testing of emotional scenarios. Never claim medical advice.", color: "risk-high" },
  { risk: "Cultural/religious backlash", probability: "Medium", impact: "High", mitigation: "Opt-in spiritual features only. Community advisory board of Arab Muslim scholars and psychologists. Conservative defaults.", color: "risk-medium" },
  { risk: "User data breach", probability: "Low", impact: "Critical", mitigation: "E2E encryption, zero-knowledge vault, on-device journaling, annual third-party security audit, bug bounty program.", color: "risk-high" },
  { risk: "Stigma blocking adoption", probability: "High", impact: "High", mitigation: "Never use 'mental health' or 'therapy' in positioning. Frame as companion, not treatment. Creator-led de-stigmatization content.", color: "risk-high" },
  { risk: "Dialect accuracy failures", probability: "Medium", impact: "Medium", mitigation: "Prompt engineering layered on MSA base. Beta test each dialect with 50+ native speakers. User correction feedback loop.", color: "risk-medium" },
  { risk: "App Store policy changes (mental health)", probability: "Low", impact: "High", mitigation: "Maintain 'companion app' positioning, not 'therapy app'. Proactive relationship with Apple/Google policy teams.", color: "risk-medium" },
  { risk: "Regulatory pressure (KSA/UAE)", probability: "Medium", impact: "High", mitigation: "PDPL compliance from day 1. Legal counsel in both markets. Data residency in MENA region (AWS Bahrain).", color: "risk-medium" },
  { risk: "LLM cost at scale", probability: "High", impact: "Medium", mitigation: "Tiered model routing (GPT-4o for premium, GPT-4o-mini for free). Emotional memory compression reduces prompt length. Cache common patterns.", color: "risk-medium" },
];
