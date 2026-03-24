import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, Calendar, RefreshCw } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

const CATEGORIES = ["تحفيز", "هدوء", "تأمل", "نمو ذاتي"];
const CATEGORY_COLORS: Record<string, string> = {
  "تحفيز": "bg-amber-100 text-amber-800 border-amber-200",
  "هدوء":  "bg-teal-100 text-teal-800 border-teal-200",
  "تأمل":  "bg-violet-100 text-violet-800 border-violet-200",
  "نمو ذاتي": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

interface Recipe {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  category: string;
  scheduledFor: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY: Omit<Recipe, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  summary: "",
  content: "",
  imageUrl: null,
  category: "هدوء",
  scheduledFor: null,
  isActive: true,
};

export default function DailyRecipes() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/daily-recipes`);
      const d = await r.json();
      setRecipes(d.recipes ?? []);
    } catch {
      toast({ title: "خطأ في التحميل", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setDialogOpen(true);
  }

  function openEdit(r: Recipe) {
    setEditing(r);
    setForm({
      title: r.title,
      summary: r.summary,
      content: r.content,
      imageUrl: r.imageUrl,
      category: r.category,
      scheduledFor: r.scheduledFor,
      isActive: r.isActive,
    });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast({ title: "يرجى ملء جميع الحقول الإلزامية", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        imageUrl: form.imageUrl || null,
        scheduledFor: form.scheduledFor || null,
      };
      const url = editing ? `${API}/admin/daily-recipes/${editing.id}` : `${API}/admin/daily-recipes`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("save failed");
      toast({ title: editing ? "تم التحديث" : "تم الإنشاء" });
      setDialogOpen(false);
      load();
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r: Recipe) {
    try {
      await fetch(`${API}/admin/daily-recipes/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      setRecipes(prev => prev.map(x => x.id === r.id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }

  async function deleteRecipe(id: string) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await fetch(`${API}/admin/daily-recipes/${id}`, { method: "DELETE" });
      setRecipes(prev => prev.filter(r => r.id !== id));
      toast({ title: "تم الحذف" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الومضة اليومية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة البطاقات اليومية التي تظهر في الشاشة الرئيسية للتطبيق
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1.5 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 ml-1.5" />
            إضافة ومضة
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          جاري التحميل...
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <p className="text-lg">لا توجد ومضات بعد</p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 ml-1.5" />
            أضف أول ومضة
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {recipes.map(r => {
            const isToday = r.scheduledFor === today;
            const isExpanded = previewId === r.id;
            return (
              <div
                key={r.id}
                className={`rounded-xl border bg-card p-5 transition-all ${!r.isActive ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[r.category] ?? "bg-gray-100 text-gray-700"}`}>
                        {r.category}
                      </span>
                      {r.isActive && (
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                          نشطة
                        </Badge>
                      )}
                      {isToday && (
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          ✦ اليوم
                        </Badge>
                      )}
                      {r.scheduledFor && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {r.scheduledFor}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-foreground">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.summary}</p>
                    {isExpanded && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {r.content}
                      </div>
                    )}
                    {r.imageUrl && (
                      <a
                        href={r.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 underline mt-1 block"
                      >
                        رابط الصورة ↗
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewId(prev => prev === r.id ? null : r.id)}
                      title="معاينة المحتوى"
                    >
                      {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(r)}
                      title={r.isActive ? "إيقاف" : "تفعيل"}
                    >
                      {r.isActive
                        ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                        : <Eye className="h-4 w-4 text-green-600" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteRecipe(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل الومضة" : "إضافة ومضة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>العنوان *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="مثال: الومضة اليومية"
                  dir="rtl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>الفئة *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>تاريخ العرض (اختياري)</Label>
                <Input
                  type="date"
                  value={form.scheduledFor ?? ""}
                  onChange={e => setForm(f => ({ ...f, scheduledFor: e.target.value || null }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>النص المختصر * <span className="text-muted-foreground">(يظهر في البطاقة)</span></Label>
              <Textarea
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="جملة أو جملتان تلخّصان الومضة"
                rows={2}
                dir="rtl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>المحتوى الكامل * <span className="text-muted-foreground">(يظهر عند الفتح)</span></Label>
              <Textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="اكتب هنا القصة أو الحكمة أو التأمل كاملاً..."
                rows={6}
                dir="rtl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>رابط الصورة (اختياري)</Label>
              <Input
                value={form.imageUrl ?? ""}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value || null }))}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">نشطة (تظهر في التطبيق)</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إنشاء الومضة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
