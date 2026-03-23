import { Apple, Play } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background py-16 text-center" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-arabic font-bold text-background text-xl leading-none">أ</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl arabic-calligraphy text-primary">أُنْس</span>
            <span className="w-px h-6 bg-white/20"></span>
            <span className="text-lg font-bold tracking-widest uppercase text-muted-foreground">UNS</span>
          </div>
        </div>
        
        <p className="arabic-text text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-loose">
          الرفيق الذكي الأول الذي صُمم ليفهم الإنسان العربي حقًا.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="flex items-center gap-3 bg-card hover:bg-card-high transition-colors px-6 py-3 rounded-xl opacity-50 cursor-not-allowed w-full sm:w-auto justify-center" style={{ border: '1px solid rgba(116,198,157,0.15)' }}>
            <Apple className="w-6 h-6 text-foreground" />
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground leading-none mb-1">قريباً في</div>
              <div className="text-sm font-semibold text-foreground leading-none">App Store</div>
            </div>
          </button>
          <button className="flex items-center gap-3 bg-card hover:bg-card-high transition-colors px-6 py-3 rounded-xl opacity-50 cursor-not-allowed w-full sm:w-auto justify-center" style={{ border: '1px solid rgba(116,198,157,0.15)' }}>
            <Play className="w-5 h-5 text-foreground fill-foreground" />
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground leading-none mb-1">قريباً في</div>
              <div className="text-sm font-semibold text-foreground leading-none">Google Play</div>
            </div>
          </button>
        </div>

        <div className="text-sm text-muted-foreground/60 flex flex-col md:flex-row items-center justify-center gap-4">
          <span>© ٢٠٢٦ أُنْس. جميع الحقوق محفوظة.</span>
          <span className="hidden md:block w-1 h-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-primary transition-colors font-arabic">سياسة الخصوصية</a>
          <span className="hidden md:block w-1 h-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-primary transition-colors font-arabic">شروط الاستخدام</a>
        </div>
      </div>
    </footer>
  );
}
