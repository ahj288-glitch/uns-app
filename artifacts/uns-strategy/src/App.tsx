import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SideNav } from "@/components/SideNav";
import { ExecutiveSummary } from "@/components/sections/ExecutiveSummary";
import { MarketAnalysis } from "@/components/sections/MarketAnalysis";
import { GapAnalysis } from "@/components/sections/GapAnalysis";
import { ProductDefinition } from "@/components/sections/ProductDefinition";
import { Positioning } from "@/components/sections/Positioning";
import { FeatureUniverse } from "@/components/sections/FeatureUniverse";
import { UXJourney } from "@/components/sections/UXJourney";
import { Monetization } from "@/components/sections/Monetization";
import { Growth } from "@/components/sections/Growth";
import { Architecture } from "@/components/sections/Architecture";
import { Security } from "@/components/sections/Security";
import { AdminSystem } from "@/components/sections/AdminSystem";
import { MVP } from "@/components/sections/MVP";
import { Roadmap } from "@/components/sections/Roadmap";
import { Risks } from "@/components/sections/Risks";
import { FinalRecommendation } from "@/components/sections/FinalRecommendation";
import { DesignSystem } from "@/components/sections/DesignSystem";
import { PersonalizationEngine } from "@/components/sections/PersonalizationEngine";
import { ViralLoop } from "@/components/sections/ViralLoop";
import { TrustFramework } from "@/components/sections/TrustFramework";
import { ContentSystem } from "@/components/sections/ContentSystem";
import { JournalSystem } from "@/components/sections/JournalSystem";
import { GrowthMechanics } from "@/components/sections/GrowthMechanics";
import { ObservabilityAndQA } from "@/components/sections/ObservabilityAndQA";
import { MonetizationArchitecture } from "@/components/sections/MonetizationArchitecture";
import { DataGovernance } from "@/components/sections/DataGovernance";
import { LocalizationEnterprise } from "@/components/sections/LocalizationEnterprise";
import { BrandAndSupport } from "@/components/sections/BrandAndSupport";
import { useState } from "react";
import { NAV_SECTIONS } from "@/data/strategy";

const queryClient = new QueryClient();

function MobileNav() {
  const [open, setOpen] = useState(false);
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="text-lg font-bold gold-gradient">UNS | أُنس</div>
        <button
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
        >
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-sidebar border-b border-sidebar-border max-h-[70vh] overflow-y-auto">
          {NAV_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-sidebar-accent border-b border-border/20 last:border-0"
            >
              <span className="text-xs font-mono text-primary">{s.num}</span>
              <span className="text-xs text-foreground">{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background flex">
        <SideNav />
        <MobileNav />
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
          <div className="divide-y divide-border/20">
            <ExecutiveSummary />
            <MarketAnalysis />
            <GapAnalysis />
            <ProductDefinition />
            <Positioning />
            <FeatureUniverse />
            <UXJourney />
            <Monetization />
            <Growth />
            <Architecture />
            <Security />
            <AdminSystem />
            <MVP />
            <Roadmap />
            <Risks />
            <FinalRecommendation />
            <DesignSystem />
            <PersonalizationEngine />
            <ViralLoop />
            <TrustFramework />
            <ContentSystem />
            <JournalSystem />
            <GrowthMechanics />
            <ObservabilityAndQA />
            <MonetizationArchitecture />
            <DataGovernance />
            <LocalizationEnterprise />
            <BrandAndSupport />
          </div>
          <footer className="py-12 px-8 lg:px-16 border-t border-border/30 text-center">
            <div className="text-2xl gold-gradient font-bold mb-2">أُنس | UNS</div>
            <p className="text-sm text-muted-foreground">Venture Strategy Document — Confidential</p>
            <p className="text-xs text-muted-foreground mt-1">March 2026 · Arabic-First Emotional Wellness Companion</p>
          </footer>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
