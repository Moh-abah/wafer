"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useMutation } from "@tanstack/react-query";
import { Save, Lock, Info, Bell, Globe, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/pwa/version";
import { apiClient } from "@/services/api-client";
import {
  useAdminMe,
  useChangeAdminPassword,
  useUpdateAdminMe,
} from "@/hooks/useAdminMe";
import { useToast } from "@/hooks/use-toast";
import type { AdminMe, MessageOut } from "@/types/api.generated";

/* ─── Local notification preferences (no backend store yet) ─── */
const NOTIF_KEY = "wafir_admin_notif_prefs";

interface NotifPrefs {
  email: boolean;
  facility: boolean;
  security: boolean;
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  email: true,
  facility: true,
  security: true,
};

function readNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIF_PREFS;
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return DEFAULT_NOTIF_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotifPrefs>;
    return { ...DEFAULT_NOTIF_PREFS, ...parsed };
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
}

function writeNotifPrefs(prefs: NotifPrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota errors */
  }
}

/* ─── Password strength calculator ──────────────── */
function getPasswordStrength(password: string): { level: "weak" | "medium" | "strong"; percent: number } {
  if (!password) return { level: "weak", percent: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 2) return { level: "weak", percent: 33 };
  if (score <= 3) return { level: "medium", percent: 66 };
  return { level: "strong", percent: 100 };
}

const STRENGTH_LABELS: Record<string, string> = {
  weak: "ضعيفة",
  medium: "متوسطة",
  strong: "قوية",
};

const STRENGTH_COLORS: Record<string, string> = {
  weak: "bg-destructive",
  medium: "bg-accent",
  strong: "bg-success",
};

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Real admin profile from GET /admin/me
  const { data: adminMe, isLoading: meLoading } = useAdminMe();

  // Notification preferences (persisted locally — no backend store yet)
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(() => readNotifPrefs());

  return (
    <div className="relative space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إدارة إعدادات الحساب والمنصة.
        </p>
      </div>

      {/* Profile section — keyed on adminMe.id so internal form state resets cleanly
          when the API data changes, without setState-in-effect lint violations. */}
      <div className="gradient-border-animated rounded-xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              الملف الشخصي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileAvatar adminMe={adminMe} meLoading={meLoading} />
            <Separator />
            <ProfileForm
              key={`profile-${adminMe?.id ?? "loading"}`}
              adminMe={adminMe}
              meLoading={meLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Animated gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-l from-transparent via-primary/30 to-transparent" />

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-secondary" />
            الإعدادات العامة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">المظهر</p>
              <p className="text-xs text-muted-foreground">
                {theme === "dark" ? "داكن" : "فاتح"}
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="تبديل المظهر"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">اللغة</p>
              <p className="text-xs text-muted-foreground">العربية - ثابت</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animated gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-l from-transparent via-secondary/30 to-transparent" />

      {/* Account Security — keyed on adminMe.id so the password fields reset cleanly. */}
      <ChangePasswordSection key={`pwd-${adminMe?.id ?? "loading"}`} />

      {/* Logout all devices */}
      <AdminLogoutAllDevices />

      {/* Animated gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-l from-transparent via-accent/30 to-transparent" />

      {/* Notification Preferences — persisted locally (no backend store yet) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">إشعارات البريد الإلكتروني</p>
              <p className="text-xs text-muted-foreground">استلام إشعارات عبر البريد الإلكتروني</p>
            </div>
            <Switch
              checked={notifPrefs.email}
              onCheckedChange={(v) => {
                const next = { ...notifPrefs, email: v };
                setNotifPrefs(next);
                writeNotifPrefs(next);
                toast({ title: "تم حفظ تفضيلات الإشعارات" });
              }}
              aria-label="إشعارات البريد الإلكتروني"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">إشعارات المنشآت الجديدة</p>
              <p className="text-xs text-muted-foreground">تنبيه عند إضافة منشآت جديدة</p>
            </div>
            <Switch
              checked={notifPrefs.facility}
              onCheckedChange={(v) => {
                const next = { ...notifPrefs, facility: v };
                setNotifPrefs(next);
                writeNotifPrefs(next);
                toast({ title: "تم حفظ تفضيلات الإشعارات" });
              }}
              aria-label="إشعارات المنشآت الجديدة"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">تنبيهات الأمان</p>
              <p className="text-xs text-muted-foreground">إشعارات تسجيل الدخول والنشاط المشبوه</p>
            </div>
            <Switch
              checked={notifPrefs.security}
              onCheckedChange={(v) => {
                const next = { ...notifPrefs, security: v };
                setNotifPrefs(next);
                writeNotifPrefs(next);
                toast({ title: "تم حفظ تفضيلات الإشعارات" });
              }}
              aria-label="تنبيهات الأمان"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            تُحفظ تفضيلات الإشعارات محليًا على هذا الجهاز. سيتم ربطها بحسابك في إصدار لاحق.
          </p>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-muted-foreground" />
            عن المنصة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>وفر - بطاقة الخصم السعودية</p>
          <p>
            الإصدار: <span dir="ltr">{APP_VERSION}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Profile avatar (initial letter from real name) ─── */
function ProfileAvatar({
  adminMe,
  meLoading,
}: {
  adminMe: AdminMe | undefined;
  meLoading: boolean;
}) {
  const initial = (adminMe?.full_name?.trim()?.[0] ?? "م").toUpperCase();
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-primary-foreground">
          {meLoading ? "?" : initial}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold">
          {meLoading ? "جارٍ التحميل…" : adminMe?.full_name || "المشرف"}
        </p>
        <p dir="ltr" className="text-sm text-muted-foreground">
          {adminMe?.email || "—"}
        </p>
        <p dir="ltr" className="text-xs text-muted-foreground">
          {adminMe?.phone || "—"}
        </p>
      </div>
    </div>
  );
}

/* ─── Profile form — keyed by adminMe.id so it resets on data change ─── */
function ProfileForm({
  adminMe,
  meLoading,
}: {
  adminMe: AdminMe | undefined;
  meLoading: boolean;
}) {
  const updateMeMut = useUpdateAdminMe();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(adminMe?.full_name ?? "");
  const [phone, setPhone] = useState(adminMe?.phone ?? "");

  // Compute "dirty" purely from current state vs. snapshot — no setState-in-effect.
  const profileDirty =
    displayName !== (adminMe?.full_name ?? "") ||
    phone !== (adminMe?.phone ?? "");

  function handleSaveProfile() {
    if (!displayName.trim()) {
      toast({ title: "الاسم المعروض مطلوب", variant: "destructive" });
      return;
    }
    updateMeMut.mutate({ full_name: displayName, phone });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display-name">الاسم المعروض</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="الاسم الكامل"
            className="min-h-[44px]"
            disabled={meLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني (غير قابل للتعديل)</Label>
          <Input
            id="email"
            value={adminMe?.email ?? ""}
            disabled
            dir="ltr"
            className="min-h-[44px]"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+9665XXXXXXXX"
          dir="ltr"
          className="min-h-[44px]"
          disabled={meLoading}
        />
      </div>
      <Button
        className="gap-2"
        onClick={handleSaveProfile}
        disabled={updateMeMut.isPending || meLoading || !profileDirty}
      >
        {updateMeMut.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        حفظ الملف الشخصي
      </Button>
    </>
  );
}

/* ─── Logout all devices ─── */
function AdminLogoutAllDevices() {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: () => apiClient.post<MessageOut>("/admin/me/logout-all"),
    onSuccess: (data) => {
      toast({ title: data.detail });
    },
    onError: (e: Error) => {
      toast({
        title: "تعذّر تسجيل الخروج",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          إدارة الجلسات
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">تسجيل الخروج من جميع الأجهزة</p>
          <p className="mt-1 text-xs text-muted-foreground">
            يلغي جميع رموز التحديث — ستحتاج لإعادة تسجيل الدخول على كل جهاز
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="gap-2 min-h-[44px] shrink-0"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Smartphone className="h-4 w-4" />
          )}
          خروج من الكل
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Change password section — keyed by adminMe.id so it resets cleanly ─── */
function ChangePasswordSection() {
  const changePwdMut = useChangeAdminPassword();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "كلمة المرور الجديدة غير متطابقة", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "كلمة المرور يجب أن تكون 8 أحرف على الأقل", variant: "destructive" });
      return;
    }
    changePwdMut.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5 text-accent" />
          أمان الحساب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="current-password">كلمة المرور الحالية</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="********"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="********"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              className="min-h-[44px]"
            />
          </div>
        </div>

        {/* Password strength meter */}
        {newPassword.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">قوة كلمة المرور</span>
              <span className={cn(
                "text-xs font-medium",
                passwordStrength.level === "weak" && "text-destructive",
                passwordStrength.level === "medium" && "text-accent",
                passwordStrength.level === "strong" && "text-success",
              )}>
                {STRENGTH_LABELS[passwordStrength.level]}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  STRENGTH_COLORS[passwordStrength.level],
                )}
                style={{ width: `${passwordStrength.percent}%` }}
              />
            </div>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              يُنصح بـ 12 حرفًا على الأقل مع أحرف كبيرة وأرقام ورموز.
            </p>
          </div>
        )}

        <Button
          className="gap-2"
          onClick={handleChangePassword}
          disabled={changePwdMut.isPending}
        >
          {changePwdMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          تغيير كلمة المرور
        </Button>
      </CardContent>
    </Card>
  );
}
