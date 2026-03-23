export function GrowthMechanics() {
  const growthLoops = [
    {
      loop: "Emotional Card Share Loop",
      ar: "حلقة المشاركة العاطفية",
      trigger: "User shares emotional fingerprint card",
      action: "Viewer sees Arabic card with brand attribution",
      outcome: "34% projected 7-day retention from card-sourced acquisition",
      stage: "Core",
    },
    {
      loop: "Streak Visibility Loop",
      ar: "حلقة الاستمرارية",
      trigger: "User reaches 7-day streak milestone",
      action: "Optional shareable streak card + in-app celebration",
      outcome: "Public commitment drives consistency and curiosity",
      stage: "Core",
    },
    {
      loop: "Friend Invite Loop",
      ar: "حلقة دعوة الأصدقاء",
      trigger: "User has 14+ day streak or completes a journey",
      action: "Contextual invite prompt: 'أعرف أحداً قد يحتاج هذا؟'",
      outcome: "Referral code grants invitee 2 free premium weeks",
      stage: "Phase 2",
    },
    {
      loop: "Waitlist Referral Loop",
      ar: "حلقة انتظار المُحيل",
      trigger: "User joins waitlist",
      action: "Unique referral link. Each referral moves you up 5 positions",
      outcome: "Waitlist becomes a viral acquisition engine before launch",
      stage: "Pre-launch",
    },
    {
      loop: "Monthly Insight Report Loop",
      ar: "حلقة تقرير الرؤى",
      trigger: "AI generates monthly emotional summary",
      action: "Optional shareable 'My Month' card — emotion word, theme, milestone",
      outcome: "Aspirational social proof — 'I grew this month' narrative",
      stage: "Phase 2",
    },
    {
      loop: "Reactivation Loop",
      ar: "حلقة إعادة التفعيل",
      trigger: "User inactive 3+ days",
      action: "Personalized re-engagement nudge from companion perspective",
      outcome: "Emotional (not transactional) re-entry: 'رفيقك يسأل عليك'",
      stage: "Core",
    },
  ];

  const referralPrinciples = [
    "Referrals must never feel transactional or cheap",
    "No cash rewards — only access extensions and premium unlocks",
    "Invitations are contextual, not nagging — triggered by peak moments",
    "The referral mechanism itself must feel emotionally intelligent",
    "No spam mechanics: 1 invite prompt per milestone, no re-prompting",
    "Friend invitations respect the sensitivity of the product context",
  ];

  const acquisitionChannels = [
    { channel: "Organic Share", ar: "مشاركة عضوية", cac: "~0", quality: "Highest intent", notes: "Card shares, Arabic quote forwards, story reposts" },
    { channel: "Creator Seeding", ar: "توعية المبدعين", cac: "Low", quality: "High trust", notes: "5–10 Arabic mental wellness creators at launch. Co-created content." },
    { channel: "SEO / Content", ar: "محتوى البحث", cac: "Low", quality: "Medium–High", notes: "Arabic wellness articles, emotional vocabulary content, Ramadan guides" },
    { channel: "Paid Social", ar: "إعلانات مدفوعة", cac: "Medium", quality: "Medium", notes: "Instagram/TikTok. Emotional storytelling. Never 'download now' CTAs." },
    { channel: "Institutional B2B", ar: "شراكات مؤسسية", cac: "High", quality: "Highest LTV", notes: "HR wellness programs. University wellbeing packages." },
    { channel: "Waitlist Referral", ar: "قائمة الانتظار", cac: "~0", quality: "High", notes: "Pre-launch flywheel. 10K+ waitlist before launch target." },
  ];

  return (
    <section id="growth-mechanics" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">23</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Growth Mechanics & Referral Architecture</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Organic growth for أُنْس must be culturally intelligent. Arabic social dynamics — built on trust, private recommendation, and collective emotional experience — demand a completely different approach than Western viral mechanics. Growth must feel earned, not gimmicked.
          </p>
        </div>

        {/* Growth Principle */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-5">
          <p className="font-semibold text-center">Core Growth Principle</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Every growth mechanic must pass the "Would this embarrass a user in front of their family?" test. If yes, we don't build it.
          </p>
        </div>

        {/* Growth Loops */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Designed Growth Loops</h3>
          <div className="space-y-3">
            {growthLoops.map(g => (
              <div key={g.loop} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{g.loop}</h4>
                    <p className="text-xs text-primary mt-0.5" dir="rtl">{g.ar}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    g.stage === "Core" ? "bg-primary/10 text-primary" :
                    g.stage === "Pre-launch" ? "bg-amber-500/10 text-amber-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>{g.stage}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Trigger</p>
                    <p>{g.trigger}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Action</p>
                    <p>{g.action}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Outcome</p>
                    <p>{g.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Principles */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-4">Referral Design Principles</h3>
          <div className="space-y-2">
            {referralPrinciples.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Acquisition Mix */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Acquisition Channel Architecture</h3>
          <div className="overflow-hidden rounded-2xl border border-border/30">
            <div className="grid grid-cols-5 gap-2 px-5 py-3 text-xs text-muted-foreground bg-card">
              <span className="col-span-2">Channel</span>
              <span>CAC</span>
              <span>Quality</span>
              <span>Approach</span>
            </div>
            {acquisitionChannels.map(a => (
              <div key={a.channel} className="grid grid-cols-5 gap-2 px-5 py-4 items-center hover:bg-card/50 transition-colors border-t border-border/20 text-sm">
                <div className="col-span-2">
                  <div className="font-medium">{a.channel}</div>
                  <div className="text-xs text-primary" dir="rtl">{a.ar}</div>
                </div>
                <span className="text-xs text-muted-foreground">{a.cac}</span>
                <span className="text-xs text-muted-foreground">{a.quality}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{a.notes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ambassador Model */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-3">Creator & Ambassador Model</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            The most powerful growth channel in the Arab market is trusted peer recommendation. A small group of emotionally credible Arabic creators — mental health advocates, writers, therapists with public profiles — can move thousands.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { tier: "Founding Ambassadors", count: "5–10 creators", perk: "Early access, private briefing, co-creation input, premium lifetime access. No cash — brand alignment only." },
              { tier: "Community Voices", count: "25–50 users", perk: "Gifted premium access. First access to new features. Content creator badge. Quarterly check-in with product team." },
              { tier: "Brand Advocates", count: "Open program", perk: "Shareable referral link. Premium extension for each 3 successful referrals. Leaderboard recognition." },
            ].map(t => (
              <div key={t.tier} className="bg-background rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-1">{t.tier}</h4>
                <p className="text-xs text-primary mb-2">{t.count}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.perk}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
