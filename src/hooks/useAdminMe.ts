"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import type {
  AdminChangePasswordPayload,
  AdminMe,
  AdminUpdateMePayload,
} from "@/types/api.generated";
import { useToast } from "@/hooks/use-toast";

const KEY = ["admin", "me"] as const;

/** GET /admin/me — current admin profile (replaces hardcoded data). */
export function useAdminMe() {
  return useQuery<AdminMe>({
    queryKey: KEY,
    queryFn: () => adminService.getMe(),
    staleTime: 30_000,
    retry: 1,
  });
}

/** PUT /admin/me — update full_name and/or phone. */
export function useUpdateAdminMe() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: AdminUpdateMePayload) => adminService.updateMe(payload),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
      qc.invalidateQueries({ queryKey: KEY });
      toast({ title: "تم حفظ الملف الشخصي" });
    },
    onError: () => {
      toast({ title: "تعذّر حفظ الملف الشخصي", variant: "destructive" });
    },
  });
}

/** POST /admin/me/password — change password (verifies current server-side). */
export function useChangeAdminPassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: AdminChangePasswordPayload) =>
      adminService.changePassword(payload),
    onSuccess: () => {
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
    },
    onError: () => {
      toast({
        title: "تعذّر تغيير كلمة المرور",
        description: "تأكد من صحة كلمة المرور الحالية",
        variant: "destructive",
      });
    },
  });
}
