import { create } from "zustand";

type PreviewState = {
  isPlaying: boolean;
  time: number;
  setTime: (t: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
};

export const usePreviewStore = create<PreviewState>((set, get) => ({
  isPlaying: false,
  time: 0,
  setTime: (t) => set({ time: Math.max(0, t) }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set({ isPlaying: !get().isPlaying })
}));

