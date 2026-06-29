"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
};

export default function FormSection({ title, icon: Icon, children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        {Icon && <Icon size={18} className="text-primary" />}
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
  );
}
