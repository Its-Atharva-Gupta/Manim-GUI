import { create } from "zustand";
import type { Relationship, Scene, SceneAnimation, SceneObjectV2 } from "../../../shared/types";
import { useHistoryStore } from "./historyStore";
import { nextId } from "../utils/idGenerator";

type SceneStore = {
  selectedObjectIds: string[];
  selectObject: (objectId: string | null, additive?: boolean) => void;
  clearSelection: () => void;
  createGroupFromSelection: () => void;
  selectGroupChildren: () => void;
  addCircle: () => void;
  addText: () => void;
  addSquare: () => void;
  addRectangle: () => void;
  addTriangle: () => void;
  addRegularPolygon: () => void;
  addEllipse: () => void;
  addLine: () => void;
  addArrow: () => void;
  addVector: () => void;
  addAxes: () => void;
  addNumberPlane: () => void;
  addTex: () => void;
  addMathTex: () => void;
  addFunctionPlot: () => void;
  addBraceBetweenPoints: () => void;
  addArc: () => void;
  addAngle: () => void;
  addGraphLabel: () => void;
  addVerticalLineAtX: () => void;
  addHighlightPoint: () => void;
  addFadeIn: () => void;
  addMove: () => void;
  addFadeOut: () => void;
  addCreate: () => void;
  addWrite: () => void;
  addTransform: () => void;
  addReplacementTransform: () => void;
  addScale: () => void;
  addRotate: () => void;
  alignCenter: () => void;
  alignHorizontal: () => void;
  alignVertical: () => void;
  updateObject: (objectId: string, updater: (obj: SceneObjectV2) => SceneObjectV2) => void;
  updateAnimation: (animId: string, patch: { start?: number; duration?: number }) => void;
  updateAnimationFull: (animId: string, updater: (a: SceneAnimation) => SceneAnimation) => void;
  deleteAnimation: (animId: string) => void;
  deleteSelectedObjects: () => void;
  addRelationship: (rel: Relationship) => void;
  deleteRelationship: (relId: string) => void;
  undo: () => void;
  redo: () => void;
};

function updateScene(scene: Scene, fn: (scene: Scene) => Scene): void {
  const next = fn(scene);
  useHistoryStore.getState().push(next);
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  selectedObjectIds: [],
  selectObject: (objectId, additive = false) => {
    if (!objectId) {
      set({ selectedObjectIds: [] });
      return;
    }
    const current = get().selectedObjectIds;
    if (!additive) {
      set({ selectedObjectIds: [objectId] });
      return;
    }
    const exists = current.includes(objectId);
    set({ selectedObjectIds: exists ? current.filter((id) => id !== objectId) : [...current, objectId] });
  },
  clearSelection: () => set({ selectedObjectIds: [] }),
  createGroupFromSelection: () => {
    const selected = get().selectedObjectIds;
    if (selected.length < 2) return;
    const scene = useHistoryStore.getState().present;
    const id = nextId("obj");
    updateScene(scene, (s) => ({
      ...s,
      objects: [
        ...s.objects,
        { id, name: "Group", type: "Group", props: { children: selected }, transform: { position: [0, 0], scale: 1, rotation: 0 } }
      ]
    }));
    set({ selectedObjectIds: [id] });
  },
  selectGroupChildren: () => {
    const scene = useHistoryStore.getState().present;
    const selected = get().selectedObjectIds;
    if (selected.length !== 1) return;
    const obj = scene.objects.find((o) => o.id === selected[0]) as any;
    if (!obj || obj.type !== "Group") return;
    const children: string[] = Array.isArray(obj.props?.children) ? obj.props.children : [];
    if (children.length === 0) return;
    set({ selectedObjectIds: children });
  },
  addCircle: () => {
    const scene = useHistoryStore.getState().present;
    const id = nextId("obj");
    updateScene(scene, (s) => ({
      ...s,
      objects: [
        ...s.objects,
        {
          id,
          name: "Circle",
          type: "Circle",
          props: { radius: 2, stroke_color: "BLUE", stroke_width: 4, fill_opacity: 0 },
          transform: { position: [0, 0], scale: 1, rotation: 0 }
        }
      ]
    }));
    set({ selectedObjectIds: [id] });
  },
  addText: () => {
    const scene = useHistoryStore.getState().present;
    const id = nextId("obj");
    updateScene(scene, (s) => ({
      ...s,
      objects: [
        ...s.objects,
        {
          id,
          name: "Text",
          type: "Text",
          props: { text: "Hello", color: "WHITE", font_size: 48, stroke_width: 0 },
          transform: { position: [0, 0], scale: 1, rotation: 0 }
        }
      ]
    }));
    set({ selectedObjectIds: [id] });
  },
  addSquare: () => addGenericObject(set, "Square", { side_length: 2, stroke_color: "BLUE", stroke_width: 4, fill_opacity: 0 }),
  addRectangle: () => addGenericObject(set, "Rectangle", { width: 3, height: 2, stroke_color: "BLUE", stroke_width: 4, fill_opacity: 0 }),
  addTriangle: () => addGenericObject(set, "Triangle", { stroke_color: "BLUE", stroke_width: 4, fill_opacity: 0 }),
  addRegularPolygon: () => addGenericObject(set, "RegularPolygon", { n: 5, stroke_color: "BLUE", stroke_width: 4, fill_opacity: 0 }),
  addEllipse: () => addGenericObject(set, "Ellipse", { width: 3, height: 2, stroke_color: "BLUE", stroke_width: 4, fill_opacity: 0 }),
  addLine: () => addGenericObject(set, "Line", { start: [-2, 0], end: [2, 0], stroke_color: "WHITE", stroke_width: 4 }),
  addArrow: () => addGenericObject(set, "Arrow", { start: [-2, 0], end: [2, 0], stroke_color: "WHITE", stroke_width: 4 }),
  addVector: () => addGenericObject(set, "Vector", { start: [0, 0], end: [2, 1], stroke_color: "WHITE", stroke_width: 4 }),
  addAxes: () => addGenericObject(set, "Axes", { x_range: [-6, 6, 1], y_range: [-3.5, 3.5, 1], tips: true }),
  addNumberPlane: () => addGenericObject(set, "NumberPlane", { x_range: [-6, 6, 1], y_range: [-3.5, 3.5, 1], faded_line_ratio: 2 }),
  addTex: () => addGenericObject(set, "Tex", { tex: "E=mc^2", font_size: 48, color: "WHITE", stroke_width: 0 }),
  addMathTex: () => addGenericObject(set, "MathTex", { tex: "\\int_0^1 x^2 dx", font_size: 48, color: "WHITE", stroke_width: 0 }),
  addFunctionPlot: () => {
    const scene = useHistoryStore.getState().present;
    const axes = scene.objects.find((o: any) => o.type === "Axes");
    if (!axes) {
      get().addAxes();
      return;
    }
    const id = nextId("obj");
    updateScene(scene, (s) => ({
      ...s,
      objects: [
        ...s.objects,
        {
          id,
          name: "FunctionPlot",
          type: "FunctionPlot",
          props: { axes_id: (axes as any).id, expr: "sin(x)", domain: [-6, 6], stroke_color: "YELLOW", stroke_width: 4 },
          transform: { position: [0, 0], scale: 1, rotation: 0 }
        }
      ]
    }));
    set({ selectedObjectIds: [id] });
  },
  addBraceBetweenPoints: () =>
    addGenericObject(set, "BraceBetweenPoints", {
      a: [-2, 0],
      b: [2, 0],
      direction: "DOWN",
      color: "WHITE",
      label: { type: "MathTex", value: "d", font_size: 36, color: "WHITE" }
    }),
  addArc: () =>
    addGenericObject(set, "Arc", {
      radius: 2,
      start_angle: 0,
      angle: 1.57079632679,
      stroke_color: "WHITE",
      stroke_width: 4,
      fill_opacity: 0
    }),
  addAngle: () =>
    addGenericObject(set, "Angle", {
      a: [-1, 0],
      b: [0, 0],
      c: [0, 1],
      radius: 1,
      other_angle: false,
      stroke_color: "WHITE",
      stroke_width: 4,
      fill_opacity: 0
    }),
  addGraphLabel: () => {
    const scene = useHistoryStore.getState().present;
    const plot = scene.objects.find((o: any) => o.type === "FunctionPlot");
    if (!plot) {
      get().addFunctionPlot();
      return;
    }
    addGenericObject(set, "GraphLabel", {
      plot_id: (plot as any).id,
      x_value: 0,
      label: { type: "MathTex", value: "f(0)", font_size: 36, color: "WHITE" },
      offset: [0.3, 0.3]
    });
  },
  addVerticalLineAtX: () => {
    const scene = useHistoryStore.getState().present;
    const axes = scene.objects.find((o: any) => o.type === "Axes");
    if (!axes) {
      get().addAxes();
      return;
    }
    const plot = scene.objects.find((o: any) => o.type === "FunctionPlot" && o.props.axes_id === (axes as any).id);
    addGenericObject(set, "VerticalLineAtX", {
      axes_id: (axes as any).id,
      plot_id: plot ? (plot as any).id : undefined,
      x_value: 0,
      stroke_color: "WHITE",
      stroke_width: 3
    });
  },
  addHighlightPoint: () => {
    const scene = useHistoryStore.getState().present;
    const axes = scene.objects.find((o: any) => o.type === "Axes");
    if (!axes) {
      get().addAxes();
      return;
    }
    addGenericObject(set, "HighlightPoint", { axes_id: (axes as any).id, x_value: 0, y_value: 0, radius: 0.08, color: "YELLOW" });
  },
  addFadeIn: () => {
    const targetIds = get().selectedObjectIds;
    if (targetIds.length === 0) return;
    const scene = useHistoryStore.getState().present;
    const track = scene.timeline.tracks[0] ?? { id: "track_1", items: [] };
    updateScene(scene, (s) => {
      const ids: string[] = [];
      const anims = [...s.animations];
      for (const tid of targetIds) {
        const animId = nextId("anim");
        ids.push(animId);
        anims.push({ id: animId, type: "FadeIn", targets: [tid], start: 0, duration: 1, rate_function: "linear", props: {} });
      }
      return {
        ...s,
        animations: anims,
        timeline: {
          ...s.timeline,
          tracks:
            s.timeline.tracks.length > 0
              ? s.timeline.tracks.map((t, idx) => (idx === 0 ? { ...t, items: [...t.items, ...ids] } : t))
              : [{ ...track, items: [...track.items, ...ids] }]
        }
      };
    });
  },
  addMove: () => {
    const targetIds = get().selectedObjectIds;
    if (targetIds.length === 0) return;
    const scene = useHistoryStore.getState().present;
    const track = scene.timeline.tracks[0] ?? { id: "track_1", items: [] };
    updateScene(scene, (s) => {
      const ids: string[] = [];
      const anims = [...s.animations];
      for (const tid of targetIds) {
        const animId = nextId("anim");
        ids.push(animId);
        anims.push({ id: animId, type: "Move", targets: [tid], start: 0, duration: 1, rate_function: "linear", props: { to: [2, 0] } });
      }
      return {
        ...s,
        animations: anims,
        timeline: {
          ...s.timeline,
          tracks:
            s.timeline.tracks.length > 0
              ? s.timeline.tracks.map((t, idx) => (idx === 0 ? { ...t, items: [...t.items, ...ids] } : t))
              : [{ ...track, items: [...track.items, ...ids] }]
        }
      };
    });
  },
  addFadeOut: () => addSimpleFadeLike(get().selectedObjectIds, "FadeOut"),
  addCreate: () => addSimpleLike(get().selectedObjectIds, "Create"),
  addWrite: () => addSimpleLike(get().selectedObjectIds, "Write"),
  addTransform: () => addTransformLike(get().selectedObjectIds, "Transform"),
  addReplacementTransform: () => addTransformLike(get().selectedObjectIds, "ReplacementTransform"),
  addScale: () => addScaleLike(get().selectedObjectIds),
  addRotate: () => addRotateLike(get().selectedObjectIds),
  alignCenter: () => {
    const ids = get().selectedObjectIds;
    if (ids.length === 0) return;
    for (const targetId of ids) get().updateObject(targetId, (o) => ({ ...o, transform: { ...o.transform, position: [0, 0] } }));
  },
  alignHorizontal: () => {
    const ids = get().selectedObjectIds;
    if (ids.length === 0) return;
    for (const targetId of ids)
      get().updateObject(targetId, (o) => ({ ...o, transform: { ...o.transform, position: [o.transform.position[0], 0] } }));
  },
  alignVertical: () => {
    const ids = get().selectedObjectIds;
    if (ids.length === 0) return;
    for (const targetId of ids)
      get().updateObject(targetId, (o) => ({ ...o, transform: { ...o.transform, position: [0, o.transform.position[1]] } }));
  },
  updateObject: (objectId, updater) => {
    const scene = useHistoryStore.getState().present;
    updateScene(scene, (s) => ({
      ...s,
      objects: s.objects.map((o) => (o.id === objectId ? updater(o) : o))
    }));
  },
  updateAnimation: (animId, patch) => {
    const scene = useHistoryStore.getState().present;
    updateScene(scene, (s) => ({
      ...s,
      animations: s.animations.map((a) =>
        a.id !== animId ? a : { ...a, start: patch.start ?? a.start, duration: patch.duration ?? a.duration }
      )
    }));
  },
  updateAnimationFull: (animId, updater) => {
    const scene = useHistoryStore.getState().present;
    updateScene(scene, (s) => ({
      ...s,
      animations: s.animations.map((a) => (a.id === animId ? updater(a as any) : a))
    }));
  },
  deleteAnimation: (animId) => {
    const scene = useHistoryStore.getState().present;
    updateScene(scene, (s) => ({
      ...s,
      animations: s.animations.filter((a) => a.id !== animId),
      timeline: {
        ...s.timeline,
        tracks: s.timeline.tracks.map((t) => ({ ...t, items: t.items.filter((id) => id !== animId) }))
      }
    }));
  },
  deleteSelectedObjects: () => {
    const ids = get().selectedObjectIds;
    if (ids.length === 0) return;
    const removed = new Set(ids);
    const scene = useHistoryStore.getState().present;
    updateScene(scene, (s) => {
      const removedObjectIds = new Set(ids);

      let objects: SceneObjectV2[] = s.objects
        .filter((o) => !removed.has(o.id))
        .map((o) => {
          if (o.type !== "Group") return o;
          const children: string[] = Array.isArray((o as any).props?.children) ? (o as any).props.children : [];
          return { ...o, props: { ...(o as any).props, children: children.filter((cid) => !removed.has(cid)) } } as any;
        });

      // Cascade removals for objects that reference missing ids.
      // Also strip VerticalLineAtX.plot_id if the plot is missing so it can fall back to c2p().
      let changed = true;
      while (changed) {
        changed = false;
        const existing = new Set(objects.map((o) => o.id));
        const next: SceneObjectV2[] = [];
        for (const o of objects) {
          if (o.type === "FunctionPlot") {
            if (!existing.has((o as any).props.axes_id)) {
              changed = true;
              removedObjectIds.add(o.id);
              continue;
            }
          } else if (o.type === "GraphLabel") {
            if (!existing.has((o as any).props.plot_id)) {
              changed = true;
              removedObjectIds.add(o.id);
              continue;
            }
          } else if (o.type === "VerticalLineAtX") {
            if (!existing.has((o as any).props.axes_id)) {
              changed = true;
              removedObjectIds.add(o.id);
              continue;
            }
            const pid = (o as any).props.plot_id;
            if (pid && !existing.has(pid)) {
              changed = true;
              next.push({ ...(o as any), props: { ...(o as any).props, plot_id: undefined } });
              continue;
            }
          } else if (o.type === "HighlightPoint") {
            if (!existing.has((o as any).props.axes_id)) {
              changed = true;
              removedObjectIds.add(o.id);
              continue;
            }
          }
          next.push(o);
        }
        objects = next;
      }

      const animations = (s.animations ?? []).filter((a: any) => {
        if (!Array.isArray(a.targets) || a.targets.some((t: string) => removedObjectIds.has(t))) return false;
        if ((a.type === "Transform" || a.type === "ReplacementTransform") && removedObjectIds.has((a as any).props?.target)) return false;
        return true;
      });
      const removedAnimIds = new Set((s.animations ?? []).filter((a: any) => !animations.includes(a as any)).map((a: any) => a.id));

      const tracks = (s.timeline?.tracks ?? []).map((t) => ({
        ...t,
        items: (t.items ?? []).filter((id) => !removedAnimIds.has(id))
      }));

      const relationships = (s.relationships ?? []).filter((r: any) => {
        if (r.type === "LineBetweenObjects") return !removedObjectIds.has(r.line_id) && !removedObjectIds.has(r.a_id) && !removedObjectIds.has(r.b_id);
        if (r.type === "LabelFollowsObject") return !removedObjectIds.has(r.label_id) && !removedObjectIds.has(r.target_id);
        if (r.type === "BraceFollows") return !removedObjectIds.has(r.brace_id) && !removedObjectIds.has(r.a_id) && !removedObjectIds.has(r.b_id);
        return true;
      });

      return {
        ...s,
        objects,
        animations,
        timeline: { ...(s.timeline ?? { tracks: [] }), tracks },
        relationships
      };
    });
    set({ selectedObjectIds: [] });
  },
  addRelationship: (rel) => {
    const scene = useHistoryStore.getState().present;
    updateScene(scene, (s) => ({
      ...s,
      relationships: [...(s.relationships ?? []), rel]
    }));
  },
  deleteRelationship: (relId) => {
    const scene = useHistoryStore.getState().present;
    updateScene(scene, (s) => ({
      ...s,
      relationships: (s.relationships ?? []).filter((r) => r.id !== relId)
    }));
  },
  undo: () => {
    useHistoryStore.getState().undo();
    const selected = get().selectedObjectIds;
    if (selected.length === 0) return;
    const scene = useHistoryStore.getState().present;
    const still = selected.filter((id) => scene.objects.some((o) => o.id === id));
    if (still.length !== selected.length) set({ selectedObjectIds: still });
  },
  redo: () => {
    useHistoryStore.getState().redo();
    const selected = get().selectedObjectIds;
    if (selected.length === 0) return;
    const scene = useHistoryStore.getState().present;
    const still = selected.filter((id) => scene.objects.some((o) => o.id === id));
    if (still.length !== selected.length) set({ selectedObjectIds: still });
  }
}));

function addGenericObject(set: any, type: any, props: any) {
  const scene = useHistoryStore.getState().present;
  const id = nextId("obj");
  updateScene(scene, (s) => ({
    ...s,
    objects: [
      ...s.objects,
      { id, name: String(type), type, props, transform: { position: [0, 0], scale: 1, rotation: 0 } }
    ]
  }));
  set({ selectedObjectIds: [id] });
}

function addSimpleFadeLike(targetIds: string[], type: "FadeOut") {
  if (targetIds.length === 0) return;
  const scene = useHistoryStore.getState().present;
  const track = scene.timeline.tracks[0] ?? { id: "track_1", items: [] };
  updateScene(scene, (s) => {
    const ids: string[] = [];
    const anims = [...s.animations];
    for (const tid of targetIds) {
      const animId = nextId("anim");
      ids.push(animId);
      anims.push({ id: animId, type, targets: [tid], start: 0, duration: 1, rate_function: "linear", props: {} });
    }
    return {
      ...s,
      animations: anims,
      timeline: {
        ...s.timeline,
        tracks:
          s.timeline.tracks.length > 0
            ? s.timeline.tracks.map((t, idx) => (idx === 0 ? { ...t, items: [...t.items, ...ids] } : t))
            : [{ ...track, items: [...track.items, ...ids] }]
      }
    };
  });
}

function addSimpleLike(targetIds: string[], type: "Create" | "Write") {
  if (targetIds.length === 0) return;
  const scene = useHistoryStore.getState().present;
  const track = scene.timeline.tracks[0] ?? { id: "track_1", items: [] };
  updateScene(scene, (s) => {
    const ids: string[] = [];
    const anims = [...s.animations];
    for (const tid of targetIds) {
      const animId = nextId("anim");
      ids.push(animId);
      anims.push({ id: animId, type, targets: [tid], start: 0, duration: 1, rate_function: "linear", props: {} });
    }
    return {
      ...s,
      animations: anims,
      timeline: {
        ...s.timeline,
        tracks:
          s.timeline.tracks.length > 0
            ? s.timeline.tracks.map((t, idx) => (idx === 0 ? { ...t, items: [...t.items, ...ids] } : t))
            : [{ ...track, items: [...track.items, ...ids] }]
      }
    };
  });
}

function addTransformLike(targetIds: string[], type: "Transform" | "ReplacementTransform") {
  if (targetIds.length === 0) return;
  const scene = useHistoryStore.getState().present;
  const available = scene.objects.map((o) => o.id);
  const track = scene.timeline.tracks[0] ?? { id: "track_1", items: [] };
  updateScene(scene, (s) => {
    const ids: string[] = [];
    const anims = [...s.animations];
    for (const tid of targetIds) {
      const animId = nextId("anim");
      ids.push(animId);
      const target = available.find((id) => id !== tid) ?? tid;
      anims.push({ id: animId, type, targets: [tid], start: 0, duration: 1, rate_function: "linear", props: { target } });
    }
    return {
      ...s,
      animations: anims,
      timeline: {
        ...s.timeline,
        tracks:
          s.timeline.tracks.length > 0
            ? s.timeline.tracks.map((t, idx) => (idx === 0 ? { ...t, items: [...t.items, ...ids] } : t))
            : [{ ...track, items: [...track.items, ...ids] }]
      }
    };
  });
}

function addScaleLike(targetIds: string[]) {
  if (targetIds.length === 0) return;
  const scene = useHistoryStore.getState().present;
  const track = scene.timeline.tracks[0] ?? { id: "track_1", items: [] };
  updateScene(scene, (s) => {
    const ids: string[] = [];
    const anims = [...s.animations];
    for (const tid of targetIds) {
      const animId = nextId("anim");
      ids.push(animId);
      anims.push({ id: animId, type: "Scale", targets: [tid], start: 0, duration: 1, rate_function: "linear", props: { factor: 1.5 } });
    }
    return {
      ...s,
      animations: anims,
      timeline: {
        ...s.timeline,
        tracks:
          s.timeline.tracks.length > 0
            ? s.timeline.tracks.map((t, idx) => (idx === 0 ? { ...t, items: [...t.items, ...ids] } : t))
            : [{ ...track, items: [...track.items, ...ids] }]
      }
    };
  });
}

function addRotateLike(targetIds: string[]) {
  if (targetIds.length === 0) return;
  const scene = useHistoryStore.getState().present;
  const track = scene.timeline.tracks[0] ?? { id: "track_1", items: [] };
  updateScene(scene, (s) => {
    const ids: string[] = [];
    const anims = [...s.animations];
    for (const tid of targetIds) {
      const animId = nextId("anim");
      ids.push(animId);
      anims.push({ id: animId, type: "Rotate", targets: [tid], start: 0, duration: 1, rate_function: "linear", props: { angle: 1.57079632679 } });
    }
    return {
      ...s,
      animations: anims,
      timeline: {
        ...s.timeline,
        tracks:
          s.timeline.tracks.length > 0
            ? s.timeline.tracks.map((t, idx) => (idx === 0 ? { ...t, items: [...t.items, ...ids] } : t))
            : [{ ...track, items: [...track.items, ...ids] }]
      }
    };
  });
}
