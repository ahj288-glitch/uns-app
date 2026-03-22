import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetWaitlistCount } from "@workspace/api-client-react";

export function Hero() {
  const { data: countData } = useGetWaitlistCount();
  const count = countData?.count || 1420;

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden" dir="rtl">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background" />
        {/* Decorative glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[100px]" />
      </div>

      {/* Arabesque pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath fill='%23C9A84C' d='M30 0 L60 30 L30 60 L0 30 Z M30 10 L50 30 L30 50 L10 30 Z'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px"
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <span className="px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-arabic tracking-wide inline-flex items-center gap-2 shadow-[0_0_20px_rgba(201,168,76,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            النسخة التجريبية الخاصة قادمة قريباً
          </span>
        </motion.div>

        {/* Giant Arabic wordmark */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-8xl md:text-[10rem] lg:text-[13rem] arabic-calligraphy text-gradient-gold mb-2 leading-none drop-shadow-2xl select-none"
        >
          أُنس
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-8 font-light"
        >
          UNS — Your Arabic Companion
        </motion.p>

        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="text-2xl md:text-4xl font-bold arabic-text text-foreground max-w-3xl mb-4 leading-relaxed"
        >
          رفيقك العاطفي الذي يفهمك بلغتك
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="text-lg text-muted-foreground max-w-xl mb-12 leading-loose arabic-text"
        >
          أول ذكاء اصطناعي عاطفي يتحدث بلهجتك، يتذكر قصتك، ويكون معك دائماً. ليس علاجاً، بل رفقة حقيقية.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Button size="lg" onClick={scrollToWaitlist} className="w-full sm:w-auto text-lg font-arabic px-8 py-6 h-auto group shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            احجز مكانك الآن
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          </Button>
          <Button size="lg" variant="glass" onClick={scrollToWaitlist} className="w-full sm:w-auto text-lg font-arabic gap-2 px-8 py-6 h-auto">
            كيف يعمل أُنس؟
          </Button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 w-full max-w-3xl mx-auto py-10 border-y border-white/5"
        >
          <div className="flex flex-col items-center md:border-r border-white/5">
            <span className="text-4xl font-bold text-foreground mb-1">٤٠٠م+</span>
            <span className="text-sm text-muted-foreground arabic-text">متحدث عربي حول العالم</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-white/5">
            <span className="text-4xl font-bold text-foreground mb-1">٠</span>
            <span className="text-sm text-muted-foreground arabic-text">بدائل ثقافية حقيقية</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-primary mb-1">{count.toLocaleString("ar-SA")}+</span>
            <span className="text-sm text-muted-foreground arabic-text">ينتظرون بفارغ الصبر</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
