export function ObservabilityAndQA() {
  const monitoringPillars = [
    { area: "AI Response Quality", metrics: "Hallucination rate, crisis detection recall, dialect accuracy score, response latency P50/P95/P99", alertThreshold: "Latency >3s for 5% of requests", tooling: "Custom eval suite + LangFuse" },
    { area: "Provider Health", metrics: "Provider uptime, error rate by provider, failover trigger frequency, fallback success rate", alertThreshold: "Any provider error rate >2% over 5 min", tooling: "Prometheus + PagerDuty" },
    { area: "User Journey Funnel", metrics: "Onboarding completion, D1/D7/D30 retention, session start rate, journal initiation", alertThreshold: "D1 retention drops >15% week-over-week", tooling: "Mixpanel + custom BI" },
    { area: "Error Concentration", metrics: "Top 5 errors by volume, new errors introduced per release, error → churn correlation", alertThreshold: "Any E-SAF (safety) error increase >10% daily", tooling: "Sentry + error taxonomy system" },
    { area: "Moderation & Safety", metrics: "Crisis detection triggers per 1K sessions, false positive rate, escalation response time", alertThreshold: "Escalation response >15 min for active crisis event", tooling: "Custom safety dashboard + Slack alerts" },
    { area: "Infrastructure", metrics: "API response time, DB query latency, cache hit rate, CDN performance, pod health", alertThreshold: "API P99 >2s or DB >500ms for >1 min", tooling: "Datadog APM + CloudWatch" },
  ];

  const testingLevels = [
    { level: "Unit Tests", scope: "Individual functions, error formatters, personalization logic, streak calculations", coverage: ">85% of business logic", cadence: "Every commit" },
    { level: "Integration Tests", scope: "API endpoint contracts, database operations, mood check-in → XP award pipeline", coverage: "All critical user paths", cadence: "Every PR" },
    { level: "AI Response Tests", scope: "Prompt regression suite: 200+ test scenarios covering crisis, dialect, tone, hallucination risks", coverage: "Weekly automated red-team", cadence: "Pre-release + weekly" },
    { level: "End-to-End Tests", scope: "Full user journeys: onboarding → mood → chat → share → journal → profile", coverage: "Top 10 user flows", cadence: "Pre-release" },
    { level: "Localization Tests", scope: "Arabic RTL rendering, font fallback, dialect-specific copy, date/time formatting", coverage: "All 4 dialect variants", cadence: "Pre-release" },
    { level: "Safety Regression Tests", scope: "Crisis phrase detection recall, moderation block accuracy, safe message pass-through", coverage: "Full crisis taxonomy", cadence: "Every model/prompt change" },
    { level: "Load Testing", scope: "10K concurrent users, peak Ramadan scenario (3× normal), burst traffic handling", coverage: "Core API endpoints", cadence: "Pre-scale milestones" },
  ];

  const releaseGates = [
    "All unit + integration tests passing",
    "AI response regression suite: 0 new failures",
    "Crisis detection recall ≥ 98% on test suite",
    "End-to-end test run complete with 0 critical failures",
    "Localization review signed off for affected copy",
    "Security review for any new data flow",
    "Feature flag configured for staged rollout (5% → 25% → 100%)",
    "Rollback procedure documented and verified",
    "On-call engineer briefed for release window",
  ];

  return (
    <section id="observability-qa" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">24</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">QA, Observability & Operational Reliability</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            أُنْس is a trust product. A single crisis detection failure, AI hallucination in an emotional moment, or privacy breach could cause irreversible damage. Quality is not a phase — it is an operational culture built into every release and every runtime hour.
          </p>
        </div>

        {/* Reliability Philosophy */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { principle: "Emotionally Safe by Default", detail: "When in doubt, the system errs on the side of safety. A false positive crisis escalation is better than a missed one." },
            { principle: "Observable at All Times", detail: "No aspect of the system should be a black box at 2AM when an alert fires. Every service, model, and pipeline has metrics." },
            { principle: "Fail Gracefully, Always", detail: "Every failure state has a user-facing fallback, internal alert, and documented recovery path. No silent failures." },
          ].map(p => (
            <div key={p.principle} className="bg-card rounded-2xl p-5 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary mb-3" />
              <h4 className="font-semibold mb-2 text-sm">{p.principle}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Monitoring Pillars */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Observability Pillars</h3>
          <div className="space-y-3">
            {monitoringPillars.map(m => (
              <div key={m.area} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="font-semibold text-sm">{m.area}</h4>
                  <span className="text-xs font-mono bg-primary/8 text-primary px-2 py-0.5 rounded-full shrink-0">{m.tooling}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Metrics</p>
                    <p className="leading-relaxed">{m.metrics}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Alert Threshold</p>
                    <p className="leading-relaxed text-amber-400">{m.alertThreshold}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testing Pyramid */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Quality Assurance Architecture</h3>
          <div className="space-y-2">
            {testingLevels.map((t, i) => (
              <div key={t.level} className="bg-card rounded-2xl p-4 border border-border/30">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary font-mono">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{t.level}</h4>
                      <p className="text-xs text-muted-foreground">{t.scope}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className="text-muted-foreground">{t.coverage}</span>
                    <span className="bg-primary/8 text-primary px-2 py-0.5 rounded-full">{t.cadence}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Release Gates */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-2">Release Quality Gates</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Every production release must clear all of the following gates. No exceptions for "minor" releases. No "we'll fix it in the next patch" for safety-adjacent features.
          </p>
          <div className="grid md:grid-cols-2 gap-2">
            {releaseGates.map((gate, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded border border-primary/30 bg-primary/8 flex items-center justify-center mt-0.5 shrink-0">
                  <span className="text-primary text-xs">✓</span>
                </div>
                {gate}
              </div>
            ))}
          </div>
        </div>

        {/* Incident Management */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-4">Incident Severity Classification</h3>
          <div className="space-y-3">
            {[
              { sev: "P0 — Critical", color: "text-red-400", examples: "Safety detection offline, all AI providers down, data breach suspected", response: "Immediate page. All hands. Executive notification within 15 min." },
              { sev: "P1 — High", color: "text-amber-400", examples: "Single AI provider down, >5% error rate spike, onboarding broken", response: "On-call engineer response within 30 min. Rollback within 1 hour if no fix." },
              { sev: "P2 — Medium", color: "text-yellow-400", examples: "Specific feature degraded, elevated latency, non-critical analytics gap", response: "Next business day fix. Monitoring increase. User communication if visible." },
              { sev: "P3 — Low", color: "text-primary", examples: "Minor UI bug, non-blocking analytics anomaly, cosmetic issue", response: "Backlogged and scheduled in next sprint." },
            ].map(s => (
              <div key={s.sev} className="flex items-start gap-4">
                <span className={`font-mono text-xs font-bold shrink-0 w-28 pt-0.5 ${s.color}`}>{s.sev}</span>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-0.5">Examples: {s.examples}</p>
                  <p className="text-xs text-foreground">{s.response}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
