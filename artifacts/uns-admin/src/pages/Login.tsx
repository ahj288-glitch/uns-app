import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { login, isAuthenticated } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(password);
      navigate("/");
    } catch {
      setError("كلمة المرور غير صحيحة");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header */}
          <div className="bg-sidebar border-b border-sidebar-border p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-arabic font-bold text-background text-3xl leading-none">أ</span>
            </div>
            <div className="text-center">
              <h1 className="font-arabic font-bold text-2xl leading-tight text-foreground">أُنْس</h1>
              <p className="text-xs text-primary font-medium tracking-widest uppercase mt-1">UNS Admin Panel</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="font-arabic text-xl font-bold text-foreground mb-2 text-center">
              تسجيل الدخول
            </h2>
            <p className="text-muted-foreground text-sm font-arabic text-center mb-8">
              أدخل كلمة المرور للوصول إلى لوحة التحكم
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-arabic font-semibold text-foreground">
                  كلمة المرور <span className="text-muted-foreground font-normal">/ Admin Password</span>
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-10 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50 font-arabic transition-colors"
                    required
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-arabic rounded-xl px-4 py-3 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !password}
                className="w-full btn-gradient py-3.5 rounded-xl font-arabic font-semibold text-base disabled:opacity-50 disabled:transform-none transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    جارٍ الدخول...
                  </span>
                ) : (
                  <>دخول <span className="opacity-60 font-normal text-sm">/ Sign In</span></>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-arabic">
          للمساعدة التقنية، تواصل مع فريق الدعم
        </p>
      </div>
    </div>
  );
}
