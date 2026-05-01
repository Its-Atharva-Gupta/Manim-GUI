import { useEffect, useMemo, useRef, useState } from "react";

import { useHistoryStore } from "../../store/historyStore";
import { usePreviewStore } from "../../store/previewStore";
import { useSceneStore } from "../../store/sceneStore";

import "./timeline.css";

const PX_PER_SECOND = 120;

export default function Timeline() {
  const scene = useHistoryStore((s) => s.present);
  const time = usePreviewStore((s) => s.time);
  const setTime = usePreviewStore((s) => s.setTime);
  const toggle = usePreviewStore((s) => s.toggle);
  const isPlaying = usePreviewStore((s) => s.isPlaying);

  const updateAnimation = useSceneStore((s) => s.updateAnimation);

  const width = Math.max(400, scene.meta.duration * PX_PER_SECOND);
  const tracks = scene.timeline.tracks;
  const animById = useMemo(() => new Map(scene.animations.map((a) => [a.id, a])), [scene.animations]);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
      return;
    }

    const tick = (ts: number) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;

      const current = usePreviewStore.getState().time;
      const next = Math.min(scene.meta.duration, current + dt);
      setTime(next);
      if (next >= scene.meta.duration) usePreviewStore.getState().pause();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [isPlaying, scene.meta.duration, setTime]);

  return (
    <div className="timelineRoot">
      <div className="timelineHeader">
        <button onClick={toggle}>{isPlaying ? "Pause" : "Play"}</button>
        <label className="scrub">
          <span>t</span>
          <input
            type="range"
            min={0}
            max={scene.meta.duration}
            step={0.01}
            value={Math.min(scene.meta.duration, time)}
            onChange={(e) => setTime(Number(e.target.value))}
          />
          <span className="timeVal">{time.toFixed(2)}s</span>
        </label>
      </div>

      <div className="timelineScroll">
        <div className="timeline" style={{ width }}>
          <div className="playhead" style={{ left: time * PX_PER_SECOND }} />
          {tracks.map((track) => (
            <div className="track" key={track.id}>
              <div className="trackLabel">{track.id}</div>
              <div className="trackLane">
                {track.items
                  .map((id) => animById.get(id))
                  .filter((a): a is NonNullable<typeof a> => Boolean(a))
                  .map((anim) => (
                    <TimelineItem key={anim.id} anim={anim} onUpdate={updateAnimation} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineItem(props: {
  anim: { id: string; type: string; start: number; duration: number };
  onUpdate: (animId: string, patch: { start?: number; duration?: number }) => void;
}) {
  const { anim, onUpdate } = props;
  const [drag, setDrag] = useState<{ startX: number; startStart: number } | null>(null);
  const [resize, setResize] = useState<{ startX: number; startDur: number } | null>(null);

  const left = anim.start * PX_PER_SECOND;
  const w = Math.max(12, anim.duration * PX_PER_SECOND);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (drag) {
        const dx = e.clientX - drag.startX;
        const ds = dx / PX_PER_SECOND;
        onUpdate(anim.id, { start: Math.max(0, drag.startStart + ds) });
      }
      if (resize) {
        const dx = e.clientX - resize.startX;
        const ds = dx / PX_PER_SECOND;
        onUpdate(anim.id, { duration: Math.max(0, resize.startDur + ds) });
      }
    };
    const onUp = () => {
      setDrag(null);
      setResize(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [anim.id, drag, onUpdate, resize]);

  return (
    <div className="item" style={{ left, width: w }} onPointerDown={(e) => e.stopPropagation()}>
      <div
        className="itemBody"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag({ startX: e.clientX, startStart: anim.start });
        }}
      >
        {anim.type}
      </div>
      <div
        className="itemHandle"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setResize({ startX: e.clientX, startDur: anim.duration });
        }}
      />
    </div>
  );
}
