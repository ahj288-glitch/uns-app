import { useState } from "react";
import { Plus, Shield, User, Edit2, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Role = "super_admin" | "admin" | "moderator" | "safety_officer" | "content_editor" | "analyst";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastActive: string;
  status: "active" | "inactive";
  avatar: string;
}

interface Permission {
  module: string;
  moduleAr: string;
  super_admin: boolean;
  admin: boolean;
  moderator: boolean;
  safety_officer: boolean;
  content_editor: boolean;
  analyst: boolean;
}

const MEMBERS: TeamMember[] = [
  { id: "1", name: "أحمد الرشيد", email: "ahmed@uns.ai", role: "super_admin", lastActive: "الآن", status: "active", avatar: "أ" },
  { id: "2", name: "نورة المنصور", email: "noura@uns.ai", role: "admin", lastActive: "منذ ٢ ساعات", status: "active", avatar: "ن" },
  { id: "3", name: "خالد العمري", email: "khalid@uns.ai", role: "safety_officer", lastActive: "منذ ٣٠ دقيقة", status: "active", avatar: "خ" },
  { id: "4", name: "سارة الزهراني", email: "sara@uns.ai", role: "content_editor", lastActive: "منذ يوم", status: "active", avatar: "س" },
  { id: "5", name: "فيصل البراك", email: "faisal@uns.ai", role: "analyst", lastActive: "منذ ٣ أيام", status: "active", avatar: "ف" },
  { id: "6", name: "هند القحطاني", email: "hind@uns.ai", role: "moderator", lastActive: "منذ أسبوع", status: "inactive", avatar: "ه" },
];

const PERMISSIONS: Permission[] = [
  { module: "Dashboard", moduleAr: "لوحة التحكم", super_admin: true, admin: true, moderator: true, safety_officer: true, content_editor: true, analyst: true },
  { module: "Users", moduleAr: "المستخدمون", super_admin: true, admin: true, moderator: false, safety_officer: true, content_editor: false, analyst: true },
  { module: "AI Config", moduleAr: "إعدادات AI", super_admin: true, admin: true, moderator: false, safety_officer: false, content_editor: false, analyst: false },
  { module: "Feature Flags", moduleAr: "رايات الميزات", super_admin: true, admin: true, moderator: false, safety_officer: false, content_editor: false, analyst: false },
  { module: "Config Engine", moduleAr: "محرك الإعدادات", super_admin: true, admin: false, moderator: false, safety_officer: false, content_editor: false, analyst: false },
  { module: "Community", moduleAr: "المجتمع", super_admin: true, admin: true, moderator: true, safety_officer: false, content_editor: true, analyst: false },
  { module: "Safety", moduleAr: "السلامة", super_admin: true, admin: true, moderator: false, safety_officer: true, content_editor: false, analyst: false },
  { module: "Programs", moduleAr: "البرامج", super_admin: true, admin: true, moderator: false, safety_officer: false, content_editor: true, analyst: false },
  { module: "Nudges", moduleAr: "التدخلات", super_admin: true, admin: true, moderator: false, safety_officer: true, content_editor: false, analyst: false },
  { module: "Audit Logs", moduleAr: "سجل المراجعة", super_admin: true, admin: true, moderator: false, safety_officer: false, content_editor: false, analyst: true },
  { module: "Team RBAC", moduleAr: "إدارة الفريق", super_admin: true, admin: false, moderator: false, safety_officer: false, content_editor: false, analyst: false },
];

const ROLE_CONFIG: Record<Role, { label: string; color: string; desc: string }> = {
  super_admin: { label: "مدير عام", color: "text-[#74C69D] bg-[#74C69D]/15", desc: "صلاحيات كاملة بلا قيود" },
  admin: { label: "مدير", color: "text-primary bg-primary/10", desc: "كل الوحدات عدا RBAC والإعدادات الحساسة" },
  moderator: { label: "مشرف", color: "text-sky-400 bg-sky-400/10", desc: "إشراف على المجتمع والمحتوى فقط" },
  safety_officer: { label: "مسؤول السلامة", color: "text-destructive bg-destructive/10", desc: "وحدات السلامة والأزمات والمستخدمين" },
  content_editor: { label: "محرر محتوى", color: "text-violet-400 bg-violet-400/10", desc: "البرامج والمجتمع والمحتوى" },
  analyst: { label: "محلل بيانات", color: "text-amber-400 bg-amber-400/10", desc: "القراءة فقط — التحليلات وسجلات المراجعة" },
};

const ROLES_ORDER: Role[] = ["super_admin", "admin", "moderator", "safety_officer", "content_editor", "analyst"];

export default function TeamRBAC() {
  const [activeTab, setActiveTab] = useState<"members" | "permissions">("members");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-arabic">الفريق والصلاحيات</h1>
          <p className="text-muted-foreground font-arabic text-sm mt-1">إدارة أعضاء الفريق والأدوار والتحكم في الوصول</p>
        </div>
        <Button className="btn-gradient gap-2">
          <Plus className="w-4 h-4" />
          <span className="font-arabic">إضافة عضو</span>
        </Button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {ROLES_ORDER.map(role => {
          const cfg = ROLE_CONFIG[role];
          const count = MEMBERS.filter(m => m.role === role).length;
          return (
            <div key={role} className="bg-card rounded-2xl p-4 border border-[rgba(116,198,157,0.15)] text-right">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl font-bold">{count}</span>
                <Shield className={cn("w-4 h-4", cfg.color.split(" ")[0])} />
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-arabic inline-block mb-1", cfg.color)}>{cfg.label}</span>
              <p className="text-xs text-muted-foreground font-arabic mt-1">{cfg.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-xl p-1 w-fit mr-auto border border-[rgba(116,198,157,0.1)]">
        {(["members", "permissions"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-arabic transition-colors",
              activeTab === tab ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "members" ? "أعضاء الفريق" : "مصفوفة الصلاحيات"}
          </button>
        ))}
      </div>

      {activeTab === "members" ? (
        <div className="bg-card rounded-2xl border border-[rgba(116,198,157,0.15)] overflow-hidden">
          {MEMBERS.map((member, i) => {
            const roleCfg = ROLE_CONFIG[member.role];
            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors",
                  i < MEMBERS.length - 1 && "border-b border-[rgba(116,198,157,0.07)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-arabic", roleCfg.color)}>{roleCfg.label}</span>
                    <span className={cn("w-2 h-2 rounded-full shrink-0", member.status === "active" ? "bg-[#74C69D]" : "bg-muted")} />
                    <p className="font-medium font-arabic">{member.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{member.email} · آخر نشاط: {member.lastActive}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-arabic font-bold text-primary text-sm">{member.avatar}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-[rgba(116,198,157,0.15)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(116,198,157,0.08)]">
                <th className="text-right px-4 py-3 font-arabic text-muted-foreground font-medium text-xs">الوحدة</th>
                {ROLES_ORDER.map(role => (
                  <th key={role} className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-arabic", ROLE_CONFIG[role].color)}>
                      {ROLE_CONFIG[role].label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, i) => (
                <tr key={perm.module} className={cn("hover:bg-white/3 transition-colors", i < PERMISSIONS.length - 1 && "border-b border-[rgba(116,198,157,0.05)]")}>
                  <td className="px-4 py-3 text-right font-arabic">{perm.moduleAr}</td>
                  {ROLES_ORDER.map(role => (
                    <td key={role} className="px-4 py-3 text-center">
                      {perm[role] ? (
                        <Check className="w-4 h-4 text-[#74C69D] mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
