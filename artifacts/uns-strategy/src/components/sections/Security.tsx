export function Security() {
  return (
    <section id="security" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">11</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Security & Privacy Framework</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">الأمان والخصوصية</h2>
        <p className="text-muted-foreground mb-10">Mental health data is the most sensitive data category in existence. Treat it accordingly.</p>

        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-2xl p-8 mb-8">
          <div className="text-lg font-bold text-foreground mb-4">The Privacy Hierarchy</div>
          <div className="space-y-3">
            {[
              { level: "Level 0", label: "Public Data", desc: "App usage patterns (anonymous, aggregated). Used for product improvement only.", badge: "text-chart-4 bg-chart-4/20" },
              { level: "Level 1", label: "Profile Data", desc: "Username, dialect preference, notification settings. Standard encryption at rest.", badge: "text-chart-3 bg-chart-3/20" },
              { level: "Level 2", label: "Emotional Metadata", desc: "Mood trends, session frequency, feature usage. Encrypted, never shared, no third-party access.", badge: "text-primary bg-primary/20" },
              { level: "Level 3", label: "Journal Content", desc: "Raw journal text. On-device encryption by default. Zero-knowledge vault option: company never has decryption key.", badge: "text-accent bg-accent/20" },
              { level: "Level 4", label: "Crisis Data", desc: "Highest protection. Encrypted separately. Access only via automated safety system. Never stored in analytics.", badge: "text-destructive bg-destructive/20" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-card border border-card-border rounded-xl p-4">
                <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${item.badge}`}>{item.level}</span>
                <div>
                  <div className="text-xs font-semibold text-foreground mb-1">{item.label}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-5">Regulatory Compliance</h3>
            <div className="space-y-4">
              {[
                { reg: "GDPR", flag: "🇪🇺", desc: "Right to deletion, data portability, breach notification within 72h. Critical for EU Arabic diaspora." },
                { reg: "UAE PDPL", flag: "🇦🇪", desc: "UAE Personal Data Protection Law. Data residency in UAE data centers. DPA registration." },
                { reg: "KSA PDPL", flag: "🇸🇦", desc: "Saudi Personal Data Protection Law 2022. NDMO compliance. Saudi data stays in Saudi borders." },
                { reg: "HIPAA Adjacent", flag: "🏥", desc: "While not a medical app, we voluntarily adopt HIPAA-equivalent standards for mental health data handling." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-muted/20 rounded-lg border border-card-border">
                  <span className="text-lg shrink-0">{item.flag}</span>
                  <div>
                    <div className="text-xs font-semibold text-foreground mb-1">{item.reg}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-5">Crisis Safety Protocol</h3>
            <div className="space-y-3">
              {[
                { step: "Detection", desc: "Custom Arabic BERT crisis classifier runs on every message in <50ms. Triggers on risk language patterns." },
                { step: "Soft escalation", desc: "Companion shifts tone, acknowledges distress, asks directly about safety without alarming language." },
                { step: "Resource surface", desc: "Crisis resources surfaced naturally: hotlines for KSA (920033360), UAE (800HOPE), Egypt (762), Jordan." },
                { step: "Trusted contact alert", desc: "With prior consent, user's nominated trusted contact can be notified (opt-in, never auto)." },
                { step: "Human handoff", desc: "Integration with regional crisis services where API partnerships are established." },
              ].map((item, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                      <span className="text-xs text-primary font-bold">{i + 1}</span>
                    </div>
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-primary/20 my-1" />}
                  </div>
                  <div className="pb-3">
                    <div className="text-xs font-semibold text-foreground mb-1">{item.step}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Annual security audit", icon: "🔍", detail: "Third-party penetration test" },
            { label: "Bug bounty program", icon: "🏆", detail: "HackerOne or Bugcrowd" },
            { label: "E2E encryption", icon: "🔐", detail: "All journal content, always" },
            { label: "Zero-knowledge vault", icon: "🔑", detail: "Premium: company never reads" },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs font-semibold text-foreground mb-1">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
