"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import CustomSelect from "@/components/shared/custom-select";
import SalesStaticChart from "@/components/charts/sales-static-chart";
import { backendProxyPath } from "@/app/lib/backendProxy";

const API_URL = backendProxyPath("/api/analytics/sales");

type ChartData = {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
};

type SalesStats = {
  totalSales: number;
  growthPercent: number;
  growthPerDay: number;
  chartData: ChartData;
};

const SalesStaticCard = () => {
  const [filter, setFilter] = useState("Yearly");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats | null>(null);

  const fetchSalesData = async (selectedFilter: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?filter=${selectedFilter}`);
      const data: SalesStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(filter);
  }, [filter]);

  if (loading) return <p className="text-neutral-500">Loading sales...</p>;
  if (!stats) return <p className="text-red-500">Failed to load sales data</p>;

    return (
        <Card className="glass border-border/50 rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden group h-full">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                        <h6 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">
                            Financial Growth
                        </h6>
                        <h4 className="text-xl font-bold text-foreground">Sales Revenue</h4>
                    </div>

                    <CustomSelect
                        placeholder={filter}
                        options={["Yearly", "Monthly", "Weekly", "Today"]}
                        onChange={(value: string) => setFilter(value)}
                    />
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-baseline gap-4 mb-8">
                    <h2 className="text-4xl font-black tracking-tight text-foreground tabular-nums leading-none">
                        £{stats.totalSales.toLocaleString()}
                    </h2>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full border border-emerald-500/20">
                            {stats.growthPercent}% <ArrowUp size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            + £{stats.growthPerDay} <span className="opacity-50">/ DAY</span>
                        </span>
                    </div>
                </div>

                {/* Chart */}
                <div className="mt-2 h-[280px]">
                    <SalesStaticChart chartData={stats.chartData} />
                </div>
            </CardContent>
        </Card>
    );
};

export default SalesStaticCard;
