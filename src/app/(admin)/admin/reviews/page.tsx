"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  MessageSquare,
  Filter,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/shared/StarRating";
import {
  useAdminReviews,
  useDeleteReview,
  usePublishReview,
  useUnpublishReview,
} from "@/hooks/useAdminReviews";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@/types/api.generated";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "published" | "unpublished";

const FILTER_CONFIG: { key: FilterKey; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "published", label: "منشورة" },
  { key: "unpublished", label: "غير منشورة" },
];

function timeAgoAr(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 7) return `منذ ${d} يوم`;
  return new Date(iso).toLocaleDateString("ar-SA");
}

function ReviewRow({
  review,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  review: Review;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border bg-card p-4 transition-colors",
        review.is_published
          ? "border-border/50"
          : "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-foreground">
              {review.reviewer_name}
            </span>
            <StarRating value={review.rating} size={14} />
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                review.is_published
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {review.is_published ? "منشورة" : "مخفية"}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgoAr(review.created_at)}
            </span>
          </div>
          {review.comment ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {review.comment}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-muted-foreground/60">
              لا يوجد نص — تقييم بالنجوم فقط
            </p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            <Link
              href={`/facilities/${review.facility_id}`}
              className="inline-flex items-center gap-1 text-secondary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              منشأة #{review.facility_id}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {review.is_published ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnpublish}
              className="gap-1.5 min-h-[36px]"
            >
              <EyeOff className="h-3.5 w-3.5" />
              إخفاء
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onPublish}
              className="gap-1.5 min-h-[36px]"
            >
              <Eye className="h-3.5 w-3.5" />
              نشر
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive min-h-[36px]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-2xl bg-card p-6 shadow-soft-lg max-w-sm w-full">
        <h3 className="text-lg font-bold text-foreground">تأكيد الحذف</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          هل أنت متأكد من حذف هذه المراجعة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="gap-1.5 min-h-[44px]"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            حذف نهائي
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data, isLoading } = useAdminReviews({
    is_published:
      filter === "published" ? true : filter === "unpublished" ? false : undefined,
    limit: 100,
  });
  const publishMut = usePublishReview();
  const unpublishMut = useUnpublishReview();
  const deleteMut = useDeleteReview();
  const { toast } = useToast();

  const reviews = data?.items ?? [];
  const total = data?.total ?? 0;

  function confirmDelete() {
    if (deleteTarget == null) return;
    deleteMut.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">المراجعات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مراجعة ومتابعة تقييمات العملاء للمنشآت
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black tabular-nums text-foreground">
                {total}
              </p>
              <p className="text-xs text-muted-foreground">إجمالي المراجعات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Eye className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-black tabular-nums text-foreground">
                {reviews.filter((r) => r.is_published).length}
              </p>
              <p className="text-xs text-muted-foreground">منشورة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <EyeOff className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-black tabular-nums text-foreground">
                {reviews.filter((r) => !r.is_published).length}
              </p>
              <p className="text-xs text-muted-foreground">مخفية</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {FILTER_CONFIG.map((cfg) => (
          <button
            key={cfg.key}
            onClick={() => setFilter(cfg.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]",
              filter === cfg.key
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                لا توجد مراجعات
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filter === "all"
                  ? "لم يترك أي عميل مراجعة بعد"
                  : `لا توجد مراجعات ${filter === "published" ? "منشورة" : "مخفية"}`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {reviews.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              onPublish={() =>
                publishMut.mutate(review.id, {
                  onError: (e: Error) =>
                    toast({
                      title: "تعذّر نشر المراجعة",
                      description: e.message,
                      variant: "destructive",
                    }),
                })
              }
              onUnpublish={() =>
                unpublishMut.mutate(review.id, {
                  onError: (e: Error) =>
                    toast({
                      title: "تعذّر إخفاء المراجعة",
                      description: e.message,
                      variant: "destructive",
                    }),
                })
              }
              onDelete={() => setDeleteTarget(review.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isPending={deleteMut.isPending}
      />
    </div>
  );
}
