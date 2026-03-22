export function ExecutiveSummary() {
  return (
    <section id="executive-summary" className="min-h-screen py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">01</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Executive Summary</span>
        </div>

        <div className="mb-8">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-4">
            <span className="gold-gradient">UNS</span>
            <span className="text-foreground/40 mx-4">|</span>
            <span className="arabic-text text-4xl lg:text-6xl">أُنس</span>
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground mt-4 font-light">
            The Companion That Understands You
          </p>
          <p className="text-sm text-muted-foreground mt-2 arabic-text text-lg">
            الرفيق الذي يفهمك
          </p>
        </div>

        <div className="bg-card border border-primary/20 rounded-2xl p-8 mb-10">
          <p className="text-base lg:text-lg text-foreground/80 leading-relaxed">
            The Arabic-speaking world has <span className="text-primary font-semibold">400 million people</span>, a cultural framework where mental health discussion carries profound stigma, and <span className="text-primary font-semibold">zero dominant emotional wellness products</span> built for them. Every tool that exists was built for the West, translated badly, and fails to understand how an Arab person experiences emotion — the language, the cultural weight, the family dynamics, the spiritual context.
          </p>
          <p className="text-base lg:text-lg text-foreground/80 leading-relaxed mt-4">
            UNS is not a therapy app. It is not a chatbot. It is a daily emotional companion — an AI presence that speaks your dialect, remembers your journey, and understands what words like <span className="text-primary arabic-text">غم</span> (ghamm), <span className="text-primary arabic-text">وحشة</span> (wahsha), and <span className="text-primary arabic-text">فرح</span> (farah) actually carry. This is a category-creating opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { num: "400M+", label: "Arabic Speakers", sub: "Largest underserved language market in wellness", color: "text-primary" },
            { num: "$2.1B", label: "MENA Wellness Market 2027", sub: "70% underserved by digital products", color: "text-accent" },
            { num: "0", label: "Dominant Arabic Companions", sub: "The white space is complete. First mover wins.", color: "text-chart-3" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-6 text-center">
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.num}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">The Five Pillars of the Thesis</h3>
          {[
            { title: "Cultural vacuum", body: "No product speaks Arabic emotionally. Calm/Headspace have 0% Arabic content. Replika users report cultural alienation. This is not a niche — it is the entire market." },
            { title: "Stigma creates the opportunity", body: "Because Arabic culture carries stigma around therapy, users need a companion, not a clinician. AI companionship is the bridge between 'I can't talk about this' and 'I'm getting support.'" },
            { title: "Emotional memory is the moat", body: "An AI that remembers your story, your patterns, your language becomes irreplaceable over time. Switching cost grows exponentially. This is the deepest retention mechanic possible." },
            { title: "The timing is now", body: "Smartphones penetration in MENA hit 85% in 2025. Mental health awareness is growing. GPT-4o enables real Arabic emotional intelligence for the first time. The technology caught up with the need." },
            { title: "B2B multiplies everything", body: "Corporate wellness in the Gulf is a $400M+ market with 0 culturally relevant solutions. HR teams in UAE and KSA are actively seeking Arabic mental wellness tools. B2B revenue de-risks the company." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 bg-card border border-card-border rounded-xl hover:border-primary/30 transition-colors">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">{i + 1}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground mb-1 capitalize">{item.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
          <p className="text-lg font-medium text-foreground leading-relaxed text-center">
            "The Arabic-speaking world does not need a better translation of Calm.<br />
            It needs a product built from the soul, in its own language, for its own pain."
          </p>
          <p className="text-center text-muted-foreground text-sm mt-4 arabic-text">
            العالم العربي لا يحتاج ترجمة — يحتاج رفيقاً يفهمه
          </p>
        </div>
      </div>
    </section>
  );
}
