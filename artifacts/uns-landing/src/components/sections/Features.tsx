import { motion } from "framer-motion";
import { Mic2, BrainCircuit, ShieldCheck, Heart, Moon, PhoneCall } from "lucide-react";

const features = [
  {
    icon: Mic2,
    titleAr: "يفهم لغتك",
    titleEn: "Speaks Your Dialect",
    desc: "سواء كنت خليجيًا أو شاميًا أو مصريًا أو مغاربيًا — أُنْس يفهم التفاصيل الثقافية الخاصة بك وراء كل كلمة."
  },
  {
    icon: BrainCircuit,
    titleAr: "يتذكر قصتك",
    titleEn: "Remembers Your Story",
    desc: "محرك ذاكرة عاطفية خاص يعني أنك لن تبدأ من جديد أبدًا. رفيقك يعرف ما حدث بالأمس."
  },
  {
    icon: ShieldCheck,
    titleAr: "يحمي سريتك",
    titleEn: "Privacy Vault",
    desc: "بنية معرفة صفرية. يومياتك وبياناتك العاطفية مشفّرة بالكامل — حتى نحن لا نستطيع قراءتها."
  },
  {
    icon: Heart,
    titleAr: "يشعر بك",
    titleEn: "Emotionally Calibrated",
    desc: "لا يبدو أبدًا كمعالج نفسي بارد. يرد دائمًا بدفء وكرامة ورعاية صديق حقيقي يفهمك."
  },
  {
    icon: Moon,
    titleAr: "رمضان معك",
    titleEn: "Cultural Integration",
    desc: "برامج مبنية خصيصًا لمواسم مثل رمضان — تعترف بالبُعد الروحي لصحتك النفسية."
  },
  {
    icon: PhoneCall,
    titleAr: "آمن تماماً",
    titleEn: "Crisis Support",
    desc: "مصنفات أمان آنية ترصد الضائقة وتوصلك بموارد دعم الأزمات المحلية في منطقة الشرق الأوسط وشمال أفريقيا عند الحاجة."
  }
];

export function Features() {
  return (
    <section className="py-32 bg-background relative" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
          >
            The Difference — ما يميزنا
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold arabic-text text-foreground"
          >
            مبني من الداخل للخارج
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card/30 hover:bg-card/60 transition-all p-8 rounded-3xl group"
              style={{ border: '1px solid rgba(116, 198, 157, 0.08)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="arabic-text text-2xl font-bold text-foreground mb-1">{f.titleAr}</h3>
              <h4 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-4">{f.titleEn}</h4>
              <p className="text-muted-foreground leading-loose text-sm arabic-text">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
