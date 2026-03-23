export function LocalizationEnterprise() {
  const dialectStack = [
    { dialect: "MSA — الفصحى", market: "Universal base", coverage: "All features", notes: "The root layer. Every piece of content is authored in MSA first." },
    { dialect: "Gulf — الخليجي", market: "KSA, UAE, Kuwait, Qatar, Bahrain", coverage: "Full app + content", notes: "First localization. Largest addressable market. Highest premium willingness to pay." },
    { dialect: "Levant — الشامي", market: "Jordan, Syria, Lebanon, Palestine", coverage: "App copy + companion", notes: "High emotional expressiveness in dialect. Strong diaspora market globally." },
    { dialect: "Egyptian — المصري", market: "Egypt + pan-Arab media consumers", coverage: "App copy + companion", notes: "Egyptian Arabic is the most widely understood dialect due to media dominance." },
    { dialect: "Maghrebi — المغاربي", market: "Morocco, Algeria, Tunisia", coverage: "App copy (Phase 3)", notes: "Significant cultural uniqueness. Later phase due to Darija complexity." },
  ];

  const culturalAdaptations = [
    { area: "Mental Health Language", detail: "Never 'اضطراب نفسي' — always 'رعاية عاطفية', 'رفاهية الروح', 'راحة النفس'. The linguistic frame removes stigma before the conversation begins." },
    { area: "Religious Sensitivity", detail: "Islamic mindfulness is opt-in, prominently available, and deeply authentic — not tokenized. Quran reflections curated by scholars, not marketing teams." },
    { area: "Collectivist Context", detail: "Features acknowledge family and social dynamics. 'How are you feeling?' recognizes that for many users, individual feelings are shaped by collective pressures." },
    { area: "Gender Context", detail: "Content and companion tone adapts respectfully. No assumptions. Conservative defaults with room for individual expression." },
    { area: "Seasonal Adaptation", detail: "Ramadan is a first-class product moment: specialized content, adjusted daily loop timing, spiritual integration options, Eid celebration moments." },
    { area: "Emotional Vocabulary", detail: "The product uses the rich Arabic emotional lexicon: وحشة، شغف، طمأنينة، حنين، فرحة، قلق — not translations of English psychology terms." },
  ];

  const enterpriseModules = [
    { module: "Organization Workspace", detail: "A separate organizational namespace with its own admin console, user roster, and aggregate dashboards. No cross-contamination with consumer data." },
    { module: "Privacy Separation", detail: "The organization sees only aggregate, anonymized wellness trend data. Individual data is never visible to employers — enforced at architecture level, not policy level." },
    { module: "SSO Integration", detail: "SAML 2.0 and OIDC support. Users authenticate with their corporate identity. IT manages provisioning/deprovisioning." },
    { module: "Custom Content Channels", detail: "Organizations can publish custom content: internal wellness programs, EAP resources, leadership resilience journeys — served only to their workspace." },
    { module: "Bulk Invite System", detail: "Domain-verified self-enrollment, CSV batch invite, or direct link. Works for companies from 50 to 50,000 employees." },
    { module: "Compliance Controls", detail: "Organization admins can enforce: zero-storage mode, data residency selection, feature disablement for regulatory compliance." },
  ];

  const platformReadiness = [
    { item: "App Store Health & Mental Wellness Category", status: "Compliant", detail: "Positioned as 'companion' not 'therapy'. No diagnostic claims. Crisis resources prominently available." },
    { item: "AI Disclosure", status: "Required", detail: "Onboarding clearly states: 'أُنْس is an AI companion'. Never misrepresented as a human counselor." },
    { item: "Age Gating", status: "18+ Default", detail: "App default is 18+. Under-18 flow requires guardian consent. Crisis pathways are always unrestricted regardless of age." },
    { item: "In-App Purchase Compliance", status: "Compliant", detail: "Subscription managed via App Store / Play Store billing. No side-loading of subscriptions. Cancellation available in-app." },
    { item: "Privacy Nutrition Label", status: "Pre-launch prep", detail: "App Store privacy label accurately reflects all data types collected. No 'data not linked to user' misrepresentations." },
  ];

  return (
    <section id="localization-enterprise" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">27</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Localization, Enterprise Readiness & Platform Compliance</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            أُنْس is built for the Arab world, not translated for it. The localization strategy treats dialect as identity, cultural context as product design, and enterprise readiness as architectural discipline — not an afterthought bolted onto a Western product skeleton.
          </p>
        </div>

        {/* Dialect Architecture */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Arabic Dialect Architecture</h3>
          <div className="space-y-2">
            {dialectStack.map((d, i) => (
              <div key={d.dialect} className="bg-card rounded-2xl p-4 border border-border/30">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary font-mono">{i + 1}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm" dir="rtl">{d.dialect}</span>
                      <span className="text-xs text-muted-foreground ml-2">— {d.market}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="bg-primary/8 text-primary px-2 py-0.5 rounded-full">{d.coverage}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-10">{d.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural Adaptations */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Cultural Intelligence Layer</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {culturalAdaptations.map(c => (
              <div key={c.area} className="bg-card rounded-2xl p-5 border border-border/30">
                <h4 className="font-semibold text-sm mb-2">{c.area}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Architecture */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Enterprise Architecture — أُنس للمؤسسات</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Enterprise architecture must be designed now even if B2B launches in Year 2. The consumer product's data model and access control layer must not require a rewrite to support organizational workspaces.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {enterpriseModules.map(m => (
              <div key={m.module} className="bg-card rounded-2xl p-5 border border-border/30">
                <h4 className="font-semibold text-sm mb-2">{m.module}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Compliance */}
        <div>
          <h3 className="text-xl font-semibold mb-6">App Store & Platform Compliance</h3>
          <div className="space-y-3">
            {platformReadiness.map(p => (
              <div key={p.item} className="bg-card rounded-2xl p-4 border border-border/30">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h4 className="font-semibold text-sm">{p.item}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    p.status === "Compliant" ? "bg-primary/10 text-primary" :
                    p.status === "Required" ? "bg-amber-500/10 text-amber-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>{p.status}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
