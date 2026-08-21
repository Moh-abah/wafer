"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "wafir_welcome_dismissed";

function useWelcomeVisible() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return sessionStorage.getItem(STORAGE_KEY) === null;
  }, []);

  const getServerSnapshot = useCallback(() => {
    return true;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function WelcomeBanner() {
  const visible = useWelcomeVisible();

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new StorageEvent("storage"));
  };

  if (!visible) return null;

  return (
    <div className="relative bg-primary/10 border-b border-primary/20">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="text-sm text-foreground flex-1">
          مرحبًا بك في وفر! سجّل واحصل على خصم 30% فوري
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            size="sm"
            className="relative overflow-hidden rounded-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[36px] animate-badge-shimmer"
          >
            <Link href="/register">تسجيل</Link>
          </Button>
          <button
            onClick={handleDismiss}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:rotate-90"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
