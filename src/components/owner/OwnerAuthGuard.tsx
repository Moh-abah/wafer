"use client";

import { useEffect } from "react";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function OwnerAuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, hydrated } = useOwnerAuth();

  useEffect(() => {
    if (hydrated && !accessToken) {
      const next = window.location.pathname;
      window.location.href = `/owner/login?next=${encodeURIComponent(next)}`;
    }
  }, [hydrated, accessToken]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
}
