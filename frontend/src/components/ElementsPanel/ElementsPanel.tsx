import { useHistoryStore } from "../../store/historyStore";
import { useRenderStore } from "../../store/renderStore";
import { useSceneStore } from "../../store/sceneStore";
import { useUiStore } from "../../store/uiStore";
import { downloadScene, readSceneFile } from "../../shared/sceneIo";
import { migrateScene } from "../../shared/migrateScene";
import { validateScene } from "../../shared/validateScene";

import "./elementsPanel.css";

export default function ElementsPanel() {
  const addCircle = useSceneStore((s) => s.addCircle);
  const addText = useSceneStore((s) => s.addText);
  const addSquare = useSceneStore((s) => s.addSquare);
  const addRectangle = useSceneStore((s) => s.addRectangle);
  const addTriangle = useSceneStore((s) => s.addTriangle);
  const addRegularPolygon = useSceneStore((s) => s.addRegularPolygon);
  const addEllipse = useSceneStore((s) => s.addEllipse);
  const addLine = useSceneStore((s) => s.addLine);
  const addArrow = useSceneStore((s) => s.addArrow);
  const addVector = useSceneStore((s) => s.addVector);
  const addAxes = useSceneStore((s) => s.addAxes);
  const addNumberPlane = useSceneStore((s) => s.addNumberPlane);
  const addFunctionPlot = useSceneStore((s) => s.addFunctionPlot);
  const addTex = useSceneStore((s) => s.addTex);
  const addMathTex = useSceneStore((s) => s.addMathTex);
  const addBraceBetweenPoints = useSceneStore((s) => s.addBraceBetweenPoints);
  const addArc = useSceneStore((s) => s.addArc);
  const addAngle = useSceneStore((s) => s.addAngle);
  const addGraphLabel = useSceneStore((s) => s.addGraphLabel);
  const addVerticalLineAtX = useSceneStore((s) => s.addVerticalLineAtX);
  const addHighlightPoint = useSceneStore((s) => s.addHighlightPoint);
  const createGroupFromSelection = useSceneStore((s) => s.createGroupFromSelection);
  const selectGroupChildren = useSceneStore((s) => s.selectGroupChildren);
  const addRelationship = useSceneStore((s) => s.addRelationship);
  const deleteRelationship = useSceneStore((s) => s.deleteRelationship);
  const selectedIds = useSceneStore((s) => s.selectedObjectIds);
  const alignCenter = useSceneStore((s) => s.alignCenter);
  const alignHorizontal = useSceneStore((s) => s.alignHorizontal);
  const alignVertical = useSceneStore((s) => s.alignVertical);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);

  const scene = useHistoryStore((s) => s.present);
  const reset = useHistoryStore((s) => s.reset);

  const render = useRenderStore((s) => s.render);
  const renderStatus = useRenderStore((s) => s.status);
  const snapToCenter = useUiStore((s) => s.snapToCenter);
  const snapToGrid = useUiStore((s) => s.snapToGrid);
  const snapToObjects = useUiStore((s) => s.snapToObjects);
  const gridSize = useUiStore((s) => s.gridSize);
  const toggleSnapCenter = useUiStore((s) => s.toggleSnapCenter);
  const toggleSnapGrid = useUiStore((s) => s.toggleSnapGrid);
  const toggleSnapObjects = useUiStore((s) => s.toggleSnapObjects);
  const setGridSize = useUiStore((s) => s.setGridSize);

  return (
    <div className="elementsRoot">
      <div className="panelTitle">Elements</div>

      <div className="section">
        <div className="sectionTitle">Shapes</div>
        <button onClick={addCircle}>Circle</button>
        <button onClick={addSquare}>Square</button>
        <button onClick={addRectangle}>Rectangle</button>
        <button onClick={addTriangle}>Triangle</button>
        <button onClick={addRegularPolygon}>RegularPolygon</button>
        <button onClick={addEllipse}>Ellipse</button>
      </div>

      <div className="section">
        <div className="sectionTitle">Lines</div>
        <button onClick={addLine}>Line</button>
        <button onClick={addArrow}>Arrow</button>
        <button onClick={addVector}>Vector</button>
      </div>

      <div className="section">
        <div className="sectionTitle">Math</div>
        <button onClick={addText}>Text</button>
        <button onClick={addTex}>Tex</button>
        <button onClick={addMathTex}>MathTex</button>
        <button onClick={addBraceBetweenPoints}>Brace</button>
        <button onClick={addArc}>Arc</button>
        <button onClick={addAngle}>Angle</button>
      </div>

      <div className="section">
        <div className="sectionTitle">Graphs</div>
        <button onClick={addAxes}>Axes</button>
        <button onClick={addNumberPlane}>NumberPlane</button>
        <button onClick={addFunctionPlot}>Function Plot</button>
        <button onClick={addGraphLabel}>Graph Label</button>
        <button onClick={addVerticalLineAtX}>Vertical Line</button>
        <button onClick={addHighlightPoint}>Highlight Point</button>
      </div>

      <div className="section">
        <div className="sectionTitle">Align</div>
        <button onClick={alignCenter}>Center</button>
        <button onClick={alignHorizontal}>Horizontal</button>
        <button onClick={alignVertical}>Vertical</button>
        <button onClick={createGroupFromSelection}>Create Group</button>
        <button onClick={selectGroupChildren}>Select Group Items</button>
      </div>

      <div className="section">
        <div className="sectionTitle">Snapping</div>
        <button onClick={toggleSnapCenter}>{snapToCenter ? "Snap Center: ON" : "Snap Center: OFF"}</button>
        <button onClick={toggleSnapGrid}>{snapToGrid ? "Snap Grid: ON" : "Snap Grid: OFF"}</button>
        <button onClick={toggleSnapObjects}>{snapToObjects ? "Snap Objects: ON" : "Snap Objects: OFF"}</button>
        <label className="row2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <span style={{ fontSize: 12, color: "#374151" }}>Grid</span>
          <input
            type="number"
            value={gridSize}
            step={0.1}
            min={0.01}
            onChange={(e) => setGridSize(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="section">
        <div className="sectionTitle">Relationships</div>
        <button
          onClick={() => {
            const objs = scene.objects.filter((o) => selectedIds.includes((o as any).id)) as any[];
            const line = objs.find((o) => o.type === "Line" || o.type === "Arrow" || o.type === "Vector");
            const points = objs.filter((o) => o.type !== "Line" && o.type !== "Arrow" && o.type !== "Vector" && o.transform?.position);
            if (!line || points.length < 2) return;
            addRelationship({ id: `rel_${Date.now()}`, type: "LineBetweenObjects", line_id: line.id, a_id: points[0].id, b_id: points[1].id });
          }}
          title="Select a line + 2 objects, then click"
        >
          LineBetweenObjects
        </button>
        <button
          onClick={() => {
            const objs = scene.objects.filter((o) => selectedIds.includes((o as any).id)) as any[];
            const label = objs.find((o) => o.type === "Text" || o.type === "Tex" || o.type === "MathTex");
            const target = objs.find((o) => o.id !== label?.id && o.transform?.position);
            if (!label || !target) return;
            addRelationship({ id: `rel_${Date.now()}`, type: "LabelFollowsObject", label_id: label.id, target_id: target.id, offset: [0.3, 0.3] });
          }}
          title="Select a label object + a target object"
        >
          LabelFollows
        </button>
        <button
          onClick={() => {
            const objs = scene.objects.filter((o) => selectedIds.includes((o as any).id)) as any[];
            const brace = objs.find((o) => o.type === "BraceBetweenPoints");
            const targets = objs.filter((o) => o.id !== brace?.id && o.transform?.position);
            if (!brace || targets.length < 2) return;
            addRelationship({ id: `rel_${Date.now()}`, type: "BraceFollows", brace_id: brace.id, a_id: targets[0].id, b_id: targets[1].id, direction: brace.props?.direction ?? "DOWN" });
          }}
          title="Select a brace + 2 objects"
        >
          BraceFollows
        </button>

        {(scene.relationships ?? []).length ? (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {(scene.relationships ?? []).slice(-6).map((r: any) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                <span style={{ color: "#374151" }}>{r.type}</span>
                <button style={{ height: 22 }} onClick={() => deleteRelationship(r.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="section">
        <div className="sectionTitle">History</div>
        <div className="row2">
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
        </div>
      </div>

      <div className="section">
        <div className="sectionTitle">Project</div>
        <button onClick={() => downloadScene(scene)}>Save JSON</button>
        <label className="fileLabel">
          <input
            type="file"
            accept="application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.currentTarget.value = "";
              if (!file) return;
              const parsed = await readSceneFile(file);
              const migrated = migrateScene(parsed);
              const ok = validateScene(migrated);
              if (!ok.ok) {
                alert(ok.error);
                return;
              }
              reset(migrated as any);
            }}
          />
          Load JSON
        </label>
      </div>

      <div className="section">
        <div className="sectionTitle">Render</div>
        <button onClick={render} disabled={renderStatus === "running"}>
          {renderStatus === "running" ? "Rendering…" : "Render"}
        </button>
      </div>
    </div>
  );
}
