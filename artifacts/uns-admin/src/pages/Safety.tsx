import React from "react";
import { useGetAdminSafety } from "@workspace/api-client-react";
import { ShieldAlert, AlertCircle, CheckCircle, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function Safety() {
  const { data: safety, isLoading } = useGetAdminSafety();

  if (isLoading || !safety) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-destructive" />
          Safety Monitor
        </h1>
        <p className="text-muted-foreground mt-2">Real-time crisis detection and regional support routing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
          <div className="text-muted-foreground font-medium mb-1">Events This Week</div>
          <div className="text-5xl font-bold text-destructive">{safety.eventsThisWeek}</div>
          <div className="text-sm mt-2 text-muted-foreground">Requires immediate review</div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
          <div className="text-muted-foreground font-medium mb-1">Events This Month</div>
          <div className="text-4xl font-bold text-foreground">{safety.eventsThisMonth}</div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
          <div className="text-muted-foreground font-medium mb-1">Crisis Response Rate</div>
          <div className="text-4xl font-bold text-emerald-500">{(safety.crisisResponseRate * 100).toFixed(1)}%</div>
          <div className="text-sm mt-2 text-muted-foreground">Automated routing success</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
            <h3 className="font-bold text-lg">Recent Safety Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-xs uppercase">
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {safety.recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      {event.severity === 'high' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">HIGH</span>}
                      {event.severity === 'medium' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">MEDIUM</span>}
                      {event.severity === 'low' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">LOW</span>}
                    </td>
                    <td className="px-6 py-4 font-medium capitalize">{event.type.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        {event.region}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      {event.resolvedAt ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium"><CheckCircle className="w-4 h-4"/> Resolved</div>
                      ) : (
                        <button className="text-xs bg-destructive text-destructive-foreground px-3 py-1.5 rounded hover:bg-destructive/90 font-bold transition-colors">
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Region Breakdown</h3>
            <div className="space-y-4">
              {safety.regionBreakdown.map(r => (
                <div key={r.region}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{r.region}</span>
                    <span className="text-muted-foreground">{r.count}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, (r.count / safety.eventsThisMonth) * 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl shadow-lg p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Active Hotlines
            </h3>
            <ul className="space-y-3 relative z-10">
              <li className="flex justify-between items-center p-3 bg-background rounded-xl border border-border">
                <span className="font-medium">KSA (إتصال)</span>
                <span className="text-primary font-bold tracking-wider">920033360</span>
              </li>
              <li className="flex justify-between items-center p-3 bg-background rounded-xl border border-border">
                <span className="font-medium">UAE (800HOPE)</span>
                <span className="text-primary font-bold tracking-wider">800-4673</span>
              </li>
              <li className="flex justify-between items-center p-3 bg-background rounded-xl border border-border">
                <span className="font-medium">Egypt</span>
                <span className="text-primary font-bold tracking-wider">08008880700</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
