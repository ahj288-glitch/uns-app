export function AdminSystem() {
  return (
    <section id="admin-system" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">12</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Admin / Configurable System Design</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">نظام الإدارة</h2>
        <p className="text-muted-foreground mb-10">Two admin layers: Internal (engineering team) and External (B2B corporate clients).</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            {
              title: "Internal Admin Panel",
              subtitle: "لوحة الإدارة الداخلية",
              color: "border-primary/40",
              desc: "Full platform control for the UNS team. Content management, AI configuration, feature flags, safety monitoring.",
              modules: [
                { name: "AI System Prompt Manager", desc: "Configure companion personality, dialect defaults, regional tones, crisis escalation thresholds per market." },
                { name: "Content Management System", desc: "Create/edit guided programs, Ramadan specials, mood templates, crisis resource libraries per region." },
                { name: "Feature Flag Engine", desc: "Roll out features per region, per user cohort, per subscription tier. A/B test without deployment." },
                { name: "Safety Dashboard", desc: "Anonymous crisis event monitoring. Alert volumes by region. Escalation path performance tracking." },
                { name: "Analytics & Cohorts", desc: "Retention cohorts, conversion funnels, feature adoption, mood trend aggregates. Fully anonymized." },
                { name: "Model Configuration", desc: "Switch between GPT-4o / GPT-4o-mini per user tier, per feature. Cost monitoring per model." },
              ]
            },
            {
              title: "B2B Corporate Dashboard",
              subtitle: "لوحة الشركات",
              color: "border-chart-3/40",
              desc: "What HR teams see. Aggregate-only. No individual data ever exposed. Privacy-preserving by architecture.",
              modules: [
                { name: "Wellness Score Overview", desc: "Company-wide emotional wellness score (0–100). Week-over-week trends. Department breakdown." },
                { name: "Engagement Heatmap", desc: "When employees use UNS (time of day, day of week). No content access. Behavioral patterns only." },
                { name: "Risk Pulse (Anonymous)", desc: "Aggregate stress indicators. Trigger HR action when score drops below threshold. Zero individual data." },
                { name: "Program Manager", desc: "Assign wellness programs to departments. Track completion rates. Custom Ramadan/seasonal programs." },
                { name: "Employee Onboarding", desc: "SSO integration, bulk user provisioning, welcome email templates, onboarding progress tracking." },
                { name: "Quarterly Reports", desc: "Beautiful PDF reports for C-suite: wellness trends, program ROI, comparative benchmarks." },
              ]
            },
          ].map((panel, i) => (
            <div key={i} className={`bg-card border ${panel.color} rounded-2xl overflow-hidden`}>
              <div className="p-6 border-b border-white/5 bg-black/10">
                <div className="text-base font-semibold text-foreground">{panel.title}</div>
                <div className="text-sm text-primary arabic-text">{panel.subtitle}</div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{panel.desc}</p>
              </div>
              <div className="divide-y divide-white/5">
                {panel.modules.map((mod, mi) => (
                  <div key={mi} className="p-4">
                    <div className="text-xs font-semibold text-foreground mb-1">{mod.name}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-6">Configurable AI System (Per Market)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold text-primary mb-4">What Can Be Configured</div>
              <div className="space-y-3">
                {[
                  { param: "Dialect", values: "MSA, Gulf, Levant, Egyptian, Maghrebi", desc: "Primary dialect for companion responses" },
                  { param: "Tone intensity", values: "Formal | Semi-formal | Casual", desc: "Adjusts vocabulary and register" },
                  { param: "Spiritual layer", values: "Enabled | Disabled | User choice", desc: "Islamic mindfulness integration" },
                  { param: "Crisis threshold", values: "Conservative | Standard | Sensitive", desc: "Sensitivity of crisis detection classifier" },
                  { param: "Family mode", values: "Enabled | Disabled", desc: "Age-appropriate content filtering" },
                  { param: "Topic restrictions", values: "Configurable per market", desc: "Topics requiring human escalation in regulated markets" },
                ].map((item, i) => (
                  <div key={i} className="bg-muted/20 rounded-lg p-3 border border-card-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary font-semibold">{item.param}</span>
                      <span className="text-xs text-muted-foreground">→ {item.values}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-primary mb-4">Privacy Guarantees in B2B Context</div>
              <div className="space-y-3">
                {[
                  "HR admins see aggregate scores — never individual conversations",
                  "Employee data is owned by the employee, not the company",
                  "Company cannot request individual user data deletion on behalf of employees",
                  "Anonymous crisis alerts: HR knows 'someone needs help' not 'Ahmed needs help'",
                  "Employees can opt out of aggregate reporting (ultra-privacy mode)",
                  "GDPR right to portability: employees can export their own data regardless of company",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-chart-4 shrink-0 mt-0.5">🛡</span>
                    <span className="text-foreground/70 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
