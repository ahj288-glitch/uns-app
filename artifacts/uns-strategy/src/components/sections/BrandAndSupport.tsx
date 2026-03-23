export function BrandAndSupport() {
  const toneRules = [
    { rule: "Warm before informative", example: "'لاحظنا أنك لم تتواصل معنا منذ فترة — كيف تحس؟' not 'You have not logged in for 3 days.'", domain: "Nudges, Emails" },
    { rule: "Specific over vague", example: "'تنفّس لمدة 4 ثوانٍ' not 'خذ لحظة للتنفس'", domain: "Content, Instructions" },
    { rule: "Never prescriptive", example: "'قد يساعدك...' not 'يجب أن تفعل...'", domain: "AI responses, Companion" },
    { rule: "Acknowledge before redirect", example: "'ما تشعر به طبيعي — وأُنْس معك. جرّب هذا...' not 'Try this exercise.'", domain: "Crisis adjacent, Difficult moments" },
    { rule: "Arabic-first elegance", example: "Copy reads as native Arabic expression, not translated English. No 'كليك هنا' energy.", domain: "All surfaces" },
    { rule: "Silence is a valid response", example: "Some companion responses end with a question, not a directive. Emotional presence over productivity.", domain: "AI companion" },
  ];

  const microCopyStandards = [
    { category: "Button Labels", good: "ابدأ رحلتك، جرّب الآن، شاركني", bad: "Submit, Confirm, Proceed" },
    { category: "Empty States", good: "'ابدأ بمشاركة شعورك الآن — حتى كلمة واحدة تكفي.'", bad: "'No data available.'" },
    { category: "Error Messages", good: "'حدث شيء ما — نحن نعمل عليه. حاول مجدداً.'", bad: "'Error 500: Internal Server Error'" },
    { category: "Loading States", good: "'أُنْس يستمع...' / 'جارٍ التحضير...'", bad: "'Loading...'" },
    { category: "Success Confirmations", good: "'تم حفظ مشاعرك ✓ — شكراً لمشاركتي'", bad: "'Data saved successfully.'" },
    { category: "Onboarding Progress", good: "'خطوة واحدة أخرى ونبدأ رحلتنا معاً'", bad: "'Step 2 of 3'" },
  ];

  const supportLevels = [
    { level: "Self-Service", channel: "In-App Help + FAQ", rt: "Instant", coverage: "Account issues, how-to guides, privacy questions, billing" },
    { level: "Async Support", channel: "In-App Message → Email", rt: "<24 hours", coverage: "Feature issues, complaint handling, moderation appeals, data requests" },
    { level: "Crisis Support", channel: "Escalation pathway → External resources", rt: "Immediate routing", coverage: "User safety concerns, active crisis states, urgent welfare events" },
    { level: "Premium Support", channel: "Priority queue + Account manager (Enterprise)", rt: "<4 hours", coverage: "Enterprise technical issues, SLA breach, custom configuration" },
  ];

  const supportTonePrinciples = [
    "Every support interaction is an emotional touchpoint — not a ticket to close",
    "Never use template language that sounds like a call center script",
    "Acknowledge the user's frustration before offering a solution",
    "Don't promise what can't be delivered — under-promise, over-deliver",
    "Closing a support thread must feel like a resolution, not an eviction",
    "Safety-related support is always escalated — no 'can you try restarting the app' for welfare concerns",
  ];

  return (
    <section id="brand-and-support" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">28</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Brand Voice, Emotional Design System & Support Operations</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            أُنْس must feel like one coherent emotional environment across every touchpoint — from the first onboarding word to an error message at 2AM to a support reply three months in. Brand consistency is not visual only — it is tonal, rhythmic, and emotionally faithful at every interaction.
          </p>
        </div>

        {/* Brand Identity Core */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { word: "دافئ", en: "Warm", desc: "Like a trusted friend — never clinical, never cold" },
            { word: "ذكي", en: "Intelligent", desc: "Perceptive without showing off. Insightful, not analytical." },
            { word: "هادئ", en: "Calm", desc: "No urgency, no pressure. Even in error states." },
            { word: "صادق", en: "Honest", desc: "Clear about what it is, what it isn't, what it can and cannot do." },
          ].map(b => (
            <div key={b.word} className="bg-card rounded-2xl p-5 border border-border/30 text-center">
              <div className="text-2xl font-bold text-primary mb-1" dir="rtl">{b.word}</div>
              <div className="text-xs text-muted-foreground mb-2">{b.en}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Tone Rules */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Tone of Voice Rules</h3>
          <div className="space-y-3">
            {toneRules.map(r => (
              <div key={r.rule} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-sm">{r.rule}</h4>
                  <span className="text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full shrink-0">{r.domain}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed" dir="rtl">{r.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Microcopy Standards */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Microcopy Standards</h3>
          <div className="overflow-hidden rounded-2xl border border-border/30">
            <div className="grid grid-cols-3 gap-2 px-5 py-3 text-xs text-muted-foreground bg-card">
              <span>Context</span>
              <span className="text-primary">أُنْس Standard</span>
              <span className="text-muted-foreground/50">Avoid</span>
            </div>
            {microCopyStandards.map(m => (
              <div key={m.category} className="grid grid-cols-3 gap-2 px-5 py-4 border-t border-border/20 text-sm">
                <span className="font-medium text-sm">{m.category}</span>
                <span className="text-primary text-xs leading-relaxed" dir="rtl">{m.good}</span>
                <span className="text-muted-foreground/50 text-xs leading-relaxed">{m.bad}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motion Design Principles */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-4">Motion & Interaction Design Principles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { principle: "Breathing as a metaphor", detail: "Animations breathe — expand and contract with sine easing. Never snap, jump, or flash." },
              { principle: "Reduced motion respect", detail: "System-level 'reduce motion' preference is fully honored. No animations that cannot be turned off." },
              { principle: "No urgency animations", detail: "No countdown timers, no aggressive bouncing, no urgent-feeling motion. Calm above all." },
              { principle: "Haptic intentionality", detail: "Mobile haptics are used sparingly and meaningfully. Success is a gentle pulse. Error is a soft alert. Never jarring." },
            ].map(p => (
              <div key={p.principle} className="bg-background rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-1">{p.principle}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Operations */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Support Operations Architecture</h3>
          <div className="space-y-3">
            {supportLevels.map(s => (
              <div key={s.level} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-sm">{s.level}</h4>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-muted-foreground">{s.channel}</span>
                    <span className="bg-primary/8 text-primary px-2 py-0.5 rounded-full font-mono">{s.rt}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{s.coverage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Tone */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Support Tone Principles</h3>
          <div className="space-y-2">
            {supportTonePrinciples.map((p, i) => (
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
