"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrackingPageHeader from "@/components/tracking/TrackingPageHeader";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  Users,
  Clock,
  ArrowRight,
  Settings,
  Tag,
  Terminal,
  ParkingCircle,
} from "lucide-react";

type Stats = {
  jobs: number;
  operations: number;
  activeDrivers: number;
  pendingOperations: number;
};

const quickLinks = [
  { title: "System Settings", href: "/tracking/system-settings", icon: Settings },
  { title: "Label Settings", href: "/tracking/label-settings", icon: Tag },
  { title: "Terminals", href: "/tracking/terminals", icon: Terminal },
  { title: "Parking Yards", href: "/tracking/parking-yards", icon: ParkingCircle },
  { title: "Jobs", href: "/tracking/jobs", icon: Briefcase },
  { title: "Job Operations", href: "/tracking/job-operations", icon: ClipboardList },
  { title: "Drivers", href: "/tracking/drivers", icon: Users },
  { title: "Driver Schedules", href: "/tracking/driver-schedules", icon: Clock },
];

export default function TrackingDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(backendProxyPath("/api/tracking/dashboard-stats"), { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStats(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Jobs", value: stats?.jobs ?? 0, icon: Briefcase, color: "text-blue-600" },
    { label: "Operations", value: stats?.operations ?? 0, icon: ClipboardList, color: "text-violet-600" },
    { label: "Active Drivers", value: stats?.activeDrivers ?? 0, icon: Users, color: "text-emerald-600" },
    { label: "Pending Ops", value: stats?.pendingOperations ?? 0, icon: Clock, color: "text-amber-600" },
  ];

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
        <TrackingPageHeader
          title="Tracking Dashboard"
          subtitle="Overview of jobs, operations, and driver activity"
          icon={LayoutDashboard}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((s) => (
            <Card key={s.label} className="border-slate-200/80 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-bold mt-1">
                      {loading ? "—" : s.value}
                    </p>
                  </div>
                  <div className={`rounded-xl bg-slate-100 dark:bg-slate-800 p-3 ${s.color}`}>
                    <s.icon size={22} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-3 px-4 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-2">
                      <link.icon size={16} className="text-primary" />
                      {link.title}
                    </span>
                    <ArrowRight size={14} className="opacity-50" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
