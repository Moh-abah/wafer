"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function NotFound() {
const prefersReduced = usePrefersReducedMotion();

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-4 text-center overflow-hidden">
      {/* Radial gradient behind 404 */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,42,122,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div
        className="relative z-10 h-12 w-40"
        style={{
          maskImage: "url(/logowafir.png)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          backgroundColor: "var(--primary)",
        }}
      />

      {/* 404 Illustration with floating animation */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        animate={prefersReduced ? {} : { y: [0, -10, 0] }}
        transition={prefersReduced ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-8xl font-black text-primary/20 leading-none select-none">404</span>
        <h1 className="-mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          الصفحة غير موجودة
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
        </p>
      </motion.div>

      {/* Action */}
      <Button
        asChild
        size="lg"
        className="relative z-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] px-8"
      >
        <Link href="/">العودة للرئيسية</Link>
      </Button>

      {/* Decorative icon */}
      <SearchX className="relative z-10 mt-4 h-16 w-16 text-muted-foreground/15" />
    </div>
  );
}
