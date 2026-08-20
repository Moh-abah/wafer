// "use client";

// import * as React from "react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ThemeProvider } from "next-themes";
// import { Toaster } from "@/components/ui/toaster";

// export function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = React.useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             retry: 1,
//             refetchOnWindowFocus: false,
//             staleTime: 60 * 1000,
//           },
//         },
//       })
//   );

//   return (
//     <ThemeProvider
//       attribute="class"
//       defaultTheme="dark"
//       enableSystem={false}
//       disableTransitionOnChange
//     >
//       <QueryClientProvider client={queryClient}>
//         {children}
//         <Toaster />
//       </QueryClientProvider>
//     </ThemeProvider>
//   );
// }
"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";

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
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}