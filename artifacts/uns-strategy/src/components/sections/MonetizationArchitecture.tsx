export function MonetizationArchitecture() {
  const tiers = [
    {
      name: "مجاني",
      nameEn: "Free",
      price: "SAR 0",
      tagline: "الرفيق دائماً معك",
      color: "border-border/30",
      features: [
        "AI companion: 30 messages/day",
        "Daily mood check-in (unlimited)",
        "Basic emotional fingerprint",
        "3 breathing exercises",
        "Community Safe Space (read-only)",
        "Streak tracking (7-day)",
        "Basic emotional insights",
      ],
      limits: [
        "No journal archive access",
        "No guided programs",
        "No voice interaction",
      ],
    },
    {
      name: "أُنس+",
      nameEn: "Unns Plus",
      price: "SAR 29/mo",
      tagline: "رحلتك العاطفية الكاملة",
      color: "border-primary/40",
      highlight: true,
      features: [
        "Unlimited AI companion messages",
        "Full journal with AI reflection",
        "Complete breathing + grounding library",
        "All guided programs + thematic journeys",
        "Voice interaction (Arabic STT/TTS)",
        "Monthly AI emotional summary",
        "Advanced insights + mood trends",
        "Community posting + support circles",
        "Priority AI provider routing",
        "Offline mode for core content",
      ],
    },
    {
      name: "عائلي",
      nameEn: "Family",
      price: "SAR 79/mo",
      tagline: "العائلة في أمان عاطفي",
      color: "border-border/30",
      features: [
        "All أُنس+ features for 5 members",
        "Family wellness overview (aggregate only)",
        "Dedicated dialect per member",
        "Shared safe check-in moments",
        "Parental awareness mode (18+ consent)",
        "Family streak celebrations",
      ],
    },
  ];

  const enterpriseModules = [
    { module: "Aggregate Wellbeing Dashboard", detail: "Department-level wellness scores. No individual data. Trend over time." },
    { module: "Bulk Employee Onboarding", detail: "SSO integration, CSV import, domain-verified invite. IT-managed deployment." },
    { module: "Custom Content Library", detail: "Organization-specific programs: leadership resilience, return-from-leave support, seasonal campaigns." },
    { module: "HR Insights Reports", detail: "Quarterly anonymized wellbeing trend reports. Segment by department, seniority, tenure." },
    { module: "Privacy Governance Controls", detail: "Organization can set retention policies, enforce zero-storage mode, disable features per compliance requirement." },
    { module: "Dedicated Support Tier", detail: "Dedicated account manager, SLA 99.9% uptime, 4-hour incident response." },
  ];

  const monetizationPrinciples = [
    "Paywalls are disclosed warmly, never abruptly — users understand what they gain, not what they lose",
    "Free tier must remain genuinely useful. Crippled free tiers betray trust in a wellness product.",
    "No dark patterns: no countdown timers, no manufactured scarcity, no guilt-based upgrade prompts",
    "Trial experience ends with a choice, not an automatic charge",
    "Downgrade is always available, never hidden",
    "Grace periods: 7 days past billing failure before access reduction. No sudden lockouts.",
  ];

  return (
    <section id="monetization-architecture" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">25</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Monetization Architecture</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Monetization in an emotional wellness product is a trust exercise before a revenue exercise. Every pricing decision, paywall placement, and upgrade prompt must respect the user's emotional state and the product's positioning as a safe, supportive companion — not a subscription with feelings.
          </p>
        </div>

        {/* Revenue Mix */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { stream: "B2C Subscriptions", share: "55%", note: "Plus and Family tiers. Primary revenue in Year 1–2." },
            { stream: "B2B Enterprise", share: "35%", note: "$6–10/employee/month. High LTV, low churn. Year 2+ priority." },
            { stream: "Premium Experiences", share: "10%", note: "Expert-led workshops, seasonal programs, group journeys." },
          ].map(r => (
            <div key={r.stream} className="bg-card rounded-2xl p-5 border border-border/30 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{r.share}</div>
              <div className="font-semibold text-sm mb-1">{r.stream}</div>
              <p className="text-xs text-muted-foreground">{r.note}</p>
            </div>
          ))}
        </div>

        {/* Tier Architecture */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Subscription Tier Design</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map(t => (
              <div key={t.name} className={`bg-card rounded-2xl p-5 border ${t.color} ${t.highlight ? 'ring-1 ring-primary/30' : ''} relative`}>
                {t.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs bg-primary text-background px-3 py-1 rounded-full font-medium">الأكثر شعبية</span>
                  </div>
                )}
                <div className="text-right mb-4" dir="rtl">
                  <div className="text-xl font-bold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.nameEn}</div>
                  <div className="text-2xl font-bold text-primary mt-2">{t.price}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t.tagline}</p>
                </div>
                <div className="space-y-1.5">
                  {t.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                      {f}
                    </div>
                  ))}
                  {t.limits?.map(l => (
                    <div key={l} className="flex items-start gap-2 text-xs text-muted-foreground/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1 shrink-0" />
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-1">Enterprise — أُنس للمؤسسات</h3>
          <p className="text-sm text-muted-foreground mb-5">Custom pricing · Min 50 employees · Annual contract</p>
          <div className="grid md:grid-cols-2 gap-3">
            {enterpriseModules.map(m => (
              <div key={m.module} className="bg-background rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-1">{m.module}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trial Design */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-3">Trial Experience Design</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { phase: "Days 1–3", title: "Full Access", detail: "No restrictions. Let the product speak for itself. No prompts, no friction." },
              { phase: "Day 5", title: "Gentle Awareness", detail: "A companion message: 'رحلتك تنمو — أُنس+ يمكنه مرافقتك أكثر.' No pressure, just insight." },
              { phase: "Day 7", title: "Informed Choice", detail: "Clear summary of what the trial included. Simple choice: continue with Plus, or continue with Free. Both dignified." },
            ].map(p => (
              <div key={p.phase} className="text-center">
                <div className="text-xs font-mono text-primary mb-2">{p.phase}</div>
                <div className="font-semibold text-sm mb-1">{p.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monetization Principles */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Monetization Ethics</h3>
          <div className="space-y-2">
            {monetizationPrinciples.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
