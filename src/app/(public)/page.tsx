"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Coffee,
  Landmark,
  ShieldCheck,
  PiggyBank,
  BadgePercent,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  MapPinned,
  CircleHelp,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MemberCard } from "@/components/public/MemberCard";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { WafirPillBadge } from "@/components/shared/WafirPillBadge";
import { WafirLogo } from "@/components/shared/WafirLogo";
import { InstallPromoCard } from "@/components/pwa/PWAInstallButton";
import { useFacilities } from "@/hooks/useFacilities";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { TYPE_LABEL, TYPE_ICON } from "@/lib/constants";
import { DISCOUNT_RATE } from "@/lib/site-config";
import type { Facility, FacilityType } from "@/types/api.generated";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  أنماط الفئات الثلاث الحقيقية (توكنات cat-*)                         */
/* ------------------------------------------------------------------ */
const CATEGORY_CIRCLE: Record<
  FacilityType,
  { active: string; idle: string }
> = {
  restaurant: {
    active: "bg-cat-restaurant text-white shadow-soft",
    idle: "bg-cat-restaurant-soft text-cat-restaurant",
  },
  cafe: {
    active: "bg-cat-cafe text-white shadow-soft",
    idle: "bg-cat-cafe-soft text-cat-cafe",
  },
  public_facility: {
    active: "bg-cat-facility text-white shadow-soft",
    idle: "bg-cat-facility-soft text-cat-facility",
  },
};

const CATEGORY_PLACEHOLDER: Record<FacilityType, string> = {
  restaurant: "bg-cat-restaurant-soft text-cat-restaurant",
  cafe: "bg-cat-cafe-soft text-cat-cafe",
  public_facility: "bg-cat-facility-soft text-cat-facility",
};

const CATEGORY_BADGE: Record<FacilityType, string> = {
  restaurant: "bg-cat-restaurant-soft text-cat-restaurant",
  cafe: "bg-cat-cafe-soft text-cat-cafe",
  public_facility: "bg-cat-facility-soft text-cat-facility",
};

const CATEGORIES: ReadonlyArray<{
  key: FacilityType;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "restaurant", label: "مطاعم", icon: UtensilsCrossed },
  { key: "cafe", label: "كافيهات", icon: Coffee },
  { key: "public_facility", label: "مرافق عامة", icon: Landmark },
];

/* ------------------------------------------------------------------ */
/*  القسم 3.2 — بطاقة العضوية أعلى الصفحة                              */
/* ------------------------------------------------------------------ */
function MemberCardSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10" aria-label="بطاقة العضوية">
      <MemberCard />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  القسم 3.3 — شريط التصنيفات الدائري                                  */
/* ------------------------------------------------------------------ */
function CategoryCircles({
  active,
  onChange,
}: {
  active: FacilityType | null;
  onChange: (key: FacilityType | null) => void;
}) {
  return (
    <div
      className="scroll-area-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
      role="group"
      aria-label="تصفية العروض حسب الفئة"
    >
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = active === category.key;
        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(isActive ? null : category.key)}
            aria-pressed={isActive}
            className="flex min-h-[44px] w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-2xl p-2 transition-transform duration-150 active:scale-95"
          >
            <span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200",
                isActive
                  ? CATEGORY_CIRCLE[category.key].active
                  : CATEGORY_CIRCLE[category.key].idle
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </span>
            <span
              className={cn(
                "text-xs leading-tight text-foreground",
                isActive ? "font-bold" : "font-medium"
              )}
            >
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  القسم 3.4 — كرت المنشأة                                            */
/* ------------------------------------------------------------------ */
function FacilityCard({ facility }: { readonly facility: Facility }) {
  const PlaceholderIcon = TYPE_ICON[facility.type];
  const maxDiscount = facility.cards.length
    ? Math.max(...facility.cards.map((c) => c.discount_rate))
    : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg">
      {/* صورة 16:9 */}
      <div className="relative aspect-video">
        {facility.image_url ? (
          <ImageWithSkeleton
            src={facility.image_url}
            alt={facility.name}
            fill
            className="h-full w-full"
            skeletonClassName="rounded-none"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center",
              CATEGORY_PLACEHOLDER[facility.type]
            )}
            role="img"
            aria-label={facility.name}
          >
            <PlaceholderIcon className="h-12 w-12 opacity-70" aria-hidden="true" />
          </div>
        )}
        {maxDiscount !== null && maxDiscount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1.5 text-xs font-extrabold text-accent-foreground shadow-soft">
            خصم حتى {maxDiscount}%
          </span>
        )}
      </div>

      {/* المحتوى */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug text-foreground">
            {facility.name}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
              CATEGORY_BADGE[facility.type]
            )}
          >
            {TYPE_LABEL[facility.type]}
          </span>
        </div>
        <Button asChild className="mt-auto w-full rounded-full min-h-[44px]">
          <Link href={`/facilities/${facility.id}`}>استخدم العرض</Link>
        </Button>
      </div>
    </article>
  );
}

function FacilityCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-soft">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-auto h-11 w-full rounded-full" />
      </div>
    </div>
  );
}

function OffersGrid({
  activeCategory,
}: {
  activeCategory: FacilityType | null;
}) {
  const { data, isLoading, error, refetch } = useFacilities();

  const facilities = useMemo(() => {
    if (!data) return [];
    return activeCategory
      ? data.filter((f) => f.type === activeCategory)
      : data;
  }, [data, activeCategory]);

  const filteredLabel = activeCategory
    ? TYPE_LABEL[activeCategory]
    : null;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
      aria-busy={isLoading}
    >
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <FacilityCardSkeleton key={i} />
          ))
        : facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  القسمان 3.3 + 3.4 معاً — التصنيفات تفلتر الشبكة                    */
/* ------------------------------------------------------------------ */
function CategoriesAndOffersSection() {
  const [activeCategory, setActiveCategory] = useState<FacilityType | null>(
    null
  );
  const { data, isLoading, error, refetch } = useFacilities();

  const total = data?.length ?? 0;
  const filteredCount = useMemo(() => {
    if (!data) return 0;
    return activeCategory
      ? data.filter((f) => f.type === activeCategory).length
      : data.length;
  }, [data, activeCategory]);

  return (
    <section className="space-y-6" aria-label="عروض مميزة لك">
      {/* العنوان */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          عروض مميزة لك
        </h2>
        {activeCategory && (
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border/60 px-4 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            {TYPE_LABEL[activeCategory]} ({filteredCount}) — إلغاء التصفية
          </button>
        )}
      </div>

      {/* شريط التصنيفات الدائري */}
      <CategoryCircles active={activeCategory} onChange={setActiveCategory} />

      {/* الشبكة */}
      {error ? (
        <ErrorState
          title="تعذّر تحميل العروض"
          message="حدث خطأ أثناء جلب المنشآت. حاول مرة أخرى."
          onRetry={() => refetch()}
        />
      ) : !isLoading && total === 0 ? (
        <EmptyState
          icon={Landmark}
          title="لا توجد منشآت في منطقتك بعد"
          description="جرّب اختيار منطقة أخرى من الأعلى، أو عد لاحقاً — نضيف منشآت جديدة باستمرار."
        />
      ) : !isLoading && filteredCount === 0 && activeCategory ? (
        <EmptyState
          icon={TYPE_ICON[activeCategory]}
          title={`لا توجد ${TYPE_LABEL[activeCategory]} في منطقتك حالياً`}
          description="جرّب فئة أخرى أو ألغِ التصفية لعرض كل المنشآت."
          action={
            <Button
              variant="outline"
              className="rounded-full min-h-[44px]"
              onClick={() => setActiveCategory(null)}
            >
              عرض كل المنشآت
            </Button>
          }
        />
      ) : (
        <OffersGrid activeCategory={activeCategory} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  القسم 3.5 — لماذا بطاقة وفر؟                                       */
/* ------------------------------------------------------------------ */
const WHY_POINTS: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  desc: string;
}> = [
  {
    icon: ShieldCheck,
    title: "آمنة وسهلة الاستخدام",
    desc: "بطاقة رقمية محفوظة في حسابك — أظهرها من هاتفك عند الدفع",
  },
  {
    icon: PiggyBank,
    title: "توفير مستمر",
    desc: "خصومات فعلية على فواتيرك في كل زيارة للمنشآت المشتركة",
  },
  {
    icon: BadgePercent,
    title: "خصومات حصرية لدى المتاجر",
    desc: "عروض خاصة لحاملي بطاقة وفر في المطاعم والكافيهات والمرافق",
  },
];

function WhyWafirSection() {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <section aria-label="لماذا بطاقة وفر">
      <div className="gradient-ocean relative overflow-hidden rounded-2xl p-6 text-white shadow-soft-lg sm:p-10">
        {/* زخارف confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <span className="absolute right-[6%] top-[12%] h-3 w-3 rounded-full bg-accent/60" />
          <span className="absolute left-[8%] bottom-[20%] h-2.5 w-2.5 rotate-45 bg-secondary/50" />
          <span className="absolute left-[30%] top-[8%] h-2 w-2 [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-cat-facility/50" />
          <span className="animate-float-slow absolute right-[16%] bottom-[12%] h-2 w-2 rounded-full bg-accent/50" />
        </div>

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-5">
          {/* النقاط */}
          <div className="space-y-7 lg:col-span-3">
            <div className="space-y-3">
              <WafirPillBadge className="ring-1 ring-white/25" />
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                لماذا بطاقة وفر؟
              </h2>
              <p className="text-sm text-white/80 sm:text-base">
                بطاقة واحدة في جيبك.. توفير حقيقي في كل مكان
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {WHY_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="flex flex-col items-center gap-3 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{point.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-white/70">
                        {point.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* مجسم البطاقة الرقمية المائل */}
          <div className="hidden justify-center lg:col-span-2 lg:flex">
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 24, rotate: 12 }}
              whileInView={
                prefersReduced
                  ? { opacity: 1, y: 0, rotate: 8 }
                  : { opacity: 1, y: 0, rotate: 8 }
              }
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={prefersReduced ? undefined : { rotate: 3, scale: 1.03 }}
              className="w-64 rounded-2xl border border-white/20 bg-primary-deep/80 p-5 shadow-2xl backdrop-blur-sm"
              aria-hidden="true"
            >
              <div className="flex items-center justify-between">
                <WafirLogo variant="mark" onDark className="h-10 w-auto" />
                <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-extrabold text-accent-foreground">
                  خصم {DISCOUNT_RATE}%
                </span>
              </div>
              <div className="my-4 h-px bg-white/15" />
              <p className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                بطاقة الخصومات الذكية
              </p>
              <p className="mt-2 text-sm font-black tracking-[0.12em] text-white/50">
                •••• ••••
              </p>
              <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-3">
                <span className="text-[10px] text-white/50">عضوية وفر</span>
                <span className="text-[10px] text-white/50">MM/YY</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  الأسئلة الشائعة (محدثة)                                             */
/* ------------------------------------------------------------------ */
const FAQ_ITEMS = [
  {
    q: "ما هي بطاقة وفر؟",
    a: `بطاقة وفر هي بطاقة خصم رقمية تمنحك خصمًا بنسبة ${DISCOUNT_RATE}% على المطاعم والكافيهات والمرافق العامة المشتركة في المملكة.`,
  },
  {
    q: "كيف أحصل على الخصم؟",
    a: `اعرض بطاقة وفر في المنشأة المشتركة عند الدفع وسيتم تطبيق خصمك تلقائيًا.`,
  },
  { q: "هل البطاقة مجانية؟", a: "نعم، التسجيل في منصة وفر والحصول على البطاقة الرقمية مجاني بالكامل." },
  {
    q: "كم نسبة الخصم؟",
    a: `تحصل على خصم ${DISCOUNT_RATE}% على المنتجات والخدمات في المنشآت المشتركة.`,
  },
  {
    q: "هل يمكنني استخدامها في أي منطقة؟",
    a: "نعم، اختر منطقتك من القائمة في الأعلى وستظهر لك المنشآت المتاحة في منطقتك.",
  },
  {
    q: "كيف أتحكم في بياناتي؟",
    a: "سجّل دخولك من تبويب حسابي وعدّل بياناتك مباشرة",
  },
] as const;

function FAQSection() {
  return (
    <section className="space-y-6" aria-label="الأسئلة الشائعة">
      <div className="flex items-center gap-2">
        <CircleHelp className="h-5 w-5 text-secondary" aria-hidden="true" />
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          الأسئلة الشائعة
        </h2>
      </div>
      <div className="max-w-2xl">
        <Accordion type="single" collapsible className="rounded-2xl border bg-card">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="px-4 sm:px-6">
              <AccordionTrigger className="min-h-[44px] text-right text-sm font-bold text-foreground hover:no-underline sm:text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  القسم 3.8 — تواصل معنا (بيانات حقيقية حصراً)                       */
/* ------------------------------------------------------------------ */
const CONTACT_PHONE = "0547669078";
const CONTACT_PHONE_DISPLAY = "0547 669 078";
const CONTACT_WHATSAPP = "https://wa.me/966547669078";
const CONTACT_EMAIL = "s72468483@gmail.com";
const CONTACT_ADDRESS = "المملكة العربية السعودية";

function ContactSection() {
  return (
    <section className="space-y-6" aria-label="تواصل معنا">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-secondary" aria-hidden="true" />
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          تواصل معنا
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* الهاتف — بطاقة قابلة للنقر */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-soft-lg">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/15">
            <Phone className="h-5 w-5 text-secondary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">الهاتف</p>
            <a
              href={`tel:${CONTACT_PHONE}`}
              dir="ltr"
              className="mt-0.5 block truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
          <a
            href={CONTACT_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل معنا عبر واتساب"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>

        {/* البريد الإلكتروني — بطاقة قابلة للنقر */}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-soft-lg"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">البريد الإلكتروني</p>
            <p dir="ltr" className="mt-0.5 truncate text-sm text-muted-foreground">
              {CONTACT_EMAIL}
            </p>
          </div>
        </a>

        {/* العنوان */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-soft-lg">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cat-restaurant-soft">
            <MapPin className="h-5 w-5 text-cat-restaurant" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">العنوان</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{CONTACT_ADDRESS}</p>
          </div>
        </div>

        {/* منطقة الخدمة */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-soft-lg">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cat-facility-soft">
            <MapPinned className="h-5 w-5 text-cat-facility" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">منطقة الخدمة</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              جميع مناطق المملكة العربية السعودية
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  الصفحة الرئيسية                                                    */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  return (
    <div className="w-full">
      <MemberCardSection />
      <InstallPromoCard portal="customer" />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:space-y-14 sm:px-6 sm:py-14">
        <CategoriesAndOffersSection />
        <WhyWafirSection />
        <FAQSection />
        <ContactSection />
      </div>
    </div>
  );
}
