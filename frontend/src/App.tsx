import "./app.css";
import Canvas from "./components/Canvas/Canvas";
import ElementsPanel from "./components/ElementsPanel/ElementsPanel";
import PropertiesPanel from "./components/PropertiesPanel/PropertiesPanel";
import AnimationsPanel from "./components/PropertiesPanel/AnimationsPanel";
import RenderedVideo from "./components/RenderedVideo/RenderedVideo";
import { useHistoryStore } from "./store/historyStore";
import { useRenderStore } from "./store/renderStore";
import { useUiStore } from "./store/uiStore";
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
  const renderStatus = useRenderStore((s) => s.status);
  const renderError = useRenderStore((s) => s.error);
  const videoUrl = useRenderStore((s) => s.videoUrl);
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const clearRender = useRenderStore((s) => s.clear);
  const parsed = validateScene(scene ?? SAMPLE_SCENE);

  return (
    <div className="app">
      <div className="workspace">
        <div className="leftPane">
          <ElementsPanel />
        </div>
        <div className="canvasPane">
          {viewMode === "editor" ? (
            <>
              <Canvas />
            </>
          ) : (
            <>
              {videoUrl ? <RenderedVideo src={videoUrl} autoplay /> : null}
              <div className="renderedActions">
                <button
                  onClick={() => {
                    clearRender();
                    setViewMode("editor");
                  }}
                >
                  Back to Editor
                </button>
              </div>
            </>
          )}
        </div>
        <div className="propsPane">
          <div className="statusRow">Schema: {parsed.ok ? "OK" : "Invalid"}</div>
          {!parsed.ok ? <pre className="errorBox">{parsed.error}</pre> : null}
          {renderStatus === "error" ? <pre className="errorBox">{renderError}</pre> : null}
          <PropertiesPanel />
          <AnimationsPanel />
        </div>
      </div>
    </div>
  );
}
