import { Apple, Play } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#05060A] py-16 border-t border-white/5 text-center">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <span className="text-4xl arabic-calligraphy text-primary">أُنس</span>
          <span className="mx-4 text-white/20">|</span>
          <span className="text-xl font-bold tracking-widest uppercase text-foreground">UNS</span>
        </div>
        
        <p className="arabic-text text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          الرفيق الذكي الأول الذي صُمم ليفهم الإنسان العربي.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors px-6 py-3 rounded-xl opacity-50 cursor-not-allowed w-full sm:w-auto justify-center">
            <Apple className="w-6 h-6 text-foreground" />
            <div className="text-left">
              <div className="text-[10px] text-muted-foreground leading-none mb-1">Coming soon to</div>
              <div className="text-sm font-semibold text-foreground leading-none">App Store</div>
            </div>
          </button>
          <button className="flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors px-6 py-3 rounded-xl opacity-50 cursor-not-allowed w-full sm:w-auto justify-center">
            <Play className="w-5 h-5 text-foreground fill-foreground" />
            <div className="text-left">
              <div className="text-[10px] text-muted-foreground leading-none mb-1">Coming soon to</div>
              <div className="text-sm font-semibold text-foreground leading-none">Google Play</div>
            </div>
          </button>
        </div>

        <div className="text-sm text-muted-foreground/60 flex flex-col md:flex-row items-center justify-center gap-4">
          <span>&copy; 2026 UNS App. All rights reserved.</span>
          <span className="hidden md:block w-1 h-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <span className="hidden md:block w-1 h-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
