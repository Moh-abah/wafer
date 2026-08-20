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
import { CardForm } from "@/components/admin/CardForm";
import {
  useAdminCards,
  useDeleteCard,
} from "@/hooks/useAdminCards";
import { useRegions } from "@/hooks/useRegions";
import type { Card } from "@/types/api.generated";

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

export default function AdminCardsPage() {
  const { data, isLoading, error, refetch } = useAdminCards();
  const deleteCard = useDeleteCard();
  const { data: regions } = useRegions(false);

  const regionMap = useMemo(() => {
    const m = new Map<number, string>();
    regions?.forEach((r) => m.set(r.id, r.name));
    return m;
  }, [regions]);

  const cards = data?.items ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Card | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(card: Card) {
    setEditing(card);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (deletingId === null) return;
    await deleteCard.mutateAsync(deletingId);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة البطاقات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة بطاقات الخصم على المنصة.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة بطاقة
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>المنصة</TableHead>
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
                      تعذّر تحميل البطاقات.
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
          ) : cards.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  لا توجد بطاقات.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">{card.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {card.platform_name}
                  </TableCell>
                  <TableCell>
                    {regionMap.get(card.region_id) ?? "—"}
                  </TableCell>
                  <TableCell>{card.display_order}</TableCell>
                  <TableCell>
                    {card.is_published ? (
                      <Badge>منشورة</Badge>
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
                        onClick={() => openEdit(card)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="حذف"
                        onClick={() => setDeletingId(card.id)}
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

      <CardForm open={formOpen} onOpenChange={setFormOpen} initial={editing} />

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.
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
