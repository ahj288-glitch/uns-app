import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { 
  useGetAdminPrograms, 
  useCreateAdminProgram, 
  useUpdateAdminProgram, 
  useDeleteAdminProgram,
  getGetAdminProgramsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Edit2, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";

const programSchema = z.object({
  titleAr: z.string().min(2, "Arabic title is required"),
  titleEn: z.string().min(2, "English title is required"),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  durationDays: z.coerce.number().min(1).max(365),
  category: z.enum(["anxiety", "grief", "sleep", "ramadan", "general", "spiritual"]),
  tier: z.enum(["free", "premium"]),
  active: z.boolean().default(true),
});

type ProgramForm = z.infer<typeof programSchema>;

const CATEGORY_COLORS: Record<string, string> = {
  anxiety: "bg-destructive/10 text-destructive border-destructive/20",
  grief: "bg-[#a5d0b9]/10 text-[#a5d0b9] border-[#a5d0b9]/20",
  sleep: "bg-primary/10 text-primary border-primary/20",
  ramadan: "bg-accent/10 text-accent border-accent/20",
  general: "bg-[#85d7ad]/10 text-[#85d7ad] border-[#85d7ad]/20",
  spiritual: "bg-[#74C69D]/10 text-[#74C69D] border-[#74C69D]/20",
};

export default function Programs() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetAdminPrograms();
  const programs = data?.programs || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const createMutation = useCreateAdminProgram({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminProgramsQueryKey() });
        closeModal();
      }
    }
  });

  const updateMutation = useUpdateAdminProgram({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminProgramsQueryKey() });
        closeModal();
      }
    }
  });

  const deleteMutation = useDeleteAdminProgram({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminProgramsQueryKey() });
      }
    }
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProgramForm>({
    resolver: zodResolver(programSchema),
    defaultValues: { active: true, durationDays: 7, tier: "free", category: "general" }
  });

  const openAdd = () => {
    setEditingId(null);
    reset({ active: true, durationDays: 7, tier: "free", category: "general" });
    setIsModalOpen(true);
  };

  const openEdit = (prog: any) => {
    setEditingId(prog.id);
    reset({
      titleAr: prog.titleAr,
      titleEn: prog.titleEn,
      descriptionAr: prog.descriptionAr || "",
      descriptionEn: prog.descriptionEn || "",
      durationDays: prog.durationDays,
      category: prog.category as any,
      tier: prog.tier as any,
      active: prog.active
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = (data: ProgramForm) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this program?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wellness Programs</h1>
          <p className="text-muted-foreground mt-1">Manage structured emotional journeys</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-3 btn-gradient rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Program</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Duration & Tier</th>
                <th className="px-6 py-4 font-medium">Engagement</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground"><div className="animate-pulse flex items-center justify-center gap-3"><BookOpen className="w-5 h-5"/> Loading programs...</div></td></tr>
              ) : programs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No programs found.</td></tr>
              ) : programs.map((prog) => (
                <tr key={prog.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground font-arabic text-lg">{prog.titleAr}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{prog.titleEn}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border capitalize whitespace-nowrap",
                      CATEGORY_COLORS[prog.category] || "bg-secondary text-secondary-foreground"
                    )}>
                      {prog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{prog.durationDays} Days</div>
                    <div className={cn("text-xs font-bold mt-1 uppercase tracking-wider", prog.tier === 'premium' ? 'text-accent' : 'text-primary')}>
                      {prog.tier}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">{prog.enrolledCount.toLocaleString()} Users</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="bg-accent h-full" style={{ width: `${prog.completionRate * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{(prog.completionRate * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {prog.active ? (
                      <span className="flex items-center gap-1.5 text-primary text-sm font-medium"><CheckCircle2 className="w-4 h-4"/> Active</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium"><XCircle className="w-4 h-4"/> Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(prog)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(prog.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? "Edit Program" : "Add New Program"}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Arabic Title <span className="text-destructive">*</span></label>
              <input {...register("titleAr")} dir="rtl" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-right font-arabic" placeholder="اسم البرنامج" />
              {errors.titleAr && <p className="text-xs text-destructive">{errors.titleAr.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">English Title <span className="text-destructive">*</span></label>
              <input {...register("titleEn")} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50" placeholder="Program Title" />
              {errors.titleEn && <p className="text-xs text-destructive">{errors.titleEn.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Arabic Description</label>
              <textarea {...register("descriptionAr")} dir="rtl" rows={3} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-right font-arabic resize-none" placeholder="وصف قصير..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">English Description</label>
              <textarea {...register("descriptionEn")} rows={3} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Short description..." />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Duration (Days)</label>
              <input type="number" {...register("durationDays")} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select {...register("category")} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 appearance-none">
                <option value="general">General</option>
                <option value="anxiety">Anxiety</option>
                <option value="grief">Grief</option>
                <option value="sleep">Sleep</option>
                <option value="ramadan">Ramadan</option>
                <option value="spiritual">Spiritual</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tier</label>
              <select {...register("tier")} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 appearance-none">
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border">
            <input type="checkbox" id="active" {...register("active")} className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50 bg-background" />
            <label htmlFor="active" className="text-sm font-medium text-foreground select-none cursor-pointer">
              Program is active and visible to users
            </label>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
            >
              {editingId ? "Save Changes" : "Create Program"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
