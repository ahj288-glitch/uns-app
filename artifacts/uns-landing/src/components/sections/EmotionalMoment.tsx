import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function EmotionalMoment() {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-40 overflow-hidden flex items-center justify-center text-center" dir="rtl">
      {/* Radial glow background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Decorative arabesque */}
          <div className="flex items-center justify-center mb-10 opacity-30">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/50"></div>
            <span className="mx-4 text-3xl arabic-calligraphy text-primary">❧</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/50"></div>
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold arabic-calligraphy text-foreground leading-tight mb-8 drop-shadow-2xl">
            هل تعرف ذلك الشعور<br />اللي ما تقدر تحكيه لأحد؟
          </h2>
          <p className="text-xl md:text-2xl text-primary/80 font-light mb-4 italic">
            That feeling you can't explain to anyone?
          </p>
          <p className="text-lg text-muted-foreground mb-12 arabic-text max-w-xl mx-auto leading-loose">
            أُنْس يفهم. ليس لأنه مُبرمج — بل لأنه صُمم ليحمل معك ما يثقل عليك.
          </p>
          <div className="flex flex-col items-center justify-center gap-6">
            <Button size="lg" onClick={scrollToWaitlist} className="px-12 py-7 text-xl font-arabic h-auto shadow-[0_0_50px_rgba(116,198,157,0.25)] hover:shadow-[0_0_70px_rgba(116,198,157,0.35)] transition-shadow">
              احجز مكانك مع أُنْس
            </Button>
            <p className="text-xs text-muted-foreground/60 tracking-widest uppercase">UNS UNDERSTANDS.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
