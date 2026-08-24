"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, Wifi } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type BannerState = "online" | "offline" | "restored";

/**
 * شريحة حالة الاتصال — عنصر مشترك واحد يُعرض عبر Providers في كل
 * البوابات (العميل + المالك + الأدمن).
 * رسالة بوابة المالك تختلف: «تتطلب بوابة المنشآت اتصالاً بالإنترنت».
 */
export function OfflineBanner() {
  const pathname = usePathname();
  const [bannerState, setBannerState] = useState<BannerState>("online");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const isOwnerPortal =
    pathname === null
      ? false
      : pathname.startsWith("/owner") || pathname.startsWith("/admin");

  const goOnline = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBannerState("restored");
    timerRef.current = setTimeout(() => {
      setBannerState("online");
    }, 3000);
  }, []);

  const goOffline = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBannerState("offline");
  }, []);

  useEffect(() => {
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    if (!navigator.onLine) {
      const id = requestAnimationFrame(() => goOffline());
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [goOnline, goOffline]);

  const slideVariants = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { y: -48, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -48, opacity: 0 } };

  return (
    <AnimatePresence>
      {bannerState === "offline" && (
        <motion.div
          role="alert"
          {...slideVariants}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            {isOwnerPortal
              ? "تتطلب بوابة المنشآت اتصالاً بالإنترنت"
              : "لا يوجد اتصال بالإنترنت"}
          </span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mr-2 rounded-full p-1 transition-colors hover:bg-white/20"
            aria-label="إعادة المحاولة"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </motion.div>
      )}
      {bannerState === "restored" && (
        <motion.div
          role="status"
          {...slideVariants}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-success px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
        >
          <Wifi className="h-4 w-4 shrink-0" />
          <span>تم استعادة الاتصال</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
