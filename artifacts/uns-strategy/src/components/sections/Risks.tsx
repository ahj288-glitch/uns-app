import { RISKS } from "@/data/strategy";

export function Risks() {
  return (
    <section id="risks" className="py-20 px-8 lg:px-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">15</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Risk Analysis & Mitigation</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">تحليل المخاطر</h2>
        <p className="text-muted-foreground mb-10">Every risk identified. Every mitigation defined. No blind spots.</p>

        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {["Risk", "Probability", "Impact", "Mitigation Strategy"].map(h => (
                  <th key={h} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISKS.map((risk, i) => (
                <tr key={i} className={`border-l-2 border-b border-border/20 ${risk.color} hover:bg-muted/10 transition-colors`}>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-foreground">{risk.risk}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      risk.probability === "High" ? "text-destructive bg-destructive/10 border border-destructive/20" :
                      risk.probability === "Medium" ? "text-primary bg-primary/10 border border-primary/20" :
                      "text-chart-4 bg-chart-4/10 border border-chart-4/20"
                    }`}>{risk.probability}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      risk.impact === "Critical" ? "text-destructive bg-destructive/10 border border-destructive/20" :
                      risk.impact === "High" ? "text-accent bg-accent/10 border border-accent/20" :
                      "text-chart-3 bg-chart-3/10 border border-chart-3/20"
                    }`}>{risk.impact}</span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{risk.mitigation}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "The AI Hallucination Risk (Deep Dive)",
              severity: "Critical",
              color: "border-destructive/40 bg-destructive/5",
              body: "An emotionally vulnerable user receives a hallucinated response from the companion that causes harm. This is the existential risk. Mitigation: crisis classifier runs BEFORE GPT on every message. System prompts include strict limits: never give medical advice, never dismiss professional help, always surface resources. Monthly red-team exercises with mental health professionals testing edge cases. Liability framing: companion supplement, not replacement.",
            },
            {
              title: "The Trust Breach Risk (Deep Dive)",
              severity: "Existential",
              color: "border-primary/40 bg-primary/5",
              body: "A data breach exposing mental health conversations would end the company instantly. Mitigation goes beyond technical: zero-knowledge architecture means the breach doesn't expose content even if the database is compromised. Incident response plan published publicly before launch. First-party promise: 'We will never monetize your pain.' Bug bounty program open from day one. Third-party security audit required before launch, not after.",
            },
          ].map((item, i) => (
            <div key={i} className={`border ${item.color} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <span className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">{item.severity}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
