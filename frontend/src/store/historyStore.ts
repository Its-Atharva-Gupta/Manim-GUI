import { create } from "zustand";
import type { Scene } from "../../../shared/types";

type HistoryState = {
  past: Scene[];
  present: Scene;
  future: Scene[];
  push: (next: Scene) => void;
  undo: () => void;
  redo: () => void;
  setPresent: (scene: Scene) => void;
  reset: (scene: Scene) => void;
};

function cloneScene(scene: Scene): Scene {
  return structuredClone(scene);
}

const DEFAULT_SCENE: Scene = {
  meta: { name: "Scene 1", duration: 5 },
  objects: [],
  animations: [],
  timeline: { tracks: [{ id: "track_1", items: [] }] },
  settings: { fps: 30, resolution: "1080p", background_color: "BLACK" }
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: cloneScene(DEFAULT_SCENE),
  future: [],
  push: (next) =>
    set((s) => ({
      past: [...s.past, cloneScene(s.present)],
      present: cloneScene(next),
      future: []
    })),
  undo: () => {
    const { past, present, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      present: cloneScene(previous),
      future: [cloneScene(present), ...future]
    });
  },
  redo: () => {
    const { past, present, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, cloneScene(present)],
      present: cloneScene(next),
      future: future.slice(1)
    });
  },
  setPresent: (scene) => set({ present: cloneScene(scene) })
  ,
  reset: (scene) => set({ past: [], present: cloneScene(scene), future: [] })
}));
