"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAdminFacilities,
  useDeleteFacility,
} from "@/hooks/useAdminFacilities";
import { useRegions } from "@/hooks/useRegions";
import { FacilityForm } from "@/components/admin/FacilityForm";
import type { Facility, FacilityType } from "@/types/api.generated";

const TYPE_LABELS: Record<FacilityType, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرفق عام",
};

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function AdminFacilitiesPage() {
  const { data, isLoading, error, refetch } = useAdminFacilities();
  const deleteFacility = useDeleteFacility();
  const { data: regions } = useRegions(false);

  const regionMap = useMemo(() => {
    const m = new Map<number, string>();
    regions?.forEach((r) => m.set(r.id, r.name));
    return m;
  }, [regions]);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | undefined>(undefined);

  async function confirmDelete() {
    if (deletingId === null) return;
    await deleteFacility.mutateAsync(deletingId);
    setDeletingId(null);
  }

  function openCreate() {
    setEditingFacility(undefined);
    setFormOpen(true);
  }

  function openEdit(facility: Facility) {
    setEditingFacility(facility);
    setFormOpen(true);
  }

  const facilities = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة المنشآت</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة المطاعم والمقاهي والمرافق العامة.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          إضافة منشأة
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المنطقة</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-destructive">
                      تعذّر تحميل المنشآت.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="gap-2"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      إعادة المحاولة
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : facilities.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  لا توجد منشآت.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {facilities.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell className="font-medium">
                    {facility.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TYPE_LABELS[facility.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {regionMap.get(facility.region_id) ?? "—"}
                  </TableCell>
                  <TableCell>{facility.display_order}</TableCell>
                  <TableCell>
                    {facility.is_visible ? (
                      <Badge>ظاهرة</Badge>
                    ) : (
                      <Badge variant="secondary">مخفية</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="تعديل"
                        className="h-8 w-8"
                        onClick={() => openEdit(facility)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="حذف"
                        onClick={() => setDeletingId(facility.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المنشأة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FacilityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editingFacility}
      />
    </div>
  );
}
