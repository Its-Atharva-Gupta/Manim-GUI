# Manim GUI Builder

GUI-based editor for building Manim animations.

- Build scenes visually (elements panel + canvas + properties + timeline)
- Preview animations in-browser (fast, approximate)
- Render via Manim through a FastAPI backend (accurate)
- Single source of truth: a `scene` JSON document

This repo follows the architecture and principles described in `AGENTS.md`.

## Quick Start

Prereqs:
- Node.js + npm (for the frontend)
- Python 3.11+ and `uv` (for the backend)
- Manim installed and runnable as `manim` on your PATH (for rendering)

1) Backend

```bash
cd backend
uv venv
uv pip install -r requirements.txt
uv run uvicorn main:app --reload --port 8000
```

If you want rendering support:

```bash
cd backend
uv pip install -r requirements-render.txt
```

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## What Runs Where

- Frontend preview: runs fully in the browser (Konva canvas + interpolation).
- Render output: generated Python is executed by Manim in the backend.
- Preview is intentionally approximate, but we keep coordinate systems aligned:
  - Scene space is centered at `(0, 0)`, +X right, +Y up
  - Preview canvas uses the same Manim-like frame model (8 unit frame height, 16:9 aspect)
  - Pixel resolution is derived from `scene.settings.resolution` (e.g. `1080p`)

## UI Overview

- Left panel ("Elements")
  - Add objects by category (Shapes / Lines / Math / Graphs)
  - Alignment + grouping
  - Snapping toggles (center/grid/objects)
  - Save/load scene JSON
  - Render button
- Canvas
  - Drag objects to move them (updates scene JSON)
  - Shift-click for multi-select
  - Guides: optional alignment lines and a selection bounding box
- Properties panel
  - Edits the currently selected object (position, scale, rotation, style)
  - Object-specific controls (line endpoints, axes ranges, function expressions, etc.)
- Animations panel
  - Add animations to the current selection
  - Edit duration and easing (rate function)
  - Delete animations
  - Move animation supports "Set Target" (click canvas to set destination)
- Timeline
  - Scrub/play preview time
  - Drag to reposition items (start time)
  - Resize to change duration

## Scene JSON (Single Source of Truth)

The entire app runs off one JSON document:

```json
{
  "meta": { "name": "Scene 1", "duration": 5 },
  "objects": [],
  "animations": [],
  "timeline": { "tracks": [{ "id": "track_1", "items": [] }] },
  "settings": { "fps": 30, "resolution": "1080p", "background_color": "BLACK" },
  "relationships": []
}
```

Schema and types:
- `shared/scene.schema.json` is the JSON Schema used for validation (frontend + backend)
- `shared/types.ts` is the TypeScript source-of-truth for the scene model

Important conventions:
- Objects and animations have string IDs like `obj_1`, `anim_1`
- The `timeline.tracks[].items` list holds animation IDs in that track
- Animations use `start` + `duration` (seconds)
- `rate_function` (easing) is one of: `linear`, `smooth`, `rush_into`, `rush_from`

### Object Types (Current)

Core:
- Shapes: `Circle`, `Square`, `Rectangle`, `Triangle`, `RegularPolygon`, `Ellipse`
- Text: `Text`, `Tex`, `MathTex`
- Lines: `Line`, `Arrow`, `Vector`
- Graphing: `Axes`, `NumberPlane`, `FunctionPlot`, `GraphLabel`, `VerticalLineAtX`, `HighlightPoint`
- Helpers: `BraceBetweenPoints`, `Arc`, `Angle`
- Grouping: `Group` (maps to Manim `VGroup`)

Styling:
- Most drawable objects support stroke/fill style via props:
  - `stroke_color`, `stroke_width`
  - `fill_color`, `fill_opacity`

Relationships (preview + codegen updaters):
- `LineBetweenObjects`
- `LabelFollowsObject`
- `BraceFollows`

## Backend API

Backend is a FastAPI service:
- `GET /health`: simple health check
- `POST /validate`: validate the posted `scene` JSON against schema
- `POST /render`: generate `scene.py`, run Manim, save outputs
- `GET /outputs/{id}/video.mp4`: fetch rendered video
- `GET /outputs/{id}/scene.py`: fetch the generated Manim script

Render outputs are saved under:
- `backend/outputs/<render_id>/video.mp4`
- `backend/outputs/<render_id>/scene.py`

## Function Plotting Safety

Function plotting accepts expressions like `sin(x)` and rejects arbitrary execution.

- Frontend: parses/compiles expressions using `mathjs` with a small whitelist.
- Backend: converts expressions into numpy-only expressions and validates the AST
  (no `eval`, no arbitrary names/functions).

## Project Structure

High-level:

```
.
├── frontend/                 # React + Vite + Konva
│   ├── src/
│   │   ├── components/       # Canvas, ElementsPanel, PropertiesPanel, Timeline
│   │   ├── shared/           # validation + migration helpers
│   │   ├── store/            # Zustand stores (scene/history/preview/render/ui)
│   │   └── utils/            # math + id helpers
│   └── package.json
│
├── backend/                  # FastAPI + Manim codegen + renderer
│   ├── main.py               # API entrypoint
│   ├── models/scene.py       # schema validation
│   ├── generator/            # codegen to `scene.py`
│   ├── renderer/             # runs manim + stores outputs
│   ├── requirements.txt
│   ├── requirements-render.txt
│   └── outputs/              # generated renders (ignored by git)
│
└── shared/
    ├── types.ts              # scene model types
    └── scene.schema.json     # JSON schema for scene validation
```

## Dev Notes

### Running tests

Backend schema/codegen tests:

```bash
python3 -m unittest -q backend/tests/test_schema.py backend/tests/test_codegen.py
```

### Common issues

- Frontend build error: `Failed to resolve import "mathjs"`
  - Fix: `cd frontend && npm install`
- Render fails: `manim executable not found on PATH`
  - Fix: ensure `manim` is installed and available on PATH in the backend environment.
  - Note: Manim may require system packages (e.g. `ffmpeg`, graphics libs, and LaTeX for `Tex/MathTex`).
- Tex/MathTex render failures
  - Fix: install a LaTeX distribution and required Manim dependencies for your OS.

## License

No license specified yet.


