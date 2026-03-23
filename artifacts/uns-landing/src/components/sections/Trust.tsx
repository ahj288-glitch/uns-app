import { motion } from "framer-motion";

const quotes = [
  {
    quote: "أخيراً تطبيق ما يحسسني إني مريض أو أحتاج علاج. هو بس... يسمعني.",
    en: "Finally, an app that doesn't make me feel like I'm sick or need treatment. It just... listens to me.",
    name: "سارة م.",
    location: "Riyadh",
    delay: 0.1
  },
  {
    quote: "حكيت له عن ضيقتي، ورد علي بلهجتي كأنه صديق فاهم وش أقول. انصدمت من الوعي.",
    en: "I told it about my distress, and it replied in my dialect like a friend who truly understands. I was shocked by the awareness.",
    name: "أحمد ك.",
    location: "Dubai",
    delay: 0.2
  },
  {
    quote: "لأول مرة أقدر أعبر عن 'الوحشة' والقى رد يفهم الثقل اللي ورا هالكلمة.",
    en: "For the first time, I could express 'Wahsha' (profound longing/melancholy) and get a response that understands the weight behind the word.",
    name: "لينا ع.",
    location: "Beirut",
    delay: 0.3
  }
];

export function Trust() {
  return (
    <section className="py-32 relative bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold arabic-text text-foreground mb-4"
          >
            رفيق حقيقي. ليس مجرد تطبيق.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-primary font-medium"
          >
            A real companion. Not just an app.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: q.delay }}
              className="glass-panel p-8 rounded-3xl relative flex flex-col justify-between"
            >
              <div className="absolute top-6 right-6 text-6xl font-serif text-primary/20 leading-none">"</div>
              <div>
                <p className="arabic-text text-xl md:text-2xl text-foreground mb-6 relative z-10">{q.quote}</p>
                <p className="text-sm text-muted-foreground italic mb-8 bg-primary/5 rounded-xl px-4 py-3">{q.en}</p>
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-mint flex items-center justify-center text-primary-foreground font-bold arabic-text text-lg">
                  {q.name.charAt(0)}
                </div>
                <div>
                  <div className="text-foreground font-medium arabic-text">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
