import { Shield } from "lucide-react";

export function Privacy() {
  return (
    <section className="py-20 bg-background border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-card border border-white/5 flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="arabic-text text-3xl md:text-4xl font-bold text-foreground mb-4">
          نحن لا نبيع مشاعرك.
        </h2>
        <p className="text-xl text-muted-foreground font-medium mb-12">
          We do not sell your feelings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { title: "Zero-Knowledge", desc: "Your journal entries are encrypted on your device. We don't hold the keys." },
            { title: "No Ads, Ever", desc: "Our business model is simple: you pay for premium features. We never sell your data to advertisers." },
            { title: "Regional Data", desc: "Data residency in MENA ensures compliance with UAE and KSA PDPL frameworks." },
          ].map((item, i) => (
            <div key={i} className="border-l-2 border-primary/30 pl-4">
              <h4 className="text-base font-semibold text-foreground mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
