"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useOwnerAuth, useOwnerLogin } from "@/hooks/useOwnerAuth";
import { useToast } from "@/hooks/use-toast";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const schema = z.object({
  identifier: z.string().min(1, "اسم المستخدم أو البريد الإلكتروني مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
type FormValues = z.infer<typeof schema>;

function OwnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, hydrated } = useOwnerAuth();
  const login = useOwnerLogin();
  const { toast } = useToast();
  const nextUrl = searchParams.get("next") || "/owner";
const prefersReduced = usePrefersReducedMotion();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace(nextUrl);
    }
  }, [hydrated, accessToken, router, nextUrl]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });
  const { register, handleSubmit, formState } = form;

  function onSubmit(values: FormValues) {
    login.mutate(values);
  }

  function handleForgotPassword() {
    toast({ title: "ستتوصل برابط إعادة التعيين قريبًا" });
  }

  const cardAnimation = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } };

  const floatVariants = prefersReduced
    ? { initial: { opacity: 0.15 }, animate: { opacity: 0.15 } }
    : {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 0.15, scale: 1 },
      };

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden p-4",
        !prefersReduced && "animate-hero-gradient"
      )}
      style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0D1B2A 20%, #0B2A2A 45%, #1B1040 65%, #0D1526 85%, #0A1628 100%)",
        backgroundSize: "300% 300%",
      }}
    >
      {/* Hero pattern overlay */}
      <div className="hero-pattern-overlay absolute inset-0 z-0" />

      {/* Floating decorative shapes */}
      <motion.div
        className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,194,184,0.2) 0%, transparent 70%)" }}
        variants={floatVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, delay: 0.2 }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,42,122,0.15) 0%, transparent 70%)" }}
        variants={floatVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, delay: 0.5 }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 left-[10%] h-48 w-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,209,102,0.1) 0%, transparent 70%)" }}
        variants={floatVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, delay: 0.8 }}
      />

      <div className="absolute left-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo with glow - floating on desktop */}
        <div className={cn(
          "flex flex-col items-center gap-3 text-center",
          !prefersReduced && "hidden md:flex",
          prefersReduced && "flex"
        )}>
          <div className={cn(
            "flex flex-col items-center gap-3 text-center",
            !prefersReduced && "animate-float"
          )}>
            <div
              className="h-24 w-24 drop-shadow-[0_0_24px_rgba(0,194,184,0.4)]"
              style={{
                maskImage: "url(/logowafir.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                backgroundColor: "#00C2B8",
              }}
            />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold">وفر</span>
              <span className="text-sm text-muted-foreground">لوحة تحكم أصحاب المنشآت</span>
            </div>
          </div>
        </div>

        {/* Mobile logo without float */}
        <div className={cn(
          "flex flex-col items-center gap-3 text-center",
          prefersReduced && "hidden",
          !prefersReduced && "flex md:hidden"
        )}>
          <div
            className="h-24 w-24 drop-shadow-[0_0_24px_rgba(0,194,184,0.4)]"
            style={{
              maskImage: "url(/logowafir.png)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              backgroundColor: "#00C2B8",
            }}
          />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold">وفر</span>
            <span className="text-sm text-muted-foreground">لوحة تحكم أصحاب المنشآت</span>
          </div>
        </div>

        {/* BLOCKER NOTICE */}
        <motion.div
          {...cardAnimation}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-amber-500 via-amber-400 to-amber-600" />
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">حاجز تقني (BLOCKER)</p>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  نقطة نهاية تسجيل الدخول{" "}
                  <code className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-mono">/api/v1/owner/login</code>
                  {" "}غير موجودة في مواصفات الواجهة الخلفية. يجب إضافتها من فريق الباكند.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Login Card */}
        <motion.div
          {...cardAnimation}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <Card className="border-border/30 bg-card/60 shadow-2xl backdrop-blur-xl">
            <CardHeader className="text-center">
              <CardTitle>بوابة المالك</CardTitle>
              <CardDescription>تسجيل دخول صاحب المنشأة</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">البريد الإلكتروني أو اسم المستخدم</Label>
                  <Input
                    id="identifier"
                    autoComplete="email"
                    autoFocus
                    dir="ltr"
                    {...register("identifier")}
                  />
                  {formState.errors.identifier && (
                    <p className="text-xs text-destructive" role="alert">
                      {formState.errors.identifier.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    dir="ltr"
                    {...register("password")}
                  />
                  {formState.errors.password && (
                    <p className="text-xs text-destructive" role="alert">
                      {formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    aria-label="تذكرني"
                  />
                  <Label htmlFor="remember-me" className="text-sm cursor-pointer select-none">
                    تذكرني
                  </Label>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:underline min-h-[44px] flex items-center"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full min-h-[44px]"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {login.isPending ? "جارٍ الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Link>
          <span className="text-xs text-muted-foreground/60">
            بوابة أصحاب المنشآت — وفر
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OwnerLoginPage() {
  return (
    <Suspense>
      <OwnerLoginForm />
    </Suspense>
  );
}
