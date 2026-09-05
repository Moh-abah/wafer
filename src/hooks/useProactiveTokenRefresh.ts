"use client";

import { useEffect, useRef } from "react";
import { attemptRefresh, type Portal } from "@/lib/refresh";
import { useAuthStore } from "@/store/auth.store";
import { useOwnerAuthStore } from "@/store/ownerAuth.store";
import { useCustomerAuthStore } from "@/store/customerAuth.store";

/** Decode a JWT's payload without verifying (we trust the server-issued token
 * we already hold). Returns the `exp` (expiry) in seconds, or null if the
 * token can't be decoded. */
function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // base64url → base64 → JSON
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = JSON.parse(
      atob(payloadB64)
    ) as { exp?: number };
    if (typeof payloadJson.exp === "number") {
      return payloadJson.exp; // seconds since epoch
    }
    return null;
  } catch {
    return null;
  }
}

interface PortalConfig {
  /** Whether this portal has an access token (and thus might need refresh). */
  hasToken: () => boolean;
  getRefreshToken: () => string | null;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
}

const PORTALS: Record<Portal, PortalConfig> = {
  admin: {
    hasToken: () => !!useAuthStore.getState().accessToken,
    getRefreshToken: () => useAuthStore.getState().refreshToken,
    setTokens: (a, r) => useAuthStore.getState().setTokens(a, r),
    clearAuth: () => useAuthStore.getState().clearAuth(),
  },
  owner: {
    hasToken: () => !!useOwnerAuthStore.getState().accessToken,
    getRefreshToken: () => useOwnerAuthStore.getState().refreshToken,
    setTokens: (a, r) => useOwnerAuthStore.getState().setTokens(a, r),
    clearAuth: () => useOwnerAuthStore.getState().clearAuth(),
  },
  customer: {
    hasToken: () => !!useCustomerAuthStore.getState().accessToken,
    getRefreshToken: () => useCustomerAuthStore.getState().refreshToken,
    setTokens: (a, r) => useCustomerAuthStore.getState().setTokens(a, r),
    clearAuth: () => useCustomerAuthStore.getState().clearAuth(),
  },
};

/**
 * Proactively refreshes the access token ~60 seconds before it expires,
 * so the user never sees a 401 mid-action.
 *
 * Mount this hook ONCE at the app root (it's already wired in the customer
 * layout + admin layout + owner layout). It uses a single interval timer that
 * checks all three portals every 30 seconds; if any portal's access token is
 * within 60 seconds of expiry (or already expired), it triggers a refresh.
 *
 * The hook is idempotent — if multiple layouts mount it, the per-portal
 * in-flight guard in `attemptRefresh` deduplicates concurrent refreshes.
 */
export function useProactiveTokenRefresh(): void {
  // Keep a ref to the interval so we only log once per refresh event
  const lastRefreshRef = useRef<Record<Portal, number>>({
    admin: 0,
    owner: 0,
    customer: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const CHECK_INTERVAL_MS = 30_000; // 30 seconds
    const REFRESH_BUFFER_MS = 60_000; // refresh 60s before expiry

    const checkAndRefresh = async () => {
      const now = Date.now();
      for (const portal of ["admin", "owner", "customer"] as Portal[]) {
        const cfg = PORTALS[portal];
        if (!cfg.hasToken()) continue;

        // Read the current access token to check its expiry
        // (We re-read from the store on each check in case it was already refreshed by a 401 handler)
        const store =
          portal === "admin"
            ? useAuthStore.getState()
            : portal === "owner"
            ? useOwnerAuthStore.getState()
            : useCustomerAuthStore.getState();
        const access = store.accessToken;
        if (!access) continue;

        const exp = getTokenExpiry(access);
        if (exp === null) continue; // can't decode, skip

        const expMs = exp * 1000;
        const msUntilExpiry = expMs - now;

        // If token expires within the next 60s (or is already expired), refresh
        if (msUntilExpiry <= REFRESH_BUFFER_MS) {
          // Throttle: don't refresh the same portal more than once per 30s
          if (now - lastRefreshRef.current[portal] < 30_000) continue;
          lastRefreshRef.current[portal] = now;

          // Fire-and-forget; the attemptRefresh helper deduplicates concurrent calls
          attemptRefresh(portal, cfg.getRefreshToken, cfg.setTokens, cfg.clearAuth).catch(
            () => {
              // errors are already handled inside attemptRefresh (clears auth on failure)
            }
          );
        }
      }
    };

    // Run once on mount (in case the token is already near expiry at page load)
    checkAndRefresh();

    const id = window.setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    // Also re-check on window focus (user may have been away for a while)
    const onFocus = () => checkAndRefresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
}
