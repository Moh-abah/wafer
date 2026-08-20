import { apiClient } from "./api-client";
import type {
  AdminLoginResponse,
  RegisterResponse,
} from "@/types/api.generated";

export const authService = {
  // Public customer registration
  register: (data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirm: string;
    region_id: number;
  }) =>
    apiClient.post<RegisterResponse>("/auth/register", data),

  // Admin login (returns access token)
  adminLogin: (data: { identifier: string; password: string }) =>
    apiClient.post<AdminLoginResponse>("/admin/login", data),
};
