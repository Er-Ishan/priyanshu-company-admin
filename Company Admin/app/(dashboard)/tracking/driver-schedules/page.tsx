"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Driver Schedules uses the operations calendar view (same data as legacy PHP operationscalander). */
export default function DriverSchedulesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tracking/job-operations?view=calendar");
  }, [router]);

  return null;
}
