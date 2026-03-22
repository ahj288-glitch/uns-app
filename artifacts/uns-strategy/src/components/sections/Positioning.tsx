export function Positioning() {
  return (
    <section id="positioning" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">05</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Product Positioning Statement</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">تموضع المنتج</h2>
        <p className="text-muted-foreground mb-10">The one sentence that defines everything. The north star for every decision.</p>

        <div className="bg-gradient-to-br from-card via-primary/5 to-card border border-primary/30 rounded-2xl p-10 mb-10 text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-6">Positioning Statement</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-4">
            "The first emotionally intelligent Arabic companion that <span className="gold-gradient">knows you</span>, <span className="gold-gradient">remembers you</span>, and <span className="gold-gradient">grows with you</span>."
          </h3>
          <p className="text-base text-foreground/60 arabic-text mt-4 text-xl">
            أول رفيق عربي يعرفك، يتذكرك، ويكبر معك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "For whom", value: "Arabic-speaking individuals 18–45", detail: "Urban, smartphone-fluent, emotionally aware, underserved by existing products. Includes diaspora communities in Europe and North America.", color: "border-primary/40" },
            { label: "What we are", value: "An AI emotional companion", detail: "Not a therapy app. Not a chatbot. Not a meditation tool. A growing, remembering, emotionally intelligent presence that speaks your language.", color: "border-chart-3/40" },
            { label: "Against whom", value: "Western wellness apps that ignore culture", detail: "Calm, Headspace, Replika, Wysa, BetterHelp — all built for Western psychology, Western language, Western emotional frameworks.", color: "border-accent/40" },
          ].map((item, i) => (
            <div key={i} className={`bg-card border ${item.color} rounded-xl p-6`}>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{item.label}</div>
              <div className="text-base font-bold text-foreground mb-3">{item.value}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 mb-8">
          <h3 className="text-base font-semibold text-foreground mb-6">Brand Identity & Tone</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-sm font-semibold text-primary mb-4">The Name: أُنس (UNS)</div>
              <div className="space-y-3">
                {[
                  { label: "Literal meaning", value: "Warmth of companionship; the comfort of being with someone you trust" },
                  { label: "Root (أنس)", value: "Derived from الأُنس — the feeling of ease, familiarity, and belonging in another's presence" },
                  { label: "Critical note", value: "NEVER translate UNS as 'loneliness'. It is the OPPOSITE. It is the antidote to loneliness." },
                  { label: "English pronunciation", value: "Pronounced 'OON-s' — preserve the Arabic phoneme" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-xs font-semibold text-muted-foreground shrink-0 w-28">{item.label}:</div>
                    <div className={`text-xs leading-relaxed ${item.label === "Critical note" ? "text-destructive" : "text-foreground/80"}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-primary mb-4">Brand Tone</div>
              <div className="space-y-3">
                {[
                  { trait: "Warm", opposite: "Never clinical", detail: "Speaks like a trusted friend, not a healthcare system" },
                  { trait: "Non-judgmental", opposite: "Never prescriptive", detail: "Receives without analyzing. Listens without diagnosing." },
                  { trait: "Culturally fluent", opposite: "Never generic", detail: "References collective honor, family bonds, spiritual dimension when contextually appropriate" },
                  { trait: "Quietly confident", opposite: "Never arrogant", detail: "Knows what it knows, honest about what it doesn't" },
                  { trait: "Emotionally present", opposite: "Never performative", detail: "Doesn't over-celebrate or over-dramatize. Holds space." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-foreground">{item.trait}</span>
                      <span className="text-xs text-muted-foreground mx-1">·</span>
                      <span className="text-xs text-muted-foreground">{item.opposite}</span>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-card-border rounded-xl p-6">
            <div className="text-sm font-semibold text-primary mb-4">Visual Identity Direction</div>
            <div className="space-y-2">
              {[
                "Deep navy/charcoal backgrounds — safety and depth",
                "Warm gold accents — dignity and cultural resonance",
                "Terracotta/amber — warmth, earth, Arabic earth tones",
                "Soft gradients — emotional fluidity, not sharp edges",
                "Arabic calligraphy elements — heritage without kitsch",
                "RTL-first typography: Amiri or Cairo font for Arabic",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-primary/60" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-card-border rounded-xl p-6">
            <div className="text-sm font-semibold text-primary mb-4">Words We Never Use</div>
            <div className="space-y-2">
              {[
                { bad: "Therapy / Therapist", because: "Triggers cultural stigma immediately" },
                { bad: "Mental health treatment", because: "Medicalizes what should feel human" },
                { bad: "Diagnosis / Symptoms", because: "We are not a clinical tool" },
                { bad: "AI chatbot", because: "Destroys the companion relationship" },
                { bad: "Wellness app", because: "Too generic — we are a relationship" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-destructive font-semibold shrink-0">✕</span>
                  <span className="text-foreground/60"><span className="text-foreground font-medium">{item.bad}</span> — {item.because}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
