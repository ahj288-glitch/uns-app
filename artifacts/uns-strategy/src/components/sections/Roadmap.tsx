export function Roadmap() {
  return (
    <section id="roadmap" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">14</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Phased Roadmap</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">خارطة الطريق</h2>
        <p className="text-muted-foreground mb-10">30 / 90 / 180 days. Ship with intention. Measure ruthlessly. Expand boldly.</p>

        <div className="space-y-8 mb-10">
          {[
            {
              phase: "30 Days", arabic: "٣٠ يوماً", label: "Private Beta", color: "border-primary", accent: "text-primary", bg: "bg-primary/10",
              targets: { users: "100", revenue: "$0", milestone: "iOS TestFlight Beta" },
              goals: ["Core companion (GPT-4o Arabic) shipped and stable", "Onboarding conversation (3-screen) fully polished", "Daily mood check-in ritual functional", "7-day emotional memory working", "Crisis detection live", "iOS build on TestFlight (100 testers)"],
              metrics: ["Beta NPS > 50", "D7 retention > 30% among beta users", "Average session > 6 min", "0 critical safety incidents"],
              keyDecision: "After 30 days: Is the companion creating real emotional connection? If yes, accelerate. If no, diagnose and fix before proceeding."
            },
            {
              phase: "90 Days", arabic: "٩٠ يوماً", label: "Public Launch", color: "border-chart-3", accent: "text-chart-3", bg: "bg-chart-3/10",
              targets: { users: "1,000", revenue: "$5K MRR", milestone: "App Store Public Launch" },
              goals: ["App Store launch (iOS)", "Android beta launch", "Voice interaction (ElevenLabs + Whisper)", "Full journaling feature with AI reflection", "First guided program: '21 Days to Inner Calm' (برنامج ٢١ يوم)", "Lock screen widget + smart nudge engine", "Paywall activated (أُنس+ subscription)"],
              metrics: ["1,000 registered users", "15% premium conversion", "D30 retention > 25%", "App Store rating > 4.7"],
              keyDecision: "After 90 days: Is premium converting? If yes, invest in growth. If no, re-examine the free/premium boundary."
            },
            {
              phase: "180 Days", arabic: "١٨٠ يوماً", label: "Scale & Enterprise", color: "border-accent", accent: "text-accent", bg: "bg-accent/10",
              targets: { users: "10,000", revenue: "$50K MRR", milestone: "Series A Preparation" },
              goals: ["3 enterprise B2B pilots (UAE/KSA companies)", "Insights dashboard (mood trends, weekly reports)", "Ramadan 2027 campaign launch", "Egyptian Arabic dialect layer", "Family plan launch", "Series A fundraising materials ready", "Partnership with 2 regional universities"],
              metrics: ["10,000 active users", "50K MRR combined B2C + B2B", "3 signed enterprise contracts", "D90 retention > 20%"],
              keyDecision: "After 180 days: This is the Series A decision point. Data should tell the story clearly."
            },
          ].map((phase, i) => (
            <div key={i} className={`border ${phase.color} ${phase.bg} rounded-2xl overflow-hidden`}>
              <div className="p-6 border-b border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-2xl font-bold ${phase.accent}`}>{phase.phase}</span>
                      <span className={`text-xl arabic-text ${phase.accent}`}>{phase.arabic}</span>
                    </div>
                    <div className="text-base font-semibold text-foreground">{phase.label}</div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground">Users</div>
                      <div className={`text-lg font-bold ${phase.accent}`}>{phase.targets.users}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                      <div className={`text-lg font-bold ${phase.accent}`}>{phase.targets.revenue}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Milestone</div>
                      <div className="text-xs font-medium text-foreground mt-1">{phase.targets.milestone}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Deliverables</div>
                  <div className="space-y-2">
                    {phase.goals.map((goal, gi) => (
                      <div key={gi} className="flex items-start gap-2 text-xs text-foreground/70">
                        <span className={`${phase.accent} shrink-0`}>→</span>
                        {goal}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Success Metrics</div>
                  <div className="space-y-2">
                    {phase.metrics.map((metric, mi) => (
                      <div key={mi} className="flex items-start gap-2 text-xs text-foreground/70">
                        <span className="text-chart-4 shrink-0">✓</span>
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Decision</div>
                  <p className="text-xs text-foreground/80 italic leading-relaxed">{phase.keyDecision}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
