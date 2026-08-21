"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Eye, EyeOff, Package, Pencil, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyFacilities } from "@/hooks/useMyFacilities";
import { useOwnerProducts } from "@/hooks/useOwnerProducts";

const FACILITY_TYPE_LABELS: Record<string, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرافق عام",
};

export default function OwnerFacilitiesContent() {
  const { data: facilities, isLoading, isError, error } = useMyFacilities();
  const router = useRouter();

  // If only 1 facility, redirect to its products page
  useEffect(() => {
    if (facilities && facilities.length === 1) {
      router.replace(`/owner/facilities/${facilities[0].id}/products`);
    }
  }, [facilities, router]);

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
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
          {(error as Error).message || "حدث خطأ أثناء تحميل المنشآت"}
        </p>
        <Button variant="outline" rounded-full onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  // ─── Empty ───
  if (!facilities || facilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Store className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-medium">لا توجد منشآت مسجلة</p>
        <p className="text-sm text-muted-foreground">
          يرجى التواصل مع إدارة وفر لربط حسابك بمنشأة
        </p>
      </div>
    );
  }

  // ─── Redirecting (single facility) ───
  if (facilities.length === 1) {
    return (
      <div className="flex items-center justify-center py-20">
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  // ─── Facilities list ───
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">منشآتي</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => (
          <FacilityCard key={f.id} facility={f} />
        ))}
      </div>
    </div>
  );
}

function FacilityCard({ facility }: { facility: { id: number; name: string; type: string; is_visible: boolean; description: string | null } }) {
  const { data: productData } = useOwnerProducts(facility.id, { page: 1, page_size: 1 });
  const productCount = productData?.total ?? 0;

  return (
    <Card className="rounded-2xl transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{facility.name}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {FACILITY_TYPE_LABELS[facility.type] || facility.type}
              </Badge>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-xs ${facility.is_visible ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"}`}>
            {facility.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{facility.is_visible ? "ظاهرة" : "مخفية"}</span>
          </div>
        </div>

        {facility.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {facility.description}
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{productCount} منتج</span>
          </div>
          <div className="flex gap-2">
            <Link href={`/owner/facilities/${facility.id}`}>
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs">
                <Pencil className="h-3.5 w-3.5" />
                تعديل
              </Button>
            </Link>
            <Link href={`/owner/facilities/${facility.id}/products`}>
              <Button size="sm" className="h-9 gap-1.5 rounded-full text-xs bg-teal-600 hover:bg-teal-700 text-white">
                المنتجات
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}