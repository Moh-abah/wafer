"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

const KEY = ["admin", "reviews"] as const;

/** List all reviews for admin moderation (published + unpublished). */
export function useAdminReviews(params?: {
  facility_id?: number;
  is_published?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => adminService.listReviews(params),
    staleTime: 0,
  });
}

/** Publish a review (make visible publicly). */
export function usePublishReview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (reviewId: number) => adminService.publishReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast({ title: "تم نشر المراجعة" });
    },
  });
}

/** Unpublish a review (hide from public, keep in DB). */
export function useUnpublishReview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (reviewId: number) => adminService.unpublishReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast({ title: "تم إخفاء المراجعة" });
    },
  });
}

/** Permanently delete a review. */
export function useDeleteReview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (reviewId: number) => adminService.deleteReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast({ title: "تم حذف المراجعة" });
    },
  });
}
