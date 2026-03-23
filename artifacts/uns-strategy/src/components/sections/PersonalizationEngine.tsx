export function PersonalizationEngine() {
  return (
    <section id="personalization" className="py-16 px-8 lg:px-16 bg-card/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">18</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Personalization Engine</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            أُنْس adapts not just to what users say, but to how they are — over time, across sessions, and within the arc of a single conversation. The personalization engine is a layered inference system, not a preference selector.
          </p>
        </div>

        {/* Signal Stack */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Signal Stack — What We Observe</h3>
          <div className="space-y-3">
            {[
              { layer: "Explicit Signals", signals: ["Mood check-in selections", "Tone preference settings", "Dialect choice during onboarding", "Intention statements (sleep, anxiety, grief...)"], weight: "20%", color: "bg-primary/15 text-primary" },
              { layer: "Behavioral Signals", signals: ["Session length and frequency", "Which responses the user re-reads", "Abandoned messages (typed but not sent)", "Time of day usage patterns", "Streak consistency"], weight: "40%", color: "bg-accent/15 text-accent" },
              { layer: "Linguistic Signals", signals: ["Arabic dialect markers in free text", "Formality level shifts", "Emotional vocabulary richness", "Topics initiated vs topics deflected"], weight: "30%", color: "bg-violet-400/15 text-violet-400" },
              { layer: "Contextual Signals", signals: ["Day of week / time of day", "Seasonal context (Ramadan, exam season...)", "Streak milestone proximity", "Recent mood trajectory"], weight: "10%", color: "bg-amber-400/15 text-amber-400" },
            ].map(l => (
              <div key={l.layer} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.color}`}>Weight: {l.weight}</span>
                  <h4 className="font-semibold">{l.layer}</h4>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {l.signals.map(s => (
                    <span key={s} className="text-xs bg-background/50 text-muted-foreground px-2 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adaptation Outputs */}
        <div>
          <h3 className="text-xl font-semibold mb-6">What the Engine Changes</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                output: "AI Companion Tone",
                desc: "Shifts between warm, direct, gentle, reflective, and spiritually-informed registers based on user's linguistic cues and stated intention.",
                example: "User who uses formal Arabic + faith references → AI activates spiritual layer + formal register.",
              },
              {
                output: "Nudge Timing & Copy",
                desc: "Nudges are sent at the user's statistically most receptive window, derived from historical open-rate patterns per user.",
                example: "User who checks in between 8:30–9:00 AM → morning nudge is precision-timed, not broadcast.",
              },
              {
                output: "Home Screen UI",
                desc: "Time-of-day aware greetings, orb colors, and featured content adapt to the user's current contextual state.",
                example: "Late-night session → dark orb tones, 'Night Calm' content featured, gentler CTA copy.",
              },
              {
                output: "Program Recommendations",
                desc: "Wellness programs are ranked by predicted resonance based on the user's mood history, dialect, and engagement patterns.",
                example: "7-day anxiety-adjacent sessions → Anxiety Recovery program surfaced first with tailored entry framing.",
              },
              {
                output: "Emotional Fingerprint Card",
                desc: "The Share Your State card's aura color, tone, and quote are generated from the user's live emotional signal, not a generic template.",
                example: "User logs 'قلق' (anxious) for 3 days → Aura card shows amber hue + warm/reassurance tone quotes.",
              },
              {
                output: "XP & Gamification Multipliers",
                desc: "Streak multipliers and micro-win labels are personalised to the user's journey stage and emotional growth arc.",
                example: "User at 'Balance' level who breaks a streak → XP penalty reduced + compassionate re-entry message.",
              },
            ].map(o => (
              <div key={o.output} className="bg-card rounded-2xl p-5 border border-border/30">
                <h4 className="font-semibold mb-2 text-right">{o.output}</h4>
                <p className="text-sm text-muted-foreground mb-3 text-right leading-relaxed">{o.desc}</p>
                <div className="bg-primary/8 rounded-xl p-3 border border-primary/10">
                  <p className="text-xs text-primary italic leading-relaxed text-right">{o.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy guardrails */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-4">Privacy Architecture</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { principle: "On-device first", desc: "Mood history, behavioral patterns, and linguistic profiles are computed and stored on-device. Raw data never leaves." },
              { principle: "Differential privacy", desc: "Aggregate insights used for system improvement are mathematically anonymized before any server-side processing." },
              { principle: "User control", desc: "All personalization data is visible and deletable by the user at any time via the Profile screen's data management panel." },
            ].map(p => (
              <div key={p.principle} className="text-right">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center mb-3 ml-auto">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <h4 className="font-semibold mb-1">{p.principle}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
