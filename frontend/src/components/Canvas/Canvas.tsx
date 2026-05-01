import { useEffect, useMemo, useRef, useState } from "react";
import { Arrow as KonvaArrow, Circle, Ellipse as KonvaEllipse, Group as KonvaGroup, Layer, Line as KonvaLine, Rect, RegularPolygon, Stage, Text } from "react-konva";
import type Konva from "konva";
import { create, all, MathNode } from "mathjs";

import { useHistoryStore } from "../../store/historyStore";
import { useSceneStore } from "../../store/sceneStore";
import { useUiStore } from "../../store/uiStore";
import { normalizeToCssColor } from "../../shared/colors";
import LatexOverlay from "./LatexOverlay";
import {
  DEFAULT_FRAME_HEIGHT,
  DEFAULT_FRAME_WIDTH,
  canvasToSceneX,
  canvasToSceneY,
  pixelsPerUnitFromResolution,
  resolutionHeightPx,
  resolutionWidthPx,
  sceneToCanvasX,
  sceneToCanvasY
} from "../../utils/math";

export default function Canvas() {
  const scene = useHistoryStore((s) => s.present);
  const time = 0;
  const selectedObjectIds = useSceneStore((s) => s.selectedObjectIds);
  const selectObject = useSceneStore((s) => s.selectObject);
  const updateObject = useSceneStore((s) => s.updateObject);
  const snapToCenter = useUiStore((s) => s.snapToCenter);
  const snapToGrid = useUiStore((s) => s.snapToGrid);
  const snapToObjects = useUiStore((s) => s.snapToObjects);
  const gridSize = useUiStore((s) => s.gridSize);
  const snapThreshold = useUiStore((s) => s.snapThreshold);
  const moveTargetPick = useUiStore((s) => s.moveTargetPick);
  const clearMoveTargetPick = useUiStore((s) => s.clearMoveTargetPick);
  const updateAnimationFull = useSceneStore((s) => s.updateAnimationFull);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const objects = useMemo(() => previewObjects(scene, time), [scene, time]);
  const [guides, setGuides] = useState<{ x: number | null; y: number | null; dxdy: { dx: number; dy: number } | null }>({
    x: null,
    y: null,
    dxdy: null
  });

  const resolution = (scene as any).settings?.resolution ?? "1080p";
  const pixelHeight = resolutionHeightPx(String(resolution));
  const pixelWidth = resolutionWidthPx(String(resolution));
  const ppu = pixelsPerUnitFromResolution(pixelWidth, pixelHeight);

  const scale = Math.min(size.width / pixelWidth, size.height / pixelHeight);
  const scaledLeft = Math.max(0, (size.width - pixelWidth * scale) / 2);
  const scaledTop = Math.max(0, (size.height - pixelHeight * scale) / 2);

  const frameWpx = DEFAULT_FRAME_WIDTH * ppu;
  const frameHpx = DEFAULT_FRAME_HEIGHT * ppu;
  const frameLeft = (pixelWidth - frameWpx) / 2;
  const frameTop = (pixelHeight - frameHpx) / 2;

  const latexOverlayItems = useMemo(() => {
    const items: Array<{
      id: string;
      x: number;
      y: number;
      rotationDeg: number;
      opacity: number;
      color: string;
      fontPx: number;
      tex: string;
      displayMode: boolean;
    }> = [];

    for (const obj of objects) {
      if (obj.type === "Tex" || obj.type === "MathTex") {
        const x = sceneToCanvasX(obj.transform.position[0], pixelWidth, ppu);
        const y = sceneToCanvasY(obj.transform.position[1], pixelHeight, ppu);
        const fontPx = previewFontSizePx(obj.props.font_size, pixelHeight, resolution) * obj.transform.scale;
        items.push({
          id: obj.id,
          x,
          y,
          rotationDeg: (-obj.transform.rotation * 180) / Math.PI,
          opacity: obj.__preview.opacity ?? 1,
          color: normalizeToCssColor(obj.props.color ?? "WHITE"),
          fontPx,
          tex: String(obj.props.tex ?? ""),
          displayMode: obj.type === "MathTex"
        });
      }

      if (obj.type === "GraphLabel") {
        const plot = scene.objects.find((o: any) => o.id === obj.props.plot_id && o.type === "FunctionPlot") as any;
        if (!plot) continue;
        const axes = scene.objects.find((o: any) => o.id === plot.props.axes_id && o.type === "Axes") as any;
        if (!axes) continue;
        const labelType = obj.props.label?.type ?? "MathTex";
        if (labelType === "Text") continue;

        const xv = obj.props.x_value;
        let yv = 0;
        try {
          const compiled = safeCompileExpr(String(plot.props.expr));
          yv = compiled ? Number(compiled.evaluate({ x: xv })) : 0;
        } catch {
          yv = 0;
        }
        const off = obj.props.offset ?? [0, 0];
        const xScene = axes.transform.position[0] + xv + off[0];
        const yScene = axes.transform.position[1] + yv + off[1];
        const x = sceneToCanvasX(xScene, pixelWidth, ppu);
        const y = sceneToCanvasY(yScene, pixelHeight, ppu);
        const fontPx = previewFontSizePx(obj.props.label?.font_size ?? 36, pixelHeight, resolution);
        items.push({
          id: obj.id,
          x,
          y,
          rotationDeg: 0,
          opacity: obj.__preview.opacity ?? 1,
          color: normalizeToCssColor(obj.props.label?.color ?? "WHITE"),
          fontPx,
          tex: String(obj.props.label?.value ?? ""),
          displayMode: labelType === "MathTex"
        });
      }

      if (obj.type === "BraceBetweenPoints") {
        const label = obj.props.label;
        const labelType = label?.type ?? "MathTex";
        if (!label?.value || labelType === "Text") continue;
        const a = obj.props.a;
        const b = obj.props.b;
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const dir = obj.props.direction ?? "DOWN";
        const offset: [number, number] =
          dir === "UP" ? [0, 0.35] : dir === "DOWN" ? [0, -0.35] : dir === "LEFT" ? [-0.35, 0] : [0.35, 0];
        const x = sceneToCanvasX(mx + offset[0], pixelWidth, ppu);
        const y = sceneToCanvasY(my + offset[1], pixelHeight, ppu);
        const fontPx = previewFontSizePx(label.font_size ?? 36, pixelHeight, resolution);
        items.push({
          id: `${obj.id}__label`,
          x,
          y,
          rotationDeg: 0,
          opacity: obj.__preview.opacity ?? 1,
          color: normalizeToCssColor(label.color ?? obj.props.color ?? "WHITE"),
          fontPx,
          tex: String(label.value ?? ""),
          displayMode: labelType === "MathTex"
        });
      }
    }

    return items;
  }, [objects, pixelWidth, pixelHeight, ppu, resolution, scene.objects]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div
          style={{
            position: "absolute",
            left: scaledLeft,
            top: scaledTop,
            width: pixelWidth,
            height: pixelHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left"
          }}
        >
          <Stage
            width={pixelWidth}
            height={pixelHeight}
            onMouseDown={() => selectObject(null)}
            onClick={(e) => {
              if (!moveTargetPick) return;
              const stage = e.target.getStage();
              if (!stage) return;
              const pos = stage.getPointerPosition();
              if (!pos) return;
              const xScene = canvasToSceneX(pos.x, pixelWidth, ppu);
              const yScene = canvasToSceneY(pos.y, pixelHeight, ppu);
              updateAnimationFull(moveTargetPick.animId, (a: any) => (a.type !== "Move" ? a : { ...a, props: { ...a.props, to: [xScene, yScene] } }));
              clearMoveTargetPick();
            }}
          >
            <Layer>
              <Rect x={0} y={0} width={pixelWidth} height={pixelHeight} fill="#111827" listening={false} />
              <Rect
                x={frameLeft}
                y={frameTop}
                width={frameWpx}
                height={frameHpx}
                stroke="rgba(255,255,255,0.14)"
                strokeWidth={1}
                listening={false}
              />

              {objects.map((obj) => {
                const x = sceneToCanvasX(obj.transform.position[0], pixelWidth, ppu);
                const y = sceneToCanvasY(obj.transform.position[1], pixelHeight, ppu);
                const isSelected = selectedObjectIds.includes(obj.id);
                const common = {
                  key: obj.id,
                  x,
                  y,
                  draggable: true,
                  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
                    e.cancelBubble = true;
                    selectObject(obj.id, (e.evt as MouseEvent).shiftKey);
                  },
                  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
                    const node = e.target;
                    const sceneX = canvasToSceneX(node.x(), pixelWidth, ppu);
                    const sceneY = canvasToSceneY(node.y(), pixelHeight, ppu);
                    const snap = computeSnapGuides(sceneX, sceneY, obj.id, scene.objects, {
                      snapToCenter,
                      snapToGrid,
                      snapToObjects,
                      gridSize,
                      snapThreshold
                    });
                    setGuides({ x: snap.guideX, y: snap.guideY, dxdy: snap.dxdy });
                  },
                  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
                    const node = e.target;
                    const sceneX = canvasToSceneX(node.x(), pixelWidth, ppu);
                    const sceneY = canvasToSceneY(node.y(), pixelHeight, ppu);
                    const snapped = applySnapping(sceneX, sceneY, obj.id, scene.objects, {
                      snapToCenter,
                      snapToGrid,
                      snapToObjects,
                      gridSize,
                      snapThreshold
                    });
                    updateObject(obj.id, (o) => ({
                      ...o,
                      transform: { ...o.transform, position: [snapped.x, snapped.y] }
                    }));
                    setGuides({ x: null, y: null, dxdy: null });
                  }
                } as const;

                if (obj.type === "Group") return null;

                if (obj.type === "NumberPlane") {
                  return (
                    <NumberPlanePreview
                      key={obj.id}
                      obj={obj}
                      ppu={ppu}
                      pixelWidth={pixelWidth}
                      pixelHeight={pixelHeight}
                    />
                  );
                }

                if (obj.type === "Axes") {
                  return (
                    <AxesPreview
                      key={obj.id}
                      obj={obj}
                      ppu={ppu}
                      pixelWidth={pixelWidth}
                      pixelHeight={pixelHeight}
                    />
                  );
                }

                if (obj.type === "FunctionPlot") {
                  const axes = scene.objects.find((o: any) => o.id === obj.props.axes_id && o.type === "Axes") as any;
                  if (!axes) return null;
                  const [xmin, xmax] = obj.props.domain;
                  const samples = 240;
                  const pts: number[] = [];
                  const compiled = safeCompileExpr(String(obj.props.expr));
                  for (let i = 0; i <= samples; i++) {
                    const xval = xmin + ((xmax - xmin) * i) / samples;
                    let yval = 0;
                    try {
                      yval = compiled ? Number(compiled.evaluate({ x: xval })) : 0;
                      if (!Number.isFinite(yval)) continue;
                    } catch {
                      continue;
                    }
                    const sx = axes.transform.position[0] + xval + obj.transform.position[0];
                    const sy = axes.transform.position[1] + yval + obj.transform.position[1];
                    pts.push(sceneToCanvasX(sx, pixelWidth, ppu), sceneToCanvasY(sy, pixelHeight, ppu));
                  }
                  const stroke = normalizeToCssColor(obj.props.stroke_color ?? "YELLOW");
                  const sw = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  return <KonvaLine key={obj.id} points={pts} stroke={stroke} strokeWidth={sw} opacity={obj.__preview.opacity} listening={false} />;
                }

                if (obj.type === "VerticalLineAtX") {
                  const axes = scene.objects.find((o: any) => o.id === obj.props.axes_id && o.type === "Axes") as any;
                  if (!axes) return null;
                  const y0 = axes.props.y_range[0];
                  const y1 = axes.props.y_range[1];
                  const xv = obj.props.x_value;
                  const yr = obj.props.y_range ?? [y0, y1];
                  if (obj.props.plot_id) {
                    const plot = scene.objects.find((o: any) => o.id === obj.props.plot_id && o.type === "FunctionPlot") as any;
                    if (plot) {
                      const compiled = safeCompileExpr(String(plot.props.expr));
                      const yv = compiled ? Number(compiled.evaluate({ x: xv })) : 0;
                      const xScene = axes.transform.position[0] + xv;
                      const yA = axes.transform.position[1] + 0;
                      const yB = axes.transform.position[1] + yv;
                      const ax = sceneToCanvasX(xScene, pixelWidth, ppu);
                      const ay = sceneToCanvasY(yA, pixelHeight, ppu);
                      const bx = sceneToCanvasX(xScene, pixelWidth, ppu);
                      const by = sceneToCanvasY(yB, pixelHeight, ppu);
                      const stroke = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                      const sw = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 3;
                      return <KonvaLine key={obj.id} points={[ax, ay, bx, by]} stroke={stroke} strokeWidth={sw} opacity={obj.__preview.opacity} listening={false} />;
                    }
                  }
                  const xScene = axes.transform.position[0] + xv;
                  const yA = axes.transform.position[1] + yr[0];
                  const yB = axes.transform.position[1] + yr[1];
                  const ax = sceneToCanvasX(xScene, pixelWidth, ppu);
                  const ay = sceneToCanvasY(yA, pixelHeight, ppu);
                  const bx = sceneToCanvasX(xScene, pixelWidth, ppu);
                  const by = sceneToCanvasY(yB, pixelHeight, ppu);
                  const stroke = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                  const sw = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 3;
                  return <KonvaLine key={obj.id} points={[ax, ay, bx, by]} stroke={stroke} strokeWidth={sw} opacity={obj.__preview.opacity} listening={false} />;
                }

                if (obj.type === "HighlightPoint") {
                  const axes = scene.objects.find((o: any) => o.id === obj.props.axes_id && o.type === "Axes") as any;
                  if (!axes) return null;
                  const xScene = axes.transform.position[0] + obj.props.x_value;
                  const yScene = axes.transform.position[1] + obj.props.y_value;
                  const cx = sceneToCanvasX(xScene, pixelWidth, ppu);
                  const cy = sceneToCanvasY(yScene, pixelHeight, ppu);
                  const r = (obj.props.radius ?? 0.08) * ppu;
                  const color = normalizeToCssColor(obj.props.color ?? "YELLOW");
                  return <Circle key={obj.id} x={cx} y={cy} radius={r} fill={color} opacity={obj.__preview.opacity} listening={false} />;
                }

                if (obj.type === "GraphLabel") {
                  const plot = scene.objects.find((o: any) => o.id === obj.props.plot_id && o.type === "FunctionPlot") as any;
                  if (!plot) return null;
                  const axes = scene.objects.find((o: any) => o.id === plot.props.axes_id && o.type === "Axes") as any;
                  if (!axes) return null;
                  const xv = obj.props.x_value;
                  let yv = 0;
                  try {
                    const compiled = safeCompileExpr(String(plot.props.expr));
                    yv = compiled ? Number(compiled.evaluate({ x: xv })) : 0;
                  } catch {
                    yv = 0;
                  }
                  const off = obj.props.offset ?? [0, 0];
                  const xScene = axes.transform.position[0] + xv + off[0];
                  const yScene = axes.transform.position[1] + yv + off[1];
                  const labelType = obj.props.label?.type ?? "MathTex";
                  if (labelType !== "Text") return null;
                  const text = obj.props.label?.value ?? "";
                  const color = normalizeToCssColor(obj.props.label?.color ?? "WHITE");
                  const fontPx = previewFontSizePx(obj.props.label?.font_size ?? 36, pixelHeight, (scene as any).settings?.resolution);
                  const approxWidth = (text.length ?? 0) * fontPx * 0.55;
                  const approxHeight = fontPx;
                  return (
                    <Text
                      key={obj.id}
                      x={sceneToCanvasX(xScene, pixelWidth, ppu)}
                      y={sceneToCanvasY(yScene, pixelHeight, ppu)}
                      text={text}
                      fill={color}
                      fontSize={fontPx}
                      fontFamily="Times New Roman"
                      offsetX={approxWidth / 2}
                      offsetY={approxHeight / 2}
                      opacity={obj.__preview.opacity}
                      listening={false}
                    />
                  );
                }

                if (obj.type === "BraceBetweenPoints") {
                  const a = obj.props.a;
                  const b = obj.props.b;
                  const ax = sceneToCanvasX(a[0], pixelWidth, ppu);
                  const ay = sceneToCanvasY(a[1], pixelHeight, ppu);
                  const bx = sceneToCanvasX(b[0], pixelWidth, ppu);
                  const by = sceneToCanvasY(b[1], pixelHeight, ppu);
                  const mx = (ax + bx) / 2;
                  const my = (ay + by) / 2;
                  const color = normalizeToCssColor(obj.props.color ?? "WHITE");
                  const labelType = obj.props.label?.type ?? "MathTex";
                  const label = labelType === "Text" ? obj.props.label?.value : undefined;
                  return (
                    <KonvaGroup key={obj.id} listening={false}>
                      <KonvaLine points={[ax, ay, bx, by]} stroke={color} strokeWidth={2} opacity={obj.__preview.opacity} />
                      <Text x={mx} y={my + 18} text={label ?? ""} fill={color} fontSize={16} offsetX={label ? (label.length * 16 * 0.55) / 2 : 0} offsetY={8} opacity={obj.__preview.opacity} />
                    </KonvaGroup>
                  );
                }

                if (obj.type === "Arc") {
                  // Approx arc preview using Konva arc-like polyline sampling
                  const stroke = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                  const sw = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  const samples = 120;
                  const pts: number[] = [];
                  const r = obj.props.radius * obj.transform.scale;
                  const a0 = obj.props.start_angle + obj.transform.rotation;
                  const a1 = a0 + obj.props.angle;
                  for (let i = 0; i <= samples; i++) {
                    const t = i / samples;
                    const ang = a0 + (a1 - a0) * t;
                    const sx = obj.transform.position[0] + r * Math.cos(ang);
                    const sy = obj.transform.position[1] + r * Math.sin(ang);
                    pts.push(sceneToCanvasX(sx, pixelWidth, ppu), sceneToCanvasY(sy, pixelHeight, ppu));
                  }
                  return <KonvaLine key={obj.id} points={pts} stroke={stroke} strokeWidth={sw} opacity={obj.__preview.opacity} listening={false} />;
                }

                if (obj.type === "Angle") {
                  // Approx angle preview as small arc between BA and BC
                  const stroke = obj.props.stroke_color ?? "WHITE";
                  const sw = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  const a = obj.props.a;
                  const b = obj.props.b;
                  const c = obj.props.c;
                  const r = (obj.props.radius ?? 1) * obj.transform.scale;
                  const v1 = [a[0] - b[0], a[1] - b[1]];
                  const v2 = [c[0] - b[0], c[1] - b[1]];
                  const ang1 = Math.atan2(v1[1], v1[0]);
                  const ang2 = Math.atan2(v2[1], v2[0]);
                  let start = ang1;
                  let end = ang2;
                  const delta = ((end - start + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                  end = start + delta;
                  const samples = 80;
                  const pts: number[] = [];
                  for (let i = 0; i <= samples; i++) {
                    const t = i / samples;
                    const ang = start + (end - start) * t;
                    const sx = obj.transform.position[0] + b[0] + r * Math.cos(ang);
                    const sy = obj.transform.position[1] + b[1] + r * Math.sin(ang);
                    pts.push(sceneToCanvasX(sx, pixelWidth, ppu), sceneToCanvasY(sy, pixelHeight, ppu));
                  }
                  return <KonvaLine key={obj.id} points={pts} stroke={stroke} strokeWidth={sw} opacity={obj.__preview.opacity} listening={false} />;
                }

                if (obj.type === "Circle") {
                  const strokeWidth = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  const fillOpacity = typeof obj.props.fill_opacity === "number" ? obj.props.fill_opacity : 0;
                  const strokeColor = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                  const fillColor = normalizeToCssColor(obj.props.fill_color ?? strokeColor, strokeColor);
                  return (
                    <>
                      <Circle
                        {...common}
                        radius={obj.props.radius * obj.transform.scale * ppu}
                        fillEnabled={fillOpacity > 0}
                        fill={fillColor}
                        fillOpacity={fillOpacity}
                        opacity={obj.__preview.opacity}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                      />
                      {isSelected ? (
                        <Circle
                          x={x}
                          y={y}
                          radius={obj.props.radius * obj.transform.scale * ppu + 4}
                          fillEnabled={false}
                          opacity={obj.__preview.opacity}
                          stroke="#fbbf24"
                          strokeWidth={2}
                          listening={false}
                        />
                      ) : null}
                    </>
                  );
                }

                if (obj.type === "Square" || obj.type === "Rectangle") {
                  const w = (obj.type === "Square" ? obj.props.side_length : obj.props.width) * obj.transform.scale * ppu;
                  const h = (obj.type === "Square" ? obj.props.side_length : obj.props.height) * obj.transform.scale * ppu;
                  const strokeWidth = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  const fillOpacity = typeof obj.props.fill_opacity === "number" ? obj.props.fill_opacity : 0;
                  const strokeColor = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                  const fillColor = normalizeToCssColor(obj.props.fill_color ?? strokeColor, strokeColor);
                  return (
                    <>
                      <Rect
                        {...common}
                        x={x - w / 2}
                        y={y - h / 2}
                        width={w}
                        height={h}
                        rotation={(-obj.transform.rotation * 180) / Math.PI}
                        fillEnabled={fillOpacity > 0}
                        fill={fillColor}
                        fillOpacity={fillOpacity}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity={obj.__preview.opacity}
                      />
                      {isSelected ? (
                        <Rect
                          x={x - w / 2 - 4}
                          y={y - h / 2 - 4}
                          width={w + 8}
                          height={h + 8}
                          rotation={(-obj.transform.rotation * 180) / Math.PI}
                          fillEnabled={false}
                          stroke="#fbbf24"
                          strokeWidth={2}
                          opacity={obj.__preview.opacity}
                          listening={false}
                        />
                      ) : null}
                    </>
                  );
                }

                if (obj.type === "Ellipse") {
                  const rx = (obj.props.width / 2) * obj.transform.scale * ppu;
                  const ry = (obj.props.height / 2) * obj.transform.scale * ppu;
                  const strokeWidth = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  const fillOpacity = typeof obj.props.fill_opacity === "number" ? obj.props.fill_opacity : 0;
                  const strokeColor = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                  const fillColor = normalizeToCssColor(obj.props.fill_color ?? strokeColor, strokeColor);
                  return (
                    <>
                      <KonvaEllipse
                        {...common}
                        radiusX={rx}
                        radiusY={ry}
                        rotation={(-obj.transform.rotation * 180) / Math.PI}
                        fillEnabled={fillOpacity > 0}
                        fill={fillColor}
                        fillOpacity={fillOpacity}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity={obj.__preview.opacity}
                      />
                      {isSelected ? (
                        <KonvaEllipse
                          x={x}
                          y={y}
                          radiusX={rx + 4}
                          radiusY={ry + 4}
                          rotation={(-obj.transform.rotation * 180) / Math.PI}
                          fillEnabled={false}
                          stroke="#fbbf24"
                          strokeWidth={2}
                          opacity={obj.__preview.opacity}
                          listening={false}
                        />
                      ) : null}
                    </>
                  );
                }

                if (obj.type === "Triangle" || obj.type === "RegularPolygon") {
                  const sides = obj.type === "Triangle" ? 3 : Math.max(3, obj.props.n);
                  const strokeWidth = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  const fillOpacity = typeof obj.props.fill_opacity === "number" ? obj.props.fill_opacity : 0;
                  const strokeColor = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                  const fillColor = normalizeToCssColor(obj.props.fill_color ?? strokeColor, strokeColor);
                  const radius = 1.5 * obj.transform.scale * ppu;
                  return (
                    <>
                      <RegularPolygon
                        {...common}
                        sides={sides}
                        radius={radius}
                        rotation={(-obj.transform.rotation * 180) / Math.PI}
                        fillEnabled={fillOpacity > 0}
                        fill={fillColor}
                        fillOpacity={fillOpacity}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity={obj.__preview.opacity}
                      />
                      {isSelected ? (
                        <RegularPolygon
                          x={x}
                          y={y}
                          sides={sides}
                          radius={radius + 4}
                          rotation={(-obj.transform.rotation * 180) / Math.PI}
                          fillEnabled={false}
                          stroke="#fbbf24"
                          strokeWidth={2}
                          opacity={obj.__preview.opacity}
                          listening={false}
                        />
                      ) : null}
                    </>
                  );
                }

                if (obj.type === "Line" || obj.type === "Arrow" || obj.type === "Vector") {
                  const start = obj.props.start;
                  const end = obj.props.end;
                  const sx = sceneToCanvasX(start[0], pixelWidth, ppu);
                  const sy = sceneToCanvasY(start[1], pixelHeight, ppu);
                  const ex = sceneToCanvasX(end[0], pixelWidth, ppu);
                  const ey = sceneToCanvasY(end[1], pixelHeight, ppu);
                  const strokeColor = normalizeToCssColor(obj.props.stroke_color ?? "WHITE");
                  const strokeWidth = typeof obj.props.stroke_width === "number" ? obj.props.stroke_width : 4;
                  const points = [sx, sy, ex, ey];
                  return (
                    <KonvaGroup
                      key={obj.id}
                      draggable
                      onMouseDown={(e) => {
                        e.cancelBubble = true;
                        selectObject(obj.id, (e.evt as MouseEvent).shiftKey);
                      }}
                      onDragEnd={(e) => {
                        const dx = e.target.x();
                        const dy = e.target.y();
                        e.target.position({ x: 0, y: 0 });
                        const deltaX = dx / ppu;
                        const deltaY = -dy / ppu;
                        updateObject(obj.id, (o) => {
                          if (o.type !== "Line" && o.type !== "Arrow" && o.type !== "Vector") return o;
                          return {
                            ...o,
                            props: {
                              ...o.props,
                              start: [o.props.start[0] + deltaX, o.props.start[1] + deltaY],
                              end: [o.props.end[0] + deltaX, o.props.end[1] + deltaY]
                            }
                          };
                        });
                      }}
                    >
                      {obj.type === "Arrow" || obj.type === "Vector" ? (
                        <KonvaArrow points={points} stroke={strokeColor} strokeWidth={strokeWidth} fill={strokeColor} opacity={obj.__preview.opacity} />
                      ) : (
                        <KonvaLine points={points} stroke={strokeColor} strokeWidth={strokeWidth} opacity={obj.__preview.opacity} />
                      )}
                      {isSelected ? (
                        <KonvaLine points={points} stroke="#fbbf24" strokeWidth={2} opacity={obj.__preview.opacity} listening={false} />
                      ) : null}
                    </KonvaGroup>
                  );
                }

                if (obj.type === "Tex" || obj.type === "MathTex") {
                  const fontPx =
                    previewFontSizePx(obj.props.font_size, pixelHeight, (scene as any).settings?.resolution) *
                    obj.transform.scale;
                  const text = obj.props.tex;
                  const approxWidth = (text?.length ?? 0) * fontPx * 0.55;
                  const approxHeight = fontPx;
                  const baseStrokeWidth =
                    typeof obj.props.stroke_width === "number" && obj.props.stroke_width > 0 ? obj.props.stroke_width : 0;
                  const baseStrokeColor = normalizeToCssColor(obj.props.stroke_color ?? obj.props.color ?? "WHITE");
                  // Render actual TeX via DOM overlay (KaTeX); keep an invisible Konva node for hit-testing/dragging.
                  const fillColor = "rgba(0,0,0,0)";
                  return (
                    <>
                      <Text
                        {...common}
                        text={text}
                        fill={fillColor}
                        opacity={obj.__preview.opacity}
                        fontSize={fontPx}
                        fontFamily="Times New Roman"
                        offsetX={approxWidth / 2}
                        offsetY={approxHeight / 2}
                        stroke={baseStrokeWidth > 0 ? baseStrokeColor : undefined}
                        strokeWidth={baseStrokeWidth}
                      />
                      {isSelected ? (
                        <Text
                          x={x}
                          y={y}
                          text={text}
                          fill="rgba(0,0,0,0)"
                          opacity={obj.__preview.opacity}
                          fontSize={fontPx}
                          fontFamily="Times New Roman"
                          offsetX={approxWidth / 2}
                          offsetY={approxHeight / 2}
                          stroke="#fbbf24"
                          strokeWidth={2}
                          listening={false}
                        />
                      ) : null}
                    </>
                  );
                }

                return (
                  (() => {
                    const fontPx =
                      previewFontSizePx(obj.props.font_size, pixelHeight, (scene as any).settings?.resolution) *
                      obj.transform.scale;
                    const approxWidth = (obj.props.text?.length ?? 0) * fontPx * 0.55;
                    const approxHeight = fontPx;
                    const baseStrokeWidth =
                      typeof obj.props.stroke_width === "number" && obj.props.stroke_width > 0 ? obj.props.stroke_width : 0;
                    const baseStrokeColor = normalizeToCssColor(obj.props.stroke_color ?? obj.props.color ?? "WHITE");
                    const fillColor = normalizeToCssColor(obj.props.color ?? "WHITE");
                    return (
                      <>
                        <Text
                          {...common}
                          text={obj.props.text}
                          fill={fillColor}
                          opacity={obj.__preview.opacity}
                          fontSize={fontPx}
                          fontFamily="Times New Roman"
                          offsetX={approxWidth / 2}
                          offsetY={approxHeight / 2}
                          stroke={baseStrokeWidth > 0 ? baseStrokeColor : undefined}
                          strokeWidth={baseStrokeWidth}
                        />
                        {isSelected ? (
                          <Text
                            x={x}
                            y={y}
                            text={obj.props.text}
                            fill="rgba(0,0,0,0)"
                            opacity={obj.__preview.opacity}
                            fontSize={fontPx}
                            fontFamily="Times New Roman"
                            offsetX={approxWidth / 2}
                            offsetY={approxHeight / 2}
                            stroke="#fbbf24"
                            strokeWidth={2}
                            listening={false}
                          />
                        ) : null}
                      </>
                    );
                  })()
                );
              })}

              {selectedObjectIds.length > 1 ? (
                (() => {
                  const box = selectionBounds(objects.filter((o) => selectedObjectIds.includes(o.id)));
                  if (!box) return null;
                  return (
                    <Rect
                      x={sceneToCanvasX(box.minX, pixelWidth, ppu)}
                      y={sceneToCanvasY(box.maxY, pixelHeight, ppu)}
                      width={(box.maxX - box.minX) * ppu}
                      height={(box.maxY - box.minY) * ppu}
                      stroke="rgba(251,191,36,0.8)"
                      strokeWidth={2}
                      dash={[6, 4]}
                      fillEnabled={false}
                      listening={false}
                    />
                  );
                })()
              ) : null}

              {guides.x != null ? (
                <KonvaLine points={[sceneToCanvasX(guides.x, pixelWidth, ppu), 0, sceneToCanvasX(guides.x, pixelWidth, ppu), pixelHeight]} stroke="rgba(245,158,11,0.55)" strokeWidth={1} listening={false} />
              ) : null}
              {guides.y != null ? (
                <KonvaLine points={[0, sceneToCanvasY(guides.y, pixelHeight, ppu), pixelWidth, sceneToCanvasY(guides.y, pixelHeight, ppu)]} stroke="rgba(245,158,11,0.55)" strokeWidth={1} listening={false} />
              ) : null}
              {guides.dxdy ? (
                <Text x={12} y={12} text={`dx=${guides.dxdy.dx.toFixed(2)} dy=${guides.dxdy.dy.toFixed(2)}`} fill="rgba(255,255,255,0.8)" fontSize={14} listening={false} />
              ) : null}
            </Layer>
          </Stage>
          <LatexOverlay width={pixelWidth} height={pixelHeight} items={latexOverlayItems} />
        </div>
      </div>
    </div>
  );
}

const math = create(all, {});

function AxesPreview(props: { obj: any; ppu: number; pixelWidth: number; pixelHeight: number }) {
  const { obj, ppu, pixelWidth, pixelHeight } = props;
  const [x0, x1] = obj.props.x_range;
  const [y0, y1] = obj.props.y_range;
  const x = sceneToCanvasX(obj.transform.position[0], pixelWidth, ppu);
  const y = sceneToCanvasY(obj.transform.position[1], pixelHeight, ppu);
  const w = (obj.props.x_length ?? Math.abs(x1 - x0)) * obj.transform.scale * ppu;
  const h = (obj.props.y_length ?? Math.abs(y1 - y0)) * obj.transform.scale * ppu;
  return (
    <KonvaGroup x={x} y={y} rotation={(-obj.transform.rotation * 180) / Math.PI} listening={false}>
      <KonvaLine points={[-w / 2, 0, w / 2, 0]} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
      <KonvaLine points={[0, -h / 2, 0, h / 2]} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
    </KonvaGroup>
  );
}

function NumberPlanePreview(props: { obj: any; ppu: number; pixelWidth: number; pixelHeight: number }) {
  const { obj, ppu, pixelWidth, pixelHeight } = props;
  const [x0, x1, xs] = obj.props.x_range;
  const [y0, y1, ys] = obj.props.y_range;
  const x = sceneToCanvasX(obj.transform.position[0], pixelWidth, ppu);
  const y = sceneToCanvasY(obj.transform.position[1], pixelHeight, ppu);
  const lines: JSX.Element[] = [];
  const stroke = "rgba(255,255,255,0.12)";
  for (let xv = x0; xv <= x1 + 1e-9; xv += xs) {
    const cx = xv * obj.transform.scale * ppu;
    lines.push(<KonvaLine key={`v${xv}`} points={[cx, (y0 * obj.transform.scale * -ppu), cx, (y1 * obj.transform.scale * -ppu)]} stroke={stroke} strokeWidth={1} />);
  }
  for (let yv = y0; yv <= y1 + 1e-9; yv += ys) {
    const cy = -yv * obj.transform.scale * ppu;
    lines.push(<KonvaLine key={`h${yv}`} points={[(x0 * obj.transform.scale * ppu), cy, (x1 * obj.transform.scale * ppu), cy]} stroke={stroke} strokeWidth={1} />);
  }
  return (
    <KonvaGroup x={x} y={y} rotation={(-obj.transform.rotation * 180) / Math.PI} listening={false}>
      {lines}
    </KonvaGroup>
  );
}

function previewFontSizePx(fontSize: number, canvasHeight: number, resolution: unknown): number {
  const base = typeof fontSize === "number" && Number.isFinite(fontSize) ? fontSize : 48;
  const refH = resolutionHeightPx(typeof resolution === "string" ? resolution : "1080p");
  const scaled = base * (canvasHeight / refH);
  return Math.max(8, scaled);
}

function previewObjects(
  scene: { objects: any[]; animations: any[]; relationships?: any[] },
  t: number
): Array<any & { __preview: { opacity: number } }> {
  const byId = new Map(scene.objects.map((o) => [o.id, structuredClone(o)]));
  const opacity = new Map<string, number>(scene.objects.map((o) => [o.id, 1]));

  // relationships (preview only)
  const rels = scene.relationships ?? [];
  for (const rel of rels) {
    if (rel.type === "LineBetweenObjects") {
      const line = byId.get(rel.line_id);
      const a = byId.get(rel.a_id);
      const b = byId.get(rel.b_id);
      if (!line || !a || !b) continue;
      if (line.type !== "Line" && line.type !== "Arrow" && line.type !== "Vector") continue;
      const pa = a.transform?.position;
      const pb = b.transform?.position;
      if (!pa || !pb) continue;
      line.props.start = [pa[0], pa[1]];
      line.props.end = [pb[0], pb[1]];
    }
    if (rel.type === "LabelFollowsObject") {
      const label = byId.get(rel.label_id);
      const target = byId.get(rel.target_id);
      if (!label || !target) continue;
      if (!label.transform?.position || !target.transform?.position) continue;
      label.transform.position = [target.transform.position[0] + rel.offset[0], target.transform.position[1] + rel.offset[1]];
    }
    if (rel.type === "BraceFollows") {
      const brace = byId.get(rel.brace_id);
      const a = byId.get(rel.a_id);
      const b = byId.get(rel.b_id);
      if (!brace || !a || !b) continue;
      if (brace.type !== "BraceBetweenPoints") continue;
      const pa = a.transform?.position;
      const pb = b.transform?.position;
      if (!pa || !pb) continue;
      brace.props.a = [pa[0], pa[1]];
      brace.props.b = [pb[0], pb[1]];
      if (rel.direction) brace.props.direction = rel.direction;
    }
  }

  return Array.from(byId.values()).map((o) => ({ ...o, __preview: { opacity: opacity.get(o.id) ?? 1 } }));
}

function safeCompileExpr(expr: string): { evaluate: (scope: { x: number }) => unknown } | null {
  try {
    const node = math.parse(expr) as MathNode;
    if (!isSafeMathNode(node)) return null;
    const compiled = node.compile();
    return { evaluate: (scope) => compiled.evaluate(scope) };
  } catch {
    return null;
  }
}

function isSafeMathNode(node: any): boolean {
  const allowedSymbols = new Set(["x"]);
  const allowedFunctions = new Set(["sin", "cos", "tan", "exp", "log", "sqrt", "abs"]);
  const allowedNodeTypes = new Set([
    "OperatorNode",
    "ConstantNode",
    "SymbolNode",
    "ParenthesisNode",
    "FunctionNode"
  ]);

  const stack = [node];
  while (stack.length) {
    const n = stack.pop();
    if (!n || typeof n !== "object" || typeof n.type !== "string") return false;
    if (!allowedNodeTypes.has(n.type)) return false;
    if (n.type === "SymbolNode" && !allowedSymbols.has(n.name)) return false;
    if (n.type === "FunctionNode") {
      const fn = n.fn?.name;
      if (typeof fn !== "string" || !allowedFunctions.has(fn)) return false;
    }
    const childKeys = ["args", "content"];
    for (const k of childKeys) {
      const v = (n as any)[k];
      if (Array.isArray(v)) for (const c of v) stack.push(c);
      else if (v) stack.push(v);
    }
  }
  return true;
}

function applySnapping(
  x: number,
  y: number,
  objectId: string,
  sceneObjects: any[],
  cfg: { snapToCenter: boolean; snapToGrid: boolean; snapToObjects: boolean; gridSize: number; snapThreshold: number }
) {
  let nx = x;
  let ny = y;
  if (cfg.snapToCenter) {
    if (Math.abs(nx) <= cfg.snapThreshold) nx = 0;
    if (Math.abs(ny) <= cfg.snapThreshold) ny = 0;
  }
  if (cfg.snapToObjects) {
    const centers = sceneObjects
      .filter((o: any) => o.id && o.id !== objectId && o.transform?.position)
      .map((o: any) => ({ id: o.id, x: o.transform.position[0], y: o.transform.position[1] }));
    for (const c of centers) {
      if (Math.abs(nx - c.x) <= cfg.snapThreshold) nx = c.x;
      if (Math.abs(ny - c.y) <= cfg.snapThreshold) ny = c.y;
    }
  }
  if (cfg.snapToGrid) {
    const g = cfg.gridSize;
    nx = Math.round(nx / g) * g;
    ny = Math.round(ny / g) * g;
  }
  return { x: nx, y: ny };
}

function computeSnapGuides(
  x: number,
  y: number,
  objectId: string,
  sceneObjects: any[],
  cfg: { snapToCenter: boolean; snapToGrid: boolean; snapToObjects: boolean; gridSize: number; snapThreshold: number }
) {
  let guideX: number | null = null;
  let guideY: number | null = null;
  if (cfg.snapToCenter) {
    if (Math.abs(x) <= cfg.snapThreshold) guideX = 0;
    if (Math.abs(y) <= cfg.snapThreshold) guideY = 0;
  }
  if (cfg.snapToObjects) {
    for (const o of sceneObjects) {
      if (!o?.transform?.position || o.id === objectId) continue;
      const ox = o.transform.position[0];
      const oy = o.transform.position[1];
      if (Math.abs(x - ox) <= cfg.snapThreshold) guideX = ox;
      if (Math.abs(y - oy) <= cfg.snapThreshold) guideY = oy;
    }
  }
  if (cfg.snapToGrid) {
    const g = cfg.gridSize;
    guideX = Math.round(x / g) * g;
    guideY = Math.round(y / g) * g;
  }
  return { guideX, guideY, dxdy: { dx: x, dy: y } };
}

function selectionBounds(selected: any[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (selected.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const o of selected) {
    const pos = o.transform?.position;
    if (!pos) continue;
    const cx = pos[0];
    const cy = pos[1];
    const bb = approxObjectBounds(o, cx, cy);
    minX = Math.min(minX, bb.minX);
    minY = Math.min(minY, bb.minY);
    maxX = Math.max(maxX, bb.maxX);
    maxY = Math.max(maxY, bb.maxY);
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function approxObjectBounds(o: any, cx: number, cy: number): { minX: number; minY: number; maxX: number; maxY: number } {
  const s = o.transform?.scale ?? 1;
  if (o.type === "Circle") {
    const r = (o.props?.radius ?? 1) * s;
    return { minX: cx - r, maxX: cx + r, minY: cy - r, maxY: cy + r };
  }
  if (o.type === "Square") {
    const a = (o.props?.side_length ?? 1) * s;
    return { minX: cx - a / 2, maxX: cx + a / 2, minY: cy - a / 2, maxY: cy + a / 2 };
  }
  if (o.type === "Rectangle") {
    const w = (o.props?.width ?? 1) * s;
    const h = (o.props?.height ?? 1) * s;
    return { minX: cx - w / 2, maxX: cx + w / 2, minY: cy - h / 2, maxY: cy + h / 2 };
  }
  if (o.type === "Ellipse") {
    const rx = ((o.props?.width ?? 1) / 2) * s;
    const ry = ((o.props?.height ?? 1) / 2) * s;
    return { minX: cx - rx, maxX: cx + rx, minY: cy - ry, maxY: cy + ry };
  }
  if (o.type === "Line" || o.type === "Arrow" || o.type === "Vector") {
    const a = o.props?.start ?? [cx, cy];
    const b = o.props?.end ?? [cx, cy];
    return { minX: Math.min(a[0], b[0]), maxX: Math.max(a[0], b[0]), minY: Math.min(a[1], b[1]), maxY: Math.max(a[1], b[1]) };
  }
  // default: small box
  return { minX: cx - 0.2, maxX: cx + 0.2, minY: cy - 0.2, maxY: cy + 0.2 };
}
