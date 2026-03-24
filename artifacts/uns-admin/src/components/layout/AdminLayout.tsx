import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Home,
  Users,
  BookOpen,
  ShieldAlert,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Cpu,
  Sliders,
  Flag,
  Megaphone,
  UserCog,
  ScrollText,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type NavItem = {
  path: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "الرئيسية",
    items: [
      { path: "/", label: "لوحة التحكم", labelEn: "Dashboard", icon: Home },
      { path: "/users", label: "المستخدمون", labelEn: "Users & Waitlist", icon: Users },
    ],
  },
  {
    title: "المحتوى والمجتمع",
    items: [
      { path: "/content-cms", label: "إدارة المحتوى", labelEn: "Content CMS", icon: Layers },
      { path: "/daily-recipes", label: "الومضة اليومية", labelEn: "Daily Recipes", icon: Sparkles },
      { path: "/programs", label: "البرامج", labelEn: "Programs", icon: BookOpen },
      { path: "/community", label: "المساحة الآمنة", labelEn: "Community", icon: BookOpen },
      { path: "/safety", label: "مراقبة السلامة", labelEn: "Safety Monitor", icon: ShieldAlert },
      { path: "/nudges", label: "التدخلات السلوكية", labelEn: "Nudges", icon: Megaphone },
    ],
  },
  {
    title: "النظام والذكاء الاصطناعي",
    items: [
      { path: "/ai-config", label: "إعدادات AI", labelEn: "AI Config", icon: Settings },
      { path: "/ai-providers", label: "مزودو AI", labelEn: "AI Providers", icon: Cpu },
      { path: "/config-engine", label: "محرك الإعدادات", labelEn: "Config Engine", icon: Sliders },
      { path: "/feature-flags", label: "رايات الميزات", labelEn: "Feature Flags", icon: Flag },
    ],
  },
  {
    title: "الفريق والمراجعة",
    items: [
      { path: "/team", label: "الفريق والصلاحيات", labelEn: "Team & RBAC", icon: UserCog },
      { path: "/audit-logs", label: "سجل المراجعة", labelEn: "Audit Logs", icon: ScrollText },
      { path: "/errors-config", label: "الأخطاء والحدود", labelEn: "Errors & Limits", icon: AlertTriangle },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAdminAuth();

  const closeMobile = () => setIsMobileOpen(false);

  const currentPage = ALL_NAV_ITEMS.find(i => i.path === location);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/30 selection:text-primary" dir="rtl">
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
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <span className="font-arabic font-bold text-background text-2xl leading-none">أ</span>
            </div>
            <div>
              <h1 className="font-arabic font-bold text-xl leading-tight text-foreground">أُنْس</h1>
              <p className="text-[10px] text-primary font-medium tracking-widest uppercase">UNS Admin Panel</p>
            </div>
          </div>
          <button onClick={closeMobile} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-[10px] text-muted-foreground/50 font-arabic tracking-widest uppercase px-3 mb-1.5">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = location === item.path;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={closeMobile}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute right-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                      <span className="font-arabic text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 text-sidebar-foreground/60 hover:text-destructive transition-colors w-full px-3 py-2.5 rounded-xl hover:bg-destructive/8 font-arabic"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm">تسجيل الخروج <span className="opacity-50 font-normal">/ Logout</span></span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-white/5 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold font-arabic leading-tight">
                {currentPage?.label || "لوحة التحكم"}
              </h2>
              <p className="text-[11px] text-muted-foreground leading-tight">{currentPage?.labelEn || "Dashboard"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-destructive rounded-full border border-background"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium font-arabic leading-tight">مدير النظام</p>
                <p className="text-[11px] text-muted-foreground leading-tight">admin@uns.ai</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="font-arabic font-bold text-primary text-xs">م</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8 pb-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
