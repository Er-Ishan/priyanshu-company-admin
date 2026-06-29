"use client";

import { useEffect, useState } from "react";
import TopNavbar from "@/components/layout/Topbar";
import TopbarOperator from "@/components/layout/TopbarOperator";

function getRoleFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    const r = (user?.role ?? "").toString().toLowerCase();
    return r || null;
  } catch {
    return null;
  }
}

/**
 * Renders TopbarOperator for operator role, otherwise the full TopNavbar.
 * Role: from /api/session/me first; if API doesn't return role, fallback to localStorage (set by login-form).
 */
export default function TopbarSwitch() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session/me", {
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
      .then((res) => res.json())
      .then((data) => {
        const apiRole = (data?.role ?? data?.user?.role ?? "").toString().toLowerCase();
        const localRole = getRoleFromLocalStorage();
        setRole(apiRole || localRole);
        if (data?.name && typeof window !== "undefined") {
          const stored = localStorage.getItem("user");
          const next = { name: data.name, email: data.email, role: data.role ?? data.user?.role };
          if (!stored || (next.role && !JSON.parse(stored)?.role)) {
            localStorage.setItem("user", JSON.stringify({ ...JSON.parse(stored || "{}"), ...next }));
          }
        }
      })
      .catch(() => {
        setRole(getRoleFromLocalStorage());
      })
      .finally(() => setLoading(false));
  }, []);

  // Always render the same shell while loading — never read localStorage during render
  // (server has no window; client would mismatch and trigger hydration errors).
  if (loading) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-800/60 flex items-center px-4">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </header>
    );
  }

  if (role === "operator") {
    return <TopbarOperator />;
  }

  return <TopNavbar />;
}
