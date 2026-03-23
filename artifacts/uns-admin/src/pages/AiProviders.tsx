import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Zap, AlertTriangle, CheckCircle, XCircle, Edit2, Trash2, RefreshCw, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ProviderStatus = "active" | "fallback" | "disabled";

interface Provider {
  id: string;
  name: string;
  model: string;
  status: ProviderStatus;
  latency: number;
  cost: number;
  requests: number;
  errors: number;
  priority: number;
  useCase: string[];
}

const INITIAL_PROVIDERS: Provider[] = [
  { id: "1", name: "OpenAI", model: "gpt-4o", status: "active", latency: 420, cost: 0.015, requests: 48291, errors: 12, priority: 1, useCase: ["chat", "crisis", "empathy"] },
  { id: "2", name: "OpenAI", model: "gpt-4o-mini", status: "active", latency: 180, cost: 0.0004, requests: 102847, errors: 34, priority: 2, useCase: ["quick-reply", "mood-analysis"] },
  { id: "3", name: "Anthropic", model: "claude-3-5-sonnet", status: "fallback", latency: 510, cost: 0.018, requests: 3201, errors: 4, priority: 3, useCase: ["empathy", "long-context"] },
  { id: "4", name: "Google", model: "gemini-1.5-pro", status: "disabled", latency: 620, cost: 0.012, requests: 0, errors: 0, priority: 4, useCase: ["experimental"] },
];

const STATUS_CONFIG: Record<ProviderStatus, { label: string; color: string; bg: string }> = {
  active: { label: "نشط", color: "text-[#74C69D]", bg: "bg-[#74C69D]/10" },
  fallback: { label: "احتياطي", color: "text-amber-400", bg: "bg-amber-400/10" },
  disabled: { label: "معطّل", color: "text-muted-foreground", bg: "bg-muted/10" },
};

const FAILOVER_RULES = [
  { trigger: "خطأ ≥ ٥٪", action: "التبديل للنموذج الاحتياطي", delay: "٣٠ ثانية" },
  { trigger: "زمن استجابة > ٢٠٠٠ms", action: "توزيع الحمل بين النماذج", delay: "فوري" },
  { trigger: "حصة API مستنفدة", action: "التبديل لأقل أولوية", delay: "١ دقيقة" },
];

export default function AiProviders() {
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [expanded, setExpanded] = useState<string | null>("1");

  const toggleStatus = (id: string) => {
    setProviders(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: p.status === "disabled" ? "active" : "disabled" as ProviderStatus }
          : p
      )
    );
  };

  const totalRequests = providers.reduce((s, p) => s + p.requests, 0);
  const activeProviders = providers.filter(p => p.status === "active").length;
  const avgLatency = Math.round(
    providers.filter(p => p.status === "active").reduce((s, p) => s + p.latency, 0) / activeProviders
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-arabic">إدارة مزودي الذكاء الاصطناعي</h1>
          <p className="text-muted-foreground font-arabic text-sm mt-1">تكوين النماذج، أولويات الفشل التدريجي، وتكاليف الاستخدام</p>
        </div>
        <Button className="btn-gradient gap-2">
          <Plus className="w-4 h-4" />
          <span className="font-arabic">إضافة مزوّد</span>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: (totalRequests / 1000).toFixed(1) + "k", icon: Zap, color: "text-primary" },
          { label: "المزودون النشطون", value: `${activeProviders} / ${providers.length}`, icon: CheckCircle, color: "text-[#74C69D]" },
          { label: "متوسط الاستجابة", value: `${avgLatency}ms`, icon: RefreshCw, color: "text-amber-400" },
          { label: "معدل الأخطاء", value: "0.03٪", icon: AlertTriangle, color: "text-destructive" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl p-5 text-right border border-[rgba(116,198,157,0.15)]">
            <stat.icon className={cn("w-5 h-5 mb-3 mr-auto", stat.color)} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-arabic mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Providers List */}
      <div className="space-y-3">
        <h2 className="font-arabic font-semibold text-right">النماذج المُكوَّنة</h2>
        {providers.map((provider, idx) => {
          const cfg = STATUS_CONFIG[provider.status];
          const isExpanded = expanded === provider.id;
          const errorRate = provider.requests > 0 ? ((provider.errors / provider.requests) * 100).toFixed(2) : "0.00";

          return (
            <motion.div
              key={provider.id}
              layout
              className="bg-card rounded-2xl border border-[rgba(116,198,157,0.15)] overflow-hidden"
            >
              <div
                className="w-full p-5 flex items-center gap-4 text-right cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : provider.id)}
              >
                <div className={cn("w-2 h-2 rounded-full shrink-0", provider.status === "active" ? "bg-[#74C69D]" : provider.status === "fallback" ? "bg-amber-400" : "bg-muted")} />
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-arabic font-medium", cfg.color, cfg.bg)}>{cfg.label}</span>
                    <h3 className="font-semibold">{provider.name} — {provider.model}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-arabic mt-1">
                    الأولوية #{provider.priority} · {provider.useCase.join("، ")}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-primary">{provider.latency}ms</p>
                    <p className="text-xs text-muted-foreground">استجابة</p>
                  </div>
                  <Switch
                    checked={provider.status !== "disabled"}
                    onCheckedChange={() => toggleStatus(provider.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 pb-5 space-y-4"
                >
                  <div className="h-px bg-[rgba(116,198,157,0.08)]" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "الطلبات الإجمالية", value: provider.requests.toLocaleString() },
                      { label: "معدل الأخطاء", value: `${errorRate}٪` },
                      { label: "التكلفة لكل ١k", value: `$${provider.cost}` },
                      { label: "وقت الاستجابة", value: `${provider.latency}ms` },
                    ].map(m => (
                      <div key={m.label} className="bg-background/40 rounded-xl p-3 text-right">
                        <p className="text-sm font-semibold">{m.value}</p>
                        <p className="text-xs text-muted-foreground font-arabic mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" className="gap-1.5 font-arabic text-xs text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 font-arabic text-xs border-[rgba(116,198,157,0.2)]">
                      <Edit2 className="w-3.5 h-3.5" /> تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 font-arabic text-xs border-[rgba(116,198,157,0.2)]">
                      <RefreshCw className="w-3.5 h-3.5" /> اختبار الاتصال
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Failover Rules */}
      <div>
        <h2 className="font-arabic font-semibold text-right mb-4">قواعد الفشل التدريجي (Failover)</h2>
        <div className="bg-card rounded-2xl border border-[rgba(116,198,157,0.15)] overflow-hidden">
          {FAILOVER_RULES.map((rule, i) => (
            <div key={i} className={cn("flex items-center justify-between px-5 py-4 text-right", i < FAILOVER_RULES.length - 1 && "border-b border-[rgba(116,198,157,0.08)]")}>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs font-arabic border-[rgba(116,198,157,0.2)] text-muted-foreground">{rule.delay}</Badge>
                <span className="text-sm text-muted-foreground font-arabic">{rule.action}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-arabic">{rule.trigger}</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
