import { create } from "zustand";

type UiState = {
  snapToCenter: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  viewMode: "editor" | "rendered";
  gridSize: number;
  snapThreshold: number;
  toggleSnapCenter: () => void;
  toggleSnapGrid: () => void;
  toggleSnapObjects: () => void;
  setViewMode: (mode: "editor" | "rendered") => void;
  setGridSize: (v: number) => void;
  moveTargetPick: { animId: string } | null;
  startMoveTargetPick: (animId: string) => void;
  clearMoveTargetPick: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  snapToCenter: false,
  snapToGrid: false,
  snapToObjects: false,
  viewMode: "editor",
  gridSize: 0.5,
  snapThreshold: 0.15,
  toggleSnapCenter: () => set({ snapToCenter: !get().snapToCenter }),
  toggleSnapGrid: () => set({ snapToGrid: !get().snapToGrid }),
  toggleSnapObjects: () => set({ snapToObjects: !get().snapToObjects }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setGridSize: (v) => set({ gridSize: Math.max(0.01, v) }),
  moveTargetPick: null,
  startMoveTargetPick: (animId) => set({ moveTargetPick: { animId } }),
  clearMoveTargetPick: () => set({ moveTargetPick: null })
}));
