import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useJoinWaitlist, useGetWaitlistCount } from "@workspace/api-client-react";

// Matches WaitlistJoinRequest from openapi.yaml
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  dialect: z.enum(["gulf", "levant", "egyptian", "maghrebi", "msa"], {
    required_error: "Please select a dialect",
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
      // Handle conflict (already on waitlist) or other errors
      if (error?.response?.status === 409) {
        alert("You are already on the waitlist!");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section id="waitlist" className="py-32 relative bg-card border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold arabic-text text-foreground mb-4">
            كن من أوائل المستخدمين
          </h2>
          <p className="text-xl text-muted-foreground">
            Be among the first to experience UNS.
          </p>
          {countData?.count && !success && (
            <p className="mt-4 inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              {countData.count.toLocaleString()} people are already waiting
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
                <label className="text-sm font-medium text-foreground">Email Address *</label>
                <Input 
                  {...register("email")} 
                  placeholder="hello@example.com" 
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name (Optional)</label>
                <Input {...register("name")} placeholder="Your name" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Preferred Arabic Dialect *</label>
                <select 
                  {...register("dialect")}
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white/10 transition-all appearance-none"
                >
                  <option value="" disabled selected>Select a dialect...</option>
                  <option value="gulf" className="bg-background text-foreground">Gulf (خليجي)</option>
                  <option value="levant" className="bg-background text-foreground">Levant (شامي)</option>
                  <option value="egyptian" className="bg-background text-foreground">Egyptian (مصري)</option>
                  <option value="maghrebi" className="bg-background text-foreground">Maghrebi (مغاربي)</option>
                  <option value="msa" className="bg-background text-foreground">Standard Arabic (فصحى)</option>
                </select>
                {errors.dialect && <p className="text-xs text-destructive">{errors.dialect.message}</p>}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full mt-4" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "انضم للقائمة — Join Waitlist"}
              </Button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/40">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="arabic-text text-3xl font-bold text-foreground mb-4">شكراً لانضمامك</h3>
              <p className="text-xl font-medium text-muted-foreground mb-6">You're on the list!</p>
              
              <div className="bg-background rounded-2xl p-6 border border-white/5 inline-block min-w-[250px]">
                <div className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Your Position</div>
                <div className="text-5xl font-black text-gradient-gold">#{position?.toLocaleString() || "..."}</div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-8">We'll email you when your companion is ready.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
