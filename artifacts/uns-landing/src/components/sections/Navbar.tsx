import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-panel py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between" dir="rtl">
        {/* Logo — Arabic-first */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="font-arabic font-bold text-background text-lg leading-none">أ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl arabic-calligraphy text-gradient-mint pb-1">أُنْس</span>
            <span className="w-px h-4 bg-white/20"></span>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">UNS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {scrolled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button onClick={scrollToWaitlist} size="sm" className="hidden sm:flex font-arabic">
                  انضم للقائمة
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {!scrolled && (
             <Button variant="ghost" onClick={scrollToWaitlist} className="text-muted-foreground hover:text-primary font-arabic">
               احجز مكانك
             </Button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
