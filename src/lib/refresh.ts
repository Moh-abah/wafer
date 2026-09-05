/**
 * Shared refresh-token helpers used by the three auth stores
 * (admin / owner / customer). Each portal has its own refresh endpoint and
 * its own cookie pair (access + refresh), but the logic is identical:
 *
 *   1. Read the refresh token from the store.
 *   2. POST /<portal>/refresh with { refresh_token }.
 *   3. On 200, persist the new access + refresh pair (rotation).
 *   4. On any failure, clear auth so the user is sent back to login.
 *
 * A module-level in-flight promise guard prevents two concurrent 401s from
 * triggering two refresh requests simultaneously — the second caller awaits
 * the first caller's refresh result.
 */
import type { TokenOut } from "@/types/api.generated";

const API_BASE = "/api";

const inflight: Record<string, Promise<boolean> | null> = {
  admin: null,
  owner: null,
  customer: null,
};

export type Portal = "admin" | "owner" | "customer";

const REFRESH_PATH: Record<Portal, string> = {
  admin: "/admin/refresh",
  owner: "/owner/refresh",
  customer: "/auth/refresh",
};

/**
 * Attempt to refresh tokens for the given portal.
 *
 * @param getRefreshToken  returns the current refresh token string or null
 * @param setTokens         called with the new access + refresh pair on success
 * @param clearAuth         called on failure to log the user out
 * @returns true if the refresh succeeded, false otherwise
 */
export async function attemptRefresh(
  portal: Portal,
  getRefreshToken: () => string | null,
  setTokens: (access: string, refresh: string) => void,
  clearAuth: () => void,
): Promise<boolean> {
  // If a refresh is already in flight for this portal, await it instead of
  // firing a second request.
  if (inflight[portal]) {
    return inflight[portal]!;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuth();
    return false;
  }

  inflight[portal] = (async () => {
    try {
      const res = await fetch(`${API_BASE}${REFRESH_PATH[portal]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearAuth();
        return false;
      }
      const data = (await res.json()) as TokenOut;
      if (!data.access_token) {
        clearAuth();
        return false;
      }
      setTokens(data.access_token, data.refresh_token ?? refreshToken);
      return true;
    } catch {
      clearAuth();
      return false;
    } finally {
      inflight[portal] = null;
    }
  })();

  return inflight[portal]!;
}
