from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from pydantic import BaseModel, Field, field_validator


def _load_shared_schema() -> dict[str, Any]:
    # backend/models/scene.py -> backend/models -> backend -> repo root -> shared/scene.schema.json
    schema_path = Path(__file__).resolve().parents[2] / "shared" / "scene.schema.json"
    return json.loads(schema_path.read_text(encoding="utf-8"))


_SCHEMA = _load_shared_schema()
_VALIDATOR = Draft202012Validator(_SCHEMA)


class ScenePayload(BaseModel):
    scene: dict[str, Any] = Field(..., description="Scene JSON (single source of truth)")

    @field_validator("scene")
    @classmethod
    def validate_against_schema(cls, v: dict[str, Any]) -> dict[str, Any]:
        errors = sorted(_VALIDATOR.iter_errors(v), key=lambda e: list(e.path))
        if errors:
            first = errors[0]
            loc = "/".join([str(p) for p in first.path]) if first.path else "(root)"
            raise ValueError(f"Scene schema validation failed at {loc}: {first.message}")
        return v
