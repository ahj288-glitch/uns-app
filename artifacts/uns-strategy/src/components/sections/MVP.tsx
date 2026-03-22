export function MVP() {
  return (
    <section id="mvp" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">13</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">MVP Definition</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">المنتج الأدنى القابل للتطبيق</h2>
        <p className="text-muted-foreground mb-8">The MVP must feel like a product, not a prototype. 8 weeks. Ship something that creates real emotional bonds.</p>

        <div className="bg-card border border-primary/20 rounded-2xl p-8 mb-8">
          <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">MVP Scope Principle</div>
          <p className="text-base text-foreground leading-relaxed">
            Build the minimum experience that makes a user feel genuinely understood by an Arabic AI companion. If the user doesn't think "هذا يفهمني" (this understands me) after 3 interactions, the MVP has failed — regardless of how technically complete it is.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-chart-4/40 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-chart-4 text-lg">✓</span>
              <h3 className="text-sm font-semibold text-foreground">IN MVP (Build This)</h3>
            </div>
            <div className="space-y-3">
              {[
                { feature: "Emotional Fingerprint Onboarding", detail: "3-screen Arabic conversation. Dialect selector. Companion introduction. No forms." },
                { feature: "Daily Mood Check-in", detail: "Beautiful Arabic mood word selector. Animated bloom. 30-second ritual." },
                { feature: "Companion Chat (Arabic GPT-4o)", detail: "Full conversation. Dialect-aware. Emotional tone. Memory of session history." },
                { feature: "7-day Emotional Memory", detail: "Compressed memory of last 7 days. Companion references it naturally." },
                { feature: "Crisis Detection + Safe Response", detail: "Arabic crisis classifier. Surface hotlines. Soft escalation in companion tone." },
                { feature: "iOS App (TestFlight beta)", detail: "Native iOS app. Polished, beautiful, production-quality design." },
                { feature: "Privacy Vault (Basic)", detail: "Conversation data encrypted. Clear privacy statement. Delete all data option." },
              ].map((item, i) => (
                <div key={i} className="border-b border-border/20 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs font-semibold text-foreground mb-0.5">{item.feature}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-destructive/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-destructive text-lg">✕</span>
              <h3 className="text-sm font-semibold text-foreground">NOT IN MVP (Defer This)</h3>
            </div>
            <div className="space-y-3">
              {[
                { feature: "Voice interaction", detail: "High complexity, high cost. Earns higher priority after emotional text bond established." },
                { feature: "B2B HR portal", detail: "Needs user base and enterprise sales process. Post-funding." },
                { feature: "Family plan", detail: "Complexity without validation. Build after individual product proven." },
                { feature: "Guided programs", detail: "Content-heavy. Build 1 basic program but not the full library." },
                { feature: "Advanced insights dashboard", detail: "Need enough data history to make insights meaningful. 30-day minimum." },
                { feature: "Android app", detail: "Gulf iOS penetration is 65%+. Ship iOS first, Android at 90-day mark." },
                { feature: "Community circles", detail: "Moderation complexity. Network effect requires critical mass first." },
              ].map((item, i) => (
                <div key={i} className="border-b border-border/20 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs font-semibold text-muted-foreground line-through mb-0.5">{item.feature}</div>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 mb-8">
          <h3 className="text-base font-semibold text-foreground mb-6">8-Week MVP Timeline</h3>
          <div className="space-y-4">
            {[
              { weeks: "Week 1–2", focus: "Foundation", items: ["API server + database setup", "OpenAI Arabic integration + system prompt engineering", "Crisis classifier training/fine-tuning", "Basic auth system (anonymous first, optional account)"] },
              { weeks: "Week 3–4", focus: "Core Companion", items: ["Onboarding conversation flow (3 screens)", "Companion chat interface (RTL, Arabic-first)", "Emotional memory system (7-day, vector)", "Daily check-in component"] },
              { weeks: "Week 5–6", focus: "Polish & Safety", items: ["Crisis detection integration + response flows", "Privacy vault encryption implementation", "UI polish: animations, micro-interactions, Arabic typography", "Dialect layer prompt testing (Gulf initial)"] },
              { weeks: "Week 7–8", focus: "Beta & Validation", items: ["TestFlight beta: 100 users", "Feedback collection and critical fixes", "App Store submission preparation", "Success metrics baseline: D7 retention, session length, NPS"] },
            ].map((week, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 text-right w-20">
                  <div className="text-xs font-mono text-primary font-semibold">{week.weeks}</div>
                  <div className="text-xs text-muted-foreground">{week.focus}</div>
                </div>
                <div className="flex-1 bg-muted/20 rounded-xl p-4 border border-card-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {week.items.map((item, ii) => (
                      <div key={ii} className="flex items-start gap-2 text-xs text-foreground/70">
                        <span className="text-primary shrink-0 mt-0.5">→</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { metric: "D7 Retention", target: "> 35%", benchmark: "Industry average: 15%", color: "border-primary/40" },
            { metric: "Average Session", target: "> 8 min", benchmark: "Depth of emotional engagement indicator", color: "border-chart-3/40" },
            { metric: "NPS Score", target: "> 60", benchmark: "Category-defining: >50 is excellent", color: "border-accent/40" },
          ].map((item, i) => (
            <div key={i} className={`bg-card border ${item.color} rounded-xl p-5 text-center`}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{item.metric}</div>
              <div className="text-3xl font-bold text-primary mb-1">{item.target}</div>
              <div className="text-xs text-muted-foreground">{item.benchmark}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
