"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplierTokenIndicatorProps {
  hasToken: boolean;
  onClick: () => void;
}

export default function SupplierTokenIndicator({ hasToken, onClick }: SupplierTokenIndicatorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={
        hasToken
          ? "Supplier token configured — click to view or update"
          : "No supplier token — click to generate"
      }
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer",
        hasToken
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
          : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
      )}
    >
      {hasToken ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    </button>
  );
}