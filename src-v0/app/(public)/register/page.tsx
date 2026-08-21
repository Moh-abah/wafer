"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DiscountBadge } from "@/components/shared/DiscountBadge";
import { RegionSelector } from "@/components/public/RegionSelector";
import { useRegionStore } from "@/store/region.store";
import { useRegister } from "@/hooks/useRegister";
import { cn } from "@/lib/utils";

/* ─── Zod Schema ─────────────────────────────────── */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const registerSchema = z
  .object({
    full_name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
    email: z.string().email({ message: "صيغة البريد الإلكتروني غير صحيحة" }),
    phone: z
      .string()
      .min(10, { message: "رقم الجوال يجب أن يكون 10 أرقام على الأقل" })
      .regex(/^(05|5)\d{8}$/, { message: "أدخل رقم جوال سعودي صحيح (مثال: 05XXXXXXXX)" }),
    password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
    password_confirm: z.string().min(6, { message: "تأكيد كلمة المرور مطلوب" }),
    region_id: z.number().positive({ message: "يرجى اختيار منطقة" }),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["password_confirm"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

/* ─── Password Strength ───────────────────────────── */
function getPasswordStrength(password: string): { level: "weak" | "medium" | "strong"; label: string; percent: number } {
  if (password.length === 0) return { level: "weak", label: "", percent: 0 };
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
    return { level: "strong", label: "قوية", percent: 100 };
  }
  if (password.length >= 6 && hasLetters && hasNumbers) {
    return { level: "medium", label: "متوسطة", percent: 60 };
  }
  return { level: "weak", label: "ضعيفة", percent: 30 };
}

const STYLES: Record<string, { bar: string; text: string }> = {
  weak: { bar: "bg-red-500", text: "text-red-500" },
  medium: { bar: "bg-yellow-500", text: "text-yellow-500" },
  strong: { bar: "bg-green-500", text: "text-green-500" },
};

function PasswordStrengthBar({ password }: { password: string }) {
  const { level, label, percent } = getPasswordStrength(password);
  if (!password) return null;
  const style = STYLES[level];
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", style.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <p className={cn("text-xs", style.text)}>{label}</p>
    </div>
  );
}

/* ─── Confetti Particles ──────────────────────────── */
const CONFETTI_COLORS = ["#FF2A7A", "#14B8A6", "#FACC15", "#818CF8", "#FB923C", "#34D399", "#F472B6", "#60A5FA"];

function ConfettiParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {CONFETTI_COLORS.map((color, i) => {
        const angle = (i / CONFETTI_COLORS.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 60 + Math.random() * 80;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist - 40;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color, marginLeft: -5, marginTop: -5 }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1, x: tx, y: ty }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

/* ─── Success Screen ─────────────────────────────── */
function SuccessScreen({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative mx-auto w-full max-w-md text-center"
    >
      <ConfettiParticles />

      <div className="mb-6 flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-success" />
      </div>
      <h1 className="mb-2 text-2xl font-extrabold text-foreground">تم التسجيل بنجاح!</h1>
      <p className="mb-8 text-sm text-muted-foreground">{message || "أهلاً بك في منصة وفر"}</p>

      {/* Virtual Card with shimmer */}
      <div className="relative mx-auto mb-8 max-w-sm overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-bl from-[#0A1628] to-[#16213A] p-6 text-white">
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)",
            animation: "card-shimmer 3s ease-in-out infinite",
          }}
        />
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div
              className="h-8 w-24"
              style={{
                maskImage: "url(/logowafir.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                backgroundColor: "#FF2A7A",
              }}
            />
            <DiscountBadge percentage={30} />
          </div>
          <div className="mb-6 h-px bg-white/20" />
          <p className="text-lg font-bold">بطاقة عضوية وفر</p>
          <p className="mt-1 text-sm text-white/60">خصم 30% على جميع المنشآت المشتركة</p>
        </div>
      </div>

      <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] w-full">
        <Link href="/">استكشف العروض</Link>
      </Button>
    </motion.div>
  );
}

/* ─── Field Helper ───────────────────────────────── */
function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}

/* ─── Register Page ──────────────────────────────── */
export default function RegisterPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { mutate, isPending } = useRegister();
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);
  const prefersReduced = usePrefersReducedMotion();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      password_confirm: "",
      region_id: undefined,
    },
  });

  const passwordValue = watch("password");

  useEffect(() => {
    if (selectedRegionId) setValue("region_id", selectedRegionId, { shouldValidate: true });
  }, [selectedRegionId, setValue]);

  const onSubmit = (values: RegisterValues) => {
    mutate(values, {
      onSuccess: (response) => {
        setSuccessMessage(response.detail || "أهلاً بك في منصة وفر!");
      },
    });
  };

  if (successMessage) return <div className="mx-auto w-full max-w-md px-4 py-10"><SuccessScreen message={successMessage} /></div>;

  const formAnimation = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <motion.div
        className="mb-6 space-y-2 text-center"
        {...formAnimation}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">تسجيل العضوية</h1>
        <p className="text-sm text-muted-foreground">انضم إلى وفر واحصل على بطاقة خصم 30%</p>
      </motion.div>

      <motion.div
        {...formAnimation}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Field id="full_name" label="الاسم الكامل" error={errors.full_name?.message}>
                <Input id="full_name" autoComplete="name" placeholder="مثال: أحمد محمد" disabled={isPending} aria-invalid={!!errors.full_name} {...register("full_name")} />
              </Field>

              <Field id="email" label="البريد الإلكتروني" error={errors.email?.message}>
                <Input id="email" type="email" inputMode="email" dir="ltr" autoComplete="email" placeholder="you@example.com" className="text-left" disabled={isPending} aria-invalid={!!errors.email} {...register("email")} />
              </Field>

              <Field id="phone" label="رقم الجوال" error={errors.phone?.message}>
                <Input id="phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="05XXXXXXXX" className="text-left" disabled={isPending} aria-invalid={!!errors.phone} {...register("phone")} />
              </Field>

              <Field id="region" label="المنطقة" error={errors.region_id?.message}>
                <RegionSelector />
              </Field>

              <Field id="password" label="كلمة المرور" error={errors.password?.message}>
                <Input id="password" type="password" autoComplete="new-password" placeholder="••••••" disabled={isPending} aria-invalid={!!errors.password} {...register("password")} />
                <PasswordStrengthBar password={passwordValue} />
              </Field>

              <Field id="password_confirm" label="تأكيد كلمة المرور" error={errors.password_confirm?.message}>
                <Input id="password_confirm" type="password" autoComplete="new-password" placeholder="••••••" disabled={isPending} aria-invalid={!!errors.password_confirm} {...register("password_confirm")} />
              </Field>

              <Button type="submit" className="w-full rounded-full min-h-[44px]" disabled={isPending}>
                {isPending ? "جارٍ التسجيل…" : "تسجيل العضوية"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-6 text-center">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-secondary hover:underline min-h-[44px]">
          <ArrowRight className="h-4 w-4" />العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
