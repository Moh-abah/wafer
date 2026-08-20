"use client";

import { useState } from "react";
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
import { RegionForm } from "@/components/admin/RegionForm";
import {
  useAdminRegions,
  useDeleteRegion,
} from "@/hooks/useAdminRegions";
import type { Region } from "@/types/api.generated";

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
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

export default function AdminRegionsPage() {
  const { data, isLoading, error, refetch } = useAdminRegions();
  const deleteRegion = useDeleteRegion();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Region | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(region: Region) {
    setEditing(region);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (deletingId === null) return;
    await deleteRegion.mutateAsync(deletingId);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة المناطق</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إضافة وتعديل وحذف المناطق المتاحة على المنصة.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة منطقة
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>المعرّف (slug)</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-destructive">
                      تعذّر تحميل المناطق.
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
          ) : !data || data.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  لا توجد مناطق.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {data.map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell className="text-muted-foreground" dir="ltr">
                    {region.slug}
                  </TableCell>
                  <TableCell>
                    {region.is_active ? (
                      <Badge>مفعّلة</Badge>
                    ) : (
                      <Badge variant="secondary">معطّلة</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="تعديل"
                        onClick={() => openEdit(region)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="حذف"
                        onClick={() => setDeletingId(region.id)}
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

      <RegionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
      />

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المنطقة؟ لا يمكن التراجع عن هذا الإجراء.
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
    </div>
  );
}
