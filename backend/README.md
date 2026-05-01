# Backend (uv-managed)

This backend is intended to run in a `uv` virtual environment to avoid dependency drift.

## Setup

From repo root:

```bash
cd backend
uv venv
uv pip install -r requirements.txt
```

If you want rendering support (requires the `manim` Python package and its system deps):

```bash
cd backend
uv pip install -r requirements-render.txt
```

## Run

From repo root:

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

## Notes

- `/render` requires the `manim` command to be available on `PATH`.
- Render outputs are stored under `backend/outputs/`.
