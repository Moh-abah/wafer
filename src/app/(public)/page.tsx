"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CreditCard, UtensilsCrossed,
  Coffee, Landmark, Sparkles, Star, UserPlus, PartyPopper,
  Building2, Users,
} from "lucide-react";

// في سطر استيراد الأيقونات — احذف Users لأنها لم تعد مستخدمة:

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscountBadge } from "@/components/shared/DiscountBadge";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCards } from "@/hooks/useCards";
import { useFacilities } from "@/hooks/useFacilities";
import { useRegionStore } from "@/store/region.store";
import type { FacilityType, Card, Facility } from "@/types/api.generated";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<FacilityType, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرفق عام",
};

const TYPE_ICON: Record<FacilityType, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  public_facility: Landmark,
};

const FILTER_CHIPS = [
  { key: "all", label: "الكل" },
  { key: "restaurant", label: "مطاعم" },
  { key: "cafe", label: "كافيهات" },
  { key: "public_facility", label: "مرافق عامة" },
] as const;

type FilterKey = (typeof FILTER_CHIPS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */
function useAnimatedCounter(target: number, duration = 2000) {
  const prefersReduced = useReducedMotion();
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

/* ------------------------------------------------------------------ */
/*  Stagger helpers                                                    */
/* ------------------------------------------------------------------ */
function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    }} className={className}>{children}</motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ScrollRow (upgraded)                                               */
/* ------------------------------------------------------------------ */
function ScrollRow({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amt = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "right" ? -amt : amt, behavior: "smooth" });
  };
  return (
    <section className="relative">
      {title && (<div className="mb-3 flex items-center gap-2 px-4 sm:px-0"><Icon className="h-5 w-5 text-secondary" /><h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2></div>)}
      <div className="relative group/row">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-transparent to-background" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-transparent to-background" />
        <button onClick={() => scroll("right")} className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-lg opacity-0 backdrop-blur transition-opacity group-hover/row:opacity-100 lg:block" aria-label="تمرير لليمين"><ChevronRight className="h-5 w-5 text-foreground" /></button>
        <button onClick={() => scroll("left")} className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-lg opacity-0 backdrop-blur transition-opacity group-hover/row:opacity-100 lg:block" aria-label="تمرير لليسار"><ChevronLeft className="h-5 w-5 text-foreground" /></button>
        <div ref={scrollRef} className="scroll-area-thin flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-0 scroll-smooth">{children}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeletons                                                          */
/* ------------------------------------------------------------------ */
function CardSkeleton() {
  return (<div className="w-[260px] shrink-0 snap-start rounded-2xl bg-card p-4"><Skeleton className="mb-3 h-6 w-3/4" /><Skeleton className="mb-2 h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>);
}

function FacilityCardSkeleton() {
  return (<div className="w-[200px] shrink-0 snap-start rounded-2xl bg-card overflow-hidden"><Skeleton className="h-28 w-full" /><div className="p-3 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div>);
}

/* ------------------------------------------------------------------ */
/*  Card & Facility row items                                          */
/* ------------------------------------------------------------------ */
function CardRowItem({ card }: { card: Card }) {
  return (
    <div className="w-[260px] shrink-0 snap-start rounded-2xl border bg-card p-4 transition-shadow hover:shadow-lg hover:scale-[1.03]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-foreground leading-snug">{card.name}</h3>
        <DiscountBadge percentage={card.discount_rate} />
      </div>
      <p className="mb-1 text-sm text-muted-foreground line-clamp-1">{card.platform_name}</p>
      <p className="text-xs text-muted-foreground">{card.facilities.length > 0 ? `${card.facilities.length} منشأة مشتركة` : "بطاقة خصم عضوية"}</p>
    </div>
  );
}

function FacilityRowItem({ facility }: { facility: Facility }) {
  const Icon = TYPE_ICON[facility.type];
  return (
    <Link href={`/facilities/${facility.id}`} className="w-[200px] shrink-0 snap-start rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:scale-[1.03] block">
      <div className="relative h-28 bg-muted">
        {facility.image_url ? (
          <ImageWithSkeleton src={facility.image_url} alt={facility.name} fill className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-muted-foreground/40" /></div>
        )}
        <div className="absolute top-2 left-2 z-10"><DiscountBadge percentage={30} /></div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-foreground truncate">{facility.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{TYPE_LABEL[facility.type]}</p>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Rows                                                               */
/* ------------------------------------------------------------------ */
function CardsRow() {
  const { data, isLoading, error, refetch } = useCards();
  if (isLoading) return (<ScrollRow title="بطاقات الخصم" icon={CreditCard}>{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</ScrollRow>);
  if (error) return (<div className="px-4 sm:px-0"><ErrorState title="تعذّر تحميل البطاقات" message="حدث خطأ أثناء جلب بطاقات الخصم" onRetry={() => refetch()} /></div>);
  const cards = [...(data ?? [])].sort((a, b) => a.display_order - b.display_order || a.id - b.id);
  if (cards.length === 0) return (<div className="px-4 sm:px-0"><EmptyState icon={CreditCard} title="لا توجد بطاقات حاليًا" description="ترقّب بطاقات خصم جديدة قريبًا" /></div>);
  return (<ScrollRow title="بطاقات الخصم" icon={CreditCard}><StaggerContainer>{cards.map((card) => (<StaggerItem key={card.id}><CardRowItem card={card} /></StaggerItem>))}</StaggerContainer></ScrollRow>);
}

function FilteredFacilitiesRow({ title, icon, type, facilities }: { title: string; icon: React.ElementType; type: FacilityType | "all"; facilities: Facility[] }) {
  const filtered = type === "all" ? facilities : facilities.filter((f) => f.type === type);
  if (filtered.length === 0) return null;
  return (<ScrollRow title={title} icon={icon}><StaggerContainer>{filtered.map((f) => (<StaggerItem key={f.id}><FacilityRowItem facility={f} /></StaggerItem>))}</StaggerContainer></ScrollRow>);
}

function FacilitiesSection() {
  const { data, isLoading, error, refetch } = useFacilities();
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);
  if (isLoading) return (<div className="space-y-8"><ScrollRow title="مطاعم" icon={UtensilsCrossed}>{Array.from({ length: 4 }).map((_, i) => <FacilityCardSkeleton key={i} />)}</ScrollRow><ScrollRow title="كافيهات" icon={Coffee}>{Array.from({ length: 3 }).map((_, i) => <FacilityCardSkeleton key={i} />)}</ScrollRow></div>);
  if (error) return (<div className="px-4 sm:px-0"><ErrorState title="تعذّر تحميل المنشآت" message="حدث خطأ أثناء جلب المنشآت" onRetry={() => refetch()} /></div>);
  if (!selectedRegionId) return (<div className="px-4 sm:px-0"><EmptyState icon={Landmark} title="اختر منطقة لعرض المنشآت" description="حدد منطقتك من القائمة أعلى الصفحة" /></div>);
  const facilities = [...(data ?? [])].sort((a, b) => a.display_order - b.display_order || a.id - b.id);
  if (facilities.length === 0) return (<div className="px-4 sm:px-0"><EmptyState icon={Landmark} title="لا توجد منشآت في هذه المنطقة" description="ترقّب المزيد من المنشآت قريبًا" /></div>);
  return (<div className="space-y-8"><FilteredFacilitiesRow title="مطاعم" icon={UtensilsCrossed} type="restaurant" facilities={facilities} /><FilteredFacilitiesRow title="كافيهات" icon={Coffee} type="cafe" facilities={facilities} /><FilteredFacilitiesRow title="مرافق عامة" icon={Landmark} type="public_facility" facilities={facilities} /></div>);
}

function FilterChipsBar() {
  const [active, setActive] = useState<FilterKey>("all");
  const { data, isLoading } = useFacilities();
  const facilities = useMemo(() => [...(data ?? [])].sort((a, b) => a.display_order - b.display_order || a.id - b.id), [data]);
  if (isLoading || facilities.length === 0) return null;
  const filtered = active === "all" ? facilities : facilities.filter((f) => f.type === active);
  return (
    <section>
      <div className="scroll-area-thin flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-3 sm:px-0">
        {FILTER_CHIPS.map((chip) => (<button key={chip.key} onClick={() => setActive(chip.key)} className={cn("shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]", active === chip.key ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{chip.label}</button>))}
      </div>
      {filtered.length > 0 && (<ScrollRow title="" icon={Sparkles}><StaggerContainer>{filtered.map((f) => (<StaggerItem key={f.id}><FacilityRowItem facility={f} /></StaggerItem>))}</StaggerContainer></ScrollRow>)}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section (cinema-quality)                                       */
/* ------------------------------------------------------------------ */
const FLOATING_SHAPES = [
  { size: 180, top: "8%", right: "-6%", color: "rgba(255,42,122,0.12)", delay: 0, duration: 7 },
  { size: 120, bottom: "10%", left: "-4%", color: "rgba(255,209,102,0.10)", delay: 1.5, duration: 9 },
  { size: 90, top: "45%", left: "12%", color: "rgba(0,194,184,0.08)", delay: 3, duration: 8 },
] as const;


const SPARKLE_POSITIONS = [
  { top: "18%", right: "calc(50% + 60px)", delay: 0, size: 14 },
  { top: "12%", right: "calc(50% + 100px)", delay: 0.8, size: 10 },
  { bottom: "35%", right: "calc(50% - 80px)", delay: 1.5, size: 12 },
  { top: "25%", right: "calc(50% - 120px)", delay: 2.2, size: 8 },
] as const;
function HeroSection() {
  const prefersReduced = useReducedMotion();
  const { data: facilities } = useFacilities();
  const realCount = facilities?.length ?? 0;
  const facilityCount = useAnimatedCounter(realCount, 2000);

  return (
    <section className="relative isolate overflow-hidden rounded-b-3xl pb-16 pt-24 sm:rounded-b-none sm:pb-24 sm:pt-32">
      {/* الطبقة 1: الخلفية المتدرجة — خلف كل شيء */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 animate-hero-gradient"
        style={{
          background:
            "linear-gradient(135deg, #0A1628 0%, #1a0a2e 25%, #0D1526 50%, #16213A 75%, #0A1628 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* الطبقة 2: الأشكال العائمة — بعيدة عن منطقة النص */}
      {!prefersReduced &&
        FLOATING_SHAPES.map((shape, i) => (
          <motion.div
            key={`shape-${i}`}
            aria-hidden
            className="absolute -z-10 rounded-full"
            style={{
              width: shape.size,
              height: shape.size,
              top: "top" in shape ? shape.top : undefined,
              bottom: "bottom" in shape ? shape.bottom : undefined,
              right: "right" in shape ? shape.right : undefined,
              left: "left" in shape ? shape.left : undefined,
              backgroundColor: shape.color,
              filter: "blur(40px)",
            }}
            animate={{ y: [0, -20, 0, 15, 0], x: [0, 10, 0, -10, 0] }}
            transition={{ duration: shape.duration, delay: shape.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {/* الطبقة 3: نجمتان في الزوايا فقط — لا تلمسان العنوان أبداً */}
      {!prefersReduced && (
        <>
          <motion.span
            aria-hidden
            className="absolute left-[8%] top-[14%] z-0 hidden text-accent/50 md:block"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8], rotate: [0, 90, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="h-4 w-4 fill-accent/50" />
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute bottom-[12%] right-[10%] z-0 hidden text-primary/40 md:block"
            animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.1, 0.8], rotate: [0, -45, 0] }}
            transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="h-3 w-3 fill-primary/40" />
          </motion.span>
        </>
      )}

      {/* الطبقة 4: المحتوى — فوق كل شيء دائماً */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-right">
          <div>
            <div className="relative inline-block isolate">
              {/* توهج ناعم خلف العنوان — أصغر وأنعم */}
              <div aria-hidden className="absolute -inset-5 -z-10 rounded-full bg-primary/20 blur-2xl animate-pulse-glow" />
              <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                وفّر{" "}
                <span className="relative inline-block isolate">
                  {/* توهج ذهبي مخصص حول ٣٠٪ فقط */}
                  <span aria-hidden className="absolute -inset-3 -z-10 rounded-full bg-accent/25 blur-xl" />
                  <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
                    ٣٠٪
                  </span>
                </span>
              </h1>
            </div>
            <p className="mt-3 text-base text-white/70 sm:text-lg sm:max-w-lg">
              خصومات حقيقية على أفضل المطاعم والكافيهات والمرافق العامة في منطقتك
            </p>

            {/* إحصائية حقيقية فقط — تظهر عند توفر البيانات */}
            {realCount > 0 && (
              <div className="mt-6 flex items-center justify-center sm:justify-start">
                <div className="flex items-center gap-2 text-white/50">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">+{facilityCount} منشأة</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 text-base px-8 min-h-[44px] shadow-lg shadow-primary/25 transition-all duration-200"
            >
              <Link href="/facilities">استكشف العروض</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white hover:scale-105 min-h-[44px] shadow-lg shadow-white/5 transition-all duration-200"
            >
              <a href="#how-it-works">كيف تعمل وفر؟</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HowItWorks (with Lucide icons)                                     */
/* ------------------------------------------------------------------ */
const STEPS = [
  { num: "١", title: "اختر منطقتك", desc: "حدد المنطقة التي تريد استكشاف العروض فيها من قائمة المناطق", icon: UserPlus },
  { num: "٢", title: "سجّل عضويتك", desc: "أنشئ حسابك واحصل على بطاقة الخصم الافتراضية بنسبة 30%", icon: CreditCard },
  { num: "٣", title: "استمتع بالخصم", desc: "اعرض بطاقتك في المنشآت المشتركة واحصل على خصمك الفوري", icon: PartyPopper },
] as const;

function HowItWorks() {
  return (
    <section id="how-it-works" className="space-y-6">
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">كيف تعمل وفر؟</h2>
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          return (
            <StaggerItem key={step.num}>
              <div className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-lg font-bold">{step.num}</span>
                  <StepIcon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PromoBanner (upgraded with sparkles + shimmer)                     */
/* ------------------------------------------------------------------ */
function PromoBanner() {
  const prefersReduced = useReducedMotion();
  return (
    <section className="relative mx-4 overflow-hidden rounded-2xl sm:mx-0">
      {/* Shimmer gradient overlay */}
      <div
        className="absolute inset-0 animate-promo-shimmer"
        style={{
          background: "linear-gradient(90deg, var(--accent) 0%, #ffe08a 25%, var(--accent) 50%, #ffe08a 75%, var(--accent) 100%)",
          opacity: 0.3,
        }}
      />
      <div className="relative z-10 bg-accent p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-right">
          <div className="flex-1">
            <div className="relative inline-block">
              {/* Sparkle decorations */}
              {!prefersReduced && (
                <>
                  <motion.span
                    className="absolute -top-2 -right-6 text-accent-foreground/40"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8], rotate: [0, 45, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Star className="h-5 w-5 fill-accent-foreground/40" />
                  </motion.span>
                  <motion.span
                    className="absolute -bottom-1 -left-4 text-accent-foreground/30"
                    animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.9, 1.15, 0.9], rotate: [0, -30, 0] }}
                    transition={{ duration: 3, delay: 0.7, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-4 w-4 fill-accent-foreground/30" />
                  </motion.span>
                </>
              )}
              <h2 className="text-lg font-bold text-foreground sm:text-xl">عرض مميز: خصم 30% فوري</h2>
            </div>
            <p className="mt-1 text-sm text-foreground/70">سجّل الآن واحصل على بطاقتك مجانًا. خصم على المطاعم والكافيهات والمرافق العامة.</p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 animate-cta-pulse"
          >
            <Link href="/register">سجّل الآن</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HomePage                                                           */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <div className="mx-auto max-w-7xl space-y-12 pt-10 sm:space-y-14 sm:pt-14">
        <CardsRow />
        <FacilitiesSection />
        <FilterChipsBar />
        <HowItWorks />
        <PromoBanner />
      </div>
    </div>
  );
}
