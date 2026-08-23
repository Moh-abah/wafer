"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const TAG_PATH =
  "M4 4L20 4L28 12L28 22L12 28L4 20Z";

interface WafirLogoProps {
  className?: string;
  href?: string;
  showPill?: boolean;
  size?: "sm" | "md" | "lg";


  /** نوع الشعار: "full" = مع فر، "mark" = أيقونة فقط (التاغ + و) */
  variant?: "full" | "mark";
  /** على خلفية داكنة: يجعل لون "فر" أبيض (في وضع full) */
  onDark?: boolean;
}

export function WafirLogo({
  className,
  href = "/",
  showPill = false,
  size = "sm", // ← أصبحت القيمة الافتراضية sm
  variant = "full",
  onDark = false,
}: WafirLogoProps) {
  const sizeClasses = {
    sm: { text: "text-xl", tag: "w-7 h-7", pill: "text-[9px] px-2 py-0.5" },
    md: { text: "text-3xl", tag: "w-9 h-9", pill: "text-[10px] px-3 py-1" },
    lg: { text: "text-5xl", tag: "w-12 h-12", pill: "text-xs px-4 py-1.5" },
  };

  const s = sizeClasses[size];
  const isMark = variant === "mark";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex flex-col items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label="وفر — الصفحة الرئيسية"
    >
      <div className="flex items-center gap-1">
        <div className="relative inline-flex flex-col items-center">
          <svg
            className={cn("absolute -top-5 start-1 z-10", s.tag)}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d={TAG_PATH}
              fill="var(--logo-gold)"
              stroke="var(--logo-gold)"
              strokeWidth="1.2"
              opacity="0.9"
            />
            <circle cx="10" cy="10" r="3" fill="var(--logo-white)" opacity="0.85" />
            <circle cx="14" cy="16" r="1.8" fill="var(--logo-white)" />
            <circle cx="22" cy="16" r="1.8" fill="var(--logo-white)" />
            <path
              d="M13 20Q18 25 23 20"
              stroke="var(--logo-white)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <span
            className={cn("font-black leading-none", s.text)}
            style={{ color: "var(--logo-gold)" }}
          >
            و
          </span>
        </div>

        <span
          className={cn(
            "font-black leading-none",
            s.text
         
          )}
          style={{ color: "var(--logo-blue)" }}
        >
          فر
        </span>
      </div>

      {showPill && (
        <span
          className={cn(
            "rounded-full font-semibold text-white whitespace-nowrap",
            s.pill
          )}
          style={{ background: "var(--logo-cyan)" }}
        >
          حياة أجمل.. مع خصومات أكثر
        </span>
      )}
    </Link>
  );
}