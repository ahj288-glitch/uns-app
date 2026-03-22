import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useGetWaitlistCount } from "@workspace/api-client-react";

export function Hero() {
  const { data: countData } = useGetWaitlistCount();
  const count = countData?.count || 1420; // Fallback for visual proof if API fails

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6"
        >
          <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-widest uppercase inline-flex items-center gap-2 shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Private Beta Opening Soon
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl md:text-9xl lg:text-[140px] arabic-calligraphy text-gradient-gold mb-4 leading-tight drop-shadow-2xl"
        >
          أُنس
        </motion.h1>

        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl md:text-5xl font-bold text-foreground max-w-4xl tracking-tight mb-6"
        >
          Your Arabic Companion. <br className="hidden md:block" />
          <span className="text-muted-foreground">Built for How You Actually Feel.</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
        >
          The first emotionally intelligent AI that speaks your dialect, remembers your story, and grows with you. Never clinical, always present.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Button size="lg" onClick={scrollToWaitlist} className="w-full sm:w-auto text-lg group">
            Join the Waitlist
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Button>
          <Button size="lg" variant="glass" onClick={scrollToWaitlist} className="w-full sm:w-auto text-lg gap-2">
            <PlayCircle className="w-5 h-5 text-primary" />
            Watch How It Works
          </Button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div 
          initial={{ opacity: 0, borderBottomWidth: 0 }}
          animate={{ opacity: 1, borderBottomWidth: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 w-full max-w-4xl mx-auto py-8 border-y border-white/5"
        >
          <div className="flex flex-col items-center md:border-r border-white/5">
            <span className="text-3xl font-bold text-foreground mb-1">400M+</span>
            <span className="text-sm text-muted-foreground">Arabic speakers worldwide</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-white/5">
            <span className="text-3xl font-bold text-foreground mb-1">0</span>
            <span className="text-sm text-muted-foreground">Dominant cultural alternatives</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-primary mb-1">{count.toLocaleString()}+</span>
            <span className="text-sm text-muted-foreground">People already waiting</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
