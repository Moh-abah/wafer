"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WifiOff, RefreshCw, Wifi } from "lucide-react";

type BannerState = "online" | "offline" | "restored";

export function OfflineBanner() {
  const [bannerState, setBannerState] = useState<BannerState>("online");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReduced = useReducedMotion();

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
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>لا يوجد اتصال بالإنترنت</span>
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
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          <Wifi className="h-4 w-4 shrink-0" />
          <span>تم استعادة الاتصال</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
