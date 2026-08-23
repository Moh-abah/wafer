"use client";

import { useRef, useState, useMemo, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useMotionValue, useTransform } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CreditCard, UtensilsCrossed,
  Coffee, Landmark, Sparkles, Star, UserPlus, PartyPopper,
  Building2, Users, MessageSquareQuote, Search, CircleHelp,
  Mail, Phone, MapPin, Eye, Percent, ArrowLeft, Timer, Clock, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { DiscountBadge } from "@/components/shared/DiscountBadge";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCards } from "@/hooks/useCards";
import { useFacilities } from "@/hooks/useFacilities";
import { useRegionStore } from "@/store/region.store";
import { TYPE_LABEL, TYPE_ICON, FILTER_CHIPS, FilterKey } from "@/lib/constants";
import type { Card, Facility, FacilityType } from "@/types/api.generated";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" className="space-y-8">
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">كيف تعمل وفر؟</h2>

      <motion.div
        className="relative grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-0"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: reduced ? 0 : 0.15 },
          },
        }}
      >
        {HOW_STEPS.map((step) => {
          const StepIcon = step.icon;
          return (
            <motion.div
              key={step.num}
              className="relative flex flex-col items-center text-center"
              variants={{
                hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                },
              }}
            >
              <div className="relative z-10 w-full max-w-[280px]">
                <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:scale-[1.02] hover:glass-card">
                  <div className="mb-5 flex justify-center">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white"
                      style={{
                        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                      }}
                    >
                      {step.num}
                    </div>
                  </div>

                  <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl", step.iconBg)}>
                    <StepIcon className={cn("h-7 w-7", step.iconColor)} />
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>

                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}



/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */
function useAnimatedCounter(target: number, duration = 2000) {
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

/* ------------------------------------------------------------------ */
/*  Stagger helpers                                                    */
/* ------------------------------------------------------------------ */
function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : 0.08 } } }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div variants={{
      hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    }} className={className}>{children}</motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ScrollRow (upgraded)                                               */
/* ------------------------------------------------------------------ */
function ScrollRow({ title, icon: Icon, children, viewAllHref }: { title: string; icon: React.ElementType; children: React.ReactNode; viewAllHref?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amt = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "right" ? -amt : amt, behavior: "smooth" });
  };
  return (
    <section className="relative">
      {title && (
        <div className="mb-3 flex items-center gap-2 px-4 sm:px-0">
          <Icon className="h-5 w-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
          {viewAllHref && (
            <Link href={viewAllHref} className="mr-auto inline-flex items-center gap-1 text-sm text-secondary font-medium min-h-[44px] group">
              <span className="relative">
                عرض الكل
                <span className="absolute -bottom-0.5 right-0 h-px w-0 bg-secondary transition-all duration-300 group-hover:w-full" />
              </span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      <div className="relative group/row">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-transparent to-background" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-transparent to-background" />
        <button onClick={() => scroll("right")} className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-lg opacity-0 backdrop-blur transition-opacity group-hover/row:opacity-100 lg:block min-h-[44px] min-w-[44px]" aria-label="تمرير لليمين"><ChevronRight className="h-5 w-5 text-foreground" /></button>
        <button onClick={() => scroll("left")} className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-lg opacity-0 backdrop-blur transition-opacity group-hover/row:opacity-100 lg:block min-h-[44px] min-w-[44px]" aria-label="تمرير لليسار"><ChevronLeft className="h-5 w-5 text-foreground" /></button>
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
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-secondary font-medium">
          <Eye className="h-3 w-3" />
          عرض التفاصيل
        </p>
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
  { size: 180, top: "10%", right: "-5%", color: "rgba(0,102,153,0.12)", delay: 0, duration: 7 },
  { size: 120, top: "60%", left: "-3%", color: "rgba(255,168,0,0.10)", delay: 1.5, duration: 9 },
  { size: 90, top: "20%", left: "15%", color: "rgba(0,163,224,0.08)", delay: 3, duration: 8 },
  { size: 60, bottom: "15%", right: "20%", color: "rgba(0,102,153,0.08)", delay: 2, duration: 6 },
] as const;

const SPARKLE_POSITIONS = [
  { top: "18%", right: "calc(50% + 60px)", delay: 0, size: 14 },
  { top: "12%", right: "calc(50% + 100px)", delay: 0.8, size: 10 },
  { bottom: "35%", right: "calc(50% - 80px)", delay: 1.5, size: 12 },
  { top: "25%", right: "calc(50% - 120px)", delay: 2.2, size: 8 },
] as const;

function HeroSection() {
  const prefersReduced = usePrefersReducedMotion();
  const facilityCount = useAnimatedCounter(150, 2000);
  const userCount = useAnimatedCounter(2000, 2500);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const cardRotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const cardRotateY = useTransform(mouseX, [0, 1], [-8, 8]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY, prefersReduced]);

  return (
    <section className="relative overflow-hidden rounded-b-3xl pb-16 pt-20 sm:rounded-b-none sm:pb-24 sm:pt-28">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-hero-gradient"
        style={{
          background: "linear-gradient(135deg, #071320 0%, #091825 25%, #0D1526 50%, #0F1F33 75%, #071320 100%)",
        }}
      />
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-[1] hero-grid-pattern opacity-[0.04]" />
      <div className="hero-pattern-overlay absolute inset-0 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Floating shapes */}
      {!prefersReduced &&
        FLOATING_SHAPES.map((shape, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute rounded-full"
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
            animate={{
              y: [0, -20, 0, 15, 0],
              x: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Sparkles around discount area */}
      {!prefersReduced &&
        SPARKLE_POSITIONS.map((pos, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute z-10 text-accent/60"
            style={{
              top: "top" in pos ? pos.top : undefined,
              bottom: "bottom" in pos ? pos.bottom : undefined,
              right: pos.right,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 3,
              delay: pos.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Star className="fill-accent/60" style={{ width: pos.size, height: pos.size }} />
          </motion.div>
        ))}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-right">
          <div>
            {/* Pulsing glow behind 30% */}
            <div className="relative inline-block">
              <div className="absolute -inset-8 -z-10 rounded-full bg-primary/20 animate-pulse-glow" />
              <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                وفّر{" "}
                <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
                  ٣٠٪
                </span>
              </h1>
            </div>
            <p className="mt-3 text-base text-white/70 sm:text-lg sm:max-w-lg">
              خصومات حقيقية على أفضل المطاعم والكافيهات والمرافق العامة في منطقتك
            </p>

            {/* Animated counters */}
            <div className="mt-6 flex items-center justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-2 text-white/50">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  +{facilityCount} منشأة
                </span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-white/50">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  +{userCount} مستخدم
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <HeroSearchBar />

          {/* CTA buttons with glassmorphism container */}
          <div className="relative mx-auto w-full max-w-md sm:mx-0 sm:max-w-none">
            <div className="absolute -inset-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] -z-10" />
            <div className="flex flex-wrap items-center justify-center gap-3 p-3 sm:justify-start">
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

          {/* Floating decorative card preview (desktop only) */}
          <div
            className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10"
            onMouseMove={handleMouseMove}
          >
            <motion.div
              style={prefersReduced ? undefined : {
                rotateX: cardRotateX,
                rotateY: cardRotateY,
                perspective: 800,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 shadow-2xl w-56"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="h-2 w-16 rounded-full bg-white/20" />
                <div className="rounded-md bg-primary/80 px-2 py-0.5 text-[10px] font-bold text-white">-30%</div>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-white/10" />
              <div className="mb-4 h-2 w-3/4 rounded-full bg-white/10" />
              <div className="rounded-xl bg-white/[0.08] p-3">
                <div className="mb-2 h-2 w-20 rounded-full bg-secondary/40" />
                <div className="mb-1 h-2 w-full rounded-full bg-white/10" />
                <div className="h-2 w-2/3 rounded-full bg-white/10" />
              </div>
              <div className="mt-3 rounded-lg bg-gradient-to-l from-primary to-secondary p-2 text-center">
                <p className="text-xs font-bold text-white">بطاقة وفر</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HowItWorks (Enhanced)                                              */
/* ------------------------------------------------------------------ */
const HOW_STEPS: ReadonlyArray<{
  num: number;
  title: string;
  desc: string;
  icon: typeof UserPlus;
  iconBg: string;
  iconColor: string;
}> = [
    {
      num: 1,
      title: "سجّل عضويتك",
      desc: "أنشئ حسابك في دقائق واحصل على بطاقة خصم رقمية فورية بنسبة 30%",
      icon: UserPlus,
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      num: 2,
      title: "احصل على بطاقتك",
      desc: "تظهر بطاقتك الرقمية تلقائياً في حسابك وجاهزة للاستخدام فوراً",
      icon: CreditCard,
      iconBg: "bg-secondary/15",
      iconColor: "text-secondary",
    },
    {
      num: 3,
      title: "استمتع بالخصومات",
      desc: "اعرض بطاقتك في أي منشأة شريكة واحصل على خصمك الفوري",
      icon: Percent,
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
    },
  ];


/* ------------------------------------------------------------------ */
/*  Testimonials Section (marquee carousel)                              */
/* ------------------------------------------------------------------ */
const TESTIMONIALS = [
  { name: "أحمد محمد", city: "الرياض", rating: 5, text: "تجربة رائعة! وفّرت كثير على وجباتي في المطاعم المشتركة. أنصح الجميع بالتسجيل." },
  { name: "سارة العلي", city: "جدة", rating: 5, text: "البطاقة سهلة الاستخدام والخصومات حقيقية. استخدمتها في عدة كافيهات وكنت سعيدة بالنتيجة." },
  { name: "خالد العمري", city: "الدمام", rating: 5, text: "مميز جدًا أن الخصم يشمل مرافق عامة أيضًا. وفرت مبالغ كبيرة على خدمات متنوعة." },
  { name: "نورة السعيد", city: "الرياض", rating: 5, text: "أفضل تطبيق خصومات استخدمته. واجهة بسيطة ومنشآت كثيرة ومتنوعة في مدينتي." },
  { name: "عبدالله الحربي", city: "مكة المكرمة", rating: 5, text: "سجّلت من أسبوع واحد وبدأت أستفيد فورًا. الخصم 30% على كل شيء أمر ممتاز." },
  { name: "فاطمة الزهراني", city: "المدينة المنورة", rating: 5, text: "أحب أن البطاقة رقمية لا أحتاج حمل شيء. أعرضها من الهاتف مباشرة." },
] as const;

const AVATAR_COLORS = ["bg-primary/20 text-primary", "bg-secondary/20 text-secondary", "bg-accent/20 text-accent", "bg-primary/20 text-primary", "bg-secondary/20 text-secondary", "bg-accent/20 text-accent"];

function TestimonialCard({ t, i }: { readonly t: (typeof TESTIMONIALS)[number]; i: number }) {
  return (
    <div className="w-[300px] shrink-0 snap-start rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--primary)/0.05, var(--secondary)/0.05)", padding: "1px", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
      <Quote className="mb-3 h-5 w-5 text-primary/20" />
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: t.rating }).map((_, s) => (
          <Star key={s} className="h-4 w-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", AVATAR_COLORS[i])}>
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.city}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquareQuote className="h-5 w-5 text-secondary" />
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">آراء عملائنا</h2>
      </div>
      <div className={cn("relative overflow-hidden", !prefersReduced && "mask-gradient-x")}>
        <div className={cn("flex gap-4", !prefersReduced && "animate-marquee hover:[animation-play-state:paused]")}>
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} />
          ))}
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={`dup-${t.name}`} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Search Bar                                                    */
/* ------------------------------------------------------------------ */
function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      router.push(`/facilities?search=${encodeURIComponent(trimmed)}`);
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن منشأة أو مطعم..."
          aria-label="البحث عن منشأة"
          className="w-full min-h-[44px] rounded-full border border-white/20 bg-white/10 py-3 pr-12 pl-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-sm transition-colors focus:border-white/40 focus:bg-white/15"
        />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Section                                                        */
/* ------------------------------------------------------------------ */
const FAQ_ITEMS = [
  { q: "ما هي بطاقة وفر؟", a: "بطاقة وفر هي بطاقة خصم رقمية تمنحك خصمًا بنسبة 30% على المطاعم والكافيهات والمرافق العامة المشتركة في المملكة." },
  { q: "كيف أحصل على الخصم؟", a: "اعرض بطاقة وفر في المنشأة المشتركة عند الدفع وسيتم خصم 30% تلقائيًا من فاتورتك." },
  { q: "هل البطاقة مجانية؟", a: "نعم، التسجيل في منصة وفر والحصول على البطاقة الرقمية مجانًا بالكامل." },
  { q: "كم نسبة الخصم؟", a: "تحصل على خصم 30% على جميع المنتجات والخدمات في المنشآت المشتركة." },
  { q: "هل يمكنني استخدامها في أي منطقة؟", a: "نعم، اختر منطقتك من القائمة وستظهر لك المنشآت القريبة المتاحة في منطقتك." },
  { q: "كيف أتحكم في بياناتي؟", a: "يمكنك إدارة بياناتك الشخصية من خلال إعدادات حسابك في المنصة." },
] as const;

function FAQSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <CircleHelp className="h-5 w-5 text-secondary" />
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">الأسئلة الشائعة</h2>
      </div>
      <StaggerContainer className="max-w-2xl">
        <Accordion type="single" collapsible className="rounded-2xl border bg-card">
          {FAQ_ITEMS.map((item, i) => (
            <StaggerItem key={i}>
              <AccordionItem value={`faq-${i}`} className="px-4 sm:px-6">
                <AccordionTrigger className="text-right min-h-[44px] text-sm sm:text-base font-bold text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </StaggerItem>
          ))}
        </Accordion>
      </StaggerContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Section                                                    */
/* ------------------------------------------------------------------ */
const CONTACT_CARDS: ReadonlyArray<{ icon: typeof Mail; label: string; value: string; dir: "ltr" | undefined }> = [
  { icon: Mail, label: "البريد الإلكتروني", value: "info@wafir.gleeze.com", dir: "ltr" },
  { icon: Phone, label: "الهاتف", value: "+966 XX XXX XXXX", dir: "ltr" },
  { icon: MapPin, label: "العنوان", value: "المملكة العربية السعودية", dir: undefined },
];

function ContactSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-secondary" />
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">تواصل معنا</h2>
      </div>
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CONTACT_CARDS.map((card) => {
          const CardIcon = card.icon;
          return (
            <StaggerItem key={card.label}>
              <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/15">
                  <CardIcon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{card.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground" dir={card.dir}>{card.value}</p>
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
/*  PromoBanner (countdown + gradient)                                  */
/* ------------------------------------------------------------------ */
function useCountdown(targetDate: Date) {
  const prefersReduced = usePrefersReducedMotion();

  const computeDiff = useCallback(() => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const staticTime = useMemo(() => computeDiff(), [computeDiff]);

  const [liveTime, setLiveTime] = useState(staticTime);

  useEffect(() => {
    if (prefersReduced) return;
    const tick = () => setLiveTime(computeDiff());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [computeDiff, prefersReduced]);

  return prefersReduced ? staticTime : liveTime;
}

function getStoredCountdownTarget(): Date {
  if (typeof window === "undefined") return new Date(Date.now() + 3 * 86400000);
  const stored = localStorage.getItem("wafir_promo_end");
  if (stored) {
    const parsed = new Date(stored);
    if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) return parsed;
  }
  const target = new Date(Date.now() + 3 * 86400000);
  localStorage.setItem("wafir_promo_end", target.toISOString());
  return target;
}

function PromoBanner() {
  const prefersReduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [targetDate] = useState(() => getStoredCountdownTarget());
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  const timeBlocks = [
    { value: days, label: "أيام" },
    { value: hours, label: "ساعات" },
    { value: minutes, label: "دقائق" },
    { value: seconds, label: "ثواني" },
  ] as const;

  const countdownContent = timeBlocks.map((block) => (
    <div key={block.label} className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
        <span className="text-xl font-black text-white tabular-nums">
          {mounted ? String(block.value).padStart(2, "0") : "00"}
        </span>
      </div>
      <span className="mt-1 text-[10px] font-medium text-white/70">{block.label}</span>
    </div>
  ));

  return (
    <section className="relative mx-4 overflow-hidden rounded-2xl sm:mx-0">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
      />
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right">
          <div className="flex-1">
            <div className="relative inline-block">
              {!prefersReduced && (
                <motion.span
                  className="absolute -top-2 -right-6 text-white/30"
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8], rotate: [0, 45, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Star className="h-5 w-5 fill-white/30" />
                </motion.span>
              )}
              <h2 className="text-lg font-bold text-white sm:text-xl">عرض محدود: اشترك الآن واحصل على بطاقة وفر بخصم 30% على أفضل المنشآت</h2>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
              {countdownContent}
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className={cn(
              "rounded-full bg-white text-foreground hover:bg-white/90 text-base px-8 min-h-[44px] shadow-lg",
              !prefersReduced && "animate-cta-glow"
            )}
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
        <FAQSection />
        <TestimonialsSection />
        <PromoBanner />
        <ContactSection />
      </div>
    </div>
  );
}
