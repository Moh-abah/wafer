"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { useRecentlyViewedFacilities, clearRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { TYPE_LABEL, TYPE_ICON } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Horizontal strip of recently viewed facilities. Shown on the home page
 * below the member card. Each item is a small card with image + name + type.
 * "Clear" button removes the list. */
export function RecentlyViewedFacilities() {
  const { items, refresh } = useRecentlyViewedFacilities();

  if (items.length === 0) return null;

  function handleClear() {
    clearRecentlyViewed();
    refresh();
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6" aria-label="شوهدت مؤخراً">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Clock className="h-5 w-5 text-secondary" aria-hidden="true" />
          شوهدت مؤخراً
        </h2>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive min-h-[36px]"
          aria-label="مسح السجل"
        >
          <X className="h-3.5 w-3.5" />
          مسح
        </button>
      </div>

      <div className="scroll-area-thin mt-3 flex gap-3 overflow-x-auto pb-2">
        {items.map((item, i) => {
          const Icon = TYPE_ICON[item.type as keyof typeof TYPE_ICON] || Clock;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="shrink-0"
            >
              <Link href={`/facilities/${item.id}`} className="group block">
                <div className="relative w-40 overflow-hidden rounded-xl border border-border/50 bg-card transition-all group-hover:-translate-y-0.5 group-hover:shadow-soft group-hover:border-primary/30">
                  {/* Image */}
                  <div className="relative h-24 overflow-hidden">
                    {item.image_url ? (
                      <ImageWithSkeleton
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        skeletonClassName="rounded-none"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                        <Icon className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-2.5">
                    <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                      {item.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{TYPE_LABEL[item.type as keyof typeof TYPE_LABEL] || ""}</span>
                      <ArrowLeft className="ml-auto h-3 w-3 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
