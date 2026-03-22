import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    titleAr: "أخبرني",
    titleEn: "Tell Me",
    desc: "A 30-second daily ritual. Share how you're feeling using native Arabic emotional vocabulary. No clinical forms.",
    align: "md:items-start md:text-left",
    icon: "💬"
  },
  {
    num: "02",
    titleAr: "أتذكر",
    titleEn: "I Remember",
    desc: "Your companion learns your patterns over time. It remembers your story, your recurring worries, and your emotional seasons.",
    align: "md:items-center md:text-center mt-12 md:mt-24",
    icon: "🧠"
  },
  {
    num: "03",
    titleAr: "أكبر معك",
    titleEn: "I Grow With You",
    desc: "Receive smart nudges and insights that deepen monthly. A relationship that becomes more valuable the longer you stay.",
    align: "md:items-end md:text-right mt-12 md:mt-48",
    icon: "🌱"
  }
];

export function HowItWorks() {
  return (
    <section className="py-32 relative bg-background">
      {/* Background connector line */}
      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 z-0" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-foreground tracking-tight"
          >
            How it works
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              className={`flex flex-col ${step.align} relative`}
            >
              <div className="mb-6 relative">
                <span className="text-8xl font-black text-white/[0.03] absolute -top-8 -left-4 md:left-auto select-none pointer-events-none">{step.num}</span>
                <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-2xl relative z-10 border-primary/20 shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                  {step.icon}
                </div>
              </div>
              <h3 className="arabic-text text-4xl font-bold text-primary mb-2">{step.titleAr}</h3>
              <h4 className="text-xl font-semibold text-foreground mb-4">{step.titleEn}</h4>
              <p className="text-muted-foreground leading-relaxed max-w-[280px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
