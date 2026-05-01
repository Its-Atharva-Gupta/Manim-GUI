import { useMemo } from "react";

import { useHistoryStore } from "../../store/historyStore";
import { useSceneStore } from "../../store/sceneStore";
import DragNumberInput from "./DragNumberInput";

import "./properties.css";

export default function PropertiesPanel() {
  const scene = useHistoryStore((s) => s.present);
  const selectedObjectIds = useSceneStore((s) => s.selectedObjectIds);
  const updateObject = useSceneStore((s) => s.updateObject);

  const selected = useMemo(
    () => scene.objects.find((o) => o.id === selectedObjectIds[0]) ?? null,
    [scene.objects, selectedObjectIds]
  );

  if (!selected) {
    return <div className="panelEmpty">Select an object to edit its properties.</div>;
  }

  const [x, y] = selected.transform.position;

  return (
    <div className="panel">
      <div className="panelHeader">
        {selected.name}
        {selectedObjectIds.length > 1 ? <span style={{ marginLeft: 8, color: "#6b7280" }}>({selectedObjectIds.length} selected)</span> : null}
      </div>

      <div className="panelGroup">
        <div className="groupTitle">Layout</div>
        <DragNumberInput
          label="X"
          value={x}
          step={0.05}
          onChange={(v) =>
            updateObject(selected.id, (o) => ({ ...o, transform: { ...o.transform, position: [v, o.transform.position[1]] } }))
          }
        />
        <DragNumberInput
          label="Y"
          value={y}
          step={0.05}
          onChange={(v) =>
            updateObject(selected.id, (o) => ({ ...o, transform: { ...o.transform, position: [o.transform.position[0], v] } }))
          }
        />
        <DragNumberInput
          label="Scale"
          value={selected.transform.scale}
          step={0.01}
          min={0.01}
          onChange={(v) => updateObject(selected.id, (o) => ({ ...o, transform: { ...o.transform, scale: v } }))}
        />
        <DragNumberInput
          label="Rotate"
          value={selected.transform.rotation}
          step={0.01}
          onChange={(v) => updateObject(selected.id, (o) => ({ ...o, transform: { ...o.transform, rotation: v } }))}
        />
      </div>

      <div className="panelGroup">
        <div className="groupTitle">Style</div>
        {renderStyleSection(selected, updateObject)}
      </div>
    </div>
  );
}

function renderStyleSection(selected: any, updateObject: any) {
  if (selected.type === "Circle") {
    return (
      <>
        <DragNumberInput
          label="Radius"
          value={selected.props.radius}
          step={0.05}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Circle" ? o : { ...o, props: { ...o.props, radius: v } }))}
        />
        {renderStrokeFill(selected, updateObject)}
      </>
    );
  }

  if (selected.type === "Square") {
    return (
      <>
        <DragNumberInput
          label="Side"
          value={selected.props.side_length}
          step={0.05}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Square" ? o : { ...o, props: { ...o.props, side_length: v } }))}
        />
        {renderStrokeFill(selected, updateObject)}
      </>
    );
  }

  if (selected.type === "Rectangle") {
    return (
      <>
        <DragNumberInput
          label="Width"
          value={selected.props.width}
          step={0.05}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Rectangle" ? o : { ...o, props: { ...o.props, width: v } }))}
        />
        <DragNumberInput
          label="Height"
          value={selected.props.height}
          step={0.05}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Rectangle" ? o : { ...o, props: { ...o.props, height: v } }))}
        />
        {renderStrokeFill(selected, updateObject)}
      </>
    );
  }

  if (selected.type === "Ellipse") {
    return (
      <>
        <DragNumberInput
          label="Width"
          value={selected.props.width}
          step={0.05}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Ellipse" ? o : { ...o, props: { ...o.props, width: v } }))}
        />
        <DragNumberInput
          label="Height"
          value={selected.props.height}
          step={0.05}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Ellipse" ? o : { ...o, props: { ...o.props, height: v } }))}
        />
        {renderStrokeFill(selected, updateObject)}
      </>
    );
  }

  if (selected.type === "RegularPolygon") {
    return (
      <>
        <DragNumberInput
          label="Sides"
          value={selected.props.n}
          step={1}
          min={3}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "RegularPolygon" ? o : { ...o, props: { ...o.props, n: Math.round(v) } }))}
        />
        {renderStrokeFill(selected, updateObject)}
      </>
    );
  }

  if (selected.type === "Triangle") {
    return <>{renderStrokeFill(selected, updateObject)}</>;
  }

  if (selected.type === "Line" || selected.type === "Arrow" || selected.type === "Vector") {
    return (
      <>
        <DragNumberInput
          label="StrokeW"
          value={selected.props.stroke_width ?? 4}
          step={0.5}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, stroke_width: v } }))}
        />
        <label className="row">
          <span>Stroke</span>
          <input
            type="text"
            value={selected.props.stroke_color ?? "WHITE"}
            onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, stroke_color: e.target.value } }))}
          />
        </label>
        <DragNumberInput
          label="StartX"
          value={selected.props.start[0]}
          step={0.05}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, start: [v, o.props.start[1]] } }))}
        />
        <DragNumberInput
          label="StartY"
          value={selected.props.start[1]}
          step={0.05}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, start: [o.props.start[0], v] } }))}
        />
        <DragNumberInput
          label="EndX"
          value={selected.props.end[0]}
          step={0.05}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, end: [v, o.props.end[1]] } }))}
        />
        <DragNumberInput
          label="EndY"
          value={selected.props.end[1]}
          step={0.05}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, end: [o.props.end[0], v] } }))}
        />
      </>
    );
  }

  if (selected.type === "Text") {
    return (
      <>
        <label className="row">
          <span>Text</span>
          <input
            type="text"
            value={selected.props.text}
            onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== "Text" ? o : { ...o, props: { ...o.props, text: e.target.value } }))}
          />
        </label>
        <DragNumberInput
          label="Font"
          value={selected.props.font_size}
          step={1}
          min={1}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Text" ? o : { ...o, props: { ...o.props, font_size: v } }))}
        />
        <label className="row">
          <span>Fill</span>
          <input
            type="text"
            value={selected.props.color}
            onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== "Text" ? o : { ...o, props: { ...o.props, color: e.target.value } }))}
          />
        </label>
        <DragNumberInput
          label="StrokeW"
          value={selected.props.stroke_width ?? 0}
          step={0.5}
          min={0}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Text" ? o : { ...o, props: { ...o.props, stroke_width: v } }))}
        />
        <label className="row">
          <span>Stroke</span>
          <input
            type="text"
            value={selected.props.stroke_color ?? ""}
            placeholder="(auto)"
            onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== "Text" ? o : { ...o, props: { ...o.props, stroke_color: e.target.value || undefined } }))}
          />
        </label>
      </>
    );
  }

  if (selected.type === "Tex" || selected.type === "MathTex") {
    return (
      <>
        <label className="row">
          <span>TeX</span>
          <input
            type="text"
            value={selected.props.tex}
            onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, tex: e.target.value } }))}
          />
        </label>
        <DragNumberInput
          label="Font"
          value={selected.props.font_size}
          step={1}
          min={1}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, font_size: v } }))}
        />
        <label className="row">
          <span>Fill</span>
          <input
            type="text"
            value={selected.props.color}
            onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, color: e.target.value } }))}
          />
        </label>
      </>
    );
  }

  if (selected.type === "FunctionPlot") {
    return (
      <>
        <label className="row">
          <span>Expr</span>
          <input
            type="text"
            value={selected.props.expr}
            onChange={(e) =>
              updateObject(selected.id, (o: any) =>
                o.type !== "FunctionPlot" ? o : { ...o, props: { ...o.props, expr: e.target.value } }
              )
            }
          />
        </label>
        <DragNumberInput
          label="Xmin"
          value={selected.props.domain[0]}
          step={0.1}
          onChange={(v) =>
            updateObject(selected.id, (o: any) =>
              o.type !== "FunctionPlot" ? o : { ...o, props: { ...o.props, domain: [v, o.props.domain[1]] } }
            )
          }
        />
        <DragNumberInput
          label="Xmax"
          value={selected.props.domain[1]}
          step={0.1}
          onChange={(v) =>
            updateObject(selected.id, (o: any) =>
              o.type !== "FunctionPlot" ? o : { ...o, props: { ...o.props, domain: [o.props.domain[0], v] } }
            )
          }
        />
        <DragNumberInput
          label="StrokeW"
          value={selected.props.stroke_width ?? 4}
          step={0.5}
          min={0}
          onChange={(v) =>
            updateObject(selected.id, (o: any) =>
              o.type !== "FunctionPlot" ? o : { ...o, props: { ...o.props, stroke_width: v } }
            )
          }
        />
        <label className="row">
          <span>Stroke</span>
          <input
            type="text"
            value={selected.props.stroke_color ?? "YELLOW"}
            onChange={(e) =>
              updateObject(selected.id, (o: any) =>
                o.type !== "FunctionPlot" ? o : { ...o, props: { ...o.props, stroke_color: e.target.value } }
              )
            }
          />
        </label>
      </>
    );
  }

  if (selected.type === "BraceBetweenPoints") {
    return (
      <>
        <DragNumberInput
          label="Ax"
          value={selected.props.a[0]}
          step={0.1}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "BraceBetweenPoints" ? o : { ...o, props: { ...o.props, a: [v, o.props.a[1]] } }))}
        />
        <DragNumberInput
          label="Ay"
          value={selected.props.a[1]}
          step={0.1}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "BraceBetweenPoints" ? o : { ...o, props: { ...o.props, a: [o.props.a[0], v] } }))}
        />
        <DragNumberInput
          label="Bx"
          value={selected.props.b[0]}
          step={0.1}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "BraceBetweenPoints" ? o : { ...o, props: { ...o.props, b: [v, o.props.b[1]] } }))}
        />
        <DragNumberInput
          label="By"
          value={selected.props.b[1]}
          step={0.1}
          onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "BraceBetweenPoints" ? o : { ...o, props: { ...o.props, b: [o.props.b[0], v] } }))}
        />
        <label className="row">
          <span>Dir</span>
          <select
            value={selected.props.direction ?? "DOWN"}
            onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== "BraceBetweenPoints" ? o : { ...o, props: { ...o.props, direction: e.target.value } }))}
          >
            <option value="UP">UP</option>
            <option value="DOWN">DOWN</option>
            <option value="LEFT">LEFT</option>
            <option value="RIGHT">RIGHT</option>
          </select>
        </label>
        <label className="row">
          <span>Label</span>
          <input
            type="text"
            value={selected.props.label?.value ?? ""}
            onChange={(e) =>
              updateObject(selected.id, (o: any) =>
                o.type !== "BraceBetweenPoints"
                  ? o
                  : { ...o, props: { ...o.props, label: { ...(o.props.label ?? { type: "MathTex" }), value: e.target.value } } }
              )
            }
          />
        </label>
      </>
    );
  }

  if (selected.type === "Arc") {
    return (
      <>
        <DragNumberInput label="Radius" value={selected.props.radius} step={0.05} min={0} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Arc" ? o : { ...o, props: { ...o.props, radius: v } }))} />
        <DragNumberInput label="StartA" value={selected.props.start_angle} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Arc" ? o : { ...o, props: { ...o.props, start_angle: v } }))} />
        <DragNumberInput label="Angle" value={selected.props.angle} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Arc" ? o : { ...o, props: { ...o.props, angle: v } }))} />
        {renderStrokeFill(selected, updateObject)}
      </>
    );
  }

  if (selected.type === "Angle") {
    return (
      <>
        <DragNumberInput label="Ax" value={selected.props.a[0]} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Angle" ? o : { ...o, props: { ...o.props, a: [v, o.props.a[1]] } }))} />
        <DragNumberInput label="Ay" value={selected.props.a[1]} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Angle" ? o : { ...o, props: { ...o.props, a: [o.props.a[0], v] } }))} />
        <DragNumberInput label="Bx" value={selected.props.b[0]} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Angle" ? o : { ...o, props: { ...o.props, b: [v, o.props.b[1]] } }))} />
        <DragNumberInput label="By" value={selected.props.b[1]} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Angle" ? o : { ...o, props: { ...o.props, b: [o.props.b[0], v] } }))} />
        <DragNumberInput label="Cx" value={selected.props.c[0]} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Angle" ? o : { ...o, props: { ...o.props, c: [v, o.props.c[1]] } }))} />
        <DragNumberInput label="Cy" value={selected.props.c[1]} step={0.1} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Angle" ? o : { ...o, props: { ...o.props, c: [o.props.c[0], v] } }))} />
        <DragNumberInput label="Radius" value={selected.props.radius ?? 1} step={0.05} min={0} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Angle" ? o : { ...o, props: { ...o.props, radius: v } }))} />
        {renderStrokeFill(selected, updateObject)}
      </>
    );
  }

  if (selected.type === "Axes" || selected.type === "NumberPlane") {
    if (selected.type === "Axes") {
      const xr = selected.props.x_range;
      const yr = selected.props.y_range;
      return (
        <>
          <div className="panelGroup">
            <div className="groupTitle">X Range</div>
            <DragNumberInput label="Min" value={xr[0]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, x_range: [v, o.props.x_range[1], o.props.x_range[2]] } }))} />
            <DragNumberInput label="Max" value={xr[1]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, x_range: [o.props.x_range[0], v, o.props.x_range[2]] } }))} />
            <DragNumberInput label="Step" value={xr[2]} step={0.1} min={0.01} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, x_range: [o.props.x_range[0], o.props.x_range[1], v] } }))} />
          </div>
          <div className="panelGroup">
            <div className="groupTitle">Y Range</div>
            <DragNumberInput label="Min" value={yr[0]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, y_range: [v, o.props.y_range[1], o.props.y_range[2]] } }))} />
            <DragNumberInput label="Max" value={yr[1]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, y_range: [o.props.y_range[0], v, o.props.y_range[2]] } }))} />
            <DragNumberInput label="Step" value={yr[2]} step={0.1} min={0.01} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, y_range: [o.props.y_range[0], o.props.y_range[1], v] } }))} />
          </div>
          <label className="row">
            <span>Tips</span>
            <input
              type="checkbox"
              checked={Boolean(selected.props.tips)}
              onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, tips: e.target.checked } }))}
            />
          </label>
          <DragNumberInput label="X Len" value={selected.props.x_length ?? Math.abs(xr[1] - xr[0])} step={0.2} min={0} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, x_length: v } }))} />
          <DragNumberInput label="Y Len" value={selected.props.y_length ?? Math.abs(yr[1] - yr[0])} step={0.2} min={0} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "Axes" ? o : { ...o, props: { ...o.props, y_length: v } }))} />
        </>
      );
    }

    const xr = selected.props.x_range;
    const yr = selected.props.y_range;
    return (
      <>
        <div className="panelGroup">
          <div className="groupTitle">X Range</div>
          <DragNumberInput label="Min" value={xr[0]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "NumberPlane" ? o : { ...o, props: { ...o.props, x_range: [v, o.props.x_range[1], o.props.x_range[2]] } }))} />
          <DragNumberInput label="Max" value={xr[1]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "NumberPlane" ? o : { ...o, props: { ...o.props, x_range: [o.props.x_range[0], v, o.props.x_range[2]] } }))} />
          <DragNumberInput label="Step" value={xr[2]} step={0.1} min={0.01} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "NumberPlane" ? o : { ...o, props: { ...o.props, x_range: [o.props.x_range[0], o.props.x_range[1], v] } }))} />
        </div>
        <div className="panelGroup">
          <div className="groupTitle">Y Range</div>
          <DragNumberInput label="Min" value={yr[0]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "NumberPlane" ? o : { ...o, props: { ...o.props, y_range: [v, o.props.y_range[1], o.props.y_range[2]] } }))} />
          <DragNumberInput label="Max" value={yr[1]} step={0.5} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "NumberPlane" ? o : { ...o, props: { ...o.props, y_range: [o.props.y_range[0], v, o.props.y_range[2]] } }))} />
          <DragNumberInput label="Step" value={yr[2]} step={0.1} min={0.01} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "NumberPlane" ? o : { ...o, props: { ...o.props, y_range: [o.props.y_range[0], o.props.y_range[1], v] } }))} />
        </div>
        <DragNumberInput label="Fade" value={selected.props.faded_line_ratio ?? 2} step={0.1} min={0} onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== "NumberPlane" ? o : { ...o, props: { ...o.props, faded_line_ratio: v } }))} />
      </>
    );
  }

  return <div className="panelEmpty">No style editor for type: {selected.type}</div>;
}

function renderStrokeFill(selected: any, updateObject: any) {
  const strokeColor = selected.props.stroke_color ?? "WHITE";
  return (
    <>
      <DragNumberInput
        label="StrokeW"
        value={selected.props.stroke_width ?? 4}
        step={0.5}
        min={0}
        onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, stroke_width: v } }))}
      />
      <label className="row">
        <span>Stroke</span>
        <input
          type="text"
          value={strokeColor}
          onChange={(e) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, stroke_color: e.target.value } }))}
        />
      </label>
      <label className="row">
        <span>Fill</span>
        <input
          type="text"
          value={selected.props.fill_color ?? ""}
          placeholder="(none)"
          onChange={(e) =>
            updateObject(selected.id, (o: any) =>
              o.type !== selected.type ? o : { ...o, props: { ...o.props, fill_color: e.target.value || undefined } }
            )
          }
        />
      </label>
      <DragNumberInput
        label="FillOp"
        value={selected.props.fill_opacity ?? 0}
        step={0.05}
        min={0}
        max={1}
        onChange={(v) => updateObject(selected.id, (o: any) => (o.type !== selected.type ? o : { ...o, props: { ...o.props, fill_opacity: v } }))}
      />
    </>
  );
}
