import "./app.css";
import Canvas from "./components/Canvas/Canvas";
import ElementsPanel from "./components/ElementsPanel/ElementsPanel";
import PropertiesPanel from "./components/PropertiesPanel/PropertiesPanel";
import AnimationsPanel from "./components/PropertiesPanel/AnimationsPanel";
import Timeline from "./components/Timeline/Timeline";
import { useHistoryStore } from "./store/historyStore";
import { useRenderStore } from "./store/renderStore";
import { validateScene } from "./shared/validateScene";

const SAMPLE_SCENE = {
  meta: { name: "Scene 1", duration: 5 },
  objects: [
    {
      id: "obj_1",
      name: "Circle",
      type: "Circle",
      props: { radius: 2, stroke_color: "BLUE", stroke_width: 4, fill_opacity: 0 },
      transform: { position: [0, 0], scale: 1, rotation: 0 }
    }
  ],
  animations: [
    {
      id: "anim_1",
      type: "FadeIn",
      targets: ["obj_1"],
      start: 0,
      duration: 1,
      props: {}
    }
  ],
  timeline: { tracks: [{ id: "track_1", items: ["anim_1"] }] },
  settings: { fps: 30, resolution: "1080p", background_color: "BLACK" }
};

export default function App() {
  const scene = useHistoryStore((s) => s.present);
  const renderId = useRenderStore((s) => s.renderId);
  const renderStatus = useRenderStore((s) => s.status);
  const renderError = useRenderStore((s) => s.error);
  const parsed = validateScene(scene ?? SAMPLE_SCENE);

  return (
    <div className="app">
      <div className="workspace">
        <div className="leftPane">
          <ElementsPanel />
        </div>
        <div className="canvasPane">
          <Canvas />
          <Timeline />
        </div>
        <div className="propsPane">
          <div className="statusRow">Schema: {parsed.ok ? "OK" : "Invalid"}</div>
          {!parsed.ok ? <pre className="errorBox">{parsed.error}</pre> : null}
          {renderStatus === "error" ? <pre className="errorBox">{renderError}</pre> : null}
          {renderId ? (
            <div style={{ marginBottom: 12 }}>
              <div className="statusRow">Last render: {renderId}</div>
              <video
                controls
                style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb" }}
                src={`http://localhost:8000/outputs/${renderId}/video.mp4`}
              />
            </div>
          ) : null}
          <PropertiesPanel />
          <AnimationsPanel />
        </div>
      </div>
    </div>
  );
}
