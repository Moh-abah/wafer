"use client";

import { useState, useCallback } from "react";
import type { Facility } from "@/types/api.generated";

const STORAGE_KEY = "wafir_recently_viewed_facilities";
const MAX_ITEMS = 6;

/** Stored entry — just the facility fields needed for display. */
export interface RecentlyViewedItem {
  id: number;
  name: string;
  type: string;
  image_url: string | null;
  viewed_at: number; // epoch ms
}

function readFromStorage(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function writeToStorage(items: RecentlyViewedItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/** Track a facility view. Moves it to the front of the list, deduplicates,
 * and caps at MAX_ITEMS. */
export function trackFacilityView(facility: Facility): void {
  if (typeof window === "undefined") return;
  const items = readFromStorage();
  const filtered = items.filter((i) => i.id !== facility.id);
  const newItem: RecentlyViewedItem = {
    id: facility.id,
    name: facility.name,
    type: facility.type,
    image_url: facility.image_url,
    viewed_at: Date.now(),
  };
  writeToStorage([newItem, ...filtered].slice(0, MAX_ITEMS));
}

/** Hook returning the recently viewed facilities (max 6). */
export function useRecentlyViewedFacilities(): {
  items: RecentlyViewedItem[];
  refresh: () => void;
  clear: () => void;
} {
  // Use lazy initial state to read from localStorage on first render
  // (avoids setState-in-effect lint violation).
  const [items, setItems] = useState<RecentlyViewedItem[]>(() =>
    readFromStorage()
  );

  const refresh = useCallback(() => {
    setItems(readFromStorage());
  }, []);

  const clear = useCallback(() => {
    writeToStorage([]);
    setItems([]);
  }, []);

  return { items, refresh, clear };
}

/** Remove the recently viewed list (used by a "clear" button). */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
