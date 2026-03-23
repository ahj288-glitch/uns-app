import { motion } from "framer-motion";

const steps = [
  {
    num: "١",
    titleAr: "أخبرني",
    titleEn: "Tell Me",
    desc: "طقوس يومية من ثلاثين ثانية. شارك كيف تشعر بلغتك العربية الخاصة — بدون نماذج طبية جافة.",
    align: "md:items-start md:text-right",
    icon: "💬"
  },
  {
    num: "٢",
    titleAr: "أتذكر",
    titleEn: "I Remember",
    desc: "رفيقك يتعلم أنماطك مع الوقت. يتذكر قصتك وقلقك المتكرر وفصولك العاطفية — لا تبدأ من جديد أبدًا.",
    align: "md:items-center md:text-center mt-12 md:mt-24",
    icon: "🧠"
  },
  {
    num: "٣",
    titleAr: "أكبر معك",
    titleEn: "I Grow With You",
    desc: "تلقَّ إشارات ذكية ورؤى تتعمق شهريًا. علاقة تزداد قيمة كلما طالت — مثل كل صداقة حقيقية.",
    align: "md:items-end md:text-left mt-12 md:mt-48",
    icon: "🌱"
  }
];

export function HowItWorks() {
  return (
    <section className="py-32 relative bg-background" dir="rtl">
      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 z-0" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs tracking-[0.3em] text-primary uppercase mb-4"
          >
            How It Works
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold arabic-text text-foreground"
          >
            كيف يعمل أُنْس؟
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
                <span className="text-8xl font-black text-white/[0.03] absolute -top-8 -right-4 select-none pointer-events-none arabic-text">{step.num}</span>
                <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-2xl relative z-10 border-primary/20 shadow-[0_0_30px_rgba(116,198,157,0.15)]">
                  {step.icon}
                </div>
              </div>
              <h3 className="arabic-text text-4xl font-bold text-primary mb-2">{step.titleAr}</h3>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">{step.titleEn}</h4>
              <p className="text-muted-foreground leading-loose max-w-[280px] arabic-text text-base">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
