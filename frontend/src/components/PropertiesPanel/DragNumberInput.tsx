import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
};

export default function DragNumberInput({ label, value, step = 0.1, min, max, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef<{ x: number; value: number } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      const dx = e.clientX - start.x;

      let speed = 1;
      if (e.shiftKey) speed = 0.1;
      if (e.ctrlKey) speed = 10;

      const next = start.value + dx * step * speed;
      onChange(clamp(next, min, max));
    };
    const onUp = () => {
      startRef.current = null;
      setIsDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [max, min, onChange, step]);

  return (
    <label className="row">
      <span
        style={{ cursor: "ew-resize", userSelect: "none", opacity: isDragging ? 0.8 : 1 }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startRef.current = { x: e.clientX, value };
          setIsDragging(true);
        }}
        title="Drag left/right to adjust (Shift=fine, Ctrl=fast)"
      >
        {label}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
      />
    </label>
  );
}

function clamp(v: number, min?: number, max?: number): number {
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;
  return Math.min(hi, Math.max(lo, v));
}

