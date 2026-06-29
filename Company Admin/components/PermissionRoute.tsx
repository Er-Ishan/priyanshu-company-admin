"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NAV_SECTIONS } from "@/components/layout/Topbar";

function collectPermittedUrls(permissions: string[]): string[] {
  const urls: string[] = [];
  for (const section of NAV_SECTIONS) {
    if (section.permission && permissions.includes(section.permission)) {
      urls.push(section.url);
    }
    if (section.items) {
      for (const item of section.items) {
        if (!item.permission || permissions.includes(item.permission)) {
          urls.push(item.url);
        }
      }
    }
  }
  return [...new Set(urls)];
}

export default function PermissionRoute({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const sessionRes = await fetch("/api/session/me", { credentials: "include" });
        if (!sessionRes.ok) {
          router.replace("/auth/login");
          return;
        }
        const sessionData = await sessionRes.json();
        const userId = sessionData?.user?.id || sessionData?.id;
        if (!userId) {
          router.replace("/auth/login");
          return;
        }

        const permRes = await fetch(
          `/api/backend/api/access-control/my-permissions/${userId}`,
          { credentials: "include" }
        );
        const permData = await permRes.json();
        const permissions: string[] = permData?.success ? permData.data || [] : [];

        if (cancelled) return;

        if (permissions.includes(permission)) {
          setAllowed(true);
          return;
        }

        const permittedUrls = collectPermittedUrls(permissions);
        if (permittedUrls.length > 0) {
          router.replace(permittedUrls[0]);
        } else {
          router.replace("/auth/login");
        }
      } catch {
        if (!cancelled) router.replace("/auth/login");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [permission, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowed) return null;

  return <ProtectedRoute>{children}</ProtectedRoute>;
}