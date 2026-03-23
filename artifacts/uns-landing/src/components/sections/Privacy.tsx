import { Shield } from "lucide-react";

export function Privacy() {
  return (
    <section className="py-20 bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-card ghost-border flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="arabic-text text-3xl md:text-4xl font-bold text-foreground mb-4">
          نحن لا نبيع مشاعرك.
        </h2>
        <p className="text-sm text-muted-foreground/70 font-medium mb-12 tracking-widest uppercase">
          We do not sell your feelings. Ever.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          {[
            { 
              titleAr: "معرفة صفرية", 
              titleEn: "Zero-Knowledge",
              desc: "يومياتك مشفّرة على جهازك. نحن لا نحتفظ بالمفاتيح — ولا نستطيع قراءتها حتى لو أردنا." 
            },
            { 
              titleAr: "لا إعلانات أبداً", 
              titleEn: "No Ads, Ever",
              desc: "نموذج عملنا بسيط: تدفع مقابل الميزات المميزة. لن نبيع بياناتك للمعلنين أبداً." 
            },
            { 
              titleAr: "بيانات إقليمية", 
              titleEn: "Regional Data",
              desc: "إقامة البيانات في منطقة الشرق الأوسط وشمال أفريقيا تضمن الامتثال لأنظمة حماية البيانات في الإمارات والسعودية." 
            },
          ].map((item, i) => (
            <div key={i} className="bg-primary/5 rounded-xl px-4 py-3">
              <h4 className="text-base font-bold text-foreground mb-1 font-arabic">{item.titleAr}</h4>
              <p className="text-xs text-primary/60 uppercase tracking-widest mb-3">{item.titleEn}</p>
              <p className="text-sm text-muted-foreground leading-loose arabic-text">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
