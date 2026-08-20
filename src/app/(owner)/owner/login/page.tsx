"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, AlertTriangle } from "lucide-react";
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
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useOwnerAuth, useOwnerLogin } from "@/hooks/useOwnerAuth";

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
  const nextUrl = searchParams.get("next") || "/owner";
  const prefersReduced = useReducedMotion();

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

  const cardAnimation = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0A1628] to-[#0D1526] p-4">
      <div className="absolute left-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="h-20 w-20"
            style={{
              maskImage: "url(/logowafir.png)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              backgroundColor: "#FF2A7A",
            }}
          />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold">وفر</span>
            <span className="text-sm text-muted-foreground">لوحة تحكم أصحاب المنشآت</span>
          </div>
        </div>

        {/* BLOCKER NOTICE — Card with amber border */}
        <motion.div
          {...cardAnimation}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        >
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-amber-600 dark:text-amber-400">حاجز (BLOCKER)</p>
                <p className="mt-1 text-muted-foreground leading-relaxed">
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
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
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
                    <p className="text-xs text-destructive">
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
                    <p className="text-xs text-destructive">
                      {formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full min-h-[44px]"
                  disabled={login.isPending}
                >
                  {login.isPending ? "جارٍ الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للموقع
          </Link>
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
