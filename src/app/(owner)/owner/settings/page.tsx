"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Save, Lock, Info, Bell, Globe, Store, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useOwnerLogout } from "@/hooks/useOwnerAuth";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) {
    return { label: "", color: "bg-muted", width: "w-0" };
  }
  if (password.length < 6) {
    return { label: "ضعيفة", color: "bg-destructive", width: "w-1/3" };
  }
  if (password.length >= 6 && /[0-9]/.test(password)) {
    if (password.length >= 8 && /[A-Z]/.test(password) && /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\]/.test(password)) {
      return { label: "قوية", color: "bg-success", width: "w-full" };
    }
    return { label: "متوسطة", color: "bg-accent", width: "w-2/3" };
  }
  return { label: "ضعيفة", color: "bg-destructive", width: "w-1/3" };
}

export default function OwnerSettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const logout = useOwnerLogout();

  const [facilityName, setFacilityName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [orderNotif, setOrderNotif] = useState(true);
  const [securityNotif, setSecurityNotif] = useState(true);

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  function handleSaveFacility() {
    toast({ title: "تم حفظ بيانات المنشأة" });
  }

  function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "كلمة المرور غير متطابقة", variant: "destructive" });
      return;
    }
    toast({ title: "تم تغيير كلمة المرور" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleDeleteAccount() {
    toast({ title: "هذه الميزة غير متاحة حالياً" });
  }

  function handleChangeAvatar() {
    toast({ title: "تغيير الصورة الشخصية", description: "ستتوفر هذه الميزة قريبًا" });
  }

  function handleSaveAll() {
    toast({ title: "تم حفظ جميع التغييرات بنجاح" });
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إدارة إعدادات حسابك ومنشآتك.
        </p>
      </div>

      {/* Profile Avatar Section */}
      <div className="gradient-border-animated rounded-2xl p-[2px]">
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <span className="text-3xl font-bold text-white">م</span>
              </div>
              <button
                type="button"
                onClick={handleChangeAvatar}
                className="absolute -bottom-1 -left-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted min-h-[44px] min-w-[44px]"
                aria-label="تغيير الصورة الشخصية"
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">مالك المنشأة</p>
              <p className="mt-1 text-sm text-muted-foreground">owner@wafir.gleeze.com</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gradient Divider */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-l from-primary/30 via-secondary/30 to-accent/30" />

      {/* Facility Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5 text-secondary" />
            بيانات المنشأة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facility-name">اسم المنشأة</Label>
              <Input
                id="facility-name"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="أدخل اسم المنشأة"
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">رقم التواصل</Label>
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="min-h-[44px]"
              />
            </div>
          </div>
          <Button className="gap-2" onClick={handleSaveFacility}>
            <Save className="h-4 w-4" />
            حفظ البيانات
          </Button>
        </CardContent>
      </Card>

      {/* Gradient Divider */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-l from-primary/30 via-secondary/30 to-accent/30" />

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
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
              <p className="text-sm font-medium">إشعارات البريد الإلكتروني</p>
              <p className="text-xs text-muted-foreground">استلام إشعارات عبر البريد</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              aria-label="تبديل إشعارات البريد"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">إشعارات الطلبات</p>
              <p className="text-xs text-muted-foreground">إشعار عند كل طلب خصم جديد</p>
            </div>
            <Switch
              checked={orderNotifications}
              onCheckedChange={setOrderNotifications}
              aria-label="تبديل إشعارات الطلبات"
            />
          </div>
        </CardContent>
      </Card>

      {/* Gradient Divider */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-l from-primary/30 via-secondary/30 to-accent/30" />

      {/* Account Security */}
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
              <Label htmlFor="owner-current-password">كلمة المرور الحالية</Label>
              <Input
                id="owner-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="**********"
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-new-password">كلمة المرور الجديدة</Label>
              <Input
                id="owner-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="**********"
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="owner-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="**********"
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Password Strength Meter */}
          {newPassword.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    passwordStrength.color,
                    passwordStrength.width
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium min-w-[48px] text-left",
                  passwordStrength.label === "ضعيفة" && "text-destructive",
                  passwordStrength.label === "متوسطة" && "text-accent",
                  passwordStrength.label === "قوية" && "text-success"
                )}
              >
                {passwordStrength.label}
              </span>
            </div>
          )}

          <Button className="gap-2" onClick={handleChangePassword}>
            <Save className="h-4 w-4" />
            حفظ كلمة المرور
          </Button>
        </CardContent>
      </Card>

      {/* Gradient Divider */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-l from-primary/30 via-secondary/30 to-accent/30" />

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">إشعارات الطلبات</p>
              <p className="text-xs text-muted-foreground">تنبيه عند وصول طلبات جديدة</p>
            </div>
            <Switch
              checked={orderNotif}
              onCheckedChange={setOrderNotif}
              aria-label="تبديل إشعارات الطلبات"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">إشعارات البريد الإلكتروني</p>
              <p className="text-xs text-muted-foreground">استلام التحديثات عبر البريد</p>
            </div>
            <Switch
              checked={emailNotif}
              onCheckedChange={setEmailNotif}
              aria-label="تبديل إشعارات البريد الإلكتروني"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">تنبيهات الأمان</p>
              <p className="text-xs text-muted-foreground">إشعارات تسجيل الدخول</p>
            </div>
            <Switch
              checked={securityNotif}
              onCheckedChange={setSecurityNotif}
              aria-label="تبديل تنبيهات الأمان"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              className="gap-2 min-h-[44px]"
              onClick={() => toast({ title: "تم حفظ الإشعارات" })}
            >
              <Save className="h-4 w-4" />
              حفظ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Divider */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-l from-primary/30 via-secondary/30 to-accent/30" />

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Globe className="h-5 w-5" />
            منطقة الخطر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">تسجيل الخروج</p>
              <p className="text-xs text-muted-foreground">تسجيل الخروج من حسابك</p>
            </div>
            <Button variant="outline" className="gap-2 min-h-[44px]" onClick={() => logout()}>
              تسجيل الخروج
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">حذف الحساب</p>
              <p className="text-xs text-muted-foreground">حذف الحساب وجميع البيانات نهائياً</p>
            </div>
            <Button variant="destructive" className="gap-2 min-h-[44px]" onClick={handleDeleteAccount}>
              حذف الحساب
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Divider */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-l from-primary/30 via-secondary/30 to-accent/30" />

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-muted-foreground" />
            عن المنصة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>وفر - بوابة أصحاب المنشآت</p>
          <p>الإصدار: 1.0.0</p>
        </CardContent>
      </Card>

      {/* Sticky Bottom Save Button */}
      <div className="sticky bottom-4 z-30 flex justify-end">
        <Button
          onClick={handleSaveAll}
          className="rounded-full px-8 min-h-[44px] shadow-lg bg-gradient-to-l from-primary to-secondary text-white hover:opacity-90 transition-opacity"
        >
          <Save className="ml-2 h-4 w-4" />
          حفظ جميع التغييرات
        </Button>
      </div>
    </div>
  );
}