import { motion } from "framer-motion";
import { Mic2, BrainCircuit, ShieldCheck, Heart, Moon, PhoneCall } from "lucide-react";

const features = [
  {
    icon: Mic2,
    titleAr: "يفهم لغتك",
    titleEn: "Speaks Your Dialect",
    desc: "Whether Gulf, Levant, Egyptian, or Maghrebi. The AI understands the cultural nuance behind your specific words."
  },
  {
    icon: BrainCircuit,
    titleAr: "يتذكر قصتك",
    titleEn: "Remembers Your Story",
    desc: "A proprietary emotional memory engine means you never have to start from scratch. Your companion knows what happened yesterday."
  },
  {
    icon: ShieldCheck,
    titleAr: "يحمي سريتك",
    titleEn: "Privacy Vault",
    desc: "Zero-knowledge architecture. Your journal entries and emotional data are encrypted. We cannot read them even if we tried."
  },
  {
    icon: Heart,
    titleAr: "يشعر بك",
    titleEn: "Emotionally Calibrated",
    desc: "Never sounds like a clinical therapist. Always responds with the warmth, dignity, and care of a true friend."
  },
  {
    icon: Moon,
    titleAr: "رمضان معك",
    titleEn: "Cultural Integration",
    desc: "Programs built specifically for moments like Ramadan, acknowledging the spiritual dimension of mental wellness."
  },
  {
    icon: PhoneCall,
    titleAr: "آمن تماماً",
    titleEn: "Crisis Support",
    desc: "Real-time safety classifiers detect distress and seamlessly connect you to local MENA crisis resources when needed."
  }
];

export function Features() {
  return (
    <section className="py-32 bg-[#0B0D14] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block"
          >
            The Difference
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-foreground"
          >
            Built from the inside out.
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
              className="bg-card/30 border border-white/5 hover:border-primary/30 hover:bg-card/60 transition-all p-8 rounded-3xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="arabic-text text-2xl font-bold text-foreground mb-1">{f.titleAr}</h3>
              <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-4">{f.titleEn}</h4>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
