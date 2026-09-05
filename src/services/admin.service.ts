import { apiClient } from "./api-client";
import type {
  AdminChangePasswordPayload,
  AdminMe,
  AdminUpdateMePayload,
  AuditLog,
  Facility,
  FacilityType,
  MessageOut,
  Paginated,
  Review,
} from "@/types/api.generated";

/* ════════════════════════════════════════════════════════════════ */
/*  طلبات المنشآت المعلّقة (موافقة/رفض المشرف)                        */
/* ════════════════════════════════════════════════════════════════ */

/**
 * عنصر منشأة معلّقة كما يعيده GET /admin/facilities/pending —
 * مثل Facility مع حقول بيانات المالك مدمجة فيه.
 */
export interface PendingFacility {
  id: number;
  name: string;
  type: FacilityType;
  region_id: number;
  description: string | null;
  is_visible: boolean;
  owner_id: number | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  rejection_reason: string | null;
  created_at: string;
}

/** PATCH /admin/facilities/{id}/approve | reject → المنشأة بعد التحديث */
export type FacilityModerationResult = Facility;

export const adminService = {
  getAuditLogs: (page = 1, pageSize = 20) =>
    apiClient.get<Paginated<AuditLog>>(`/admin/audit-logs?page=${page}&page_size=${pageSize}`),

  /**
   * قائمة المنشآت المعلّقة بانتظار موافقة المشرف.
   * GET /admin/facilities/pending → {items, total, page, pages}
   */
  getPendingFacilities: (page = 1, pageSize = 20) =>
    apiClient.get<Paginated<PendingFacility>>(
      `/admin/facilities/pending?page=${page}&page_size=${pageSize}`
    ),

  /**
   * قبول منشأة معلّقة.
   * PATCH /admin/facilities/{id}/approve → 200 المنشأة المحدّثة
   * (404 «المنشأة غير موجودة» تصل كـ ApiError برسالة عربية).
   */
  approveFacility: (id: number) =>
    apiClient.patch<FacilityModerationResult>(
      `/admin/facilities/${id}/approve`
    ),

  /**
   * رفض منشأة معلّقة مع السبب.
   * PATCH /admin/facilities/{id}/reject بجسم {reason} → 200 المنشأة المحدّثة
   * (422 عند سبب فارغ — يُعرض برسالة عربية واضحة).
   */
  rejectFacility: (id: number, reason: string) =>
    apiClient.patch<FacilityModerationResult>(
      `/admin/facilities/${id}/reject`,
      { reason }
    ),

  /* ════════════════════════════════════════════════════════════════ */
  /*  ملف المشرف الشخصي (/admin/me)                                    */
  /* ════════════════════════════════════════════════════════════════ */

  /**
   * جلب بيانات المشرف الحالي.
   * GET /admin/me → AdminMe
   */
  getMe: () => apiClient.get<AdminMe>("/admin/me"),

  /**
   * تحديث الاسم المعروض و/أو الهاتف للمشرف (البريد غير قابل للتعديل).
   * PUT /admin/me → AdminMe
   */
  updateMe: (payload: AdminUpdateMePayload) =>
    apiClient.put<AdminMe>("/admin/me", payload),

  /**
   * تغيير كلمة المرور بعد التحقق من كلمة المرور الحالية.
   * POST /admin/me/password → MessageOut
   */
  changePassword: (payload: AdminChangePasswordPayload) =>
    apiClient.post<MessageOut>("/admin/me/password", payload),

  /* ════════════════════════════════════════════════════════════════ */
  /*  إدارة المراجعات (للمشرف)                                         */
  /* ════════════════════════════════════════════════════════════════ */

  /**
   * قائمة كل المراجعات (منشورة + غير منشورة) للإشراف.
   * GET /admin/reviews → {items, total}
   */
  listReviews: (params?: {
    facility_id?: number;
    is_published?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.facility_id != null)
      qs.set("facility_id", String(params.facility_id));
    if (params?.is_published != null)
      qs.set("is_published", String(params.is_published));
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    const q = qs.toString();
    return apiClient.get<{ items: Review[]; total: number }>(
      `/admin/reviews${q ? `?${q}` : ""}`
    );
  },

  /**
   * نشر مراجعة (إظهارها للعامة).
   * PATCH /admin/reviews/{id}/publish → Review
   */
  publishReview: (reviewId: number) =>
    apiClient.patch<Review>(`/admin/reviews/${reviewId}/publish`),

  /**
   * إخفاء مراجعة (تبقى في قاعدة البيانات لكن لا تُعرض للعامة).
   * PATCH /admin/reviews/{id}/unpublish → Review
   */
  unpublishReview: (reviewId: number) =>
    apiClient.patch<Review>(`/admin/reviews/${reviewId}/unpublish`),

  /**
   * حذف مراجعة نهائياً.
   * DELETE /admin/reviews/{id} → {detail, deleted}
   */
  deleteReview: (reviewId: number) =>
    apiClient.delete<{ detail: string; deleted: boolean }>(
      `/admin/reviews/${reviewId}`
    ),
};
