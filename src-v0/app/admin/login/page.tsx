"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
import { useAdminAuth, useAdminLogin } from "@/hooks/useAdminAuth";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const schema = z.object({
  identifier: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { accessToken, hydrated } = useAdminAuth();
  const login = useAdminLogin();
  const prefersReduced = usePrefersReducedMotion();
  
  // If already authenticated, bounce to /admin
  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/admin");
    }
  }, [hydrated, accessToken, router]);

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
            <span className="text-sm text-muted-foreground">لوحة تحكم المشرفين</span>
          </div>
        </div>

        <motion.div
          {...cardAnimation}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle>تسجيل الدخول</CardTitle>
              <CardDescription>أدخل بيانات الاعتماد للوصول للوحة التحكم</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">اسم المستخدم</Label>
                  <Input
                    id="identifier"
                    autoComplete="identifier"
                    autoFocus
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
