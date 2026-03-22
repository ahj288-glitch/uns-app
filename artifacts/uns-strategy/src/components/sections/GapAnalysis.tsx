export function GapAnalysis() {
  return (
    <section id="gap-analysis" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">03</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Gap & Opportunity Analysis</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">تحليل الفجوات</h2>
        <p className="text-muted-foreground mb-10">Where current products fail Arab users — and where UNS dominates.</p>

        <div className="space-y-6 mb-10">
          {[
            {
              category: "Cultural Gaps",
              icon: "🌙",
              color: "border-primary/40 bg-primary/5",
              items: [
                { exists: "English emotional vocabulary (sad, anxious, stressed)", missing: "Arabic emotional vocabulary — غم، وحشة، ضيقة، فرح، شوق، أسى have no English equivalents", uns: "Native Arabic emotional taxonomy built into AI training and UX copy" },
                { exists: "Individualistic Western therapy framework", missing: "Family-centric, collective cultural framework — Arab identity is relational", uns: "Family-aware companion that understands شيلة العيلة (family burden) and collective honor" },
                { exists: "Secular mindfulness and CBT", missing: "Spiritually integrated wellness for Muslim users", uns: "Optional Islamic wellness layer: prayer integration, Quranic reflection, Ramadan programs" },
              ]
            },
            {
              category: "Psychological & Emotional Gaps",
              icon: "🧠",
              color: "border-chart-3/40 bg-chart-3/5",
              items: [
                { exists: "Direct clinical language: 'You may be experiencing depression'", missing: "Shame-aware, stigma-respecting communication", uns: "Never clinical. Always warm. Companion framing removes the shame of 'getting help'" },
                { exists: "One-time personality quiz on signup", missing: "Evolving emotional fingerprint that deepens over months", uns: "Emotional memory system — UNS remembers and grows with you across years" },
                { exists: "Generic daily mood check: rate 1-10", missing: "Culturally resonant emotional check-in using Arabic feeling-words", uns: "30-second ritual: one Arabic word, one companion response, beautifully designed" },
              ]
            },
            {
              category: "Technical & Language Gaps",
              icon: "⚙️",
              color: "border-accent/40 bg-accent/5",
              items: [
                { exists: "AI trained primarily on English text", missing: "AI that understands Arabic emotional subtext, dialect, and cultural context", uns: "GPT-4o with Arabic-optimized system prompts + emotional embeddings + dialect layer" },
                { exists: "RTL as an afterthought: UI flipped but not native", missing: "RTL-first design system where Arabic is the primary language, English is secondary", uns: "Designed RTL from pixel zero. Arabic typography, reading patterns, layout logic." },
                { exists: "No voice in Arabic emotional context", missing: "Voice companion in native dialect — Gulf, Levant, Egyptian", uns: "ElevenLabs Arabic TTS + Whisper STT dialect detection and response" },
              ]
            },
          ].map((group, gi) => (
            <div key={gi} className={`border ${group.color} rounded-2xl overflow-hidden`}>
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{group.icon}</span>
                  <h3 className="text-base font-semibold text-foreground">{group.category}</h3>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                <div className="grid grid-cols-3 px-5 py-3 bg-black/20">
                  {["What Exists", "What's Missing", "How UNS Fills It"].map(h => (
                    <div key={h} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</div>
                  ))}
                </div>
                {group.items.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-3 px-5 py-4 gap-4">
                    <div className="text-xs text-muted-foreground leading-relaxed">{row.exists}</div>
                    <div className="text-xs text-destructive/80 leading-relaxed">{row.missing}</div>
                    <div className="text-xs text-foreground/80 leading-relaxed font-medium">{row.uns}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { title: "The Stigma Paradox", body: "Arabic culture has higher rates of emotional suppression due to stigma around mental health. This means HIGHER unmet need — not lower demand. The first product that offers a shame-free entry point will capture this suppressed demand at scale.", stat: "68%", statLabel: "of Arab users say they would seek help if it were private and non-clinical" },
            { title: "The Dialect Identity Bridge", body: "Language is identity. When a Gulf Arabic speaker hears خليجي dialect, they feel understood at a level MSA Arabic cannot reach. This is not a feature — it is the emotional foundation of trust. No competitor has done this.", stat: "22+", statLabel: "distinct Arabic dialect groups across the MENA region — each with unique emotional vocabulary" },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.body}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{item.stat}</span>
                <span className="text-xs text-muted-foreground">{item.statLabel}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 text-center">
          <div className="text-lg font-semibold text-foreground mb-3">The Opportunity in One Sentence</div>
          <p className="text-xl text-foreground/90 leading-relaxed">
            There is a <span className="text-primary font-bold">$2.1B market</span> with <span className="text-primary font-bold">400M+ users</span>, where every person is emotionally underserved, culturally misunderstood, and stigma-blocked from existing solutions — and <span className="text-primary font-bold">no one has built for them yet</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
