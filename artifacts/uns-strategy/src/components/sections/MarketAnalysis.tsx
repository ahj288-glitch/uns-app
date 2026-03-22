import { useState } from "react";
import { COMPETITORS } from "@/data/strategy";

export function MarketAnalysis() {
  const [activeTab, setActiveTab] = useState<"global" | "regional">("global");

  return (
    <section id="market-analysis" className="py-20 px-8 lg:px-16">
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">02</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Market & Competitor Analysis</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">تحليل السوق والمنافسين</h2>
        <p className="text-muted-foreground mb-8">Who exists, why they fail Arab users, and where the white space lives.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Global mental wellness market", value: "$6.2B", sub: "2025 estimate" },
            { label: "MENA mental wellness market", value: "$2.1B", sub: "Projected 2027" },
            { label: "Arabic smartphone users", value: "320M+", sub: "Active mobile users" },
            { label: "Arabic wellness apps (dominant)", value: "0", sub: "Category unclaimed" },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
              <div className="text-xs font-medium text-foreground mb-1">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: "global", label: "Global Competitors" },
            { key: "regional", label: "Regional Landscape" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "global" | "regional")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "global" ? (
          <div className="space-y-4">
            {COMPETITORS.map((c, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl overflow-hidden hover:border-primary/20 transition-colors">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-base font-bold text-foreground">{c.name}</span>
                      <span className="ml-2 text-xs bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full">Global</span>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{c.monetization}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-chart-4 uppercase tracking-wider mb-1">Strengths</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.strengths}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">Weaknesses</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.weaknesses}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Emotional Position</div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">{c.emotional}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Why Users Leave</div>
                      <p className="text-xs text-foreground/70 leading-relaxed font-medium">{c.whyLeave}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-primary/30 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary mb-2">0</div>
                <div className="text-lg font-semibold text-foreground">Dominant Arabic Emotional Wellness Apps</div>
                <p className="text-muted-foreground mt-2 text-sm">The MENA region has no Calm, no Headspace, no Replika equivalent. The category is completely unclaimed.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  { region: "Gulf (KSA, UAE, Kuwait)", status: "Completely unserved", detail: "High income, high smartphone penetration, growing mental health awareness. Perfect conditions." },
                  { region: "Levant (Lebanon, Jordan, Syria, Palestine)", status: "Completely unserved", detail: "High digital literacy, strong diaspora market, significant trauma burden. No support." },
                  { region: "Egypt & Maghreb", status: "Completely unserved", detail: "Largest Arabic-speaking population. Distinct dialect. Massive underserved market." },
                ].map((r, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-5 border border-card-border">
                    <div className="text-sm font-semibold text-foreground mb-1">{r.region}</div>
                    <div className="text-xs text-destructive font-medium mb-2">{r.status}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Indirect competition in Arabic", body: "WhatsApp groups, Instagram therapists, Twitter (X) mental health discourse. These are proof of demand, not competition — they lack safety, continuity, and privacy." },
                { title: "Islamic wellness apps", body: "Zad, Tarteel, Muslim Pro — focused on religious content only. Zero emotional intelligence or companion dynamic. No crossover with what UNS does." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-card-border rounded-xl p-6">
                  <div className="text-sm font-semibold text-foreground mb-2">{item.title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section-divider" />
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Key Strategic Insight</div>
          <p className="text-base text-foreground leading-relaxed">
            Every global competitor that has tried Arabic has done so by translating their Western product. They have failed universally — not because of language, but because of emotional architecture. Arabic emotional experience is not a translation of English emotional experience. <span className="text-primary font-semibold">It requires a product built from the inside out.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
