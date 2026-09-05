"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "@/services/reviews.service";
import type { ReviewCreatePayload } from "@/types/api.generated";
import { useCustomerAuthStore } from "@/store/customerAuth.store";

const REVIEWS_LIST_KEY = (facilityId: number) =>
  ["public", "reviews", facilityId] as const;
const REVIEWS_STATS_KEY = (facilityId: number) =>
  ["public", "reviews-stats", facilityId] as const;
const MY_REVIEW_KEY = (facilityId: number) =>
  ["customer", "my-review", facilityId] as const;

/** Public list of published reviews for a facility. */
export function useFacilityReviews(facilityId: number | undefined) {
  return useQuery({
    queryKey: facilityId != null ? REVIEWS_LIST_KEY(facilityId) : ["disabled"],
    queryFn: () => reviewsService.listForFacility(facilityId!),
    enabled: facilityId != null,
    staleTime: 30_000,
  });
}

/** Public aggregate rating stats for a facility (average + distribution). */
export function useFacilityReviewStats(facilityId: number | undefined) {
  return useQuery({
    queryKey: facilityId != null ? REVIEWS_STATS_KEY(facilityId) : ["disabled"],
    queryFn: () => reviewsService.getStats(facilityId!),
    enabled: facilityId != null,
    staleTime: 60_000,
  });
}

/** Get the current user's review for a facility (or null). Only fires when
 * the customer is logged in. */
export function useMyReview(facilityId: number | undefined) {
  const token = useCustomerAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: facilityId != null ? MY_REVIEW_KEY(facilityId) : ["disabled"],
    queryFn: () => reviewsService.getMine(facilityId!),
    enabled: !!token && facilityId != null,
    staleTime: 0,
  });
}

/** List ALL reviews by the current user (across all facilities).
 * Used by the 'my reviews' section on the account page. */
export function useMyReviews() {
  const token = useCustomerAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["customer", "my-reviews"],
    queryFn: () => reviewsService.listAllMine(),
    enabled: !!token,
    staleTime: 0,
  });
}

/** Create or update the user's review (upsert). Invalidates the list + stats
 * + my-review queries on success. */
export function useUpsertReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      facilityId,
      payload,
    }: {
      facilityId: number;
      payload: ReviewCreatePayload;
    }) => reviewsService.upsert(facilityId, payload),
    onSuccess: (data, { facilityId }) => {
      qc.setQueryData(MY_REVIEW_KEY(facilityId), data);
      qc.invalidateQueries({ queryKey: REVIEWS_LIST_KEY(facilityId) });
      qc.invalidateQueries({ queryKey: REVIEWS_STATS_KEY(facilityId) });
    },
  });
}

/** Delete the user's review. Invalidates the list + stats + my-review. */
export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (facilityId: number) => reviewsService.deleteMine(facilityId),
    onSuccess: (_, facilityId) => {
      qc.setQueryData(MY_REVIEW_KEY(facilityId), null);
      qc.invalidateQueries({ queryKey: REVIEWS_LIST_KEY(facilityId) });
      qc.invalidateQueries({ queryKey: REVIEWS_STATS_KEY(facilityId) });
    },
  });
}

/** Vote on a review's helpfulness. Stores voted review IDs in localStorage
 * to prevent duplicate votes from the same browser. Invalidates the list
 * on success so the counts update. */
export function useVoteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      facilityId,
      reviewId,
      isHelpful,
    }: {
      facilityId: number;
      reviewId: number;
      isHelpful: boolean;
    }) => reviewsService.vote(facilityId, reviewId, isHelpful),
    onSuccess: (_, { facilityId }) => {
      qc.invalidateQueries({ queryKey: REVIEWS_LIST_KEY(facilityId) });
    },
  });
}

/** Check if the current browser has already voted on a review (localStorage). */
export function hasVoted(reviewId: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const voted = JSON.parse(
      localStorage.getItem("wafir_voted_reviews") || "[]"
    ) as number[];
    return voted.includes(reviewId);
  } catch {
    return false;
  }
}

/** Mark a review as voted in localStorage. */
export function markVoted(reviewId: number): void {
  if (typeof window === "undefined") return;
  try {
    const voted = JSON.parse(
      localStorage.getItem("wafir_voted_reviews") || "[]"
    ) as number[];
    if (!voted.includes(reviewId)) {
      voted.push(reviewId);
      localStorage.setItem("wafir_voted_reviews", JSON.stringify(voted));
    }
  } catch {
    // ignore
  }
}
