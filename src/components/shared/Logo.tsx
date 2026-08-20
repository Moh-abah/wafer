"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
 className?: string;
 href?: string; // رابط الـ Logo (افتراضي "/")
 width?: number;
 height?: number;
}

export function Logo({ className, href = "/", width = 120, height = 40 }: LogoProps) {
 return (
  <Link
   href={href}
   className={cn("inline-block outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
   aria-label="وفر — الصفحة الرئيسية"
  >
   <Image
    src="/logowafir.png"
    alt="شعار وفر"
    width={width}
    height={height}
    priority // لتحميل سريع في الـ header
    className="h-auto w-auto object-contain"
   />
  </Link>
 );
}