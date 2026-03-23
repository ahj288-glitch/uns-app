import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useJoinWaitlist, useGetWaitlistCount } from "@workspace/api-client-react";

const formSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  name: z.string().optional(),
  dialect: z.enum(["gulf", "levant", "egyptian", "maghrebi", "msa"], {
    required_error: "يرجى اختيار اللهجة",
  }),
  source: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function Waitlist() {
  const [success, setSuccess] = useState<boolean>(false);
  const [position, setPosition] = useState<number | null>(null);
  
  const { data: countData } = useGetWaitlistCount();
  const joinMutation = useJoinWaitlist();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: "landing_page"
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await joinMutation.mutateAsync({ data });
      setPosition(res.position);
      setSuccess(true);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        alert("أنت مسجّل بالفعل في قائمة الانتظار!");
      } else {
        alert("حدث خطأ ما. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <section id="waitlist" className="py-32 relative bg-card border-t border-white/5" dir="rtl">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-primary uppercase mb-4">ابدأ رحلتك</p>
          <h2 className="text-4xl md:text-5xl font-bold arabic-text text-foreground mb-4">
            كن من أوائل المستخدمين
          </h2>
          <p className="text-lg text-muted-foreground arabic-text">
            سجّل اهتمامك الآن وسنبلّغك حين يكون رفيقك جاهزاً
          </p>
          {countData?.count && !success && (
            <p className="mt-4 inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-arabic">
              {countData.count.toLocaleString("ar-SA")} شخص ينتظر بالفعل
            </p>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 md:p-12 rounded-3xl max-w-2xl mx-auto"
        >
          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-arabic font-medium text-foreground">البريد الإلكتروني *</label>
                <Input 
                  {...register("email")} 
                  placeholder="hello@example.com" 
                  dir="ltr"
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive font-arabic">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-arabic font-medium text-foreground">الاسم الأول (اختياري)</label>
                <Input {...register("name")} placeholder="اسمك" className="font-arabic" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-arabic font-medium text-foreground">اللهجة العربية المفضّلة *</label>
                <select 
                  {...register("dialect")}
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground font-arabic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white/10 transition-all appearance-none"
                >
                  <option value="" disabled>اختر لهجتك...</option>
                  <option value="gulf" className="bg-background text-foreground">خليجية</option>
                  <option value="levant" className="bg-background text-foreground">شامية</option>
                  <option value="egyptian" className="bg-background text-foreground">مصرية</option>
                  <option value="maghrebi" className="bg-background text-foreground">مغاربية</option>
                  <option value="msa" className="bg-background text-foreground">فصحى</option>
                </select>
                {errors.dialect && <p className="text-xs text-destructive font-arabic">{errors.dialect.message}</p>}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full mt-4 font-arabic text-base py-6 h-auto shadow-[0_0_25px_rgba(116,198,157,0.2)]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "جارٍ التسجيل..." : "احجز مكانك في قائمة الانتظار ←"}
              </Button>

              <p className="text-xs text-muted-foreground text-center font-arabic">
                لا رسائل مزعجة. لا بيانات تُباع. وعد.
              </p>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/40 shadow-[0_0_40px_rgba(116,198,157,0.25)]">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="arabic-text text-3xl font-bold text-foreground mb-3">أهلاً بك في أُنْس</h3>
              <p className="text-lg text-muted-foreground mb-8 arabic-text">شكراً لانضمامك — رفيقك في الطريق!</p>
              
              <div className="bg-background rounded-2xl p-6 border border-white/5 inline-block min-w-[250px]">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-arabic">موقعك في القائمة</div>
                <div className="text-5xl font-black text-gradient-gold">#{position?.toLocaleString("ar-SA") || "..."}</div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-8 arabic-text">سنراسلك حين يكون رفيقك مستعداً.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
