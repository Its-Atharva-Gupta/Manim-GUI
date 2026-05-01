import { create } from "zustand";

type UiState = {
  snapToCenter: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  gridSize: number;
  snapThreshold: number;
  toggleSnapCenter: () => void;
  toggleSnapGrid: () => void;
  toggleSnapObjects: () => void;
  setGridSize: (v: number) => void;
  moveTargetPick: { animId: string } | null;
  startMoveTargetPick: (animId: string) => void;
  clearMoveTargetPick: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  snapToCenter: false,
  snapToGrid: false,
  snapToObjects: false,
  gridSize: 0.5,
  snapThreshold: 0.15,
  toggleSnapCenter: () => set({ snapToCenter: !get().snapToCenter }),
  toggleSnapGrid: () => set({ snapToGrid: !get().snapToGrid }),
  toggleSnapObjects: () => set({ snapToObjects: !get().snapToObjects }),
  setGridSize: (v) => set({ gridSize: Math.max(0.01, v) }),
  moveTargetPick: null,
  startMoveTargetPick: (animId) => set({ moveTargetPick: { animId } }),
  clearMoveTargetPick: () => set({ moveTargetPick: null })
}));
