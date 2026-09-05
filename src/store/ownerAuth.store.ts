"use client";

import { create } from "zustand";

const COOKIE_NAME = "wafir_owner_token";
const REFRESH_COOKIE_NAME = "wafir_owner_refresh";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

interface OwnerAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setAuth: (token: string, refreshToken?: string | null) => void;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useOwnerAuthStore = create<OwnerAuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  setAuth: (token, refreshToken = null) => {
    writeCookie(COOKIE_NAME, token, COOKIE_MAX_AGE);
    if (refreshToken) {
      writeCookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_MAX_AGE);
    }
    set({ accessToken: token, refreshToken, hydrated: true });
  },
  setTokens: (access, refresh) => {
    writeCookie(COOKIE_NAME, access, COOKIE_MAX_AGE);
    writeCookie(REFRESH_COOKIE_NAME, refresh, COOKIE_MAX_AGE);
    set({ accessToken: access, refreshToken: refresh });
  },
  clearAuth: () => {
    eraseCookie(COOKIE_NAME);
    eraseCookie(REFRESH_COOKIE_NAME);
    set({ accessToken: null, refreshToken: null });
  },
  hydrate: () => {
    const token = readCookie(COOKIE_NAME);
    const refresh = readCookie(REFRESH_COOKIE_NAME);
    set({ accessToken: token, refreshToken: refresh, hydrated: true });
  },
}));
