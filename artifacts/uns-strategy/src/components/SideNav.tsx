import { useState, useEffect } from "react";
import { NAV_SECTIONS } from "@/data/strategy";

export function SideNav() {
  const [activeId, setActiveId] = useState("executive-summary");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 overflow-y-auto bg-sidebar border-r border-sidebar-border flex flex-col z-50 hidden lg:flex">
      <div className="p-6 border-b border-sidebar-border">
        <div className="text-2xl font-bold gold-gradient">UNS | أُنس</div>
        <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Venture Strategy</div>
      </div>
      <div className="flex-1 py-4 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className={`w-full text-left px-6 py-2.5 flex items-start gap-3 transition-all duration-200 group hover:bg-sidebar-accent ${
              activeId === section.id ? "bg-sidebar-accent border-r-2 border-primary" : ""
            }`}
          >
            <span className={`text-xs font-mono mt-0.5 shrink-0 ${activeId === section.id ? "text-primary" : "text-muted-foreground"}`}>
              {section.num}
            </span>
            <div>
              <div className={`text-xs font-medium leading-tight ${activeId === section.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                {section.title}
              </div>
              <div className={`text-xs mt-0.5 arabic-text ${activeId === section.id ? "text-primary" : "text-muted-foreground/60"}`} style={{ fontSize: "10px" }}>
                {section.arabic}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground text-center">
          Venture Strategy Document<br />
          <span className="text-primary">March 2026</span>
        </div>
      </div>
    </nav>
  );
}
