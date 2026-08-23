import { apiClient } from "./api-client";
import type { AuditLog, Paginated } from "@/types/api.generated";

export const adminService = {
  getAuditLogs: (page = 1, pageSize = 20) =>
    apiClient.get<Paginated<AuditLog>>(`/admin/audit-logs?page=${page}&page_size=${pageSize}`),
};
