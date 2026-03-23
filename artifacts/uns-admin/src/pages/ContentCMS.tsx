import { useState } from "react";
import { FileText, Plus, Search, Filter, Eye, Edit3, Archive, Clock, CheckCircle, AlertCircle, Globe, RefreshCw, Layers } from "lucide-react";

const CONTENT_TYPES = ["الكل", "تنفس", "تأمل", "نوم", "تأريض", "مفكرة", "تعليم", "رحلات"];

const STATUSES = {
  live: { label: "منشور", color: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle },
  draft: { label: "مسودة", color: "text-amber-400 bg-amber-400/10", icon: Edit3 },
  review: { label: "مراجعة", color: "text-blue-400 bg-blue-400/10", icon: Clock },
  archived: { label: "مؤرشف", color: "text-muted-foreground bg-muted/20", icon: Archive },
};

const SAMPLE_CONTENT = [
  {
    id: "c01",
    title: "تنفس 4-7-8 للاسترخاء",
    titleEn: "4-7-8 Breathing for Calm",
    type: "تنفس",
    status: "live",
    dialect: "MSA",
    duration: "٤ دقائق",
    tier: "مجاني",
    tags: ["قلق", "نوم", "استرخاء"],
    completionRate: 78,
    opens: 1240,
    updatedAt: "منذ يومين",
    author: "فريق أُنس",
  },
  {
    id: "c02",
    title: "رحلة الامتنان — ٧ أيام",
    titleEn: "Gratitude Journey — 7 Days",
    type: "رحلات",
    status: "live",
    dialect: "خليجي",
    duration: "٧ أيام",
    tier: "أُنس+",
    tags: ["امتنان", "نمو", "عادات"],
    completionRate: 62,
    opens: 830,
    updatedAt: "منذ أسبوع",
    author: "د. نورة الحربي",
  },
  {
    id: "c03",
    title: "جلسة الليل الهادئ",
    titleEn: "Quiet Night Session",
    type: "نوم",
    status: "review",
    dialect: "MSA",
    duration: "١٢ دقيقة",
    tier: "أُنس+",
    tags: ["نوم", "ليل", "هدوء"],
    completionRate: 0,
    opens: 0,
    updatedAt: "منذ ٣ ساعات",
    author: "فريق المحتوى",
  },
  {
    id: "c04",
    title: "تمرين التأريض ٥-٤-٣-٢-١",
    titleEn: "5-4-3-2-1 Grounding",
    type: "تأريض",
    status: "draft",
    dialect: "شامي",
    duration: "٦ دقائق",
    tier: "مجاني",
    tags: ["قلق", "ذعر", "تأريض"],
    completionRate: 0,
    opens: 0,
    updatedAt: "منذ ٥ ساعات",
    author: "سارة منصور",
  },
  {
    id: "c05",
    title: "مطالبات مفكرة رمضان",
    titleEn: "Ramadan Journal Prompts",
    type: "مفكرة",
    status: "draft",
    dialect: "MSA",
    duration: "مفتوح",
    tier: "مجاني",
    tags: ["رمضان", "روحانية", "تأمل"],
    completionRate: 0,
    opens: 0,
    updatedAt: "منذ يوم",
    author: "فريق أُنس",
  },
  {
    id: "c06",
    title: "فهم القلق — درس قصير",
    titleEn: "Understanding Anxiety",
    type: "تعليم",
    status: "archived",
    dialect: "MSA",
    duration: "٣ دقائق",
    tier: "مجاني",
    tags: ["قلق", "تثقيف", "صحة نفسية"],
    completionRate: 45,
    opens: 2100,
    updatedAt: "منذ شهر",
    author: "فريق المحتوى",
  },
];

const STATS = [
  { label: "محتوى منشور", value: "42", sub: "+3 هذا الأسبوع", icon: Globe, color: "text-emerald-400" },
  { label: "في المراجعة", value: "7", sub: "يحتاج موافقة", icon: Clock, color: "text-amber-400" },
  { label: "مسودات", value: "12", sub: "قيد التأليف", icon: Edit3, color: "text-blue-400" },
  { label: "معدل إكمال", value: "68%", sub: "متوسط الأسبوع", icon: CheckCircle, color: "text-primary" },
];

export default function ContentCMS() {
  const [selectedType, setSelectedType] = useState("الكل");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "scheduled" | "dialects">("library");

  const filtered = SAMPLE_CONTENT.filter(c => {
    const matchType = selectedType === "الكل" || c.type === selectedType;
    const matchStatus = !selectedStatus || c.status === selectedStatus;
    const matchSearch = !searchQuery || c.title.includes(searchQuery) || c.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              إدارة المحتوى — CMS
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">منظومة المحتوى الموجّه — تجارب أُنس المتكاملة</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            محتوى جديد
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <Icon size={18} className={s.color} />
                  <span className="text-xs text-muted-foreground">{s.sub}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-card/60 rounded-xl p-1 w-fit border border-border/30">
          {[
            { key: "library" as const, label: "مكتبة المحتوى" },
            { key: "scheduled" as const, label: "جدول النشر" },
            { key: "dialects" as const, label: "اللهجات" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "library" && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="بحث في المحتوى..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border/30 rounded-xl pr-9 pl-4 py-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {CONTENT_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      selectedType === t ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {Object.entries(STATUSES).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      selectedStatus === key ? s.color + " border-current/30" : "border-border/30 text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Table */}
            <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs text-muted-foreground border-b border-border/20 bg-card">
                <span className="col-span-4">العنوان</span>
                <span className="col-span-1">النوع</span>
                <span className="col-span-1">الحالة</span>
                <span className="col-span-1">اللهجة</span>
                <span className="col-span-1">المستوى</span>
                <span className="col-span-1">الإكمال</span>
                <span className="col-span-1">الفتحات</span>
                <span className="col-span-1">تحديث</span>
                <span className="col-span-1">إجراء</span>
              </div>
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">لا توجد نتائج</div>
              ) : (
                filtered.map(c => {
                  const StatusMeta = STATUSES[c.status as keyof typeof STATUSES];
                  const StatusIcon = StatusMeta.icon;
                  return (
                    <div key={c.id} className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-background/50 transition-colors border-t border-border/10 group">
                      <div className="col-span-4">
                        <div className="font-medium text-sm text-foreground">{c.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{c.titleEn}</div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {c.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-xs bg-primary/8 text-primary px-1.5 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <span className="text-xs bg-card-high px-2 py-0.5 rounded-full">{c.type}</span>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${StatusMeta.color}`}>
                          <StatusIcon size={11} />
                          {StatusMeta.label}
                        </span>
                      </div>
                      <div className="col-span-1 text-xs text-muted-foreground">{c.dialect}</div>
                      <div className="col-span-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.tier === "مجاني" ? "bg-primary/8 text-primary" : "bg-amber-500/10 text-amber-400"
                        }`}>{c.tier}</span>
                      </div>
                      <div className="col-span-1">
                        {c.status === "live" ? (
                          <div>
                            <div className="text-xs text-foreground mb-1">{c.completionRate}%</div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${c.completionRate}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="col-span-1 text-xs text-muted-foreground">{c.opens > 0 ? c.opens.toLocaleString() : "—"}</div>
                      <div className="col-span-1 text-xs text-muted-foreground">{c.updatedAt}</div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
                          <button className="text-muted-foreground hover:text-primary transition-colors"><Edit3 size={14} /></button>
                          <button className="text-muted-foreground hover:text-muted-foreground/50 transition-colors"><Archive size={14} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === "scheduled" && (
          <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                النشر المجدوَل
              </h3>
              <div className="space-y-3">
                {[
                  { title: "محتوى رمضان كريم — مجموعة كاملة", date: "١ مارس ٢٠٢٦", time: "٦:٠٠ ص", pieces: 12, type: "إطلاق موسمي" },
                  { title: "جلسة ليلة القدر", date: "٢٦ رمضان ٢٠٢٦", time: "١٠:٠٠ م", pieces: 1, type: "محتوى مميز" },
                  { title: "أنشطة العيد — فرحة وتجديد", date: "١ شوال ٢٠٢٦", time: "٨:٠٠ ص", pieces: 5, type: "إطلاق موسمي" },
                  { title: "يوم الصحة النفسية العالمي", date: "١٠ أكتوبر ٢٠٢٦", time: "٩:٠٠ ص", pieces: 8, type: "حملة" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 p-4 bg-background rounded-xl">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{s.title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{s.date} · {s.time}</span>
                        <span className="text-xs text-primary">{s.pieces} قطعة محتوى</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full">{s.type}</span>
                      <button className="text-muted-foreground hover:text-primary transition-colors"><Edit3 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dialects" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { dialect: "MSA — الفصحى", coverage: "100%", pieces: 42, status: "مكتمل", bar: 100 },
                { dialect: "الخليجي", coverage: "84%", pieces: 35, status: "جيد", bar: 84 },
                { dialect: "الشامي", coverage: "61%", pieces: 26, status: "قيد العمل", bar: 61 },
                { dialect: "المصري", coverage: "45%", pieces: 19, status: "مبكر", bar: 45 },
              ].map(d => (
                <div key={d.dialect} className="bg-card rounded-2xl p-5 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.bar === 100 ? "bg-primary/10 text-primary" :
                      d.bar > 70 ? "bg-emerald-400/10 text-emerald-400" :
                      d.bar > 50 ? "bg-amber-400/10 text-amber-400" :
                      "bg-blue-400/10 text-blue-400"
                    }`}>{d.status}</span>
                    <span className="font-semibold text-sm" dir="rtl">{d.dialect}</span>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-2xl font-bold text-primary">{d.coverage}</span>
                    <span className="text-xs text-muted-foreground mb-1">{d.pieces} قطعة</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${d.bar}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <button className="hover:text-primary transition-colors flex items-center gap-1">
                      <RefreshCw size={11} /> مزامنة
                    </button>
                    <button className="hover:text-primary transition-colors flex items-center gap-1">
                      <Globe size={11} /> عرض الفجوات
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border/30">
              <h4 className="font-semibold text-sm mb-3">قطع محتوى تحتاج ترجمة</h4>
              <div className="space-y-2">
                {[
                  { title: "تمرين التأريض ٥-٤-٣-٢-١", missing: ["الشامي", "المصري"] },
                  { title: "رحلة الامتنان — ٧ أيام", missing: ["المصري"] },
                  { title: "جلسة الليل الهادئ", missing: ["الخليجي", "الشامي", "المصري"] },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-background rounded-xl">
                    <div className="flex items-center gap-2">
                      {p.missing.map(m => (
                        <span key={m} className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                    <span className="text-sm">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
