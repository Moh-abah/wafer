"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Search,
  Heart,
  Star,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOUR_STORAGE_KEY = "wafir_onboarding_completed";

/** Check if the user has already completed the onboarding tour. */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return true;
  }
}

/** Mark the onboarding tour as completed. */
export function completeOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  } catch {
    // ignore
  }
}

/** Reset the onboarding tour (for re-triggering via a button). */
export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface TourStep {
  icon: typeof CreditCard;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: CreditCard,
    title: "بطاقة العضوية الذكية",
    description:
      "سجّل مجاناً واحصل على بطاقة عضوية فورية برقم فريد ورمز QR قابل للمسح. استخدمها في آلاف المنشآت لخصم فوري 30%.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Search,
    title: "ابحث عن المنشآت",
    description:
      "تصفّح المطاعم والكافيهات والمرافق في منطقتك. ابحث بالاسم أو صفّ حسب النوع. كل المنشآت موافق عليها وموثوقة.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Heart,
    title: "احفظ مفضلاتك",
    description:
      "اضغط على القلب لحفظ المنشآت المفضلة لديك والوصول إليها بسرعة من صفحة حسابك في أي وقت.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Star,
    title: "قيّم وشارك تجربتك",
    description:
      "اترك تقييمك بالنجوم واكتب مراجعة عن المنشآت التي زرتها. ساعد الآخرين بالتصويت على المراجعات المفيدة.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export interface OnboardingTourProps {
  /** Force the tour to show (e.g. when user clicks "جولة تعريفية" button). */
  forceShow?: boolean;
  /** Called when the tour is completed or dismissed. */
  onComplete?: () => void;
}

/**
 * Customer onboarding tour — a 4-step modal walkthrough that appears for
 * first-time visitors. Highlights the key features: member card, facility
 * search, favorites, and reviews. Uses localStorage to prevent re-showing
 * after completion.
 */
export function OnboardingTour({ forceShow, onComplete }: OnboardingTourProps) {
  // Initialize visibility from localStorage on first render (avoids
  // setState-in-effect lint violation). forceShow overrides to true.
  const [isVisible, setIsVisible] = useState(() => {
    if (forceShow) return true;
    if (typeof window === "undefined") return false;
    return !hasCompletedOnboarding();
  });
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-open after a small delay if not completed (only on first mount).
  // Uses a hasDelayedOpen ref to prevent re-triggering.
  const [hasDelayedOpen, setHasDelayedOpen] = useState(false);
  useEffect(() => {
    if (hasDelayedOpen || isVisible || forceShow) return;
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding()) {
        setIsVisible(true);
      }
      setHasDelayedOpen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [hasDelayedOpen, isVisible, forceShow]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    completeOnboarding();
    onComplete?.();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSkip = useCallback(() => {
    handleClose();
  }, [handleClose]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleSkip}
        role="dialog"
        aria-modal="true"
        aria-label="جولة تعريفية"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-soft-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <button
            onClick={handleSkip}
            className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="تخطي الجولة"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Progress indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <motion.div
              className="h-full bg-gradient-to-l from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-8 pt-12">
            {/* Icon */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={cn(
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl",
                step.bgColor
              )}
            >
              <Icon className={cn("h-10 w-10", step.color)} aria-hidden="true" />
            </motion.div>

            {/* Step number */}
            <p className="mb-2 text-center text-xs font-bold tracking-widest text-muted-foreground uppercase">
              الخطوة {currentStep + 1} من {TOUR_STEPS.length}
            </p>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center text-xl font-black text-foreground"
              >
                {step.title}
              </motion.h2>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="mt-3 text-center text-sm leading-relaxed text-muted-foreground"
              >
                {step.description}
              </motion.p>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === currentStep
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`الانتقال إلى الخطوة ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Footer with navigation buttons */}
          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1.5 min-h-[44px]"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>

            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>

            {isLast ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1.5 min-h-[44px] bg-gradient-to-l from-primary to-secondary text-white"
              >
                <Check className="h-4 w-4" />
                ابدأ الآن
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1.5 min-h-[44px]"
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Decorative sparkles */}
          <div className="pointer-events-none absolute -top-6 -left-6 opacity-20">
            <Sparkles className="h-24 w-24 text-primary" />
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-10">
            <Sparkles className="h-32 w-32 text-secondary" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
