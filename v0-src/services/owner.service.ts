/**
 * Owner service — all owner gateway API calls.
 * Uses the dedicated owner API client (wafir_owner_token cookie).
 *
 * BLOCKER: POST /owner/login endpoint does NOT exist in the OpenAPI spec.
 * The backend team needs to add this endpoint (similar to /admin/login) before
 * owner login will work. The ownerLogin method is defined here assuming the
 * same request/response shape as admin login ({ identifier, password } → TokenOut).
 */
import { ownerApiClient } from "./owner-api-client";
import type {
  TokenOut,
  Facility,
  OwnerFacilityUpdate,
  Product,
  ProductCreate,
  ProductUpdate,
  ProductAvailabilityUpdate,
  ProductImportResult,
  Paginated,
  MessageOut,
} from "@/types/api.generated";

export const ownerService = {
  /**
   * BLOCKER: This endpoint does NOT exist in the OpenAPI spec.
   * POST /api/v1/owner/login → TokenOut
   * Request body: { identifier: string; password: string }
   * Backend needs to implement this endpoint.
   */
  ownerLogin: (data: { identifier: string; password: string }) =>
    ownerApiClient.post<TokenOut>("/owner/login", data),

  getMyFacilities: () =>
    ownerApiClient.get<Facility[]>("/owner/facility"),

  getMyFacility: (id: number) =>
    ownerApiClient.get<Facility>(`/owner/facility/${id}`),

  updateMyFacility: (id: number, data: OwnerFacilityUpdate) =>
    ownerApiClient.put<Facility>(`/owner/facility/${id}`, data),

  getOwnerProducts: (facilityId: number, params?: {
    category?: string;
    search?: string;
    only_available?: boolean;
    page?: number;
    page_size?: number;
  }) => {
    const qp = new URLSearchParams();
    if (params?.category) qp.set("category", params.category);
    if (params?.search) qp.set("search", params.search);
    if (params?.only_available !== undefined) qp.set("only_available", String(params.only_available));
    if (params?.page) qp.set("page", String(params.page));
    if (params?.page_size) qp.set("page_size", String(params.page_size));
    const qs = qp.toString();
    return ownerApiClient.get<Paginated<Product>>(
      `/owner/${facilityId}/products${qs ? `?${qs}` : ""}`
    );
  },

  createProduct: (facilityId: number, data: ProductCreate) =>
    ownerApiClient.post<Product>(`/owner/${facilityId}/products`, data),

  updateProduct: (facilityId: number, productId: number, data: ProductUpdate) =>
    ownerApiClient.put<Product>(`/owner/${facilityId}/products/${productId}`, data),

  deleteProduct: (facilityId: number, productId: number) =>
    ownerApiClient.delete<MessageOut>(`/owner/${facilityId}/products/${productId}`),

  toggleProductAvailability: (facilityId: number, productId: number, data: ProductAvailabilityUpdate) =>
    ownerApiClient.patch<Product>(`/owner/${facilityId}/products/${productId}/availability`, data),

  importProducts: (facilityId: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return ownerApiClient.post<ProductImportResult>(
      `/owner/${facilityId}/products/import`,
      fd
    );
  },
};
