import { customerApiClient } from "./customer-api-client";
import type {
  Facility,
  FavoriteCountResponse,
  FavoriteToggleResponse,
} from "@/types/api.generated";

export const favoritesService = {
  /** POST /me/favorites/{facilityId}/toggle → toggles favorite state.
   * Returns the NEW state (is_favorited: true = now favorited). */
  toggle: (facilityId: number) =>
    customerApiClient.post<FavoriteToggleResponse>(
      `/me/favorites/${facilityId}/toggle`
    ),

  /** GET /me/favorites/{facilityId}/status → current favorite state. */
  getStatus: (facilityId: number) =>
    customerApiClient.get<FavoriteToggleResponse>(
      `/me/favorites/${facilityId}/status`
    ),

  /** GET /me/favorites → list of favorited facilities (visible + approved). */
  list: () => customerApiClient.get<Facility[]>("/me/favorites"),

  /** GET /facilities/{facilityId}/favorites/count → public social-proof count. */
  count: (facilityId: number) =>
    customerApiClient.get<FavoriteCountResponse>(
      `/facilities/${facilityId}/favorites/count`
    ),
};
