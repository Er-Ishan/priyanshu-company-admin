"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UsersRound, Medal, FileText } from "lucide-react";
import { backendProxyPath } from "@/app/lib/backendProxy";

const API_LIST_URL = backendProxyPath("/api/analytics/parking-analytics");



const StatCard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(API_LIST_URL);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="col-span-full py-20 text-center animate-pulse">
        <p className="text-muted-foreground font-medium">Synchronizing analytics...</p>
    </div>
  );
  
  if (!stats) return (
    <div className="col-span-full py-10 text-center bg-destructive/10 rounded-xl border border-destructive/20 mt-4">
        <p className="text-destructive font-bold">Data pipeline restricted. Check connectivity.</p>
    </div>
  );

  const cardsDatas = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: UsersRound,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Aggregated system volume",
    },
    {
      title: "Active Status",
      value: stats.active.toLocaleString(),
      icon: Medal,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Live operational entries",
    },
    {
      title: "Incomplete",
      value: stats.pending.toLocaleString(),
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      description: "Awaiting finalization",
    },
    {
      title: "Cancelled",
      value: stats.cancelled.toLocaleString(),
      icon: FileText,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      description: "Voided booking history",
    },
    {
      title: "Partners",
      value: stats.supplier.toLocaleString(),
      icon: UsersRound,
      color: "text-primary",
      bg: "bg-primary/10",
      description: "Supplier-originated flow",
    },
  ];

  return (
    <>
      {cardsDatas.map((card, index) => (
        <Card
          key={index}
          className="glass border-border/50 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
        >
          {/* Subtle gradient glow on hover */}
          <div className={`absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl ${card.bg}`} />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} transition-colors duration-300 group-hover:bg-opacity-20`}>
                    <card.icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {card.title}
                </p>
                <h3 className="text-3xl font-black tracking-tight text-foreground tabular-nums leading-none">
                    {card.value}
                </h3>
            </div>

            <p className="text-[10px] text-muted-foreground/70 font-medium mt-4 line-clamp-1 border-t border-border/30 pt-4">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default StatCard;
