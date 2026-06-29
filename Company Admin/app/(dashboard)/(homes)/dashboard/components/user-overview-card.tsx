"use client";

import { useEffect, useState } from "react";
import UserOverviewChart from "@/components/charts/user-overview-chart";
import { Card, CardContent } from "@/components/ui/card";
import { backendProxyPath } from "@/app/lib/backendProxy";


const API_URL = backendProxyPath("/api/analytics/parking-pickups-returns");

type TrendItem = {
    date: string;
    total: number;
};

type ApiResponse = {
    totalPickups: number;
    totalReturns: number;
    pickupTrend: TrendItem[];
    returnTrend: TrendItem[];
};

const UserOverviewCard = () => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error("Failed to fetch");

                const json: ApiResponse = await res.json();
                setData(json);
            } catch (err) {
                console.error("Analytics fetch error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <Card className="card">
                <CardContent className="card-body p-4">Loading analytics...</CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="card">
                <CardContent className="card-body p-4 text-red-500">
                    Failed to load analytics
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass border-border/50 rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden group h-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h6 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">
                            Operational Trend
                        </h6>
                        <h4 className="text-xl font-bold text-foreground">Pickups & Returns</h4>
                    </div>
                </div>

                <div className="flex justify-center py-4">
                    <UserOverviewChart
                        totalPickups={data.totalPickups}
                        totalReturns={data.totalReturns}
                    />
                </div>


                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/30">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pickups</span>
                        </div>
                        <p className="text-xl font-black text-foreground tabular-nums leading-none">
                            {data.totalPickups.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Returns</span>
                        </div>
                        <p className="text-xl font-black text-foreground tabular-nums leading-none">
                            {data.totalReturns.toLocaleString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserOverviewCard;
