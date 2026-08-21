"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";

/* ------------------------------------------------------------------ */
/*  NProgress-style Top Loading Bar (CSS only, no library)              */
/* ------------------------------------------------------------------ */
function RouteLoadingBar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(false);
  const [barKey, setBarKey] = React.useState(0);

  React.useEffect(() => {
    setIsLoading(true);
    setBarKey((k) => k + 1);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div
      key={barKey}
      className="nprogress-bar"
      role="progressbar"
      aria-label="جاري التحميل"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Providers                                                          */
/* ------------------------------------------------------------------ */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouteLoadingBar />
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
