"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import { resetOnboarding } from "@/components/public/OnboardingTour";
import { OnboardingTour } from "@/components/public/OnboardingTour";

/**
 * Floating "help" button that re-triggers the onboarding tour.
 * Shown in the bottom-left corner of the public portal (above the mobile
 * bottom nav). Hidden during the tour itself.
 */
export function ReplayTourButton() {
  const [forceShow, setForceShow] = useState(false);

  const handleReplay = useCallback(() => {
    resetOnboarding();
    setForceShow(true);
  }, []);

  const handleComplete = useCallback(() => {
    setForceShow(false);
  }, []);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.3 }}
        onClick={handleReplay}
        className="fixed bottom-20 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border shadow-soft-lg text-secondary transition-all hover:bg-muted hover:scale-105 md:bottom-8"
        aria-label="جولة تعريفية"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="sr-only">إعادة الجولة التعريفية</span>
        {/* Decorative sparkle */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <Sparkles className="h-3 w-3 text-accent" />
        </span>
      </motion.button>

      {/* Render the tour with forceShow to re-trigger it */}
      <OnboardingTour forceShow={forceShow} onComplete={handleComplete} />
    </>
  );
}
