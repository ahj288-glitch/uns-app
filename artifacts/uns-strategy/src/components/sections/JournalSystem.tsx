export function JournalSystem() {
  const entryTypes = [
    { type: "Free Write", ar: "كتابة حرة", icon: "✍️", desc: "Open-ended private journaling. No prompts, no structure. The purest form of emotional processing.", retention: "3× longer LTV than non-journalers" },
    { type: "Prompted Reflection", ar: "تأمل موجّه", icon: "💭", desc: "AI-generated contextual prompt based on user's emotional state. 'أخبرني عن لحظة شعرت فيها بالامتنان اليوم.'", retention: "Drives daily habit formation" },
    { type: "Mood-Linked Entry", ar: "تدوينة مرتبطة بالمزاج", icon: "🎨", desc: "Journal entry automatically tagged with the mood check-in preceding it. Creates an emotional timeline with no extra effort.", retention: "Enables AI insight generation" },
    { type: "Companion Response", ar: "رد المرافق", icon: "🤝", desc: "After saving an entry, the companion offers a brief, non-prescriptive reflection: insight, validation, or a gentle question — never advice.", retention: "Creates emotional reciprocity loop" },
    { type: "Voice Note", ar: "ملاحظة صوتية", icon: "🎙️", desc: "Record a spoken reflection. Transcribed via Whisper for search and insight. Preserved as audio for emotional authenticity. (Phase 2)", retention: "Dramatically lowers journaling friction" },
    { type: "Saved Insight", ar: "بصيرة محفوظة", icon: "⭐", desc: "User or AI-highlighted insight from a conversation, saved to the personal archive. The product's memory of breakthroughs.", retention: "Creates perceived irreplaceability" },
  ];

  const archiveFeatures = [
    { feature: "Emotional Timeline", detail: "Scroll back through mood + journal history as a visual timeline — a personal emotional record that becomes more valuable over time." },
    { feature: "AI-Generated Monthly Summary", detail: "At month end, the companion generates a private summary: recurring themes, emotional shifts, breakthroughs, and gentle observations. Never shared without permission." },
    { feature: "Privacy Controls Per Entry", detail: "Each entry is individually controllable: Public (impossible), Private only (default for all journal content). Session-only option for ultra-private entries." },
    { feature: "Search & Retrieval", detail: "Semantic search across journal history. 'What was I feeling last Ramadan?' retrieves contextually relevant past entries." },
    { feature: "Export to PDF", detail: "Full personal journal archive exported as a beautifully formatted Arabic/English PDF. The user's emotional autobiography — exportable, ownable." },
    { feature: "Selective Deletion", detail: "Delete individual entries, date ranges, or full journal history. Deletion is permanent and confirmed clearly. No dark patterns." },
  ];

  return (
    <section id="journal-system" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">22</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Journal, Reflection & Personal Archive</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The journal is أُنْس's highest-LTV feature. Users who journal stay 3× longer and generate 2.4× more referrals. It is the private space where the product earns irreplaceability — when your emotional history lives inside an app, you can't leave without losing a part of yourself.
          </p>
        </div>

        {/* Core Insight Banner */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { stat: "3×", label: "longer retention for journal users" },
              { stat: "2.4×", label: "more referrals from journal users" },
              { stat: "0%", label: "journal content visible to أُنْس team" },
            ].map(s => (
              <div key={s.stat}>
                <div className="text-3xl font-bold text-primary mb-1">{s.stat}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Types */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Journal Entry Types</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {entryTypes.map(e => (
              <div key={e.type} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{e.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{e.type}</h4>
                    <p className="text-xs text-primary" dir="rtl">{e.ar}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{e.desc}</p>
                <div className="text-xs bg-primary/8 text-primary rounded-lg px-2 py-1.5">{e.retention}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Archive */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Personal Archive System</h3>
          <div className="space-y-3">
            {archiveFeatures.map(f => (
              <div key={f.feature} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{f.feature}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Architecture */}
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <h3 className="text-xl font-semibold mb-2">Journal Privacy Architecture</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Journal privacy is a product pillar, not a legal formality. The system is designed so that no one — including the أُنْس team — can read user journal entries without the user's explicit action.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "On-Device Encryption", detail: "Entries encrypted locally using AES-256 before transmission. Server stores ciphertext. Decryption key derived from user authentication." },
              { title: "Zero-Knowledge Option", detail: "Advanced setting: entries never leave the device. AI companion reflection works on-device using a lightweight model. No cloud sync." },
              { title: "AI Access Scope", detail: "The AI companion reads journal entries only to generate reflections within the same session. No cross-session retention without explicit user permission." },
              { title: "Team Access Policy", detail: "Internal staff have zero read access to individual journals. Only aggregated, anonymized patterns inform product decisions." },
            ].map(p => (
              <div key={p.title} className="bg-background rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-1">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
