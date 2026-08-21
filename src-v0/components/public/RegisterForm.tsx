"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/useRegister";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegionSelector } from "@/components/public/RegionSelector";
import { useRegionStore } from "@/store/region.store";

// تعريف الـ Schema مع كامل الحقول المطلوبة من الباكند
const registerSchema = z
  .object({
    full_name: z.string().min(2, { message: "الاسم الكامل يجب أن يكون حرفين على الأقل" }),
    email: z.string().email({ message: "صيغة البريد الإلكتروني غير صحيحة" }),
    phone: z.string().regex(/^\d{9,}$/, { message: "رقم الجوال يجب أن يكون 9 أرقام على الأقل" }),
    password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
    password_confirm: z.string().min(6, { message: "تأكيد كلمة المرور يجب أن يكون 6 أحرف على الأقل" }),
    region_id: z.number().positive({ message: "يرجى اختيار منطقة صحيحة" }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "كلمة المرور غير متطابقة",
    path: ["password_confirm"],
  });

type RegisterValues = z.infer<typeof registerSchema>;




export function RegisterForm() {
  const { mutate, isPending } = useRegister();

  // جلب المنطقة المختارة من الـ Store
  const selectedRegionId = useRegionStore((state) => state.selectedRegionId);

  const {
    register,
    handleSubmit,
    setValue,
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

  // مزامنة الـ Store مع react-hook-form
  React.useEffect(() => {
    if (selectedRegionId) {
      setValue("region_id", selectedRegionId, { shouldValidate: true });
    }
  }, [selectedRegionId, setValue]);

  const onSubmit = (values: RegisterValues) => {
    // إرسال البيانات كاملة (بما فيها password_confirm)
    mutate(values);
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>تسجيل العضوية</CardTitle>
        <CardDescription>
          انضم إلى وفر واحصل على بطاقة خصم 30%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            id="full_name"
            label="الاسم الكامل"
            error={errors.full_name?.message}
          >
            <Input
              id="full_name"
              autoComplete="name"
              placeholder="مثال: أحمد محمد"
              disabled={isPending}
              aria-invalid={!!errors.full_name}
              {...register("full_name")}
            />
          </Field>

          <Field
            id="email"
            label="البريد الإلكتروني"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              inputMode="email"
              dir="ltr"
              autoComplete="email"
              placeholder="you@example.com"
              className="text-left"
              disabled={isPending}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </Field>

          <Field
            id="phone"
            label="رقم الجوال"
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              placeholder="05XXXXXXXX"
              className="text-left"
              disabled={isPending}
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
          </Field>

          {/* حقل المنطقة - باستخدام RegionSelector الموجود مع مزامنة الـ Store */}
          <Field
            id="region_id"
            label="المنطقة"
            error={errors.region_id?.message}
          >
            <RegionSelector />
          </Field>

          <Field
            id="password"
            label="كلمة المرور"
            error={errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••"
              disabled={isPending}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </Field>

          <Field
            id="password_confirm"
            label="تأكيد كلمة المرور"
            error={errors.password_confirm?.message}
          >
            <Input
              id="password_confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••"
              disabled={isPending}
              aria-invalid={!!errors.password_confirm}
              {...register("password_confirm")}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "جارٍ التسجيل…" : "تسجيل العضوية"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// مكون Field مساعد
interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}