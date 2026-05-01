import { useMemo } from "react";

import { useHistoryStore } from "../../store/historyStore";
import { useSceneStore } from "../../store/sceneStore";
import { useUiStore } from "../../store/uiStore";

import "./animationsPanel.css";

export default function AnimationsPanel() {
  const scene = useHistoryStore((s) => s.present);
  const selectedObjectIds = useSceneStore((s) => s.selectedObjectIds);
  const addFadeIn = useSceneStore((s) => s.addFadeIn);
  const addMove = useSceneStore((s) => s.addMove);
  const addFadeOut = useSceneStore((s) => s.addFadeOut);
  const addCreate = useSceneStore((s) => s.addCreate);
  const addWrite = useSceneStore((s) => s.addWrite);
  const addTransform = useSceneStore((s) => s.addTransform);
  const addReplacementTransform = useSceneStore((s) => s.addReplacementTransform);
  const addScale = useSceneStore((s) => s.addScale);
  const addRotate = useSceneStore((s) => s.addRotate);
  const updateAnimationFull = useSceneStore((s) => s.updateAnimationFull);
  const deleteAnimation = useSceneStore((s) => s.deleteAnimation);
  const objects = scene.objects;
  const startMoveTargetPick = useUiStore((s) => s.startMoveTargetPick);
  const moveTargetPick = useUiStore((s) => s.moveTargetPick);

  const selectedAnims = useMemo(() => {
    if (selectedObjectIds.length === 0) return [];
    const set = new Set(selectedObjectIds);
    return scene.animations.filter((a) => a.targets.some((t) => set.has(t)));
  }, [scene.animations, selectedObjectIds]);

  return (
    <div className="animPanel">
      <div className="animHeader">Animations</div>
      {selectedObjectIds.length === 0 ? (
        <div className="animEmpty">Select an object to add animations.</div>
      ) : (
        <>
          <div className="animButtons">
            <button onClick={addFadeIn}>FadeIn</button>
            <button onClick={addFadeOut}>FadeOut</button>
            <button onClick={addMove}>Move</button>
            <button onClick={addCreate}>Create</button>
            <button onClick={addWrite}>Write</button>
            <button onClick={addTransform}>Transform</button>
            <button onClick={addReplacementTransform}>ReplTransform</button>
            <button onClick={addScale}>Scale</button>
            <button onClick={addRotate}>Rotate</button>
          </div>
          <div className="animList">
            {selectedAnims.length === 0 ? (
              <div className="animEmpty">No animations for selection.</div>
            ) : (
              selectedAnims.map((a) => (
                <div key={a.id} className="animRow">
                  <div className="animType">{a.type}</div>
                  <div className="animMeta">{a.start.toFixed(2)}s</div>
                  <input
                    type="number"
                    style={{ width: 70 }}
                    value={a.duration}
                    step={0.1}
                    min={0}
                    onChange={(e) =>
                      updateAnimationFull(a.id, (anim: any) => ({ ...anim, duration: Math.max(0, Number(e.target.value)) }))
                    }
                    title="Duration (s)"
                  />
                  {a.type === "Move" ? (
                    <button
                      style={{ height: 26 }}
                      onClick={() => startMoveTargetPick(a.id)}
                      title="Click, then click on canvas to set target position"
                    >
                      {moveTargetPick?.animId === a.id ? "Picking…" : "Set Target"}
                    </button>
                  ) : null}
                  {a.type === "Transform" || a.type === "ReplacementTransform" ? (
                    <select
                      value={(a as any).props?.target ?? ""}
                      onChange={(e) =>
                        updateAnimationFull(a.id, (anim: any) => ({
                          ...anim,
                          props: { ...(anim.props ?? {}), target: e.target.value }
                        }))
                      }
                      title="Target"
                    >
                      {objects.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.id})
                        </option>
                      ))}
                    </select>
                  ) : null}
                  {a.type === "Scale" ? (
                    <input
                      type="number"
                      style={{ width: 70 }}
                      value={(a as any).props?.factor ?? 1}
                      step={0.1}
                      onChange={(e) =>
                        updateAnimationFull(a.id, (anim: any) => ({
                          ...anim,
                          props: { ...(anim.props ?? {}), factor: Number(e.target.value) }
                        }))
                      }
                      title="Factor"
                    />
                  ) : null}
                  {a.type === "Rotate" ? (
                    <input
                      type="number"
                      style={{ width: 70 }}
                      value={(a as any).props?.angle ?? 0}
                      step={0.1}
                      onChange={(e) =>
                        updateAnimationFull(a.id, (anim: any) => ({
                          ...anim,
                          props: { ...(anim.props ?? {}), angle: Number(e.target.value) }
                        }))
                      }
                      title="Angle (radians)"
                    />
                  ) : null}
                  <select
                    value={(a as any).rate_function ?? "linear"}
                    onChange={(e) =>
                      updateAnimationFull(a.id, (anim: any) => ({ ...anim, rate_function: e.target.value }))
                    }
                  >
                    <option value="linear">linear</option>
                    <option value="smooth">smooth</option>
                    <option value="rush_into">rush_into</option>
                    <option value="rush_from">rush_from</option>
                  </select>
                  <button
                    style={{ height: 26, border: "1px solid #fecaca", background: "#fff" }}
                    onClick={() => deleteAnimation(a.id)}
                    title="Delete animation"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
