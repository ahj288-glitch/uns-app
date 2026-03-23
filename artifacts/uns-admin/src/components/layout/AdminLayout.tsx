import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  BookOpen, 
  ShieldAlert, 
  Settings, 
  Menu,
  X,
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { path: "/", label: "لوحة التحكم", labelEn: "Dashboard", icon: Home },
  { path: "/users", label: "المستخدمون وقائمة الانتظار", labelEn: "Users & Waitlist", icon: Users },
  { path: "/community", label: "المساحة الآمنة", labelEn: "Community", icon: BookOpen },
  { path: "/safety", label: "مراقبة السلامة", labelEn: "Safety Monitor", icon: ShieldAlert },
  { path: "/ai-config", label: "إعدادات الذكاء الاصطناعي", labelEn: "AI Config", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobile = () => setIsMobileOpen(false);

  const currentPage = NAV_ITEMS.find(i => i.path === location);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/30 selection:text-primary" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-72 bg-sidebar border-l border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col",
        isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <span className="font-arabic font-bold text-background text-2xl leading-none">أ</span>
            </div>
            <div>
              <h1 className="font-arabic font-bold text-xl leading-tight text-foreground">أُنس</h1>
              <p className="text-[10px] text-primary font-medium tracking-widest uppercase">UNS Admin Panel</p>
            </div>
          </div>
          <button onClick={closeMobile} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path} onClick={closeMobile} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "text-primary bg-primary/10 font-medium" 
                  : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
              )}>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                <span className="font-arabic text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-sidebar-border mt-auto">
          <button className="flex items-center gap-3 text-sidebar-foreground/70 hover:text-destructive transition-colors w-full px-4 py-2 font-arabic">
            <LogOut className="w-5 h-5 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-white/5 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold font-arabic">
                {currentPage?.label || "لوحة التحكم"}
              </h2>
              <p className="text-xs text-muted-foreground">{currentPage?.labelEn || "Dashboard"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium font-arabic">مدير النظام</p>
                <p className="text-xs text-muted-foreground">admin@uns.ai</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="font-arabic font-bold text-primary text-sm">م</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-24">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
