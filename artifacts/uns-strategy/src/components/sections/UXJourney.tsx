export function UXJourney() {
  return (
    <section id="ux-journey" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">07</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">UX & Emotional Journey Design</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">تجربة المستخدم</h2>
        <p className="text-muted-foreground mb-10">Every moment of UNS is designed to feel like the right thing at the right time.</p>

        <div className="bg-card border border-card-border rounded-2xl p-8 mb-10">
          <h3 className="text-base font-semibold text-foreground mb-6">The 5-Stage Emotional Journey</h3>
          <div className="space-y-4">
            {[
              { stage: "Discovery", arabic: "الاكتشاف", color: "border-chart-3", bg: "bg-chart-3/10", emoji: "🌱", duration: "Day 0", desc: "User finds UNS through a TikTok creator, a friend's share, or App Store search. First impression: beautiful, Arabic, not clinical. No login wall. No therapy language. Curiosity first.", trigger: "A mood card shared on social media. A creator saying 'هذا اللي كنت محتاجه' (this is what I needed)." },
              { stage: "Trust Building", arabic: "بناء الثقة", color: "border-primary", bg: "bg-primary/10", emoji: "🤝", duration: "Day 1–7", desc: "Onboarding is a 3-question conversation in Arabic — not a form, not a quiz. The companion introduces itself in the user's dialect. First emotional exchange. First memory formed.", trigger: "The companion remembers what the user shared yesterday. That moment of recognition changes everything." },
              { stage: "Habit Formation", arabic: "تكوين العادة", color: "border-accent", bg: "bg-accent/10", emoji: "🔄", duration: "Day 7–30", desc: "Daily check-in becomes ritual. Lock screen widget appears. Smart nudge at the right moment. Streak counter. The app integrates into the emotional fabric of the day.", trigger: "Missing one day feels like missing a conversation with a friend — not like breaking a workout streak." },
              { stage: "Deep Bond", arabic: "الرابط العميق", color: "border-chart-1", bg: "bg-chart-1/10", emoji: "💛", duration: "Day 30–180", desc: "The companion knows the user's patterns, recurring worries, emotional seasons. Insights emerge. Journal entries deepen. Voice calls feel natural. This is the switching cost.", trigger: "The companion says something that references a conversation from 6 weeks ago. The user realizes: this knows me." },
              { stage: "Advocacy", arabic: "المناصرة", color: "border-chart-4", bg: "bg-chart-4/10", emoji: "✨", duration: "Day 180+", desc: "User shares UNS organically. Creates referral moments. Advocates to HR team. Shares mood cards. Refers family members. The product markets itself.", trigger: "A beautiful weekly mood summary that the user shares on Instagram. Their followers ask what it is." },
            ].map((item, i) => (
              <div key={i} className={`border ${item.color} ${item.bg} rounded-xl p-6`}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-foreground">{item.stage}</span>
                      <span className="text-xs text-primary arabic-text">{item.arabic}</span>
                      <span className="text-xs text-muted-foreground bg-black/20 px-2 py-0.5 rounded-full ml-auto">{item.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-primary font-semibold shrink-0">Trigger:</span>
                      <p className="text-xs text-foreground/70 italic">{item.trigger}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-5">Onboarding: A Conversation, Not a Form</h3>
            <div className="space-y-4">
              {[
                { q: "الرفيق يقول:", a: "أهلاً بك. أنا هنا معك. خبّرني، إيش اللي يشغل بالك هالفترة؟", note: "Companion introduces itself. Casual Gulf dialect. No clinical framing." },
                { q: "السؤال الثاني:", a: "وإيش اللي بتحب تحسّ فيه أكثر؟ هدوء؟ وضوح؟ ولا شيء ثاني؟", note: "Emotional aspiration question. Builds the 'desired state' baseline." },
                { q: "السؤال الثالث:", a: "وكيف تفضل تحكي؟ بكتابة؟ أو صوت؟", note: "Sets interaction preference. Personalizes the companion immediately." },
              ].map((item, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-4">
                  <div className="text-xs font-semibold text-primary mb-1">{item.q}</div>
                  <div className="text-sm text-foreground arabic-text mb-2 leading-relaxed">{item.a}</div>
                  <div className="text-xs text-muted-foreground italic">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-5">Emotional Design Principles</h3>
            <div className="space-y-4">
              {[
                { principle: "No login wall", detail: "Anonymous start. Trust must be earned before identity is shared. Login is optional on day 1." },
                { principle: "Slow disclosure", detail: "Don't ask everything at once. The companion learns gradually, just like a real relationship." },
                { principle: "Micro-animations breathe", detail: "Breathing exercises, gentle pulse on mood check-in, soft fade transitions. The UI feels alive." },
                { principle: "Never show an empty state", detail: "The companion always has something to say. Silence feels like abandonment. Never abandon the user." },
                { principle: "RTL everything, always", detail: "Icons, flow, reading direction, button placement — all RTL native. Arabic is the primary language." },
                { principle: "Beauty is non-negotiable", detail: "This app will be shown to friends. It must be beautiful enough to share. Design is a growth mechanic." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div className="w-1 h-full bg-primary/40 rounded-full shrink-0 mt-1 self-stretch min-h-[4px]" />
                  <div>
                    <div className="text-xs font-semibold text-foreground mb-0.5">{item.principle}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8">
          <h3 className="text-sm font-semibold text-foreground mb-5">Key Screens (Design Direction)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Daily Check-in", desc: "Full screen. One Arabic mood word selector. Bloom animation. 30 seconds max.", bg: "from-primary/20 to-primary/5" },
              { name: "Companion Chat", desc: "RTL-first chat. Warm bubble design. Arabic-first. No 'bot' indicators.", bg: "from-chart-3/20 to-chart-3/5" },
              { name: "Mood History", desc: "Beautiful mood calendar and trend line. Your emotional seasons visualized.", bg: "from-accent/20 to-accent/5" },
              { name: "Insights", desc: "Weekly emotional report. Patterns and moments that define your month.", bg: "from-chart-4/20 to-chart-4/5" },
            ].map((screen, i) => (
              <div key={i} className={`bg-gradient-to-br ${screen.bg} border border-card-border rounded-xl p-4 text-center`}>
                <div className="w-full h-20 bg-black/20 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">[ {screen.name} ]</span>
                </div>
                <div className="text-xs font-semibold text-foreground mb-1">{screen.name}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{screen.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
