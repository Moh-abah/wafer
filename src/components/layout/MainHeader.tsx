"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { RegionSelector } from "@/components/public/RegionSelector";
import { WafirLogo } from "@/components/shared/WafirLogo";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/shared/Logo";

/**
 * هيدر بوابة العميل — متكيف مع الوضعين:
 * ثابت أعلى الصفحة بخلفية bg-background، وعند التمرير (أو الموبايل)
 * يتحول إلى bg-background/95 + backdrop-blur.
 */
export function MainHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      /* hide-in-standalone: يُخفي الهيدر كلياً عند تشغيل التطبيق مثبّتاً
         (display-mode: standalone) — تجربة Native App */
      className={cn(
        "hide-in-standalone sticky top-0 z-40 w-full border-b transition-[background-color,border-color] duration-200",
        scrolled
          ? "border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
          : "border-transparent bg-background/95 backdrop-blur-md md:bg-background md:backdrop-blur-none"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
        <Logo size="sm" />

        {/* منتقي المنطقة */}
        <div className="flex min-w-0 flex-1 items-center justify-center sm:justify-end">
          <RegionSelector />
        </div>

        {/* حسابي + الثيم */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Link href="/account" aria-label="حسابي">
              <CircleUserRound className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { CircleUserRound } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/theme/ThemeToggle";
// import { RegionSelector } from "@/components/public/RegionSelector";
// import { WafirLogo } from "@/components/shared/WafirLogo";
// import { cn } from "@/lib/utils";

// import { Logo } from "@/components/shared/Logo";

// /**
//  * هيدر بوابة العميل — متكيف مع الوضعين:
//  * ثابت أعلى الصفحة بخلفية bg-background، وعند التمرير (أو الموبايل)
//  * يتحول إلى bg-background/95 + backdrop-blur.
//  */
// export function MainHeader() {
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 8);
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   return (
//     <header
//       className={cn(
//         "sticky top-0 z-40 w-full border-b transition-[background-color,border-color] duration-200",
//         scrolled
//           ? "border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
//           : "border-transparent bg-background/95 backdrop-blur-md md:bg-background md:backdrop-blur-none"
//       )}
//     >
//       <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
//       <Logo size="sm" />

//         {/* منتقي المنطقة */}
//         <div className="flex min-w-0 flex-1 items-center justify-center sm:justify-end">
//           <RegionSelector />
//         </div>

//         {/* حسابي + الثيم */}
//         <div className="flex shrink-0 items-center gap-1 sm:gap-2">
//           <Button
//             asChild
//             variant="ghost"
//             size="icon"
//             className="h-10 w-10 rounded-full"
//           >
//             <Link href="/account" aria-label="حسابي">
//               <CircleUserRound className="h-5 w-5" aria-hidden="true" />
//             </Link>
//           </Button>
//           <ThemeToggle />
//         </div>
//       </div>
//     </header>
//   );
// }
