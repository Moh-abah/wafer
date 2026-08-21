"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { ArrowRight, MapPin, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ownerService } from "@/services/owner.service";
import { useUpdateMyFacility } from "@/hooks/useUpdateMyFacility";
import type { Facility, OwnerFacilityUpdate } from "@/types/api.generated";
import { useQuery } from "@tanstack/react-query";

export default function FacilityEditContent() {
  const params = useParams<{ id: string }>();
  const facilityId = Number(params.id);
  const router = useRouter();

  const { data: facility, isLoading, isError, error } = useQuery<Facility>({
    queryKey: ["my-facility", facilityId],
    queryFn: () => ownerService.getMyFacility(facilityId),
  });

  const updateMutation = useUpdateMyFacility(facilityId);

  const form = useForm<OwnerFacilityUpdate>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      working_hours: "",
      image_url: "",
      is_visible: false,
      latitude: null,
      longitude: null,
    },
  });
  const { register, handleSubmit, control, reset } = form;

  // Populate form when data loads
  useEffect(() => {
    if (facility) {
      reset({
        name: facility.name,
        description: facility.description ?? "",
        address: facility.address ?? "",
        phone: facility.phone ?? "",
        working_hours: facility.working_hours ?? "",
        image_url: facility.image_url ?? "",
        is_visible: facility.is_visible,
        latitude: facility.latitude,
        longitude: facility.longitude,
      });
    }
  }, [facility, reset]);

  function onSubmit(data: OwnerFacilityUpdate) {
    updateMutation.mutate(data, {
      onSuccess: () => {
        router.push(`/owner/facilities/${facilityId}/products`);
      },
    });
  }

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-medium text-destructive">
          {(error as Error).message || "حدث خطأ أثناء تحميل المنشأة"}
        </p>
        <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">تعديل المنشأة</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنشأة *</Label>
              <Input id="name" {...register("name", { required: "اسم المنشأة مطلوب" })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea id="description" rows={3} {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">رابط الصورة</Label>
              <Input id="image_url" dir="ltr" {...register("image_url")} />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <Label htmlFor="is_visible">المنشأة ظاهرة للعملاء</Label>
                <p className="text-xs text-muted-foreground">
                  عند التعطيل لن تظهر المنشأة في التطبيق
                </p>
              </div>
              <Controller
                name="is_visible"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>معلومات التواصل والموقع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Input id="address" {...register("address")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" dir="ltr" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="working_hours">ساعات العمل</Label>
              <Input id="working_hours" placeholder="مثال: 8 صباحًا - 11 مساءً" {...register("working_hours")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">خط العرض</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  dir="ltr"
                  {...register("latitude", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">خط الطول</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  dir="ltr"
                  {...register("longitude", { valueAsNumber: true })}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-full"
              onClick={() => {
                const lat = form.getValues("latitude");
                const lng = form.getValues("longitude");
                if (lat && lng) {
                  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                } else {
                  window.open("https://www.google.com/maps", "_blank");
                }
              }}
            >
              <MapPin className="h-4 w-4" />
              حدّد على الخريطة
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => router.back()}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-teal-600 text-white hover:bg-teal-700"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ التعديلات
          </Button>
        </div>
      </form>
    </div>
  );
}
