import { customerApiClient } from "./customer-api-client";
import type {
  MyReview,
  Review,
  ReviewCreatePayload,
  ReviewDeleteResponse,
  ReviewStats,
} from "@/types/api.generated";

export const reviewsService = {
  /** POST /me/reviews/{facilityId} — create or update (upsert) the user's review. */
  upsert: (facilityId: number, payload: ReviewCreatePayload) =>
    customerApiClient.post<Review>(`/me/reviews/${facilityId}`, payload),

  /** GET /me/reviews/{facilityId} — get the user's own review (or null). */
  getMine: (facilityId: number) =>
    customerApiClient.get<Review | null>(`/me/reviews/${facilityId}`),

  /** GET /me/reviews — list ALL my reviews across all facilities. */
  listAllMine: () => customerApiClient.get<MyReview[]>("/me/reviews"),

  /** DELETE /me/reviews/{facilityId} — delete the user's review. */
  deleteMine: (facilityId: number) =>
    customerApiClient.delete<ReviewDeleteResponse>(`/me/reviews/${facilityId}`),

  /** GET /facilities/{facilityId}/reviews — public list of published reviews. */
  listForFacility: (facilityId: number) =>
    customerApiClient.get<Review[]>(`/facilities/${facilityId}/reviews`),

  /** GET /facilities/{facilityId}/reviews/stats — public aggregate stats. */
  getStats: (facilityId: number) =>
    customerApiClient.get<ReviewStats>(`/facilities/${facilityId}/reviews/stats`),

  /** POST /facilities/{facilityId}/reviews/{reviewId}/vote — vote helpful/unhelpful. */
  vote: (facilityId: number, reviewId: number, isHelpful: boolean) =>
    customerApiClient.post<Review>(
      `/facilities/${facilityId}/reviews/${reviewId}/vote`,
      { is_helpful: isHelpful }
    ),
};
