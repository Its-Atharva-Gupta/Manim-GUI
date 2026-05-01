import { create } from "zustand";

import { useHistoryStore } from "./historyStore";

type RenderState = {
  status: "idle" | "running" | "success" | "error";
  renderId: string | null;
  error: string | null;
  render: () => Promise<void>;
  clear: () => void;
};

export const useRenderStore = create<RenderState>((set) => ({
  status: "idle",
  renderId: null,
  error: null,
  clear: () => set({ status: "idle", renderId: null, error: null }),
  render: async () => {
    const scene = useHistoryStore.getState().present;
    set({ status: "running", renderId: null, error: null });
    try {
      const res = await fetch("http://localhost:8000/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scene })
      });
      const text = await res.text();
      const json = safeJsonParse(text);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }
      set({ status: "success", renderId: json.id ?? null, error: null });
    } catch (e) {
      set({ status: "error", renderId: null, error: e instanceof Error ? e.message : String(e) });
    }
  }
}));

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: text || "Non-JSON response from backend" };
  }
}
