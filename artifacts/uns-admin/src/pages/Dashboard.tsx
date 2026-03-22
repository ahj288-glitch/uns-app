import React from "react";
import { motion } from "framer-motion";
import { 
  Users, Activity, Clock, Award, AlertTriangle, TrendingUp, Heart
} from "lucide-react";
import { useGetAdminOverview } from "@workspace/api-client-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const MOOD_COLORS: Record<string, string> = {
  "calm": "#10b981",    // Emerald
  "happy": "#f59e0b",   // Amber
  "sad": "#6366f1",     // Indigo
  "anxious": "#ef4444", // Red
  "grateful": "#8b5cf6",// Violet
  "other": "#64748b"    // Slate
};

export default function Dashboard() {
  const { data: overview, isLoading } = useGetAdminOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!overview) return null;

  const stats = [
    { label: "إجمالي المستخدمين", value: overview.totalUsers.toLocaleString("ar-SA"), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "نشطون اليوم", value: overview.activeToday.toLocaleString("ar-SA"), icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "قائمة الانتظار", value: overview.waitlistCount.toLocaleString("ar-SA"), icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    { label: "المستخدمون المدفوعون", value: overview.premiumUsers.toLocaleString("ar-SA"), icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "متوسط الجلسة", value: `${overview.avgSessionLength}د`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "الاحتفاظ ٧ أيام", value: `${(overview.d7Retention * 100).toFixed(1)}%`, icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const chartData = overview.recentGrowth.map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Users: d.users,
    Sessions: d.sessions
  }));

  const pieData = overview.moodDistribution.map(d => ({
    name: `${d.moodArabic} (${d.mood})`,
    value: d.percentage,
    color: MOOD_COLORS[d.mood] || MOOD_COLORS.other
  }));

  return (
    <div className="space-y-8">
      {overview.crisisEventsThisWeek > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start sm:items-center gap-4"
        >
          <div className="p-3 bg-destructive/20 rounded-full text-destructive shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-destructive font-bold text-lg font-arabic">تنبيه السلامة</h3>
            <p className="text-destructive/80 mt-1 font-arabic">تم رصد {overview.crisisEventsThisWeek} أحداث أزمة هذا الأسبوع. يرجى مراجعة مراقب السلامة.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 hover-lift"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{stat.value}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-arabic">نمو المستخدمين</h3>
              <p className="text-muted-foreground text-sm mt-1 font-arabic">المستخدمون النشطون يومياً مقابل الجلسات</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary">NPS Score: <span className="text-lg font-bold">{overview.npsScore}</span></div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1f2c', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="Users" stroke="#c9a84c" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Sessions" stroke="#d97757" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5 flex flex-col"
        >
          <div className="mb-2">
            <h3 className="text-xl font-bold font-arabic">توزيع الحالات المزاجية</h3>
            <p className="text-muted-foreground text-sm mt-1 text-xs">Mood Distribution</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1f2c', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="truncate text-muted-foreground font-medium" title={d.name}>{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
