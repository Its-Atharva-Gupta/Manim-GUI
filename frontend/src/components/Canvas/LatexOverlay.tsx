import katex from "katex";
import "katex/dist/katex.min.css";

type LatexItem = {
  id: string;
  x: number;
  y: number;
  rotationDeg: number;
  opacity: number;
  color: string;
  fontPx: number;
  tex: string;
  displayMode: boolean;
};

export default function LatexOverlay({ width, height, items }: { width: number; height: number; items: LatexItem[] }) {
  return (
    <div style={{ position: "absolute", inset: 0, width, height, pointerEvents: "none" }}>
      {items.map((it) => {
        const html = katex.renderToString(it.tex ?? "", {
          throwOnError: false,
          displayMode: it.displayMode,
          strict: "ignore"
        });
        return (
          <div
            key={it.id}
            style={{
              position: "absolute",
              left: it.x,
              top: it.y,
              transform: `translate(-50%, -50%) rotate(${it.rotationDeg}deg)`,
              transformOrigin: "center",
              opacity: it.opacity,
              color: it.color,
              fontSize: it.fontPx,
              lineHeight: 1
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

