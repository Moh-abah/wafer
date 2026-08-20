"use client";

import { RefreshCcw, MoreHorizontal, ShieldCheck, UserIcon, Store } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminUsers, useUpdateUserRole } from "@/hooks/useAdminUsers";
import type { User, UserRole } from "@/types/api.generated";

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

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "مشرف",
  owner: "مالك",
  customer: "عميل",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  owner: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
  customer: "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200",
};

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <ShieldCheck className="h-3.5 w-3.5" />,
  owner: <Store className="h-3.5 w-3.5" />,
  customer: <UserIcon className="h-3.5 w-3.5" />,
};

const ROLES: UserRole[] = ["admin", "owner", "customer"];

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

interface UsersTableProps {
  search?: string;
}

export function UsersTable({ search }: UsersTableProps) {
  const { data, isLoading, error, refetch } = useAdminUsers(search);
  const updateRole = useUpdateUserRole();
  const items = data?.items ?? [];

  function handleChangeRole(user: User, newRole: UserRole) {
    if (user.role === newRole) return;
    updateRole.mutate({ userId: user.id, role: newRole });
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-lg border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد</TableHead>
            <TableHead>الجوال</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>تاريخ التسجيل</TableHead>
            <TableHead className="w-10"> </TableHead>
          </TableRow>
        </TableHeader>
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-destructive">
                    تعذّر تحميل المستخدمين.
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
                colSpan={6}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                لا يوجد مستخدمون.
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name}
                </TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">
                  {user.email}
                </TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">
                  {user.phone || "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={ROLE_COLORS[user.role]}
                  >
                    <span className="flex items-center gap-1">
                      {ROLE_ICONS[user.role]}
                      {ROLE_LABELS[user.role]}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">تغيير الدور</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>تغيير الدور</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ROLES.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleChangeRole(user, role)}
                          disabled={user.role === role || updateRole.isPending}
                          className="gap-2"
                        >
                          {ROLE_ICONS[role]}
                          {ROLE_LABELS[role]}
                          {user.role === role && (
                            <span className="mr-auto text-xs text-muted-foreground">
                              الحالي
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
