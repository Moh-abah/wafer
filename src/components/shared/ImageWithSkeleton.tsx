"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  skeletonClassName?: string;
}

export function ImageWithSkeleton({
  src,
  alt,
  fill,
  width,
  height,
  className,
  skeletonClassName,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 skeleton-shimmer rounded-md",
            skeletonClassName
          )}
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(
          "object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
