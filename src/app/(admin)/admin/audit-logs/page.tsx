"use client";

import { AuditTable } from "@/components/admin/AuditTable";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">سجل العمليات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سجل عمليات الدخول والإضافة والتعديل والحذف على لوحة التحكم.
        </p>
      </div>

      <AuditTable />

      <p className="text-xs text-muted-foreground">
        يتم تحديث السجل تلقائيًا عند العودة للنافذة.
      </p>
    </div>
  );
}
