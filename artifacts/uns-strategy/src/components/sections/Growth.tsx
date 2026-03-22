export function Growth() {
  return (
    <section id="growth" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">09</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Growth to 1M Users</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">النمو والتوسع</h2>
        <p className="text-muted-foreground mb-10">From 0 to 1,000,000 users across 3 phases and 36 months.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { phase: "Phase 1", arabic: "المرحلة الأولى", range: "Months 0–6", target: "10,000 users", color: "border-primary/40 bg-primary/5", strategy: "Creator-led organic growth + Gulf market seeding", channels: ["TikTok/Instagram Arabic mental health creators", "Micro-influencer gifted access program", "Product Hunt Arabic community", "App Store ASO: Arabic keywords", "Viral mood cards (shareable, beautiful, no data)"] },
            { phase: "Phase 2", arabic: "المرحلة الثانية", range: "Months 6–18", target: "100,000 users", color: "border-chart-3/40 bg-chart-3/5", strategy: "Ramadan moment + B2B pilots + word-of-mouth flywheel", channels: ["Ramadan 2027 campaign: 30 days wellness journey", "3 corporate HR pilot programs (UAE/KSA)", "University partnerships: AUS, KAUST, AUC", "Arabic podcast sponsorships (mental health angle)", "Referral program: share your رفيق"] },
            { phase: "Phase 3", arabic: "المرحلة الثالثة", range: "Months 18–36", target: "1,000,000 users", color: "border-accent/40 bg-accent/5", strategy: "Regional expansion + enterprise + PR momentum", channels: ["Egypt & Levant dialect launch", "Enterprise contracts: government & banking", "Media partnerships: Shahid, MBC, Spotify Arabia", "Series A press + international visibility", "Arabic diaspora communities (UK, France, US)"] },
          ].map((p, i) => (
            <div key={i} className={`border ${p.color} rounded-2xl p-6`}>
              <div className="text-xs font-mono text-muted-foreground mb-1">{p.range}</div>
              <div className="text-lg font-bold text-foreground">{p.phase}</div>
              <div className="text-sm text-primary arabic-text mb-3">{p.arabic}</div>
              <div className="text-2xl font-bold text-foreground mb-2">{p.target}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{p.strategy}</p>
              <div className="space-y-2">
                {p.channels.map((c, ci) => (
                  <div key={ci} className="flex items-start gap-2 text-xs text-foreground/70">
                    <span className="text-primary shrink-0">→</span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 mb-8">
          <h3 className="text-base font-semibold text-foreground mb-6">Core Growth Mechanics</h3>
          <div className="space-y-6">
            {[
              {
                title: "The Mood Card Viral Loop",
                desc: "Weekly/monthly emotional summary rendered as a beautiful visual card. User shares on Instagram/WhatsApp/Twitter. Card shows mood patterns (no sensitive data) with UNS branding. Followers ask 'ما هذا؟' (what is this?). UNS link in bio converts.",
                impact: "Estimated 3–5 new users per share from engaged users. Zero cost.",
                emoji: "📊"
              },
              {
                title: "Ramadan Moment (Recurring Annual Growth Spike)",
                desc: "Ramadan is the single most emotionally heightened month in the Arabic calendar — reflection, family, spirituality, and often depression/loneliness peak simultaneously. A 30-day 'Ramadan Journey' program launched annually creates massive app store spikes, press, and word-of-mouth.",
                impact: "2–3× monthly downloads during Ramadan. Converts to year-round retention.",
                emoji: "🌙"
              },
              {
                title: "The Stigma De-stigmatization Campaign",
                desc: "Partner with 5–10 Arabic mental health advocates (not celebrities) to share their personal struggles. UNS positions itself as 'the companion I wish I'd had.' Campaign: #كلنا نحتاج_رفيق. Not therapy advocacy — companion advocacy.",
                impact: "Changes the conversation. Creates emotional permission for millions to try.",
                emoji: "💙"
              },
              {
                title: "B2B HR → B2C Employee Flywheel",
                desc: "When a company deploys UNS for employees, those employees use it personally and refer it to family. B2B acquisition becomes B2C acquisition engine. One enterprise contract creates 500+ individual users with zero additional CAC.",
                impact: "B2B is the cheapest B2C acquisition channel at scale.",
                emoji: "🏢"
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 bg-muted/20 rounded-xl p-5 border border-card-border">
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">{item.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">Impact:</span>
                    <span className="text-xs text-foreground/70">{item.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { metric: "CAC Target", value: "$2–5", sub: "B2C, organic-led" },
            { metric: "CAC (B2B)", value: "$500–2K", sub: "Per enterprise deal" },
            { metric: "D7 Retention", value: ">35%", sub: "Industry average is 15%" },
            { metric: "NPS Target", value: ">65", sub: "Category-defining score" },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-primary mb-1">{item.value}</div>
              <div className="text-xs font-semibold text-foreground mb-1">{item.metric}</div>
              <div className="text-xs text-muted-foreground">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
