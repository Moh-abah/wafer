"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** إجراء اختياري (زر مثلاً) يظهر أسفل الرسالة */
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div
        className={cn(
          "flex flex-col items-center text-center rounded-2xl border bg-card p-8 sm:p-10",
          "max-w-sm w-full"
        )}
      >
        <div className="relative mb-5">
          {/* Gradient background circle */}
          <div
            className="absolute inset-0 -m-2 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            }}
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
