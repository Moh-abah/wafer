"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  UserRound,
  Mail,
  Phone,
  LogOut,
  Loader2,
  Save,
  UserPlus,
  LogIn,
  ShieldCheck,
  Heart,
  Clock,
  UtensilsCrossed,
  Coffee,
  Landmark,
  Star,
  Trash2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberCard } from "@/components/public/MemberCard";
import { WafirLogo } from "@/components/shared/WafirLogo";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { useCustomerAuth, useCustomerLogout } from "@/hooks/useCustomerAuth";
import { useMe, useInvalidateMe } from "@/hooks/useMe";
import { useMyFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useMyReviews, useDeleteReview } from "@/hooks/useReviews";
import { StarRating } from "@/components/shared/StarRating";
import { customerAuthService } from "@/services/customer-auth.service";
import { customerApiClient } from "@/services/customer-api-client";
import type { MessageOut } from "@/types/api.generated";
import { useToast } from "@/hooks/use-toast";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { MeOut } from "@/types/api.generated";

/* ------------------------------------------------------------------ */
/*  زائر — بطاقة ترحيب مصغرة + زرا الدخول والتسجيل                     */
/* ------------------------------------------------------------------ */
function GuestAccount() {
  const prefersReduced = usePrefersReducedMotion();
  const anim = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      {...anim}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-md px-4 py-10 sm:py-16"
    >
      <Card className="rounded-2xl border-border/60 shadow-soft-lg">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-10">
          <WafirLogo className="h-14 w-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-foreground">
              أهلاً بك في وفر
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              سجّل الدخول لعرض بطاقة الخصومات الخاصة بك،
              أو أنشئ حساباً جديداً واحصل على بطاقتك فوراً.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3">
            <Button asChild className="min-h-[44px] gap-2 rounded-full">
              <Link href="/login">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                تسجيل الدخول
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-[44px] gap-2 rounded-full"
            >
              <Link href="/register">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                إنشاء حساب
              </Link>
            </Button>
          </div>
          <PWAInstallButton portal="customer" variant="full" className="w-full" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  هيكل تحميل الصفحة                                                  */
/* ------------------------------------------------------------------ */
function AccountSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-56 w-full rounded-[20px]" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  نموذج تعديل البيانات (الاسم + الجوال — البريد ثابت)                */
/* ------------------------------------------------------------------ */
const profileSchema = z.object({
  full_name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
  phone: z
    .string()
    .min(10, { message: "رقم الجوال يجب أن يكون 10 أرقام على الأقل" })
    .regex(/^(05|5)\d{8}$/, {
      message: "أدخل رقم جوال سعودي صحيح (مثال: 05XXXXXXXX)",
    }),
});
type ProfileValues = z.infer<typeof profileSchema>;

function ProfileEditForm({ me }: { me: MeOut }) {
  const { toast } = useToast();
  const invalidateMe = useInvalidateMe();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState,
    watch,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: me.full_name,
      phone: me.phone,
    },
  });

  const currentValues = watch();

  const updateMutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      customerAuthService.updateMe(values),
    onSuccess: () => {
      setServerError(null);
      invalidateMe();
      toast({
        title: "تم حفظ التعديلات",
        description: "تم تحديث بياناتك بنجاح",
      });
    },
    onError: (e: Error) => {
      setServerError(e.message || "تعذّر حفظ التعديلات");
      toast({
        title: "تعذّر حفظ التعديلات",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const isDirty =
    currentValues.full_name !== me.full_name || currentValues.phone !== me.phone;

  return (
    <form
      onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input
          id="full_name"
          autoComplete="name"
          disabled={updateMutation.isPending}
          aria-invalid={!!formState.errors.full_name}
          {...register("full_name")}
        />
        {formState.errors.full_name && (
          <p className="text-xs text-destructive" role="alert">
            {formState.errors.full_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">رقم الجوال</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          className="text-left"
          autoComplete="tel"
          disabled={updateMutation.isPending}
          aria-invalid={!!formState.errors.phone}
          {...register("phone")}
        />
        {formState.errors.phone && (
          <p className="text-xs text-destructive" role="alert">
            {formState.errors.phone.message}
          </p>
        )}
      </div>

      {serverError && (
        <p
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        className="min-h-[44px] gap-2 rounded-full"
        disabled={updateMutation.isPending || !isDirty}
      >
        {updateMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="h-4 w-4" aria-hidden="true" />
        )}
        {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  محتوى الحساب — بطاقة العضوية + البيانات + التعديل + الخروج         */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  المفضلة — قائمة المنشآت التي أضافها العميل للمفضلة                  */
/* ------------------------------------------------------------------ */
function MyFavoritesSection() {
  const { data: favorites, isLoading } = useMyFavorites();
  const toggleMut = useToggleFavorite();

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
          مفضلاتي
        </CardTitle>
        <CardDescription>
          المنشآت التي حفظتها للوصول السريع
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Heart className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">لا توجد منشآت في مفضلاتك</p>
              <p className="mt-1 text-xs text-muted-foreground">
                تصفّح المنشآت واضغط على القلب لإضافتها هنا
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2 min-h-[44px]">
              <Link href="/facilities">
                تصفّح المنشآت
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((facility) => (
              <div
                key={facility.id}
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15">
                  {facility.type === "restaurant" ? (
                    <UtensilsCrossed className="h-5 w-5 text-primary" aria-hidden="true" />
                  ) : facility.type === "cafe" ? (
                    <Coffee className="h-5 w-5 text-secondary" aria-hidden="true" />
                  ) : (
                    <Landmark className="h-5 w-5 text-accent" aria-hidden="true" />
                  )}
                </div>
                <Link
                  href={`/facilities/${facility.id}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                    {facility.name}
                  </p>
                  {facility.working_hours && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {facility.working_hours}
                    </p>
                  )}
                </Link>
                <button
                  onClick={() => toggleMut.mutate(facility.id)}
                  disabled={toggleMut.isPending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label={`إزالة ${facility.name} من المفضلة`}
                >
                  <Heart className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  مراجعاتي — قائمة المراجعات التي كتبها العميل عبر كل المنشآت       */
/* ------------------------------------------------------------------ */
function MyReviewsSection() {
  const { data: reviews, isLoading } = useMyReviews();
  const deleteMut = useDeleteReview();
  const { toast } = useToast();

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-accent" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          مراجعاتي
        </CardTitle>
        <CardDescription>
          المراجعات التي كتبتها على المنشآت
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Star className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">لم تكتب أي مراجعة بعد</p>
              <p className="mt-1 text-xs text-muted-foreground">
                زر منشأة واترك تقييمك لمشاركة تجربتك مع الآخرين
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2 min-h-[44px]">
              <Link href="/facilities">
                تصفّح المنشآت
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="group flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/15 to-secondary/15">
                  <Star className="h-5 w-5 text-accent" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                </div>
                <Link
                  href={`/facilities/${review.facility_id}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                    {review.facility_name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating value={review.rating} size={12} />
                    <span className="text-xs text-muted-foreground">
                      {review.helpful_count > 0 && `${review.helpful_count} وجدوها مفيدة`}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                  {!review.is_published && (
                    <span className="mt-1 inline-block rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                      مخفية
                    </span>
                  )}
                </Link>
                <button
                  onClick={() =>
                    deleteMut.mutate(review.facility_id, {
                      onSuccess: () => toast({ title: "تم حذف المراجعة" }),
                    })
                  }
                  disabled={deleteMut.isPending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label={`حذف مراجعة ${review.facility_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  تسجيل الخروج من جميع الأجهزة                                       */
/* ------------------------------------------------------------------ */
function LogoutAllDevicesButton() {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: () => customerApiClient.post<MessageOut>("/me/logout-all"),
    onSuccess: (data) => {
      toast({ title: data.detail });
    },
    onError: (e: Error) => {
      toast({
        title: "تعذّر تسجيل الخروج",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="min-h-[44px] gap-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {mutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Smartphone className="h-4 w-4" aria-hidden="true" />
      )}
      خروج من كل الأجهزة
    </Button>
  );
}

function AccountContent({ me }: { me: MeOut }) {
  const logout = useCustomerLogout();
  const prefersReduced = usePrefersReducedMotion();
  const anim = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      {...anim}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6"
    >
      {/* الترحيب */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            مرحباً، {me.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            هذه بطاقتك وبياناتك في منصة وفر
          </p>
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="min-h-[44px] gap-2 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          تسجيل الخروج
        </Button>
        <LogoutAllDevicesButton />
      </div>

      {/* بطاقة العضوية — نفس تصميم MemberCard ببيانات حقيقية */}
      <MemberCard />

      {/* تثبيت التطبيق — يظهر عند توفر إمكانية التثبيت فقط */}
      <PWAInstallButton portal="customer" variant="full" />

      {/* بيانات الملف + التعديل */}
      <Card className="rounded-2xl border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserRound className="h-5 w-5 text-primary" aria-hidden="true" />
            بياناتي
          </CardTitle>
          <CardDescription>
            يمكنك تعديل الاسم ورقم الجوال — البريد الإلكتروني ثابت
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* عرض البيانات الحالية */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4">
              <UserRound
                className="h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">الاسم الكامل</p>
                <p className="truncate text-sm font-bold text-foreground">
                  {me.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4">
              <Mail
                className="h-5 w-5 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  البريد الإلكتروني
                </p>
                <p dir="ltr" className="truncate text-left text-sm font-bold text-foreground">
                  {me.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4">
              <Phone
                className="h-5 w-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">رقم الجوال</p>
                <p dir="ltr" className="truncate text-left text-sm font-bold text-foreground">
                  {me.phone}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* نموذج التعديل */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
              تعديل البيانات
            </h3>
            <ProfileEditForm key={`${me.id}-${me.full_name}-${me.phone}`} me={me} />
          </div>
        </CardContent>
      </Card>

      {/* المفضلة — قائمة المنشآت المحفوظة */}
      <MyFavoritesSection />

      {/* مراجعاتي — قائمة المراجعات التي كتبها العميل */}
      <MyReviewsSection />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  صفحة حسابي                                                         */
/* ------------------------------------------------------------------ */
export default function AccountPage() {
  const { accessToken, hydrated } = useCustomerAuth();
  const me = useMe();

  /* قبل الترطيب: هيكل ثابت يمنع وميض التوجيه */
  if (!hydrated) {
    return <AccountSkeleton />;
  }

  /* زائر غير مسجل */
  if (!accessToken) {
    return <GuestAccount />;
  }

  if (me.isLoading) {
    return <AccountSkeleton />;
  }

  if (me.isError || !me.data) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          {me.error instanceof Error
            ? me.error.message
            : "تعذّر تحميل بيانات الحساب"}
        </p>
        <Button
          onClick={() => me.refetch()}
          className="min-h-[44px] rounded-full"
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return <AccountContent me={me.data} />;
}
