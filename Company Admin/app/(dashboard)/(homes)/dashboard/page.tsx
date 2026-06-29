import GenerateContentCard from "@/app/(dashboard)/(homes)/dashboard/components/generate-content-card";
import SalesStaticCard from "@/app/(dashboard)/(homes)/dashboard/components/sales-static-card";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import TabsWithTableCard from "@/app/(dashboard)/(homes)/dashboard/components/tabs-with-table-card";
import TopCountriesCard from "@/app/(dashboard)/(homes)/dashboard/components/top-countries-card";
import TopPerformerCard from "@/app/(dashboard)/(homes)/dashboard/components/top-performer-card";
import TotalSubscriberCard from "@/app/(dashboard)/(homes)/dashboard/components/total-subscriber-card";
import UserOverviewCard from "@/app/(dashboard)/(homes)/dashboard/components/user-overview-card";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import PermissionRoute from "@/components/PermissionRoute";

export const metadata: Metadata = {
  title: "Dashboard Overview | Airport Parking",
  description: "Monitor booking analytics, sales performance, and operational trends.",
};


export default async function DashboardPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return (
    <PermissionRoute permission="access_dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Overview</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Real-time analytics for bookings, sales, and logistics tracking.
          </p>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Suspense fallback={<LoadingSkeleton text="Loading Metrics..." />}>
            <StatCard />
          </Suspense>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          {/* Pickups & Returns (Donut) */}
          <div className="lg:col-span-4 h-full">
            <Suspense fallback={<LoadingSkeleton text="Loading Overview..." />}>
              <UserOverviewCard />
            </Suspense>
          </div>

          {/* Sales Statistics (Area Chart) */}
          <div className="lg:col-span-8 h-full">
            <Suspense fallback={<LoadingSkeleton text="Loading Sales..." />}>
              <SalesStaticCard />
            </Suspense>
          </div>
        </div>
      </div>
    </PermissionRoute>
  );
}