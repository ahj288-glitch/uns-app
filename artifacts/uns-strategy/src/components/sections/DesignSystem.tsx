export function DesignSystem() {
  return (
    <section id="design-system" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">17</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Design DNA — Midnight Garden System</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            أُنْس's visual identity is a living system designed to feel like stillness made visible. Every colour, motion, and typographic choice maps to an emotional intention — not a brand preference.
          </p>
        </div>

        {/* Color System */}
        <div>
          <h3 className="text-xl font-semibold mb-6">The Midnight Garden Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { name: "Depth", hex: "#041710", role: "Background / Ground", token: "--background" },
              { name: "Surface", hex: "#10231c", role: "Card background", token: "--card" },
              { name: "Elevated", hex: "#1a2e26", role: "High-contrast card", token: "--card-high" },
              { name: "Vessel", hex: "#1B4332", role: "Primary container", token: "--primary-container" },
              { name: "Mint", hex: "#74C69D", role: "Primary action", token: "--primary" },
              { name: "Sage", hex: "#85d7ad", role: "Accent / Hover", token: "--accent" },
              { name: "Dew", hex: "#a5d0b9", role: "Muted primary", token: "--primary-muted" },
              { name: "Forest", hex: "#4a7a5e", role: "Subtle text", token: "--muted-foreground" },
            ].map(c => (
              <div key={c.name} className="rounded-xl overflow-hidden border border-border/30">
                <div className="h-14" style={{ backgroundColor: c.hex }} />
                <div className="p-3 bg-card">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.hex}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border/30">
            <h4 className="font-semibold mb-4">Design Principles behind the Palette</h4>
            <div className="space-y-3">
              {[
                { principle: "Darkness is Safety", desc: "Deep background (#041710) signals privacy and enclosure — a digital cocoon. Unlike clinical white apps, dark surfaces reduce anxiety activation." },
                { principle: "Mint is Permission", desc: "The primary colour (#74C69D) was calibrated to read as 'safe to proceed' without the urgency of blue or the danger of red. It is calm encouragement." },
                { principle: "Gradient has Direction", desc: "All gradients run at 135° — diagonal movement signals transformation, not left-to-right momentum (which reads as urgency/progress)." },
                { principle: "Ghost Borders, Not Hard Walls", desc: "rgba(116,198,157,0.15) creates separation without confinement. Walls trap; ghost borders breathe." },
              ].map(p => (
                <div key={p.principle} className="flex gap-3">
                  <div className="w-1 rounded-full bg-primary shrink-0 mt-1.5" />
                  <div>
                    <span className="font-medium text-sm">{p.principle} — </span>
                    <span className="text-sm text-muted-foreground">{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Typographic System</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border/30">
              <div className="text-4xl font-bold mb-2" style={{ fontFamily: "serif" }}>Tajawal</div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Primary Arabic typeface</p>
              <div className="space-y-2 text-right" dir="rtl">
                <p className="text-2xl font-bold" style={{ fontFamily: "serif" }}>العنوان الرئيسي</p>
                <p className="text-base" style={{ fontFamily: "serif" }}>النص الأساسي في الواجهة</p>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "serif" }}>نص مساعد وتوضيحي</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                <p>700 Bold — headings, CTAs, key metrics</p>
                <p>400 Regular — body, descriptions, labels</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border/30">
              <div className="text-4xl font-bold mb-2">Be Vietnam Pro</div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Latin / numerals typeface</p>
              <div className="space-y-2">
                <p className="text-2xl font-bold">EMOTIONAL SCORE</p>
                <p className="text-base font-medium">Journey · Insights · Chat</p>
                <p className="text-sm text-muted-foreground tracking-widest">UNS ADMIN PANEL</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                <p>500 Medium — UI labels, tab names, metrics</p>
                <p>Used for: numbers, English labels, tracking text</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motion */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Motion Language</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Breathing Rhythm",
                duration: "4000ms in / 4000ms out",
                easing: "Easing.inOut(Easing.sin)",
                use: "BreathingOrb, modal entries, focus state pulses",
                intent: "Signals biological calm — matches a natural breathing pace",
              },
              {
                name: "Micro-spring",
                duration: "150–200ms",
                easing: "withSpring(0.93 → 1, speed: 50)",
                use: "Chip taps, button presses, mood selection",
                intent: "Confirms touch without being bouncy/playful",
              },
              {
                name: "Slow Reveal",
                duration: "300–500ms",
                easing: "FadeInDown / FadeInUp",
                use: "Card appearances, modal opening, section loads",
                intent: "Nothing appears abruptly — everything arrives",
              },
            ].map(m => (
              <div key={m.name} className="bg-card rounded-2xl p-5 border border-border/30">
                <h4 className="font-semibold mb-1">{m.name}</h4>
                <p className="text-xs text-primary font-mono mb-3">{m.duration}</p>
                <p className="text-xs text-muted-foreground mb-2">{m.easing}</p>
                <p className="text-xs text-muted-foreground mb-3">{m.use}</p>
                <div className="text-xs italic text-foreground/60 border-t border-border/30 pt-3">{m.intent}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
