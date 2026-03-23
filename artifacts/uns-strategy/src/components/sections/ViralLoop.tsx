export function ViralLoop() {
  return (
    <section id="viral-loop" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">19</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Viral Loop — Share Your State</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The emotional fingerprint card system turns private reflection into shareable cultural moments — without compromising the intimacy that makes أُنْس trusted. This is the product's primary organic acquisition engine.
          </p>
        </div>

        {/* Loop Diagram */}
        <div>
          <h3 className="text-xl font-semibold mb-6">The Viral Flywheel</h3>
          <div className="space-y-3">
            {[
              { step: "01", title: "Emotional Check-In", desc: "User logs mood in the app (takes < 60 seconds). This is the moment of maximum emotional resonance — the user has just named how they feel.", trigger: "Daily habit, intrinsic motivation" },
              { step: "02", title: "Fingerprint Generation", desc: "The system generates a personalised card — aura color, tone, quote, and card type — derived from the user's live emotional signal and personalization profile.", trigger: "Instant, automated, always personal" },
              { step: "03", title: "Curation & Control", desc: "User selects card type (Aura, Insight, Streak, Summary, Night Calm), tone (Calm, Deep, Warm, Reflective, Mysterious), and privacy level. Quote can be regenerated.", trigger: "Empowers without overwhelming" },
              { step: "04", title: "Share or Save", desc: "Card is exported as an image or text with Arabic quote + brand attribution. Shared to Stories, WhatsApp, Twitter/X — wherever the user has emotional credibility.", trigger: "Zero friction share action" },
              { step: "05", title: "Organic Acquisition", desc: "Viewer sees a beautiful, deeply Arabic card with a resonant quote. They're curious: 'How did they make this?' The card carries a subtle invitation: 'اكتشف بصمتك العاطفية مع أُنْس'.", trigger: "Curiosity-driven download" },
              { step: "06", title: "Attribution & Loop Close", desc: "User who downloaded from a shared card has a 34% higher 7-day retention rate (projected) — they arrived with intent, not just curiosity. Loop closes.", trigger: "High-intent acquisition" },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary font-mono">{s.step}</span>
                  </div>
                  {i < 5 && <div className="w-px flex-1 bg-gradient-to-b from-primary/20 to-transparent mt-2" />}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 mt-0.5">{s.trigger}</span>
                    <h4 className="font-semibold text-right">{s.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-right leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Types */}
        <div>
          <h3 className="text-xl font-semibold mb-6">The Five Card Types</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: "Aura Card", ar: "بطاقة الأورا", desc: "Breathing orb + emotional state label + tone-matched quote. The most personal — shows how the user feels right now.", shareRate: "High — emotionally immediate" },
              { type: "Insight Card", ar: "بطاقة الحكمة", desc: "Large Arabic quote centred, with emotional state and brand attribution. Designed to be screenshot and shared as a standalone statement.", shareRate: "Highest — quote-first format" },
              { type: "Streak Card", ar: "بطاقة السلسلة", desc: "Days of consecutive self-care, visualised as dots. Celebrates consistency publicly — social proof of emotional discipline.", shareRate: "Medium — milestone-driven" },
              { type: "Daily Summary", ar: "ملخص يومي", desc: "4-stat grid: emotional state, sessions, streak, mood. A 'year in review' format for daily emotional data.", shareRate: "Medium — data-forward users" },
              { type: "Night Calm", ar: "بطاقة ليلية", desc: "Dark, moon-themed card for late-night check-ins. Softer colours, 'calm energy' meter. Resonates with the late-night emotional processing demographic.", shareRate: "High — aesthetic resonance" },
            ].map(c => (
              <div key={c.type} className="bg-card rounded-2xl p-5 border border-border/30">
                <h4 className="font-semibold mb-0.5">{c.type}</h4>
                <p className="text-xs text-primary mb-3" dir="rtl">{c.ar}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.desc}</p>
                <div className="text-xs bg-primary/8 text-primary rounded-lg px-2 py-1.5">{c.shareRate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Model */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-2">Privacy-First Sharing Model</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            The cardinal rule: <strong>no sensitive emotional data is ever in a shared card.</strong> Users choose what to reveal — the system enforces what stays private.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { mode: "عام (Public)", what: "Emotional state label, curated quote, streak count", never: "Session content, AI conversation, raw mood history" },
              { mode: "محدود (Friends)", what: "Same as Public, sent only to direct contacts", never: "Same restrictions — friends don't get more data" },
              { mode: "خاص (Private)", what: "Full card saved locally for personal reflection", never: "Nothing leaves the device — zero network activity" },
            ].map(m => (
              <div key={m.mode} className="text-right">
                <div className="font-semibold mb-2 text-sm" dir="rtl">{m.mode}</div>
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground mb-1">Shared:</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{m.what}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Never shared:</p>
                  <p className="text-xs text-destructive/70 leading-relaxed">{m.never}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projections */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Acquisition Projections</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "K factor (viral coefficient)", value: "0.3–0.5", note: "Per shared card at maturity" },
              { label: "Share rate at launch", value: "12–18%", note: "Of active users / week" },
              { label: "Conversion from share", value: "4–7%", note: "Viewer → download (projected)" },
              { label: "D7 retention uplift", value: "+28–34%", note: "Share-acquired vs direct users" },
            ].map(p => (
              <div key={p.label} className="bg-card rounded-2xl p-5 border border-border/30 text-right">
                <p className="text-2xl font-bold text-primary mb-1">{p.value}</p>
                <p className="text-xs text-muted-foreground">{p.note}</p>
                <p className="text-xs font-medium mt-2 leading-snug">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
