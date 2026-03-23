export function TrustFramework() {
  const consentBlocks = [
    { title: "Emotional Data Consent", ar: "موافقة البيانات العاطفية", detail: "Explicit opt-in before first mood entry. Plain-language explanation — no legal jargon. Covers what is stored, how long, who can access." },
    { title: "AI Interaction Consent", ar: "موافقة التفاعل مع الذكاء الاصطناعي", detail: "Users are informed they are conversing with an AI companion — not a licensed therapist. Limitations are stated warmly and clearly at onboarding." },
    { title: "Conversation Storage Choice", ar: "خيار حفظ المحادثات", detail: "Three modes: 1) Store for personalization, 2) Session-only (auto-deleted after close), 3) Zero-storage (never persisted). User can change anytime." },
    { title: "Data Export & Deletion", ar: "تصدير البيانات وحذفها", detail: "One-tap export of all personal data as a readable JSON + PDF. Full account deletion clears all records within 72 hours with a confirmation receipt." },
    { title: "Marketing & Communications Consent", ar: "موافقة التسويق", detail: "Granular consent for: product updates, emotional support emails, community digests. Pre-ticked opt-outs only — never opt-in by default." },
  ];

  const privacyPillars = [
    { icon: "🔒", title: "Zero-Knowledge Journaling", detail: "Journal entries encrypted on-device before transit. Server receives ciphertext only. Even أُنْس cannot read your private entries." },
    { icon: "🧹", title: "Emotional Data Minimization", detail: "We collect only what we need for the companion to be helpful. No selling. No third-party targeting. No ad profiles." },
    { icon: "🌍", title: "Regional Data Residency", detail: "All data stored in AWS Bahrain (me-south-1) for GCC users. Compliant with Saudi PDPL and UAE Data Protection Law." },
    { icon: "🔍", title: "Audit Transparency", detail: "Annual third-party security audit. Summary of findings published. Bug bounty program open year-round." },
    { icon: "⏱️", title: "Retention Policy by Type", detail: "Conversation memory: 12 months rolling. Mood check-ins: retained indefinitely (exportable). Crisis events: 30 days internal review then anonymized." },
    { icon: "🤝", title: "Wellness ≠ Medical Care", detail: "أُنْس is a companion, not a clinician. Every onboarding flow and crisis pathway makes this distinction with care — protecting users and the company." },
  ];

  return (
    <section id="trust-framework" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">20</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Trust, Consent & Privacy Framework</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Trust is not a feature toggle — it is the foundation of everything أُنْس is. In a product that holds emotional confessions, the privacy architecture must be designed-in from day one, communicated clearly, and experienced as a product strength rather than a legal footnote.
          </p>
        </div>

        {/* Principle Banner */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-6">
          <p className="text-lg font-semibold text-center" dir="rtl">
            "ما تشاركه معنا يبقى بيننا — دائماً."
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            What you share with us stays with us — always.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">The core trust promise. Never violated. Never hedged.</p>
        </div>

        {/* Consent Architecture */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Consent Architecture</h3>
          <div className="space-y-3">
            {consentBlocks.map((b, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-0.5">{b.title}</h4>
                    <p className="text-xs text-primary mb-2" dir="rtl">{b.ar}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.detail}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary font-mono">{i + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Pillars */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Six Privacy Pillars</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {privacyPillars.map((p, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="text-2xl mb-3">{p.icon}</div>
                <h4 className="font-semibold mb-2 text-sm">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* In-App Trust Center */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-4">In-App Trust Center</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Trust must live inside the product — not just in a privacy policy URL. The Trust Center is a dedicated in-app section accessible from Profile Settings, covering all of the following in plain Arabic and English.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "What data we collect and why",
              "How your AI conversations work",
              "Who can access your data (no one without your consent)",
              "How to export all your data",
              "How to delete your account permanently",
              "How crisis detection and escalation works",
              "Difference between أُنْس and clinical therapy",
              "How to change your consent choices at any time",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Readiness */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Regulatory Readiness</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { reg: "Saudi PDPL", status: "Compliant from launch", detail: "Data residency in Bahrain. Consent records stored. DPO appointed. 72h breach notification." },
              { reg: "UAE Data Protection", status: "Compliant from launch", detail: "ADGM-aware architecture. User deletion request processing within 30 days." },
              { reg: "GDPR-Aligned", status: "Best-practice alignment", detail: "While not legally required, GDPR principles inform our data handling — future-proofing for EU expansion." },
            ].map(r => (
              <div key={r.reg} className="bg-card rounded-2xl p-4 border border-border/30 text-right" dir="rtl">
                <div className="font-semibold text-sm mb-1">{r.reg}</div>
                <div className="text-xs text-primary mb-2">{r.status}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
