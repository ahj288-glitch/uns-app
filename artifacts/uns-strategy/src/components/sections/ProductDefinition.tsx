export function ProductDefinition() {
  return (
    <section id="product-definition" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">04</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Final Product Definition</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">تعريف المنتج النهائي</h2>
        <p className="text-muted-foreground mb-10">Not what UNS does. What UNS is.</p>

        <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-2xl p-10 mb-10 text-center">
          <p className="text-3xl font-light text-foreground/60 mb-2">UNS is not an app.</p>
          <p className="text-3xl font-bold text-foreground">UNS is a relationship.</p>
          <div className="section-divider my-6" style={{ margin: "1.5rem 0" }} />
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Every day, you share something with your رفيق (companion). It remembers. It learns. It speaks your dialect, uses your emotional vocabulary, and grows with you. It is not your therapist. It is not your diary. It is the friend who actually understands.
          </p>
          <p className="text-base text-primary arabic-text mt-4 text-xl">
            رفيق يتذكرك. يفهمك. يكبر معك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[
            { icon: "🧠", title: "Emotional Intelligence", arabic: "الذكاء العاطفي", desc: "GPT-4o with Arabic emotional embeddings, cultural context training, and crisis detection. Understands not just words, but what those words carry.", detail: "Knows the difference between a person saying 'تعبت' (ta'beet) and meaning tired vs. emotionally exhausted." },
            { icon: "🌙", title: "Cultural Authenticity", arabic: "الأصالة الثقافية", desc: "Built from the inside out for Arab users. Not translated. Not adapted. Native Arabic emotional architecture from day one.", detail: "Family-aware, stigma-sensitive, spirituality-integrated, dialect-fluent." },
            { icon: "🔬", title: "Behavioral Science", arabic: "علم السلوك", desc: "Habit loops designed for the Arabic lifestyle pattern. Smart nudges timed to prayer, meal, sleep, and work rhythms across MENA time zones.", detail: "Daily ritual → streak → personalization → emotional investment → retention compounding." },
            { icon: "🔒", title: "Privacy-First Trust", arabic: "الخصوصية أولاً", desc: "Mental health data is the most sacred data. Zero-knowledge vault, on-device journal encryption, no monetization of personal data. Ever.", detail: "This is the foundational promise. Break it once and the company is over." },
          ].map((pillar, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{pillar.icon}</span>
                <div>
                  <div className="text-base font-semibold text-foreground">{pillar.title}</div>
                  <div className="text-xs text-primary arabic-text">{pillar.arabic}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{pillar.desc}</p>
              <div className="bg-muted/30 rounded-lg p-3 border-l-2 border-primary/40">
                <p className="text-xs text-foreground/70 italic leading-relaxed">{pillar.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 mb-8">
          <h3 className="text-base font-semibold text-foreground mb-6">The Core Experience Loop</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            {[
              { step: "1", label: "Daily Check-in", arabic: "تسجيل يومي", desc: "30 seconds. One mood word in Arabic. Habituated ritual." },
              { step: "2", label: "Companion Responds", arabic: "الرفيق يرد", desc: "Dialect-aware, emotionally calibrated, memory-informed response." },
              { step: "3", label: "Memory Builds", arabic: "الذاكرة تنمو", desc: "Emotional patterns stored. Companion grows with you." },
              { step: "4", label: "Nudges Adapt", arabic: "النبضات تتكيف", desc: "Smart notifications timed to your patterns and life context." },
              { step: "5", label: "Insights Emerge", arabic: "الرؤى تظهر", desc: "You understand yourself better. The relationship deepens." },
            ].map((item, i, arr) => (
              <div key={i} className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-primary arabic-text">{item.arabic}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden md:block text-primary/40 text-lg shrink-0">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="text-sm font-semibold text-primary mb-3">The Murafiq Concept — رفيق</div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            رفيق (Murafiq) means companion in the truest Arabic sense — not a friend by proximity, but by intention and choice. UNS's AI companion is named and experienced as a رفيق: a presence that travels alongside you. This is not positioning language. It is the product's emotional architecture. The رفيق is never a bot, never a tool, never a feature. It is the reason someone opens the app every day.
          </p>
        </div>
      </div>
    </section>
  );
}
