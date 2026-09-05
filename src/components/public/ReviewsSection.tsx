"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, MessageSquare, Loader2, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/shared/StarRating";
import {
  useDeleteReview,
  useFacilityReviewStats,
  useFacilityReviews,
  useMyReview,
  useUpsertReview,
  useVoteReview,
  hasVoted,
  markVoted,
} from "@/hooks/useReviews";
import { useCustomerAuthStore } from "@/store/customerAuth.store";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@/types/api.generated";
import { cn } from "@/lib/utils";

/** Format an ISO date string as a relative Arabic time (e.g. "منذ 3 أيام"). */
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
  if (d < 30) return `منذ ${Math.floor(d / 7)} أسبوع`;
  return new Date(iso).toLocaleDateString("ar-SA");
}

/** Initials avatar — first 1–2 letters of the name. */
function ReviewerAvatar({ name }: { name: string }) {
  const initials = name.trim().slice(0, 2).toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-bold text-primary">
      {initials}
    </div>
  );
}

/** A single review card with helpfulness voting. */
function ReviewCard({ review, facilityId }: { review: Review; facilityId: number }) {
  const voteMut = useVoteReview();
  const [voted, setVoted] = useState(() => hasVoted(review.id));

  function handleVote(isHelpful: boolean) {
    if (voted) return;
    setVoted(true);
    markVoted(review.id);
    voteMut.mutate(
      { facilityId, reviewId: review.id, isHelpful },
      {
        onError: () => {
          // Revert on failure
          setVoted(false);
        },
      }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-border/50 bg-card/50 p-4"
    >
      <div className="flex items-start gap-3">
        <ReviewerAvatar name={review.reviewer_name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-foreground">
              {review.reviewer_name}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgoAr(review.created_at)}
            </span>
          </div>
          <div className="mt-1">
            <StarRating value={review.rating} size={14} />
          </div>
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          )}
          {/* Helpfulness voting */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => handleVote(true)}
              disabled={voted || voteMut.isPending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors min-h-[36px]",
                voted
                  ? "cursor-default text-muted-foreground"
                  : "text-muted-foreground hover:bg-success/10 hover:text-success"
              )}
              aria-label="مراجعة مفيدة"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="tabular-nums">{review.helpful_count}</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={voted || voteMut.isPending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors min-h-[36px]",
                voted
                  ? "cursor-default text-muted-foreground"
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
              aria-label="مراجعة غير مفيدة"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="tabular-nums">{review.unhelpful_count}</span>
            </button>
            {voted && (
              <span className="text-[10px] text-muted-foreground/60">
                تم التصويت
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Aggregate stats bar — big average + distribution. */
function RatingSummary({
  stats,
  reviewsCount,
}: {
  stats: { average: number; total: number; distribution: Record<string, number> };
  reviewsCount: number;
}) {
  if (stats.total === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 sm:flex-row sm:items-center">
      {/* Big average */}
      <div className="flex shrink-0 flex-col items-center justify-center sm:w-28">
        <span className="text-3xl font-black tabular-nums text-foreground" dir="ltr">
          {stats.average.toFixed(1)}
        </span>
        <StarRating value={stats.average} size={14} className="mt-1" />
        <span className="mt-1 text-xs text-muted-foreground">
          {stats.total} مراجعة
        </span>
      </div>
      {/* Distribution bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[String(star)] ?? 0;
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-3 text-xs font-medium text-muted-foreground" dir="ltr">
                {star}
              </span>
              <Star className="h-3 w-3 shrink-0 text-accent" fill="currentColor" strokeWidth={0} />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground" dir="ltr">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Review form — star input + comment textarea + submit. Shown when logged in. */
function ReviewForm({ facilityId }: { facilityId: number }) {
  const { toast } = useToast();
  const { data: myReview } = useMyReview(facilityId);
  const upsertMut = useUpsertReview();
  const deleteMut = useDeleteReview();

  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(myReview?.comment ?? "");

  // Sync local state when the server-side review loads/changes
  // (uses key-based remount pattern via the parent to avoid setState-in-effect lint)
  const isEditing = !!myReview;

  function handleSubmit() {
    if (rating === 0) {
      toast({ title: "يرجى اختيار تقييم", variant: "destructive" });
      return;
    }
    upsertMut.mutate(
      { facilityId, payload: { rating, comment: comment.trim() || null } },
      {
        onSuccess: () => {
          toast({ title: isEditing ? "تم تحديث مراجعتك" : "تم نشر مراجعتك" });
        },
        onError: (e: Error) => {
          toast({
            title: "تعذّر نشر المراجعة",
            description: e.message,
            variant: "destructive",
          });
        },
      }
    );
  }

  function handleDelete() {
    deleteMut.mutate(facilityId, {
      onSuccess: () => {
        setRating(0);
        setComment("");
        toast({ title: "تم حذف مراجعتك" });
      },
    });
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="mb-3 text-sm font-bold text-foreground">
        {isEditing ? "عدّل مراجعتك" : "اكتب مراجعتك"}
      </p>
      <div className="flex items-center gap-2">
        <StarRating
          value={rating}
          size={28}
          interactive
          onChange={setRating}
          hoverValue={hover}
        />
        <div
          onMouseLeave={() => setHover(0)}
          className="flex"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onClick={() => setRating(star)}
              className="p-0.5"
              aria-label={`${star} نجوم`}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  (hover ?? rating) >= star
                    ? "text-accent"
                    : "text-muted-foreground/30"
                )}
                fill={(hover ?? rating) >= star ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="شاركنا تجربتك (اختياري)..."
        className="mt-3 min-h-[80px] resize-none"
        maxLength={1000}
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground" dir="ltr">
          {comment.length}/1000
        </span>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              className="gap-1.5 min-h-[44px]"
            >
              {deleteMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              حذف
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={upsertMut.isPending || rating === 0}
            className="gap-1.5 min-h-[44px]"
          >
            {upsertMut.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isEditing ? "تحديث" : "نشر"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Empty state when no reviews exist yet. */
function NoReviewsYet() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">لا توجد مراجعات بعد</p>
        <p className="mt-1 text-xs text-muted-foreground">
          كن أول من يشارك تجربته في هذه المنشأة
        </p>
      </div>
    </div>
  );
}

/** Main reviews section — stats + form + list + sort. */
export function ReviewsSection({ facilityId }: { facilityId: number }) {
  const token = useCustomerAuthStore((s) => s.accessToken);
  const [sortBy, setSortBy] = useState<"newest" | "helpful" | "rating">("newest");
  const { data: reviews, isLoading: reviewsLoading } =
    useFacilityReviews(facilityId);
  const { data: stats, isLoading: statsLoading } =
    useFacilityReviewStats(facilityId);
  const { data: myReview } = useMyReview(facilityId);

  // Sort reviews client-side (the API returns newest-first by default;
  // we re-sort by helpfulness or rating here)
  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    const sorted = [...reviews];
    if (sortBy === "helpful") {
      sorted.sort((a, b) => b.helpful_count - a.helpful_count);
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    // "newest" is the default API order, no re-sort needed
    return sorted;
  }, [reviews, sortBy]);

  const reviewsList = sortedReviews;
  const statsData = stats ?? {
    facility_id: facilityId,
    average: 0,
    total: 0,
    distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  };

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-accent" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            المراجعات والتقييمات
          </CardTitle>
          {/* Sort controls — only show when there are reviews */}
          {reviewsList.length > 1 && (
            <div className="flex items-center gap-1.5">
              {[
                { key: "newest" as const, label: "الأحدث" },
                { key: "helpful" as const, label: "الأكثر فائدة" },
                { key: "rating" as const, label: "الأعلى تقييماً" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px]",
                    sortBy === opt.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats summary */}
        {statsLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : (
          <RatingSummary stats={statsData} reviewsCount={reviewsList.length} />
        )}

        {/* Review form (only when logged in) */}
        {token && (
          <ReviewForm key={`form-${myReview?.id ?? "new"}`} facilityId={facilityId} />
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : reviewsList.length === 0 ? (
          <NoReviewsYet />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {reviewsList.map((review) => (
                <ReviewCard key={review.id} review={review} facilityId={facilityId} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
