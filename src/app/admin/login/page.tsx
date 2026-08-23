"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAdminAuth, useAdminLogin } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const schema = z.object({
  identifier: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { accessToken, hydrated } = useAdminAuth();
  const login = useAdminLogin();
  const prefersReduced = usePrefersReducedMotion();
  const { toast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/admin");
    }
  }, [hydrated, accessToken, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });
  const { register, handleSubmit, formState } = form;

  function onSubmit(values: FormValues) {
    login.mutate(values);
  }

  function handleForgotPassword() {
    toast({ title: "ستتوصل برابط إعادة التعيين قريبًا" });
  }

  const cardAnimation = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } };

  const floatVariants = prefersReduced
    ? { initial: { opacity: 0.15 }, animate: { opacity: 0.15 } }
    : {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 0.15, scale: 1 },
    };

  // const formStagger = prefersReduced
  //   ? {
  //     hidden: { opacity: 1 },
  //     visible: { transition: { staggerChildren: 0 } },
  //   }
  //   : {
  //     hidden: { opacity: 0 },
  //     visible: { transition: { staggerChildren: 0.1 } },
  //   };

  const formStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: prefersReduced ? 0 : 0.1 } },
  };

  
  const formFieldVariants = prefersReduced
    ? {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    }
    : {
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
    };

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden p-4",
        !prefersReduced && "animate-hero-gradient"
      )}
      style={{
        background: "linear-gradient(135deg, #071320 0%, #091825 25%, #0D2137 50%, #0D1526 75%, #071320 100%)",
        backgroundSize: "300% 300%",
      }}
    >
      {/* Decorative background pattern */}
      <div className="hero-pattern-overlay pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      <motion.div
        className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,102,153,0.2) 0%, transparent 70%)" }}
        variants={floatVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, delay: 0.2 }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,163,224,0.15) 0%, transparent 70%)" }}
        variants={floatVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, delay: 0.5 }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 right-[10%] h-48 w-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,168,0,0.1) 0%, transparent 70%)" }}
        variants={floatVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, delay: 0.8 }}
      />

      <div className="absolute left-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo / Brand area with floating animation */}
        <div
          className={cn(
            "flex flex-col items-center gap-3 text-center",
            !prefersReduced && "animate-float"
          )}
        >
          <div
            className="h-24 w-24 drop-shadow-[0_0_24px_rgba(0,102,153,0.4)]"
            style={{
              maskImage: "url(/logowafir.png)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              backgroundColor: "#006699",
            }}
          />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold">وفر</span>
            <span className="text-sm text-muted-foreground">لوحة تحكم المشرفين</span>
          </div>
        </div>

        <motion.div
          {...cardAnimation}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="border-border/30 bg-card/60 shadow-2xl backdrop-blur-xl login-card-shimmer">
            <CardHeader className="text-center">
              <CardTitle>تسجيل الدخول</CardTitle>
              <CardDescription>أدخل بيانات الاعتماد للوصول للوحة التحكم</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={formStagger}
              >
                <motion.div className="space-y-2" variants={formFieldVariants}>
                  <Label htmlFor="identifier">اسم المستخدم</Label>
                  <Input
                    id="identifier"
                    autoComplete="identifier"
                    autoFocus
                    {...register("identifier")}
                  />
                  {formState.errors.identifier && (
                    <p className="text-xs text-destructive" role="alert">
                      {formState.errors.identifier.message}
                    </p>
                  )}
                </motion.div>

                <motion.div className="space-y-2" variants={formFieldVariants}>
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  {formState.errors.password && (
                    <p className="text-xs text-destructive" role="alert">
                      {formState.errors.password.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  className="flex items-center justify-between"
                  variants={formFieldVariants}
                >
                  <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
                    <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
                    <span className="text-sm text-muted-foreground">تذكرني</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:text-primary/80 transition-colors min-h-[44px]"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </motion.div>

                <motion.div variants={formFieldVariants}>
                  <Button
                    type="submit"
                    className="w-full min-h-[44px]"
                    disabled={login.isPending}
                  >
                    {login.isPending ? "جارٍ الدخول..." : "تسجيل الدخول"}
                  </Button>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للموقع
          </Link>
          <span className="text-xs text-muted-foreground/60">
            مدعوم من وفر
          </span>
        </div>
      </div>
    </div>
  );
}


// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { motion } from "framer-motion";
// import { ArrowRight } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ThemeToggle } from "@/components/theme/ThemeToggle";
// import { WafirLogo } from "@/components/shared/WafirLogo";
// import { useAdminAuth, useAdminLogin } from "@/hooks/useAdminAuth";
// import { useToast } from "@/hooks/use-toast";
// import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// const schema = z.object({
//   identifier: z.string().min(1, "اسم المستخدم مطلوب"),
//   password: z.string().min(1, "كلمة المرور مطلوبة"),
// });
// type FormValues = z.infer<typeof schema>;

// export default function AdminLoginPage() {
//   const router = useRouter();
//   const { accessToken, hydrated } = useAdminAuth();
//   const login = useAdminLogin();
//   const prefersReduced = usePrefersReducedMotion();
//   const { toast } = useToast();
//   const [rememberMe, setRememberMe] = useState(false);

//   useEffect(() => {
//     if (hydrated && accessToken) {
//       router.replace("/admin");
//     }
//   }, [hydrated, accessToken, router]);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: { identifier: "", password: "" },
//   });
//   const { register, handleSubmit, formState } = form;

//   function onSubmit(values: FormValues) {
//     login.mutate(values);
//   }

//   function handleForgotPassword() {
//     toast({ title: "ستتوصل برابط إعادة التعيين قريبًا" });
//   }

//   const cardAnimation = prefersReduced
//     ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
//     : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } };

//   const floatVariants = prefersReduced
//     ? { initial: { opacity: 0.15 }, animate: { opacity: 0.15 } }
//     : {
//       initial: { opacity: 0, scale: 0.8 },
//       animate: { opacity: 0.15, scale: 1 },
//     };

//   const formStagger = prefersReduced
//     ? {
//       hidden: { opacity: 1 },
//       visible: { transition: { staggerChildren: 0 } },
//     }
//     : {
//       hidden: { opacity: 0 },
//       visible: { transition: { staggerChildren: 0.1 } },
//     };

//   const formFieldVariants = prefersReduced
//     ? {
//       hidden: { opacity: 1, y: 0 },
//       visible: { opacity: 1, y: 0 },
//     }
//     : {
//       hidden: { opacity: 0, y: 8 },
//       visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
//     };

//   return (
//     <div
//       className={cn(
//         "login-ocean-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4",
//         !prefersReduced && "animate-hero-gradient"
//       )}
//     >
//       {/* Decorative background pattern */}
//       <div className="hero-pattern-overlay pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

//       <motion.div
//         className="login-blob-cyan pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full"
//         variants={floatVariants}
//         initial="initial"
//         animate="animate"
//         transition={{ duration: 2, delay: 0.2 }}
//         aria-hidden="true"
//       />
//       <motion.div
//         className="login-blob-deep pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full"
//         variants={floatVariants}
//         initial="initial"
//         animate="animate"
//         transition={{ duration: 2, delay: 0.5 }}
//         aria-hidden="true"
//       />
//       <motion.div
//         className="login-blob-gold pointer-events-none absolute top-1/3 right-[10%] h-48 w-48 rounded-full"
//         variants={floatVariants}
//         initial="initial"
//         animate="animate"
//         transition={{ duration: 2, delay: 0.8 }}
//         aria-hidden="true"
//       />

//       <div className="absolute left-4 top-4 z-10">
//         <ThemeToggle />
//       </div>

//       <div className="relative z-10 w-full max-w-sm space-y-6">
//         {/* Logo / Brand area with floating animation */}
//         <div
//           className={cn(
//             "flex flex-col items-center gap-3 text-center",
//             !prefersReduced && "animate-float"
//           )}
//         >
//           <div className="login-logo-glow">
//             <WafirLogo variant="mark" className="h-24 w-auto" />
//           </div>
//           <div className="flex flex-col items-center gap-1">
//             <span className="text-2xl font-bold text-white">وفر</span>
//             <span className="text-sm text-white/70">لوحة تحكم المشرفين</span>
//           </div>
//         </div>

//         <motion.div
//           {...cardAnimation}
//           transition={{ duration: 0.4, ease: "easeOut" }}
//         >
//           <Card className="border-white/15 bg-card/60 shadow-2xl backdrop-blur-xl login-card-shimmer">
//             <CardHeader className="text-center">
//               <CardTitle>تسجيل الدخول</CardTitle>
//               <CardDescription>أدخل بيانات الاعتماد للوصول للوحة التحكم</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <motion.form
//                 onSubmit={handleSubmit(onSubmit)}
//                 className="space-y-4"
//                 initial="hidden"
//                 animate="visible"
//                 variants={formStagger}
//               >
//                 <motion.div className="space-y-2" variants={formFieldVariants}>
//                   <Label htmlFor="identifier">اسم المستخدم</Label>
//                   <Input
//                     id="identifier"
//                     autoComplete="identifier"
//                     autoFocus
//                     {...register("identifier")}
//                   />
//                   {formState.errors.identifier && (
//                     <p className="text-xs text-destructive" role="alert">
//                       {formState.errors.identifier.message}
//                     </p>
//                   )}
//                 </motion.div>

//                 <motion.div className="space-y-2" variants={formFieldVariants}>
//                   <Label htmlFor="password">كلمة المرور</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     autoComplete="current-password"
//                     {...register("password")}
//                   />
//                   {formState.errors.password && (
//                     <p className="text-xs text-destructive" role="alert">
//                       {formState.errors.password.message}
//                     </p>
//                   )}
//                 </motion.div>

//                 <motion.div
//                   className="flex items-center justify-between"
//                   variants={formFieldVariants}
//                 >
//                   <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
//                     <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
//                     <span className="text-sm text-muted-foreground">تذكرني</span>
//                   </label>
//                   <button
//                     type="button"
//                     onClick={handleForgotPassword}
//                     className="text-sm text-primary hover:text-primary/80 transition-colors min-h-[44px]"
//                   >
//                     نسيت كلمة المرور؟
//                   </button>
//                 </motion.div>

//                 <motion.div variants={formFieldVariants}>
//                   <Button
//                     type="submit"
//                     className="w-full min-h-[44px] rounded-full"
//                     disabled={login.isPending}
//                   >
//                     {login.isPending ? "جارٍ الدخول..." : "تسجيل الدخول"}
//                   </Button>
//                 </motion.div>
//               </motion.form>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <div className="flex flex-col items-center gap-2">
//           <Link
//             href="/"
//             className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white min-h-[44px]"
//           >
//             <ArrowRight className="h-4 w-4" />
//             العودة للموقع
//           </Link>
//           <span className="text-xs text-white/50">
//             مدعوم من وفر
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
