"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesService } from "@/services/favorites.service";
import type { Facility } from "@/types/api.generated";
import { useCustomerAuthStore } from "@/store/customerAuth.store";

const FAV_LIST_KEY = ["customer", "favorites"] as const;

/** Check if a facility is favorited by the current user.
 * Returns `false` when not logged in (no query is fired). */
export function useFavoriteStatus(facilityId: number | undefined) {
  const token = useCustomerAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["customer", "favorite-status", facilityId],
    queryFn: () => favoritesService.getStatus(facilityId!),
    enabled: !!token && facilityId != null,
    staleTime: 0,
    retry: 1,
  });
}

/** Toggle the favorite state for a facility. Invalidates the list + status
 * queries on success so the UI stays in sync. */
export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (facilityId: number) => favoritesService.toggle(facilityId),
    onSuccess: (data, facilityId) => {
      // Update the status cache optimistically
      qc.setQueryData(["customer", "favorite-status", facilityId], data);
      // Invalidate the favorites list so it refetches
      qc.invalidateQueries({ queryKey: FAV_LIST_KEY });
    },
  });
}

/** List all favorited facilities for the current user.
 * Returns an empty array when not logged in. */
export function useMyFavorites() {
  const token = useCustomerAuthStore((s) => s.accessToken);
  return useQuery<Facility[]>({
    queryKey: FAV_LIST_KEY,
    queryFn: () => favoritesService.list(),
    enabled: !!token,
    staleTime: 0,
    retry: 1,
  });
}

/** Public favorite count for a facility (social proof). No auth needed. */
export function useFavoriteCount(facilityId: number | undefined) {
  return useQuery({
    queryKey: ["public", "favorite-count", facilityId],
    queryFn: () => favoritesService.count(facilityId!),
    enabled: facilityId != null,
    staleTime: 60_000, // 1 min cache — count doesn't need to be real-time
  });
}
