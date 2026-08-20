"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";
import { getAuditLabel } from "@/lib/audit-labels";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-64" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export function AuditTable() {
  const { data, isLoading, error, refetch } = useAdminAuditLogs();
  const items = data?.items ?? [];

  return (
    <div className="max-h-[70vh] overflow-auto rounded-lg border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead>النوع</TableHead>
            <TableHead>التفاصيل</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>التاريخ</TableHead>
          </TableRow>
        </TableHeader>
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-destructive">
                    تعذّر تحميل سجل العمليات.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : items.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                لا توجد عمليات مسجّلة.
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {items.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant="outline">{getAuditLabel(log.action_type)}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">
                  {log.details
                    ? typeof log.details === "string"
                      ? log.details
                      : JSON.stringify(log.details)
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">
                  {log.ip_address || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(log.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
