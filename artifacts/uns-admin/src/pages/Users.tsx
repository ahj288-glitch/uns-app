import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGetWaitlistCount } from "@workspace/api-client-react";
import { Clock, Filter, Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data since API doesn't expose the full list in generated hooks, just the count
const MOCK_WAITLIST = [
  { id: "1", email: "ahmed.k@example.com", name: "Ahmed", dialect: "gulf", position: 1, date: "2024-05-12" },
  { id: "2", email: "sarah.m@example.com", name: "Sarah M.", dialect: "levant", position: 2, date: "2024-05-12" },
  { id: "3", email: "omar99@example.com", name: "Omar", dialect: "egyptian", position: 3, date: "2024-05-13" },
  { id: "4", email: "fatima.h@example.com", name: "Fatima", dialect: "maghrebi", position: 4, date: "2024-05-14" },
  { id: "5", email: "khalid_z@example.com", name: "Khalid", dialect: "gulf", position: 5, date: "2024-05-14" },
];

export default function Users() {
  const [activeTab, setActiveTab] = useState<"waitlist" | "active">("waitlist");
  const { data: waitlistStats, isLoading } = useGetWaitlistCount();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users & Access</h1>
          <p className="text-muted-foreground mt-1">Manage waitlist conversions and active cohorts</p>
        </div>
        
        <div className="flex p-1 bg-secondary rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab("waitlist")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === "waitlist" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Waitlist
          </button>
          <button 
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === "active" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Active Users
          </button>
        </div>
      </div>

      <AnimateTab tab={activeTab}>
        {activeTab === "waitlist" && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg shadow-black/5 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
                <div className="flex items-center gap-4 mb-2 relative z-10">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-muted-foreground font-medium">Total Waiting</h3>
                </div>
                <div className="text-4xl font-bold text-foreground relative z-10">
                  {isLoading ? "..." : waitlistStats?.count?.toLocaleString() || "0"}
                </div>
              </div>
              
              <div className="md:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-lg shadow-black/5 flex flex-col justify-center">
                <h3 className="text-sm text-muted-foreground font-medium mb-4">Dialect Breakdown</h3>
                <div className="flex w-full h-4 rounded-full overflow-hidden mb-3">
                  <div className="bg-primary" style={{ width: '40%' }} title="Gulf 40%"></div>
                  <div className="bg-accent" style={{ width: '28%' }} title="Levant 28%"></div>
                  <div className="bg-[#4a7a5e]" style={{ width: '18%' }} title="Egyptian 18%"></div>
                  <div className="bg-[#1B4332]" style={{ width: '10%' }} title="Maghrebi 10%"></div>
                  <div className="bg-[#85d7ad]" style={{ width: '4%' }} title="MSA 4%"></div>
                </div>
                <div className="flex gap-4 text-xs font-medium text-muted-foreground overflow-x-auto pb-2">
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-primary"></div> Gulf (40%)</div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-accent"></div> Levant (28%)</div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-[#4a7a5e]"></div> Egyptian (18%)</div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-[#1B4332]"></div> Maghrebi (10%)</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search waitlist by email or name..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors font-medium">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 btn-gradient rounded-xl">
                  <UserPlus className="w-4 h-4" />
                  Invite Top 100
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg shadow-black/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Position</th>
                      <th className="px-6 py-4 font-medium">User Details</th>
                      <th className="px-6 py-4 font-medium">Dialect</th>
                      <th className="px-6 py-4 font-medium">Date Joined</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_WAITLIST.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground font-bold text-sm">
                            {user.position}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{user.name || "Anonymous"}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium capitalize">
                            {user.dialect}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.date}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                            Send Invite
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/20">
                <span>Showing 1 to 5 of {waitlistStats?.count || 0} entries</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-border rounded hover:bg-muted disabled:opacity-50" disabled>Prev</button>
                  <button className="px-3 py-1 border border-border rounded hover:bg-muted">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "active" && (
          <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-2xl text-center px-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Cohort Analysis Missing</h3>
            <p className="text-muted-foreground max-w-md">Detailed cohort analysis and active user management will appear here once sufficient engagement data is collected.</p>
          </div>
        )}
      </AnimateTab>
    </div>
  );
}

function AnimateTab({ children, tab }: { children: React.ReactNode, tab: string }) {
  return (
    <motion.div
      key={tab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
