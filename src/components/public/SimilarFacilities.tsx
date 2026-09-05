"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Landmark, ArrowLeft, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscountBadge } from "@/components/shared/DiscountBadge";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { useSimilarFacilities } from "@/hooks/useFacilities";
import { TYPE_LABEL, TYPE_ICON } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Similar facilities section — shows up to 6 facilities of the same type
 * in the same region. Displayed at the bottom of the facility detail page
 * to improve discovery. */
export function SimilarFacilities({ facilityId }: { facilityId: number }) {
  const { data, isLoading } = useSimilarFacilities(facilityId);
  const facilities = data ?? [];

  // Don't render the section if loading or empty
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-secondary" aria-hidden="true" />
          منشآت مشابهة
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (facilities.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
        <Sparkles className="h-5 w-5 text-secondary" aria-hidden="true" />
        منشآت مشابهة
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {facilities.map((facility, i) => {
          const Icon = TYPE_ICON[facility.type];
          return (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <Link href={`/facilities/${facility.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border/50 bg-card transition-all group-hover:-translate-y-1 group-hover:shadow-soft-lg group-hover:border-primary/30">
                  {/* Image */}
                  <div className="relative h-3/4 overflow-hidden">
                    {facility.image_url ? (
                      <ImageWithSkeleton
                        src={facility.image_url}
                        alt={facility.name}
                        fill
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        skeletonClassName="rounded-none"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Discount badge */}
                    <div className="absolute top-2 left-2">
                      <DiscountBadge percentage={30} />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex h-1/4 flex-col justify-center p-3">
                    <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                      {facility.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{TYPE_LABEL[facility.type]}</span>
                      <ArrowLeft className="ml-auto h-3 w-3 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
