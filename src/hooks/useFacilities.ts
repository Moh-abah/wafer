"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import type { Facility, FacilityType } from "@/types/api.generated";
import { useRegionStore } from "@/store/region.store";

/** Build the facilities URL with optional search + type filter query params. */
function buildFacilitiesUrl(
  regionId: number,
  search?: string,
  type?: FacilityType | "all"
): string {
  const params = new URLSearchParams({ region_id: String(regionId) });
  if (search && search.trim()) {
    params.set("search", search.trim());
  }
  if (type && type !== "all") {
    params.set("type", type);
  }
  return `/facilities?${params.toString()}`;
}

/** Load all visible+approved facilities for the selected region (cached).
 * No search/filter — uses the cache. */
export function useFacilities() {
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);

  return useQuery({
    queryKey: ["facilities", selectedRegionId],
    queryFn: () =>
      apiClient.get<Facility[]>(
        buildFacilitiesUrl(selectedRegionId!)
      ),
    enabled: !!selectedRegionId,
    staleTime: 60 * 1000,
  });
}

/** Load facilities with optional search + type filter. Bypasses the cache
 * on the server when search or type is provided.
 *
 * @param search  facility name search (partial match, case-insensitive)
 * @param type    facility type filter ("all" = no filter)
 */
export function useFacilitiesSearch(
  search: string,
  type: FacilityType | "all"
) {
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);

  return useQuery({
    queryKey: ["facilities", "search", selectedRegionId, search, type],
    queryFn: () =>
      apiClient.get<Facility[]>(
        buildFacilitiesUrl(selectedRegionId!, search, type)
      ),
    enabled: !!selectedRegionId,
    staleTime: 30 * 1000, // shorter cache for search results
  });
}

/** Load similar facilities to a given facility (same type + region).
 * Used by the facility detail page's "similar facilities" section. */
export function useSimilarFacilities(facilityId: number | undefined) {
  return useQuery({
    queryKey: ["facilities", "similar", facilityId],
    queryFn: () =>
      apiClient.get<Facility[]>(`/facilities/${facilityId}/similar?limit=6`),
    enabled: facilityId != null,
    staleTime: 60 * 1000,
  });
}
