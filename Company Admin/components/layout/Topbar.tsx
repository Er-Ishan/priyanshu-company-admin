"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/assets/images/parking-box.png";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Bell,
  AlertCircle,
  LayoutDashboard,
  CirclePlus,
  FileText,
  Package,
  BadgePoundSterling,
  Tag,
  Megaphone,
  Settings,
  Link2,
  PlaneTakeoff,
  User,
  Menu,
  X,
  Building,
  Shield,
  MessageSquare,
  LayoutGrid,
  Tags,
  Terminal,
  ParkingCircle,
  Users,
  CalendarDays,
  Gauge,
  ClipboardList,
  Share2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProfileDropdown from "@/components/shared/profile-dropdown";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import ProtectedRoute from "../ProtectedRoute";
/* ---------------- TYPES ---------------- */
type ChildItem = {
  title: string;
  url: string;
  icon?: any;
  permission?: string;
  group?: string;
};
type NavSection = {
  id: string;
  title: string;
  url: string;
  icon?: any;
  permission?: string;
  items?: ChildItem[];
};
/* ---------------- NAV DATA ---------------- */
export const NAV_SECTIONS: NavSection[] = [
  { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, permission: "access_dashboard" },

  {
    id: "bookings",
    title: "Bookings",
    url: "/active-bookings",
    icon: FileText,
    items: [
      { title: "Active", url: "/active-bookings", icon: FileText, permission: "access_all_bookings" },
      { title: "Supplier", url: "/Suppliers-Info", icon: FileText, permission: "access_supplier_bookings" },
      { title: "Website", url: "/websiteData", icon: FileText, permission: "access_website_bookings" },
      { title: "Admin", url: "/mobile-bookings", icon: FileText, permission: "access_admin_bookings" },
      { title: "Cancelled", url: "/refund-bookings", icon: FileText, permission: "access_cancelled_bookings" },
      { title: "Incomplete", url: "/incomplete-bookings", icon: FileText, permission: "access_incomplete_bookings" },
      { title: "Refunded", url: "/refund-bookings", icon: FileText, permission: "access_refunded_bookings" },
    ],
  },
  {
    id: "websitebookings",
    title: "Invoice",
    url: "/website-invoice",
    icon: FileText,
    items: [
      { title: "Website Invoice", url: "/website-invoice", icon: FileText, permission: "access_invoice" },
      { title: "Supplier Invoice", url: "/supplierInvoice", icon: FileText, permission: "access_supplier_invoice" },
      { title: "Supplier Report", url: "/supplier-report-new", icon: FileText, permission: "access_supplier_report" },
    ],
  },
  {
    id: "supplier",
    title: "Supplier",
    url: "/supplier",
    icon: Building,
    items: [
      { title: "Supplier List", url: "/suppliersList", icon: FileText, permission: "access_supplier_list" },
    ],
  },
  {
    id: "reportdata",
    title: "Report",
    url: "/supplier",
    icon: Building,
    items: [
      { title: "Depart", url: "/depart-report", icon: FileText, permission: "access_depart_report" },
      { title: "Return", url: "/return-report", icon: FileText, permission: "access_return_report" },
      { title: "Depart & Return", url: "/depart-return-report", icon: FileText, permission: "access_depart_return_report" },
      { title: "Depart Cards Only", url: "/depart-cards-report", icon: FileText, permission: "access_depart_cards_report" },
      { title: "Social Media Report", url: "/social-media-report", icon: Share2, permission: "access_social_media_report" },
    ],
  },
  {
    id: "product",
    title: "Product",
    url: "/viewProducts",
    icon: Package,
    permission: "access_products",
  },
  {
    id: "tracking",
    title: "Tracking",
    url: "/tracking/dashboard",
    icon: MessageSquare,
    items: [
      { title: "Dashboard", url: "/tracking/dashboard", icon: LayoutGrid, permission: "access_tracking_dashboard" },
      { title: "System Settings", url: "/tracking/system-settings", icon: Gauge, permission: "access_tracking_system_settings" },
      { title: "Label Settings", url: "/tracking/label-settings", icon: Tags, permission: "access_tracking_label_settings" },
      { title: "Terminals", url: "/tracking/terminals", icon: Terminal, permission: "access_tracking_terminals" },
      { title: "Parking Yards", url: "/tracking/parking-yards", icon: ParkingCircle, permission: "access_tracking_parking_yards" },
      { title: "Jobs", url: "/tracking/jobs", icon: FileText, permission: "access_jobs" },
      { title: "Job Operations", url: "/tracking/job-operations", icon: ClipboardList, permission: "access_job_operations" },
      { title: "Drivers", url: "/tracking/drivers", icon: Users, permission: "access_tracking_drivers" },
      { title: "Driver Schedules", url: "/tracking/driver-schedules", icon: CalendarDays, permission: "access_tracking_driver_schedules" },
    ],
  },
  {
    id: "admin-support",
    title: "Support",
    url: "/admin-support",
    icon: MessageSquare,
    permission: "access_admin_support",
  },
  {
    id: "settings",
    title: "Settings",
    url: "/ChargesTable",
    icon: Settings,
    items: [
      { title: "Website", url: "/ChargesTable", icon: Link2, permission: "access_website_settings" },
      { title: "Airport", url: "/airport-data", icon: PlaneTakeoff, permission: "access_airport_settings" },
      { title: "Admin", url: "/users-data", icon: User, permission: "access_admin_settings" },
      { title: "Terms & Conditions", url: "/terms-and-conditions", icon: FileText, permission: "access_terms_conditions" },
      { title: "Promo Codes", url: "/promo-codes", icon: BadgePoundSterling, permission: "access_promo_codes" },
      { title: "Marketing Links", url: "/marketing-sources", icon: Megaphone, permission: "access_marketing_sources" },
      { title: "Access", url: "/access-control", icon: Shield, permission: "access_access_control" },
    ],
  },
];
/* ---------------- COMPONENT ---------------- */
export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] =
    React.useState<NavSection | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [navCounts, setNavCounts] = React.useState<Record<string, number>>({});
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [userPermissions, setUserPermissions] = React.useState<string[] | null>(null);
  React.useEffect(() => {
    fetch("/api/session/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data);
        const userId = data?.user?.id || data?.id;
        let fetchUrl = `/api/backend/api/access-control/my-permissions/${userId}`;
        if (userId) {
          fetch(fetchUrl)
            .then(r => r.json())
            .then(permData => {
              if (permData.success) {
                setUserPermissions(permData.data);
              } else {
                setUserPermissions([]); // Block access on failure
              }
            })
            .catch(() => {
              setUserPermissions([]); // Block access on network error
            });
        } else {
          setUserPermissions([]); // No user ID available
        }
      })
      .catch(() => {
        setUserPermissions([]); // Session fetch failed
      });
  }, []);
  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/backend/api/analytics/navbar-counts");
        if (!res.ok) return;

        const data = await res.json();
        setNavCounts(data);
      } catch (err) {
        console.error("Navbar counts error", err);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // auto refresh
    return () => clearInterval(interval);
  }, []);
  const CountBadge = ({ count }: { count?: number }) => {
    if (!count || count <= 0) return null;

    return (
      <span className="
      ml-2 min-w-[18px] h-[18px]
      px-1 rounded-full
      bg-primary text-primary-foreground
      text-[10px] font-semibold
      flex items-center justify-center
    ">
        {count}
      </span>
    );
  };
  // 🔗 MAP SUB MENU URL → COUNT KEY
  const getBookingCount = (title: string) => {
    switch (title) {
      case "All Bookings":
        return navCounts.total || 0;

      case "Active Bookings":
        return navCounts.active || 0;

      case "Supplier Booking":
        return navCounts.supplier || 0;

      case "Website Booking":
        return navCounts.website || 0;

      case "Incomplete":
        return navCounts.incomplete || 0;

      case "Refund Bookings":
        return navCounts.refunds || 0;

      case "Admin Booking":
        return navCounts.admin || 0;

      default:
        return 0;
    }
  };




  const pathMatches = React.useCallback((url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`);
  }, [pathname]);

  /* ── permission-based filtering ── */
  const hasPerm = React.useCallback((p?: string) => {
    if (!p) return true;                       // no permission required → always show
    if (userPermissions === null) return true;  // still loading → show all (avoid flash)
    // owners and admins bypass all permission checks
    const role = currentUser?.user?.role || currentUser?.role;
    if (role === "owner" || role === "admin") return true;
    return userPermissions.includes(p);
  }, [userPermissions, currentUser]);

  const filteredSections = React.useMemo(() => NAV_SECTIONS
    .filter(s => {
      // top-level permission check
      if (s.permission && !hasPerm(s.permission)) return false;
      // for parent sections with sub-items: keep if at least one child is permitted
      if (s.items) {
        const allowed = s.items.filter(i => hasPerm(i.permission));
        return allowed.length > 0;
      }
      return true;
    })
    .map(s => {
      if (!s.items) return s;
      return { ...s, items: s.items.filter(i => hasPerm(i.permission)) };
    }), [hasPerm]);

  // Auto-open tracking subnav when route changes (client-only — avoids SSR/client pathname drift)
  React.useEffect(() => {
    const section = filteredSections.find(
      (s) =>
        s.items?.some((i) => pathMatches(i.url)) ||
        (s.url ? pathMatches(s.url) : false)
    );

    setActiveSection(section?.items ? section : null);
  }, [pathname, pathMatches, filteredSections]);

  const hasSubNav = Boolean(activeSection?.items?.length);

  const NavButton = ({ section }: { section: NavSection }) => {
    const isOpen = activeSection?.id === section.id;
    const isActive =
      (section.url ? pathMatches(section.url) : false) ||
      section.items?.some((i) => pathMatches(i.url));
    const count = navCounts[section.id]; // 👈 ID-BASED COUNT
    return (
      <button
        onClick={() => {
          if (!section.items) {
            router.push(section.url);
            setActiveSection(null);
            return;
          }

          setActiveSection(prev =>
            prev?.id === section.id ? null : section
          );
        }}
        className={cn(
          "relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl",
          "border border-transparent",
          "hover:bg-primary/10 hover:border-primary/20",

          // Active route
          isActive && [
            "bg-primary text-white shadow-lg shadow-primary/25",
            "dark:shadow-primary/10"
          ],

          // Dropdown OPEN state
          isOpen && !isActive && "bg-accent/50 text-accent-foreground border-accent-foreground/10"
        )}
      >
        {section.icon && <section.icon size={17} className={cn("transition-colors", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />}
        <span className={cn(isActive ? "text-white" : "text-slate-700 dark:text-slate-200")}>{section.title || ""}</span>
        {/* 🔔 COUNT */}
        {!section.items && <CountBadge count={count} />}

        {section.items && (
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-300 opacity-60",
              isOpen && "rotate-180 opacity-100",
              isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
            )}
          />
        )}
      </button>
    );
  };
  return (
    <ProtectedRoute>
      <>
        {/* ================= FIXED NAVBAR ================= */}
        <header className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
        )}>


          {/* MAIN NAVBAR */}
          <div className="h-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-8 flex-1">
              <Link href="/dashboard" className="shrink-0 flex items-center justify-center h-full">
                <div className="flex items-center justify-center min-w-0">
                  {currentUser?.user && (currentUser.user as any).company_logo ? (
                    <div className="relative h-8 w-[110px] sm:h-10 sm:w-[140px] md:h-[52px] md:w-[220px] flex items-center">
                      <Image
                        src={(currentUser?.user as any).company_logo}
                        alt={currentUser?.user?.company_name || "Admin"}
                        fill
                        className="object-contain object-left dark:brightness-110"
                        priority
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20">
                      <Building className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-900 dark:text-white truncate w-[120px] sm:w-[160px] md:w-[170px]">
                        {currentUser?.user?.company_name || "Admin"}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
              <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5">
                {/* {filteredSections.map((s) => (
                  <NavButton key={s.id} section={s} />
                ))} */}
              </nav>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 md:gap-5 shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 md:border-r md:border-slate-200 md:dark:border-slate-800 md:pr-5">
                <Link href="/AddBookings">
                  <Button size="sm" className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95">
                    <CirclePlus size={16} />
                    <span className="font-semibold">Add New Booking</span>
                  </Button>
                  <Button size="icon" variant="ghost" className="sm:hidden flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20">
                    <CirclePlus size={18} />
                  </Button>
                </Link>
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
              </div>
              <button
                className="relative h-10 w-10 rounded-xl transition"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <ProfileDropdown />
              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={24} className="text-slate-600 dark:text-slate-300" /> : <Menu size={24} className="text-slate-600 dark:text-slate-300" />}
              </button>
            </div>
          </div>
          {/* MAIN NAVBAR */}
          <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hidden lg:block">
            <div className="flex items-center justify-center h-full max-w-screen-2xl mx-auto px-6">
              <nav className="flex items-center justify-center gap-4 h-full">
                {filteredSections.map((s) => (
                  <NavButton key={s.id} section={s} />
                ))}
              </nav>
            </div>
          </div>
          {/* MOBILE NAV PANEL */}
          {mobileOpen && (
            <div className="lg:hidden border-t bg-background/95 backdrop-blur-xl p-4 space-y-2 animate-in slide-in-from-top-4 duration-300 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {filteredSections.map((s) => (
                <div key={s.id} className="flex flex-col">
                  <button
                    onClick={() => {
                      if (!s.items) {
                        router.push(s.url);
                        setMobileOpen(false);
                        return;
                      }
                      setActiveSection(
                        activeSection?.id === s.id ? null : s
                      );
                    }}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
                      (s.url && pathMatches(s.url)) ? "bg-primary/10 text-primary font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <span className="flex items-center gap-3 font-medium">
                      {s.icon && <s.icon size={18} />}
                      {s.title || "Dashboard"}
                    </span>
                    {s.items && <ChevronDown size={18} className={cn("transition-transform", activeSection?.id === s.id && "rotate-180")} />}
                  </button>

                  {activeSection?.id === s.id &&
                    (() => {
                      let lastGroup: string | undefined;
                      return s.items?.map((item) => {
                        const showGroup = item.group && item.group !== lastGroup;
                        if (item.group) lastGroup = item.group;
                        return (
                          <React.Fragment key={item.title}>
                            {showGroup && (
                              <p className="ml-11 mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {item.group}
                              </p>
                            )}
                            <Link
                              href={item.url}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "ml-11 py-2.5 text-sm transition-colors relative flex items-center gap-2",
                                pathMatches(item.url)
                                  ? "text-primary font-semibold"
                                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                              )}
                            >
                              {pathMatches(item.url) && (
                                <span className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full" />
                              )}
                              {item.icon && <item.icon size={14} />}
                              {item.title}
                            </Link>
                          </React.Fragment>
                        );
                      });
                    })()}
                </div>
              ))}
            </div>
          )}

          {/* SUB NAVBAR */}
          {hasSubNav && activeSection && (
            <div className="hidden lg:block border-t bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-top-2">
              <div className="min-h-14 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 max-w-screen-2xl mx-auto md:overflow-x-auto md:whitespace-nowrap md:scrollbar-hide px-2 md:px-4 py-3 md:py-2">
                {(() => {
                  let lastGroup: string | undefined;
                  return activeSection.items!.filter(item => hasPerm(item.permission)).map((item) => {
                    const count = getBookingCount(item.title);
                    const isItemActive = pathMatches(item.url);
                    const showGroupHeader = item.group && item.group !== lastGroup;
                    if (item.group) lastGroup = item.group;

                    return (
                      <React.Fragment key={item.title}>
                        {showGroupHeader && (
                          <span className="mx-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">
                            {item.group}
                          </span>
                        )}
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 w-[48%] sm:w-[31%] md:w-auto",
                            "border border-transparent",
                            isItemActive
                              ? "bg-green-500 hover:bg-green-600 text-white shadow-sm border-green-500 dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-600"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                          )}
                        >
                          {item.icon && (
                            <item.icon
                              size={15}
                              className={cn(
                                "transition-colors duration-200",
                                isItemActive
                                  ? "text-white"
                                  : "text-slate-500 dark:text-slate-400"
                              )}
                            />
                          )}
                          <span>{item.title}</span>
                          <CountBadge count={count} />
                        </Link>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>
          )}
          {/* MOBILE SEARCH */}
          <div className="px-4 pb-3 mt-2 lg:hidden">
            <Input placeholder="Search…" className="h-9" />
          </div>
        </header>
        {/* ================= SPACER ================= */}
        <div
          className={cn(
            "transition-all duration-300",
            hasSubNav
              ? "h-[128px] lg:h-[128px]"
              : "h-16"
          )}
        />
      </>
    </ProtectedRoute>
  );
}