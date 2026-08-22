"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Check, User, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

/* ─── Step Indicator Data ─────────────────────────── */
const STEPS = [
  { num: 1, label: "البيانات الشخصية", icon: User },
  { num: 2, label: "كلمة المرور", icon: Lock },
  { num: 3, label: "تأكيد الحساب", icon: ShieldCheck },
] as const;

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
  const reduced = useReducedMotion();
  const { level, label, percent } = getPasswordStrength(password);
  if (!password) return null;
  const style = STYLES[level];
  const animate = reduced ? { width: `${percent}%` } : { width: `${percent}%` };
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", style.bar)}
          initial={reduced ? { width: `${percent}%` } : { width: 0 }}
          animate={animate}
          transition={reduced ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <p className={cn("text-xs", style.text)}>{label}</p>
    </div>
  );
}

/* ─── Confetti Particles ──────────────────────────── */
const CONFETTI_COLORS = ["#FF2A7A", "#14B8A6", "#FACC15", "#818CF8", "#FB923C", "#34D399", "#F472B6", "#60A5FA"];

function ConfettiParticles() {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {CONFETTI_COLORS.map((color, i) => {
        if (reduced) return null;
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
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
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
      <div className="relative mx-auto mb-8 max-w-sm overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-bl from-[#071320] to-[#0F1F33] p-6 text-white">
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
                backgroundColor: "#006699",
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

/* ─── Step Indicator ─────────────────────────────── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const reduced = useReducedMotion();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <div key={step.num} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full transition-colors min-h-[44px] min-w-[44px]",
                    isCompleted && "bg-secondary text-secondary-foreground",
                    isActive && "bg-primary text-primary-foreground",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                  initial={false}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium text-center leading-tight max-w-[80px]",
                    (isCompleted || isActive) ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {idx < STEPS.length - 1 && (
                <div className="relative mx-2 h-1 flex-1 mt-[-20px]">
                  <div className="absolute inset-0 rounded-full bg-muted" />
                  <motion.div
                    className={cn(
                      "absolute inset-y-0 right-0 rounded-full",
                      step.num < currentStep ? "bg-secondary" : "bg-transparent"
                    )}
                    initial={reduced ? { width: step.num < currentStep ? "100%" : "0%" } : { width: "0%" }}
                    animate={{ width: step.num < currentStep ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      left: 0,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Progress Bar ───────────────────────────────── */
function FormProgressBar({ progress }: { progress: number }) {
  const reduced = useReducedMotion();
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">تقدم التسجيل</span>
        <span className="text-xs font-bold text-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-secondary to-primary"
          initial={reduced ? { width: `${progress}%` } : { width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ─── Decorative Side Panel ──────────────────────── */
const BENEFITS = [
  "خصم 30% على جميع المنشآت المشتركة",
  "بطاقة عضوية رقمية فورية",
  "عروض حصرية ومزايا مميزة",
];

function DecorativeSidePanel() {
const prefersReduced = usePrefersReducedMotion();
  const anim = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } };

  return (
    <motion.div
      {...anim}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl p-10 text-center"
    >
      <div
        className="mb-6 h-16 w-40"
        style={{
          maskImage: "url(/logowafir.png)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          backgroundColor: "var(--primary)",
        }}
      />
      <h2 className="text-2xl font-extrabold text-foreground mb-2">انضم لعائلة وفر</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        سجّل الآن واحصل على بطاقة خصم تنفعك في عشرات المنشآت
      </p>
      <ul className="space-y-4 text-right">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-3 text-sm text-foreground">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15">
              <Check className="h-3.5 w-3.5 text-secondary" />
            </span>
            {benefit}
          </li>
        ))}
      </ul>
    </motion.div>
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

  const fullName = watch("full_name");
  const email = watch("email");
  const phone = watch("phone");
  const passwordValue = watch("password");
  const passwordConfirm = watch("password_confirm");

  /* ─── Compute progress & active step ──────────── */
  const { progress, currentStep } = useMemo(() => {
    let filled = 0;
    let step = 1;
    if (fullName.trim().length >= 2) filled += 1;
    else { return { progress: 0, currentStep: 1 }; }
    if (email.trim().length > 0) filled += 1;
    else { return { progress: 33, currentStep: 1 }; }
    if (phone.trim().length > 0) filled += 1;
    else { return { progress: 50, currentStep: 1 }; }
    step = 2;
    if (passwordValue.length > 0) filled += 1;
    else { return { progress: 66, currentStep: 2 }; }
    if (passwordConfirm.length > 0) { filled += 1; step = 3; }
    const pct = (filled / 5) * 100;
    return { progress: pct, currentStep: step };
  }, [fullName, email, phone, passwordValue, passwordConfirm]);

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
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <motion.div
        className="mb-8 space-y-2 text-center"
        {...formAnimation}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">تسجيل العضوية</h1>
        <p className="text-sm text-muted-foreground">انضم إلى وفر واحصل على بطاقة خصم 30%</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Decorative side panel */}
        <div className="hidden lg:block lg:col-span-2">
          <DecorativeSidePanel />
        </div>

        {/* Form card */}
        <motion.div
          className="lg:col-span-3"
          {...formAnimation}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <Card className="rounded-2xl relative overflow-hidden">
            {/* Subtle gradient border on the right side */}
            <div className="pointer-events-none absolute top-0 right-0 h-full w-[3px] bg-gradient-to-b from-primary to-secondary" />
            <CardContent className="pt-6">
              {/* Step Indicator */}
              <StepIndicator currentStep={currentStep} />

              {/* Progress Bar */}
              <FormProgressBar progress={progress} />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Field id="full_name" label="الاسم الكامل" error={errors.full_name?.message}>
                  <Input id="full_name" autoComplete="name" placeholder="مثال: أحمد محمد" disabled={isPending} aria-invalid={!!errors.full_name} {...register("full_name")} />
                </Field>

                <Separator />

                <Field id="email" label="البريد الإلكتروني" error={errors.email?.message}>
                  <Input id="email" type="email" inputMode="email" dir="ltr" autoComplete="email" placeholder="you@example.com" className="text-left" disabled={isPending} aria-invalid={!!errors.email} {...register("email")} />
                </Field>

                <Field id="phone" label="رقم الجوال" error={errors.phone?.message}>
                  <Input id="phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="05XXXXXXXX" className="text-left" disabled={isPending} aria-invalid={!!errors.phone} {...register("phone")} />
                </Field>

                <Separator />

                <Field id="region" label="المنطقة" error={errors.region_id?.message}>
                  <RegionSelector />
                </Field>

                <Separator />

                <Field id="password" label="كلمة المرور" error={errors.password?.message}>
                  <Input id="password" type="password" autoComplete="new-password" placeholder="......" disabled={isPending} aria-invalid={!!errors.password} {...register("password")} />
                  <PasswordStrengthBar password={passwordValue} />
                </Field>

                <Field id="password_confirm" label="تأكيد كلمة المرور" error={errors.password_confirm?.message}>
                  <Input id="password_confirm" type="password" autoComplete="new-password" placeholder="......" disabled={isPending} aria-invalid={!!errors.password_confirm} {...register("password_confirm")} />
                </Field>

                <Button type="submit" className="w-full rounded-full min-h-[44px]" disabled={isPending}>
                  {isPending ? "جارٍ التسجيل..." : "تسجيل العضوية"}
                </Button>
              </form>

              <Separator className="my-5" />

              <p className="text-center text-sm text-muted-foreground">
                لديك حساب بالفعل؟{" "}
                <Link href="/" className="font-medium text-secondary hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-secondary hover:underline min-h-[44px]">
          <ArrowRight className="h-4 w-4" />العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
