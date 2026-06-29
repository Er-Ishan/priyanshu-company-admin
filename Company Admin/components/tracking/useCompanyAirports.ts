"use client";

import { useEffect, useState } from "react";
import { backendProxyPath } from "@/app/lib/backendProxy";

export type CompanyAirport = {
  airport_id: number;
  airport_name: string;
  iata_code?: string;
};

export function useCompanyAirports() {
  const [airports, setAirports] = useState<CompanyAirport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(backendProxyPath("/api/airports"), { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAirports(json.data);
        } else if (Array.isArray(json)) {
          setAirports(json);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { airports, loading };
}
