"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Mail, Phone, Building2, Users, Smartphone, Twitter, Instagram, Ghost, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const QUICK_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "المنشآت", href: "/facilities" },
  { label: "البطاقات", href: "/" },
  { label: "تسجيل العضوية", href: "/register" },
  { label: "كيف تعمل", href: "/#how-it-works" },
] as const;

const SOCIAL_ITEMS = [
  { label: "إكس", icon: Twitter, color: "hover:bg-foreground hover:text-background" },
  { label: "انستقرام", icon: Instagram, color: "hover:bg-pink-600 hover:text-white" },
  { label: "سناب شات", icon: Ghost, color: "hover:bg-yellow-400 hover:text-foreground" },
] as const;

function useFooterCounter(target: number, duration = 2000) {
const prefersReduced = usePrefersReducedMotion();
  const [count, setCount] = useState(prefersReduced ? target : 0);

  useEffect(() => {
    if (prefersReduced) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, prefersReduced]);

  return count;
}

function FooterStat({
  icon: Icon,
  target,
  label,
  iconBg,
  iconColor,
}: {
  icon: typeof Building2;
  target: number;
  label: string;
  iconBg: string;
  iconColor: string;
}) {
  const count = useFooterCounter(target);
  return (
    <div className="flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">+{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const prefersReduced = usePrefersReducedMotion();
  
  const handleNewsletterSubmit = () => {
    toast({
      title: "تم تسجيل اشتراكك",
      description: "شكراً لاشتراكك في النشرة البريدية",
    });
    setEmail("");
  };

  return (
    <footer className="mt-auto w-full bg-card" role="contentinfo">
      {/* Gradient top border */}
      <div
        className="h-1 w-full"
        style={{
          background: "linear-gradient(to left, var(--primary), var(--secondary))",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: وفر Brand */}
          <div className="space-y-4">
            <div
              className="h-20 w-32"
              style={{
                maskImage: "url(/logowafir.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                backgroundColor: "var(--primary)",
              }}
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              منصة وفر تقدم لك بطاقات خصم بنسبة 30% على المطاعم والمقاهي
              والمرافق العامة في المملكة العربية السعودية.
            </p>
          </div>

          {/* Column 2: روابط سريعة */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">روابط سريعة</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground min-h-[44px] inline-flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: تواصل معنا */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground min-h-[44px]">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <span dir="ltr">info@wafir.gleeze.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground min-h-[44px]">
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <span dir="ltr">05XXXXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground min-h-[44px]">
                <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                <span>الرياض - المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>

          {/* Column 4: تابعنا */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">تابعنا</h3>
            <div className="flex items-center gap-3">
              {SOCIAL_ITEMS.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <button
                    key={social.label}
                    type="button"
                    aria-label={social.label}
                    className={
                      "flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 hover:scale-110 min-h-[44px] min-w-[44px] " +
                      social.color
                    }
                  >
                    <SocialIcon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-10 rounded-2xl border bg-muted/30 p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:text-right">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10", !prefersReduced && "animate-pulse")}>
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">اشترك في النشرة البريدية</h3>
                <p className="text-xs text-muted-foreground">كن أول من يعرف آخر العروض والخصومات</p>
              </div>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Input
                type="email"
                placeholder="بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg bg-background sm:w-64 animate-newsletter-glow"
              />
              <Button
                type="button"
                onClick={handleNewsletterSubmit}
                className="shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] gap-2"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">اشتراك</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border bg-muted/50 p-6 sm:grid-cols-2">
          <FooterStat
            icon={Building2}
            target={150}
            label="منشأة شريكة"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <FooterStat
            icon={Users}
            target={2000}
            label="مستخدم نشط"
            iconBg="bg-secondary/10"
            iconColor="text-secondary"
          />
        </div>

        {/* App Download Badges (placeholder) */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <div
            className={
              "flex h-12 items-center gap-2 rounded-xl border bg-muted/50 px-5 text-muted-foreground transition-colors hover:bg-muted min-h-[44px]"
            }
          >
            <Smartphone className="h-5 w-5" />
            <div>
              <p className="text-[10px] leading-none">قريبا على</p>
              <p className="text-xs font-bold leading-tight">متجر التطبيقات</p>
            </div>
          </div>
          <div
            className={
              "flex h-12 items-center gap-2 rounded-xl border bg-muted/50 px-5 text-muted-foreground transition-colors hover:bg-muted min-h-[44px]"
            }
          >
            <Smartphone className="h-5 w-5" />
            <div>
              <p className="text-[10px] leading-none">قريبا على</p>
              <p className="text-xs font-bold leading-tight">جوجل بلاي</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            جميع الحقوق محفوظة لوفر {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
