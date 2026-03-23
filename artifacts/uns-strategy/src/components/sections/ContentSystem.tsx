export function ContentSystem() {
  const contentTypes = [
    { type: "Breathing Sessions", ar: "جلسات التنفس", count: "12 protocols", tags: ["calm", "anxiety", "sleep"], duration: "2–8 min", tier: "Free + Premium" },
    { type: "Guided Reflections", ar: "تأملات موجهة", count: "40+ prompts", tags: ["self-awareness", "grief", "gratitude"], duration: "5–15 min", tier: "Free + Premium" },
    { type: "Grounding Exercises", ar: "تمارين التأريض", count: "8 techniques", tags: ["anxiety", "panic", "overwhelm"], duration: "3–10 min", tier: "Free" },
    { type: "Sleep Wind-Down", ar: "جلسات النوم", count: "6 programs", tags: ["sleep", "calm", "night"], duration: "10–30 min", tier: "Premium" },
    { type: "Micro-Journaling Prompts", ar: "مطالبات المفكرة", count: "200+ prompts", tags: ["all moods", "growth", "reflection"], duration: "Open-ended", tier: "Free + Premium" },
    { type: "Moment Rescue", ar: "إنقاذ اللحظة", count: "24 mini-experiences", tags: ["crisis-adjacent", "overwhelm", "anger"], duration: "60–90 sec", tier: "Free" },
    { type: "Thematic Journeys", ar: "رحلات موضوعية", count: "8 journeys (14–30 days)", tags: ["grief", "anxiety", "confidence", "Ramadan"], duration: "Multi-week", tier: "Premium" },
    { type: "Emotional Education", ar: "تعليم المشاعر", count: "30+ micro-lessons", tags: ["literacy", "self-knowledge"], duration: "3–5 min", tier: "Free" },
  ];

  const contentLifecycle = [
    { stage: "Commission", detail: "Internally authored or contracted from Arab psychologists, mindfulness coaches, and culturally fluent writers. All content reviewed before entry into CMS." },
    { stage: "Draft & Review", detail: "CMS workflow: Author → Arabic language editor → Clinical safety reviewer → Head of Content. Four-stage gate before publish." },
    { stage: "Tagging & Personalization", detail: "Each piece tagged with: mood relevance, dialect adaptation needed, cultural sensitivity flag, time-of-day relevance, program placement." },
    { stage: "Localization", detail: "MSA base → Gulf variant → Levant variant → Egypt variant. Dialect layers are copywriting, not full retranslation." },
    { stage: "Scheduling & Seasonality", detail: "Content can be time-activated: Ramadan journeys, Eid grounding sessions, seasonal anxiety prompts." },
    { stage: "Retirement & Archive", detail: "Content past performance threshold is retired but archived. A/B tested replacements run before permanent removal." },
  ];

  return (
    <section id="content-system" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">21</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Content System & Guided Experiences</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            أُنْس is not only an AI companion — it is a curated content ecosystem. Guided experiences are the depth layer: they give users something to return to even on days when they don't want to talk, and they provide proof of cultural intelligence that no global competitor can replicate.
          </p>
        </div>

        {/* Content Philosophy */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { principle: "Culturally Authored", detail: "Content is written by and for the Arab world — not translated from Western wellness frameworks. Emotional vocabulary is indigenous." },
            { principle: "Mood-Triggered", detail: "The personalization engine surfaces the right content type based on the user's current emotional state — no browsing required." },
            { principle: "Evidence-Informed", detail: "All techniques are grounded in behavioral science: CBT, ACT, DBT-adapted, somatic awareness, Islamic mindfulness frameworks." },
          ].map(p => (
            <div key={p.principle} className="bg-card rounded-2xl p-5 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary mb-3" />
              <h4 className="font-semibold mb-2 text-sm">{p.principle}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Content Library */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Content Library Architecture</h3>
          <div className="space-y-2">
            {contentTypes.map(c => (
              <div key={c.type} className="bg-card rounded-2xl p-4 border border-border/30">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-sm">{c.type}</span>
                      <span className="text-xs text-muted-foreground" dir="rtl">{c.ar}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.tags.map(t => (
                        <span key={t} className="text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span className="font-mono">{c.count}</span>
                    <span>{c.duration}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      c.tier === "Free" ? "bg-primary/10 text-primary" :
                      c.tier === "Premium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>{c.tier}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Lifecycle */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Content Lifecycle</h3>
          <div className="space-y-3">
            {contentLifecycle.map((s, i) => (
              <div key={s.stage} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary font-mono">{i + 1}</span>
                  </div>
                  {i < contentLifecycle.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-primary/20 to-transparent mt-1" />}
                </div>
                <div className="pb-5 flex-1">
                  <h4 className="font-semibold text-sm mb-1">{s.stage}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CMS Architecture */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-4">CMS Architecture for Non-Technical Operations</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            The content operations system must allow authorized content editors, psychologists, and community managers to manage all product copy, guided sessions, in-app messaging, and seasonal campaigns — without any developer involvement.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { cap: "Content CRUD", detail: "Create, edit, archive all guided experiences, prompts, and educational micro-lessons with rich text + Arabic RTL support." },
              { cap: "Draft / Publish Workflow", detail: "Multi-stage: Draft → Review → Approved → Scheduled → Live. Full rollback to any previous published version." },
              { cap: "Localization Management", detail: "Per-dialect content variants. Missing translation warnings. Side-by-side Arabic/English editor." },
              { cap: "Scheduled Publishing", detail: "Set future publish date/time. Ramadan content activates automatically on Hilal sighting date." },
              { cap: "Performance Visibility", detail: "Completion rate, abandonment point, re-open rate, user rating per content piece — editable by content team without code." },
              { cap: "In-App Banner Management", detail: "Create and schedule app-wide banners for campaigns, maintenance notices, seasonal features — live in minutes." },
            ].map(c => (
              <div key={c.cap} className="bg-background rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-1">{c.cap}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
