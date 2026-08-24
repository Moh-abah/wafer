import { apiClient } from "./api-client";
import type {
  AuditLog,
  Facility,
  FacilityType,
  Paginated,
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
};
