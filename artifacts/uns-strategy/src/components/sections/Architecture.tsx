export function Architecture() {
  return (
    <section id="architecture" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">10</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Technical Architecture</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">البنية التقنية</h2>
        <p className="text-muted-foreground mb-10">High-level but real. Every decision justified by product requirements.</p>

        <div className="space-y-6 mb-10">
          {[
            {
              layer: "Frontend / Mobile",
              emoji: "📱",
              color: "border-primary/40",
              items: [
                { tech: "React Native (Expo)", role: "iOS + Android app", why: "Single codebase, fast iteration, Expo ecosystem for OTA updates. Critical for small team." },
                { tech: "Next.js 15 (App Router)", role: "Web landing + B2B dashboard", why: "SEO-critical for landing page. Server components for performance. RSC for B2B data-heavy views." },
                { tech: "Tailwind CSS + Radix UI", role: "Design system", why: "RTL support, accessible components, consistent design language across web and admin." },
                { tech: "Framer Motion", role: "Emotional animations", why: "The micro-interactions that make UNS feel alive. Breathing animations, mood transitions, companion responses." },
              ]
            },
            {
              layer: "Backend / API",
              emoji: "⚙️",
              color: "border-chart-3/40",
              items: [
                { tech: "Node.js + Express 5", role: "Primary API server", why: "Fast iteration, JS ecosystem, strong team familiarity. Express 5 for async error handling." },
                { tech: "PostgreSQL + Drizzle ORM", role: "Primary database", why: "Relational structure for user/session/program data. Drizzle for type-safe queries and fast migrations." },
                { tech: "pgvector", role: "Emotional memory embeddings", why: "Vector similarity search for emotional memory recall. Allows companion to surface relevant past context." },
                { tech: "Redis", role: "Session cache + rate limiting", why: "Low-latency session management. Rate limit AI calls per user tier. Cache common companion responses." },
              ]
            },
            {
              layer: "AI Layer",
              emoji: "🧠",
              color: "border-accent/40",
              items: [
                { tech: "GPT-4o (OpenAI)", role: "Companion intelligence", why: "Best Arabic language understanding available. Emotional nuance. Cultural context. Dialect awareness via prompting." },
                { tech: "GPT-4o-mini", role: "Free tier + nudges", why: "Cost-efficient for high-volume low-stakes interactions. 95% of quality at 10% of cost." },
                { tech: "text-embedding-3-large", role: "Emotional memory embeddings", why: "Compress emotional state into vectors. Store in pgvector. Recall relevant past moments for companion context." },
                { tech: "Whisper (Arabic model)", role: "Voice input (STT)", why: "Best open Arabic speech recognition. Can be fine-tuned on dialect-specific audio." },
                { tech: "ElevenLabs Arabic TTS", role: "Voice output", why: "Most natural Arabic voice synthesis available. Can generate dialect-specific voices." },
                { tech: "Custom crisis classifier", role: "Safety system", why: "Fine-tuned BERT model for Arabic crisis language detection. Runs before GPT on every message. Zero latency safety gate." },
              ]
            },
            {
              layer: "Infrastructure",
              emoji: "☁️",
              color: "border-chart-4/40",
              items: [
                { tech: "AWS (Bahrain + UAE regions)", role: "Primary cloud", why: "MENA data residency. Regulatory compliance in KSA/UAE. Low latency for Gulf users. PDPL compliance." },
                { tech: "CloudFront CDN", role: "Static asset delivery", why: "Sub-50ms load times for media, images, guided program content across MENA." },
                { tech: "Docker + ECS Fargate", role: "Container orchestration", why: "Serverless containers for auto-scaling. No server management. Pay per use." },
                { tech: "GitHub Actions + CDK", role: "CI/CD pipeline", why: "Infrastructure as code. Automated testing, deployment, rollback. Type-safe AWS CDK constructs." },
              ]
            },
          ].map((layer, li) => (
            <div key={li} className={`bg-card border ${layer.color} rounded-2xl overflow-hidden`}>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-black/10">
                <span className="text-xl">{layer.emoji}</span>
                <h3 className="text-sm font-semibold text-foreground">{layer.layer}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {layer.items.map((item, ii) => (
                  <div key={ii} className="grid grid-cols-12 gap-4 px-6 py-4">
                    <div className="col-span-3">
                      <div className="text-xs font-mono font-semibold text-primary">{item.tech}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-xs text-foreground/80">{item.role}</div>
                    </div>
                    <div className="col-span-6">
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8">
          <h3 className="text-base font-semibold text-foreground mb-6">Emotional Memory Architecture (The Technical Moat)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              { step: "1. Interaction", desc: "User has a conversation with companion. Raw dialogue captured." },
              { step: "2. Extraction", desc: "LLM extracts: emotional state, topics, intensity, key phrases, life context markers." },
              { step: "3. Compression", desc: "Compressed emotional summary stored as vector + structured JSON. Not raw conversation (privacy)." },
              { step: "4. Recall", desc: "On new interaction, pgvector similarity search retrieves relevant past emotional moments." },
              { step: "5. Context injection", desc: "Relevant memories injected into companion system prompt. Companion speaks with history." },
              { step: "6. Privacy layer", desc: "User can delete memories anytime. On-device option for most sensitive content." },
            ].map((item, i) => (
              <div key={i} className="bg-muted/20 rounded-lg p-4 border border-card-border">
                <div className="text-xs font-semibold text-primary mb-2">{item.step}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-xs text-foreground/80 leading-relaxed">
              <span className="font-semibold text-primary">Why this is the moat:</span> Emotional memory cannot be replicated instantly by a competitor. Every conversation deepens it. Every month that passes makes switching cost higher. After 6 months, leaving UNS means losing 180 days of emotional history that exists nowhere else. This is the single most defensible technical feature in the product.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
