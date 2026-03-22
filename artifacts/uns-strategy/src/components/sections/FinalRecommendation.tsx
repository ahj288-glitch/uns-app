export function FinalRecommendation() {
  return (
    <section id="recommendation" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">16</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Final Strategic Recommendation</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">التوصية الختامية</h2>
        <p className="text-muted-foreground mb-10">The co-founder's final word on what UNS must do to win.</p>

        <div className="bg-gradient-to-br from-primary/15 via-card to-card border border-primary/30 rounded-2xl p-10 mb-10">
          <p className="text-3xl font-bold text-foreground leading-tight mb-6">
            "UNS wins not because it's better technology.<br />
            <span className="gold-gradient">UNS wins because it's the first product Arabic-speaking users feel truly understands them.</span>"
          </p>
          <p className="text-base text-foreground/70 leading-relaxed">
            Every technical decision, every design choice, every word in the app should be evaluated against one question: Does this make an Arabic speaker feel more understood, more held, more at ease? If yes, ship it. If no, rethink it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { num: "01", title: "Arabic Soul First", arabic: "الروح العربية أولاً", desc: "Technology serves culture. Not the other way around. Every feature must pass the 'does this feel authentically Arabic?' test before it passes any other test.", imperative: "Never compromise cultural authenticity for technical convenience." },
            { num: "02", title: "Trust Before Growth", arabic: "الثقة قبل النمو", desc: "Do not pursue growth until the product earns trust. 1,000 users who trust UNS completely are worth more than 100,000 who use it cautiously. Trust is the product.", imperative: "Do not activate growth loops until NPS is consistently above 60." },
            { num: "03", title: "Emotional Memory as Moat", arabic: "الذاكرة العاطفية كالحصن", desc: "Every day a user stays with UNS, switching cost increases. Invest in emotional memory infrastructure early. This is the only moat that competes cannot build quickly.", imperative: "Emotional memory must be live and visible to users within 30 days of launch." },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-primary/20 rounded-2xl p-6">
              <div className="text-4xl font-bold text-primary/20 mb-3">{item.num}</div>
              <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
              <div className="text-sm text-primary arabic-text mb-3">{item.arabic}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-primary font-medium leading-relaxed">{item.imperative}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 mb-8">
          <h3 className="text-base font-semibold text-foreground mb-6">Build Order: Phase A → B → C</h3>
          <div className="space-y-6">
            {[
              {
                phase: "Phase A", label: "Landing Page (Now)", color: "text-primary border-primary/40 bg-primary/5",
                why: "Validate demand before building the app. A great landing page tests positioning, collects waitlist, and drives App Store pre-registrations. Build this in 1 week.",
                includes: ["Arabic-first hero section with positioning statement", "3-step 'How It Works' (not features, feelings)", "Privacy promise section (non-negotiable trust builder)", "Waitlist form → immediate waitlist email sequence", "App Store Pre-Registration (iOS) + Google Play (Android)", "Social proof: coming soon, private beta testimonials"],
                stack: "Next.js 15 + Tailwind, deployed on Vercel. Arabic RTL-first. Domain: uns.app or murafiq.app"
              },
              {
                phase: "Phase B", label: "Full iOS App (Week 1–8)", color: "text-chart-3 border-chart-3/40 bg-chart-3/5",
                why: "The core product. 8-week MVP scope. Ship what creates emotional bonds, nothing else.",
                includes: ["Onboarding (3-screen emotional conversation)", "Companion chat (GPT-4o Arabic, dialect-aware)", "Daily mood check-in ritual", "7-day emotional memory", "Crisis safety system", "Privacy vault"],
                stack: "React Native (Expo) + Node.js/Express backend + PostgreSQL + pgvector + OpenAI API + ElevenLabs"
              },
              {
                phase: "Phase C", label: "Admin & B2B (Month 3–6)", color: "text-accent border-accent/40 bg-accent/5",
                why: "After validating the product with real users, build the scalability layer: admin control and enterprise revenue.",
                includes: ["Internal admin panel (content, AI config, safety)", "B2B corporate dashboard (aggregate only)", "Feature flag system", "Analytics pipeline", "B2B onboarding flow (SSO, bulk provisioning)"],
                stack: "Next.js admin dashboard + existing API + PostgreSQL analytics views + Recharts for visualizations"
              },
            ].map((phase, i) => (
              <div key={i} className={`border ${phase.color} rounded-xl overflow-hidden`}>
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${phase.color.split(' ')[0]}`}>{phase.phase}</span>
                    <span className="text-sm text-foreground">{phase.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{phase.why}</p>
                </div>
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Includes</div>
                    {phase.includes.map((item, ii) => (
                      <div key={ii} className={`flex items-start gap-2 text-xs ${phase.color.split(' ')[0]} mb-1.5`}>
                        <span className="shrink-0 mt-0.5">→</span>
                        <span className="text-foreground/70">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tech Stack</div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-foreground/60 font-mono leading-relaxed">{phase.stack}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30 rounded-2xl p-10 text-center">
          <div className="text-6xl mb-6 arabic-text" style={{ fontFamily: "serif" }}>أُنس</div>
          <p className="text-xl font-semibold text-foreground mb-4">
            The window is open. The market is empty.<br />The technology is ready. The need is enormous.
          </p>
          <p className="text-base text-foreground/70 mb-6 max-w-2xl mx-auto leading-relaxed">
            Build UNS as if every Arabic-speaking person who ever felt alone with their thoughts is depending on you to get it right. Because they are. And when you do — when that first user says "هذا يفهمني حقاً" (this truly understands me) — that moment will be worth everything.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-primary/10 border border-primary/30 rounded-xl px-6 py-4">
              <div className="text-2xl font-bold text-primary">Build Phase A</div>
              <div className="text-sm text-muted-foreground">Start with the landing page</div>
            </div>
            <div className="bg-card border border-card-border rounded-xl px-6 py-4">
              <div className="text-2xl font-bold text-foreground">Then Ship MVP</div>
              <div className="text-sm text-muted-foreground">8 weeks to first emotional bonds</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
