"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/** Routes operators are allowed to access; any other dashboard path redirects to operator-bookings */
const OPERATOR_ALLOWED_PATHS = ["/operator-bookings", "/depart-report", "/return-report"];

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/session/check", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          router.replace("/auth/login");
          return;
        }
        setAuthorized(true);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [router]);

  useEffect(() => {
    if (!authorized || !pathname) return;

    const checkOperatorAccess = async () => {
      const res = await fetch("/api/session/me", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const role = (data?.role || "").toString().toLowerCase();
      if (role !== "operator") return;

      const allowed = OPERATOR_ALLOWED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );
      if (!allowed) {
        router.replace("/operator-bookings");
      }
    };

    checkOperatorAccess();
  }, [authorized, pathname, router]);

  if (checking) {
  return (
    <div className="flex items-center justify-center h-screen">
      Loading...
    </div>
  );
}

return <>{children}</>;
}
