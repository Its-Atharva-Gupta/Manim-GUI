
# AGENT.md — Manim GUI Builder (Canvas + Timeline + Code Generator)

---

## 🧠 PROJECT OVERVIEW

Build a **GUI-based editor for Manim animations** where users:
- Create objects visually on a canvas
- Adjust properties using panels (with drag-adjust inputs)
- Define animations via a timeline
- Preview in real-time (approximate)
- Click **Generate** to produce Manim Python code and render output

---

## 🎯 CORE PRINCIPLES

1. **Stay close to Manim**
   - Same coordinate system (center = [0,0])
   - Same animation concepts (`FadeIn`, `Transform`, etc.)

2. **Preview ≠ Render**
   - Preview is fast, approximate (frontend)
   - Render is accurate (Manim backend)

3. **Single Source of Truth**
   - Entire app driven by a single `scene JSON`

4. **No direct code editing**
   - Everything maps from GUI → JSON → Manim code

5. **Immutable state**
   - Required for undo/redo

---

## 🧱 TECH STACK

### Frontend
- React
- Zustand (state management)
- Konva.js (canvas rendering)
- React Timeline (custom or lightweight lib)

### Backend
- FastAPI
- Manim

---

## 📁 PROJECT STRUCTURE

```

root/
├── frontend/
│   ├── components/
│   │   ├── Canvas/
│   │   ├── PropertiesPanel/
│   │   ├── Timeline/
│   │   └── Toolbar/
│   ├── store/
│   │   ├── sceneStore.ts
│   │   └── historyStore.ts
│   ├── utils/
│   │   ├── idGenerator.ts
│   │   └── math.ts
│   └── App.tsx
│
├── backend/
│   ├── main.py
│   ├── generator/
│   │   ├── codegen.py
│   │   └── templates.py
│   ├── renderer/
│   │   └── render.py
│   └── models/
│       └── scene.py
│
└── shared/
└── types.ts

````

---

## 🧩 SCENE DATA MODEL (SOURCE OF TRUTH)

```json
{
  "meta": {
    "name": "Scene 1",
    "duration": 5
  },
  "objects": [
    {
      "id": "obj_1",
      "name": "Circle",
      "type": "Circle",
      "props": {
        "radius": 2,
        "color": "BLUE"
      },
      "transform": {
        "position": [0, 0],
        "scale": 1,
        "rotation": 0
      }
    }
  ],
  "animations": [
    {
      "id": "anim_1",
      "type": "FadeIn",
      "targets": ["obj_1"],
      "start": 0,
      "duration": 1,
      "props": {}
    }
  ],
  "timeline": {
    "tracks": [
      {
        "id": "track_1",
        "items": ["anim_1"]
      }
    ]
  },
  "settings": {
    "fps": 30,
    "resolution": "1080p",
    "background_color": "BLACK"
  }
}
````

---

## 🧠 STATE MANAGEMENT (ZUSTAND)

### sceneStore.ts

Responsibilities:

* Hold current scene JSON
* CRUD for objects & animations
* Selection state

### historyStore.ts

```ts
{
  past: Scene[],
  present: Scene,
  future: Scene[]
}
```

### Rules:

* Every change → push snapshot
* Undo → move backward
* Redo → move forward
* NEVER mutate state directly

---

## 🎨 CANVAS SYSTEM

### Requirements:

* Render objects using Konva
* Support:

  * Drag to move
  * Resize (later)
  * Selection

### Coordinate System:

* Center = (0,0)
* X right positive
* Y up positive (invert for canvas)

### Sync:

* Dragging updates scene JSON
* JSON updates re-render canvas

---

## 🎛️ PROPERTIES PANEL

Tabs:

* Style
* Layout
* Animations

---

### 🔥 Drag-Adjust Inputs (CRITICAL FEATURE)

Behavior:

* Drag LEFT → decrease value
* Drag RIGHT → increase value
* Updates live canvas

Modifiers:

* Shift → fine control
* Ctrl → fast control

---

## 🎞️ TIMELINE SYSTEM

### Features:

* Horizontal time axis
* Tracks for grouping animations
* Drag to move animations
* Resize to change duration

### Rules:

* Animations CAN overlap
* Timeline reflects `start` and `duration`

---

## 🎬 ANIMATION SYSTEM

### Types (MVP):

* FadeIn
* FadeOut
* Transform
* Move (via position change)

---

### Transform Logic:

```json
{
  "type": "Transform",
  "targets": ["obj_1"],
  "props": {
    "target": "obj_2"
  }
}
```

Behavior:

* Source object becomes target

---

## 🔄 OBJECT MANAGEMENT

* IDs: auto-generated (`obj_1`)
* Names: user-editable
* Selection: single-select (MVP)

---

## 🔧 ALIGNMENT SYSTEM (MVP)

* Center
* Align horizontally
* Align vertically

---

## 🔁 UNDO / REDO

Use snapshot-based history.

Operations:

* `undo()`
* `redo()`

---

## 🧠 CODE GENERATION

### Step 1: Generate Objects

```python
circle = Circle(radius=2)
circle.move_to([0, 0, 0])
```

---

### Step 2: Sort Animations

* Sort by `start`
* Group overlapping animations

---

### Step 3: Generate Plays

```python
self.play(FadeIn(circle))
```

---

### Step 4: Full Template

```python
from manim import *

class GeneratedScene(Scene):
    def construct(self):
        # objects

        # animations
```

---

## ⚙️ RENDER PIPELINE

### API Endpoint

POST `/render`

Body:

```json
{
  "scene": {...}
}
```

---

### Backend Flow

1. Receive scene JSON
2. Generate Python file
3. Run:

```powershell
manim scene.py GeneratedScene -pql
```

4. Return video path

---

## 📺 PREVIEW SYSTEM

* Runs in frontend only
* Uses simple animation interpolation
* Supports:

  * Position
  * Opacity
  * Scale

---

## ⚠️ LIMITATIONS (INTENTIONAL)

* No 3D (MVP)
* No physics
* No advanced easing
* Preview ≠ exact Manim output

---

## 🚀 MVP FEATURE LIST

* Add objects (Circle, Text)
* Move via drag
* Edit properties
* Drag-adjust inputs
* Timeline (basic)
* FadeIn / Transform
* Generate + render
* Undo/Redo
* Local JSON save/load

---

## 📦 FUTURE FEATURES

* Node editor (advanced mode)
* AI prompt → scene
* Collaboration
* Keyframes
* More Manim objects

---

## 🧠 FINAL NOTE

This system is:

> A visual compiler for Manim

NOT:

* A full renderer
* NOT a simulation engine

---

## ✅ BUILD ORDER (MANDATORY)

1. Scene data model
2. Zustand store
3. Canvas rendering
4. Object creation
5. Drag movement
6. Properties panel
7. Drag-adjust inputs
8. Timeline
9. Animation system
10. Undo/Redo
11. Code generator
12. Backend render


---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS (STRICT)

This section defines **non-negotiable implementation constraints**. Any coding agent must follow these exactly.

---

## 🧱 FRONTEND STACK (LOCKED)

### Core
- React (latest stable)
- TypeScript (STRICT mode ON)
- Vite (build tool)

### State Management
- Zustand ONLY (no Redux, no Context for global state)

### Canvas Rendering
- Konva.js
- react-konva bindings

### Timeline
- Custom implementation (no heavy external editors)

### Styling
- Tailwind CSS

---

## 📦 FRONTEND PACKAGE RULES

- Use **npm ONLY** (no pnpm, no yarn)

```powershell
npm create vite@latest frontend
cd frontend
npm install
````

---

### Required Dependencies

```powershell
npm install zustand react-konva konva nanoid
npm install -D typescript @types/react @types/react-dom tailwindcss postcss autoprefixer
```

---

## 🧠 FRONTEND ARCHITECTURE RULES

* NO prop drilling beyond 2 levels
* All global state MUST be in Zustand
* Components must be:

  * Small
  * Reusable
  * Single responsibility

---

## 🧱 BACKEND STACK (LOCKED)

### Core

* Python 3.11+
* FastAPI
* Manim

### Package Manager

* **uv (MANDATORY)**

---

## 📦 BACKEND SETUP

```powershell
uv init backend
cd backend
uv venv
uv pip install fastapi uvicorn manim pydantic
```

---

## 🚫 BACKEND RULES

* DO NOT use Flask
* DO NOT use Django
* DO NOT mix async/sync inconsistently

---

## 🧠 API DESIGN RULES

### Endpoint: Render

```
POST /render
```

Body:

```json
{
  "scene": {...}
}
```

Response:

```json
{
  "status": "success",
  "video_url": "/outputs/scene.mp4"
}
```

---

## 🧠 CODE GENERATION RULES

* Must be deterministic
* No randomness
* Always:

  * Create objects first
  * Then animations
  * Then play in timeline order

---

## 🧱 FILE GENERATION RULES

* Generated Python file path:

```
/tmp/generated_scene.py
```

* Output directory:

```
/outputs/
```

---

## ⚙️ MANIM EXECUTION RULES

Preview:

```powershell
manim generated_scene.py GeneratedScene -pql
```

High quality:

```powershell
manim generated_scene.py GeneratedScene -pqh
```

---

## 🔄 STATE MANAGEMENT RULES

* NEVER mutate state directly
* ALWAYS use immutable updates

Bad:

```ts
state.objects.push(obj)
```

Good:

```ts
set(state => ({
  objects: [...state.objects, obj]
}))
```

---

## 🆔 ID GENERATION RULES

* Use `nanoid`
* Format:

  * objects → `obj_xxx`
  * animations → `anim_xxx`

---

## 🧠 NUMERIC INPUT DRAG RULES

* Use `pointer events` (NOT mouse-only)
* Must support:

  * drag left/right
  * shift modifier (fine)
  * ctrl modifier (fast)

---

## 🎞️ TIMELINE RULES

* Time unit: seconds (float)
* Precision: up to 2 decimal places
* Animations must NEVER auto-snap unless explicitly implemented

---

## 💾 STORAGE RULES

* Save project as JSON
* No database in MVP
* Use:

  * Download JSON
  * Upload JSON

---

## 🚫 WHAT NOT TO DO

* No WebSockets (MVP)
* No authentication system
* No cloud storage
* No SSR frameworks (Next.js, etc.)

---

## 🧪 TESTING (MINIMAL)

* Validate:

  * JSON schema
  * Code generation correctness

---

## 🧠 PERFORMANCE RULES

* Debounce heavy updates (dragging)
* Avoid unnecessary re-renders
* Memoize canvas components

---

## 📁 NAMING CONVENTIONS

* camelCase (JS/TS)
* snake_case (Python)
* PascalCase (React components)

---

## ⚠️ FINAL WARNING

If any implementation:

* deviates from Manim behavior
* breaks deterministic output
* introduces unnecessary abstraction

→ it must be rejected.

---

END OF TECHNICAL SPEC


