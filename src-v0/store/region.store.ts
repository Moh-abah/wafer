"use client";

import { create } from "zustand";

interface RegionState {
  selectedRegionId: number | null;
  setSelectedRegion: (id: number | null) => void;
}

export const useRegionStore = create<RegionState>((set) => ({
  selectedRegionId: null,
  setSelectedRegion: (id) => set({ selectedRegionId: id }),
}));
