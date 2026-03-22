export function Monetization() {
  return (
    <section id="monetization" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">08</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Monetization Strategy</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">استراتيجية الإيرادات</h2>
        <p className="text-muted-foreground mb-10">Freemium to premium. Individual to enterprise. Trust before revenue.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              name: "أُنس Free", tier: "free", price: "$0", period: "forever",
              color: "border-card-border",
              features: ["Daily mood check-in (limited)", "3 companion conversations/day", "Basic emotional insights", "1 guided program", "Crisis resources always available"],
              purpose: "Acquisition engine. Get users hooked on the relationship. The companion creates need for premium.",
              cta: "Start free"
            },
            {
              name: "أُنس+", tier: "premium", price: "$8.99", period: "per month",
              color: "border-primary/50",
              features: ["Unlimited companion conversations", "Full emotional memory (unlimited history)", "Voice interaction (Arabic TTS/STT)", "All guided programs", "Smart nudges & lock screen widget", "Full insights dashboard", "Export emotional journal"],
              purpose: "Core revenue. $8.99/mo × 24-month LTV = $215 per user. Target: 60% conversion from engaged free users.",
              cta: "Upgrade to أُنس+"
            },
            {
              name: "أُنس Family", tier: "family", price: "$14.99", period: "per month",
              color: "border-chart-3/40",
              features: ["3 family profiles", "All أُنس+ features per profile", "Parental insights mode (teens)", "Family wellness reports", "Separate companion for each member"],
              purpose: "Increases ARPU significantly. Reduces churn via social/family network effects. Arabic family unit is the natural share unit.",
              cta: "Get family plan"
            },
          ].map((plan, i) => (
            <div key={i} className={`bg-card border ${plan.color} rounded-2xl p-6 flex flex-col ${plan.tier === "premium" ? "ring-1 ring-primary/30" : ""}`}>
              {plan.tier === "premium" && (
                <div className="text-xs text-center text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1 mb-4 font-semibold uppercase tracking-wider">
                  Recommended
                </div>
              )}
              <div className="text-lg font-bold text-foreground mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <div className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-start gap-2">
                    <span className="text-primary text-xs mt-0.5 shrink-0">✓</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground italic leading-relaxed">{plan.purpose}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-chart-3/10 border border-primary/20 rounded-2xl p-8 mb-8">
          <h3 className="text-base font-semibold text-foreground mb-6">B2B: رفيق للمؤسسات (Murafiq for Teams)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">$6</div>
              <div className="text-sm text-muted-foreground mb-4">per employee / per month</div>
              <div className="space-y-2">
                {[
                  "Aggregate employee wellness dashboard",
                  "No individual data exposed — privacy preserved",
                  "Department-level mood trend reports",
                  "Crisis alert system (anonymous escalation)",
                  "Customizable wellness programs",
                  "Admin control panel + SAML SSO",
                  "Quarterly wellness reports for leadership",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-primary text-xs shrink-0">✓</span>
                    <span className="text-xs text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-card border border-card-border rounded-xl p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Revenue Model</div>
                {[
                  { scale: "100 employees", mrr: "$600 MRR", arr: "$7,200 ARR" },
                  { scale: "500 employees", mrr: "$3,000 MRR", arr: "$36,000 ARR" },
                  { scale: "1,000 employees", mrr: "$6,000 MRR", arr: "$72,000 ARR" },
                  { scale: "5,000 employees", mrr: "$30,000 MRR", arr: "$360,000 ARR" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-xs">
                    <span className="text-muted-foreground">{row.scale}</span>
                    <span className="text-foreground font-medium">{row.mrr}</span>
                    <span className="text-primary font-semibold">{row.arr}</span>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-card-border rounded-xl p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target B2B Markets</div>
                <div className="space-y-2">
                  {["UAE government & corporate sector", "KSA Vision 2030 aligned enterprises", "Regional banks (NBD, Al Rajhi, QNB)", "Universities & educational institutions"].map((m, i) => (
                    <div key={i} className="text-xs text-foreground/70">→ {m}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Target LTV (B2C)", value: "$180", sub: "24-month average retention target at $8.99/mo" },
            { label: "Free → Premium Conversion", value: "15%", sub: "Of engaged users (7+ days active). Industry benchmark is 3-5%; we target 3× due to emotional moat." },
            { label: "B2B Contract ACV", value: "$50K+", sub: "Average annual contract value for enterprise clients with 500+ employees" },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
              <div className="text-xs font-semibold text-foreground mb-2">{item.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-6">
          <div className="text-sm font-semibold text-destructive mb-2">Non-Negotiable: No Data Monetization</div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            UNS will never sell emotional data, never build advertising profiles, never share personal wellness insights with third parties for commercial purposes. This is not a legal policy — it is a founding principle. The moment users suspect their pain is a product being sold, the company is over. Trust is the product. Protect it like the business depends on it, because it does.
          </p>
        </div>
      </div>
    </section>
  );
}
