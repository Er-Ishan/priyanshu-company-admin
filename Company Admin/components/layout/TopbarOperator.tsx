"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/assets/images/parking-box.png";
import { usePathname } from "next/navigation";
import { ChevronDown, FileText, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileDropdown from "@/components/shared/profile-dropdown";
import ProtectedRoute from "../ProtectedRoute";

/** Operator-only nav: Logo, Report menu (Depart & Return), Logout. */
const OPERATOR_REPORT_ITEMS = [
  { title: "Depart", url: "/depart-report", icon: FileText },
  { title: "Return", url: "/return-report", icon: FileText },
] as const;

export default function TopbarOperator() {
  const pathname = usePathname();
  const [reportOpen, setReportOpen] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/session/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data?.success) setSession(data);
      })
      .catch(() => { });
  }, []);

  React.useEffect(() => {
    const onReportPage =
      pathname === "/depart-report" || pathname === "/return-report";
    setReportOpen(onReportPage);
  }, [pathname]);

  return (
    <ProtectedRoute>
      <>
        <header className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
        )}>
          <div className="h-16 max-w-screen-2xl mx-auto flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/operator-bookings" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                <div className="flex items-center gap-2">
                  {(session?.user as any)?.company_logo ? (
                    <div className="relative h-9 w-[150px]">
                      <Image
                        src={(session?.user as any).company_logo}
                        alt={session?.user?.company_name || "Airport Parking"}
                        fill
                        className="object-contain dark:brightness-110"
                        priority
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20">
                      <Building className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {session?.user?.company_name || "Airport Parking"}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
              <nav className="flex items-center gap-1.5">
                <Link
                  href="/operator-bookings"
                  className={cn(
                    "relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl",
                    "border border-transparent",
                    "hover:bg-primary/10 hover:border-primary/20",
                    pathname === "/operator-bookings"
                      ? "bg-primary text-white shadow-lg shadow-primary/25 dark:shadow-primary/10"
                      : "text-slate-700 dark:text-slate-200"
                  )}
                >
                  <FileText size={17} className={pathname === "/operator-bookings" ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                  <span>All Bookings</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setReportOpen((prev) => !prev)}
                  className={cn(
                    "relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl",
                    "border border-transparent",
                    "hover:bg-primary/10 hover:border-primary/20",
                    (pathname === "/depart-report" || pathname === "/return-report")
                      ? "bg-primary text-white shadow-lg shadow-primary/25 dark:shadow-primary/10"
                      : "text-slate-700 dark:text-slate-200",
                    reportOpen && !pathname.includes("report") && "bg-accent/50 text-accent-foreground border-accent-foreground/10"
                  )}
                >
                  <FileText size={17} className={(pathname === "/depart-report" || pathname === "/return-report") ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                  <span>Report</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-300 opacity-60",
                      reportOpen && "rotate-180 opacity-100",
                      (pathname === "/depart-report" || pathname === "/return-report") ? "text-white" : "text-slate-500 dark:text-slate-400"
                    )}
                  />
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ProfileDropdown />
            </div>
          </div>

          {/* Sub nav: Depart & Return only */}
          {reportOpen && (
            <div className="border-t bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-top-2">
              <div className="h-14 flex items-center justify-center gap-2 px-6 max-w-screen-2xl mx-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
                {OPERATOR_REPORT_ITEMS.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-1.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200",
                      "border border-transparent",
                      pathname === item.url
                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm border-slate-200/60 dark:border-slate-700/60"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    {item.icon && <item.icon size={15} className={pathname === item.url ? "text-primary" : "opacity-60"} />}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        <div
          className={cn(
            "transition-all duration-300",
            reportOpen ? "h-[120px]" : "h-16"
          )}
        />
      </>
    </ProtectedRoute>
  );
}
