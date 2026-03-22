import { useState } from "react";
import { FEATURES } from "@/data/strategy";

export function FeatureUniverse() {
  const [activeLayer, setActiveLayer] = useState<"p0" | "p1" | "p2">("p0");

  const layers = {
    p0: { label: "Core (P0)", sub: "Build this first. The product lives or dies here.", color: "text-primary", badgeClass: "bg-primary/20 text-primary border-primary/40" },
    p1: { label: "Growth (P1)", sub: "Launch within 90 days. Drives premium conversion and depth.", color: "text-chart-3", badgeClass: "bg-chart-3/20 text-chart-3 border-chart-3/40" },
    p2: { label: "Moat (P2)", sub: "The defensibility layer. Hard to copy, impossible to ignore.", color: "text-accent", badgeClass: "bg-accent/20 text-accent border-accent/40" },
  };

  return (
    <section id="feature-universe" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">06</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Feature Universe</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">كون الميزات</h2>
        <p className="text-muted-foreground mb-8">Every feature exists to serve emotional depth, cultural trust, or behavioral retention.</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {(["p0", "p1", "p2"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveLayer(tier)}
              className={`flex-1 p-4 rounded-xl border transition-all text-left ${
                activeLayer === tier
                  ? `border-2 ${tier === "p0" ? "border-primary bg-primary/10" : tier === "p1" ? "border-chart-3 bg-chart-3/10" : "border-accent bg-accent/10"}`
                  : "border-card-border bg-card hover:border-white/20"
              }`}
            >
              <div className={`text-sm font-bold ${layers[tier].color} mb-1`}>{layers[tier].label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{layers[tier].sub}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {FEATURES[activeLayer].map((feature, i) => (
            <div
              key={i}
              className={`border rounded-xl p-5 transition-colors priority-${activeLayer}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-base font-semibold text-foreground">{feature.nameEn}</div>
                  <div className={`text-sm arabic-text ${layers[activeLayer].color}`}>{feature.name}</div>
                </div>
                <span className={`text-xs border px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2 ${layers[activeLayer].badgeClass}`}>
                  {activeLayer.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{feature.desc}</p>
              <div className="bg-black/20 rounded-lg p-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why it matters: </span>
                <span className="text-xs text-foreground/70">{feature.why}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="section-divider" />

        <div className="bg-card border border-card-border rounded-2xl p-8">
          <h3 className="text-base font-semibold text-foreground mb-6">Feature Design Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Emotion first, feature second", desc: "Every feature must answer: 'How does this make the user feel understood?' Not: 'What does this feature do?'" },
              { title: "Memory is the moat", desc: "Every interaction should deepen the companion's understanding of the user. Switching cost compounds over time." },
              { title: "Shame-free by design", desc: "No feature should require a user to admit they're struggling. Let them arrive from curiosity, stay from comfort." },
            ].map((item, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-4">
                <div className="text-sm font-semibold text-foreground mb-2">{item.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
