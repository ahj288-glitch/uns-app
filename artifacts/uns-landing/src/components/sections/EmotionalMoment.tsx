import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function EmotionalMoment() {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-40 overflow-hidden flex items-center justify-center text-center">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/arabic-pattern.png`} 
          alt="" 
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold arabic-calligraphy text-foreground leading-tight mb-8 drop-shadow-2xl">
            هل تعرف ذلك الشعور اللي ما تقدر تحكيه لأحد؟
          </h2>
          <p className="text-2xl md:text-3xl text-primary font-light italic mb-12 font-serif">
            You know that feeling you can't explain to anyone?
          </p>
          <div className="flex flex-col items-center justify-center gap-6">
            <span className="text-xl font-medium tracking-widest uppercase text-muted-foreground">UNS UNDERSTANDS.</span>
            <Button size="lg" onClick={scrollToWaitlist} className="px-10 py-6 text-lg mt-4 shadow-[0_0_40px_rgba(201,168,76,0.3)]">
              Find Your Companion
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
