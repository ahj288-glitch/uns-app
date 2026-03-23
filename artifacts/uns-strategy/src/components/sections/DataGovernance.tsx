export function DataGovernance() {
  const dataModels = [
    { model: "Mood Event Model", fields: "sessionId, moodWord (Arabic), moodWord (EN), intensity 1–5, timestamp, dialect, context (check-in source)", retention: "Indefinite (exportable)", sensitivity: "High", analytics: "Mood trend, daily habit analysis" },
    { model: "Companion Session Model", fields: "sessionId, userId (hashed), dialect, messageCount, crisisFlag, aiProvider, latency, startTime, endTime", retention: "12 months rolling", sensitivity: "Very High", analytics: "Session quality, provider health, safety" },
    { model: "Journal Entry Model", fields: "entryId, userId (hashed), encryptedContent, moodSnapshot, tags, wordCount, timestamp, promptId (if prompted)", retention: "User-controlled", sensitivity: "Critical", analytics: "Aggregate pattern only — never individual content" },
    { model: "Progression Model", fields: "userId (hashed), xpTotal, currentLevel, streakDays, completedLoops, microWins[], lastCheckin", retention: "Indefinite", sensitivity: "Medium", analytics: "Engagement funnel, level distribution, streak analysis" },
    { model: "Nudge Event Model", fields: "nudgeId, userId (hashed), deliveredAt, openedAt, actionTaken, context (time, moodState), channel", retention: "6 months", sensitivity: "Medium", analytics: "Open rates, behavioral intervention effectiveness" },
    { model: "Provider Event Model", fields: "requestId, provider, latencyMs, status, errorCode, fallbackTriggered, timestamp", retention: "90 days", sensitivity: "Low", analytics: "Provider reliability, cost modeling, failover frequency" },
    { model: "Moderation Event Model", fields: "eventId, contentType, triggerType (crisis/abuse/moderation), severity, action, reviewedAt, outcome", retention: "12 months", sensitivity: "High", analytics: "Safety pattern analysis, policy effectiveness" },
    { model: "User Preference Model", fields: "userId (hashed), dialect, notifPrefs{}, contentPrefs{}, privacyMode, consentVersion, updatedAt", retention: "Lifetime of account", sensitivity: "Medium", analytics: "Segmentation, personalization engine inputs" },
  ];

  const governancePrinciples = [
    { principle: "Single Source of Truth", detail: "Every metric has a documented owner and canonical definition. 'Daily Active Users' means the same thing across every dashboard, team, and report." },
    { principle: "Anonymization First", detail: "All analytics pipelines work on hashed user IDs. No PII in dashboards. Individual data only accessible for crisis review with audit log." },
    { principle: "Retention Policy Enforcement", detail: "Automated data lifecycle jobs run nightly. Expired data is purged on schedule — not held 'just in case'. Retention exceptions require legal sign-off." },
    { principle: "Experiment Data Separation", detail: "A/B test data flows into a separate experiment data warehouse. Production metrics are never contaminated by test variants." },
    { principle: "Metric Governance Board", detail: "A monthly cross-functional meeting validates metric definitions, flags inconsistencies, and approves changes to core KPI definitions." },
  ];

  const experimentingFramework = [
    { element: "Hypothesis Registry", detail: "Every experiment requires a written hypothesis, success criteria, guardrail metrics, and expected impact estimate — before any code is written." },
    { element: "Guardrail Metrics", detail: "Each experiment is monitored against non-negotiable guardrails: crisis detection recall cannot drop, D7 retention cannot fall >10%, safety events cannot increase." },
    { element: "Minimum Sample Sizes", detail: "Statistical significance required before decision. No 'gut feel' ship decisions. Minimum 95% confidence, minimum 100 users per variant for behavioral experiments." },
    { element: "Rollback Protocol", detail: "Every experiment has a defined rollback trigger. If guardrails breach, automated rollback within 15 minutes. No manual intervention required for P0 triggers." },
    { element: "Prompt Experiments", detail: "AI prompt changes require their own experiment registry. Emotional quality scoring (manual + automated) must improve or hold before ship." },
    { element: "Readout Culture", detail: "Experiment results — including failures — are published in a shared learning log. Negative results are celebrated as much as positive ones." },
  ];

  return (
    <section id="data-governance" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">26</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Data Governance, Experimentation & Analytics Integrity</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A product that makes decisions about users' emotional states must make decisions about itself with equal rigor. The data architecture defines how أُنْس learns, how it measures success, and how it ensures that its understanding of users never drifts into noise or misrepresentation.
          </p>
        </div>

        {/* Core Principle */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-5">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-semibold text-foreground">The Analytics Integrity Rule:</span> If a metric can't be consistently reproduced by two different engineers querying the same date range, it isn't a real metric yet.
          </p>
        </div>

        {/* Data Models */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Core Data Models</h3>
          <div className="space-y-2">
            {dataModels.map(d => (
              <div key={d.model} className="bg-card rounded-2xl p-4 border border-border/30">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-sm">{d.model}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.sensitivity === "Critical" ? "bg-red-500/10 text-red-400" :
                      d.sensitivity === "Very High" ? "bg-amber-500/10 text-amber-400" :
                      d.sensitivity === "High" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-primary/8 text-primary"
                    }`}>{d.sensitivity}</span>
                    <span className="text-xs text-muted-foreground">{d.retention}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Fields: <span className="text-foreground/60">{d.fields}</span></p>
                <p className="text-xs text-primary">Analytics: {d.analytics}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Governance Principles */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Analytics Governance Principles</h3>
          <div className="space-y-3">
            {governancePrinciples.map(p => (
              <div key={p.principle} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{p.principle}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experimentation Framework */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Experimentation Framework</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {experimentingFramework.map(e => (
              <div key={e.element} className="bg-card rounded-2xl p-5 border border-border/30">
                <h4 className="font-semibold text-sm mb-2">{e.element}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{e.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
