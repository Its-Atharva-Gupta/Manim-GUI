from __future__ import annotations

import subprocess
import tempfile
import uuid
import shutil
from pathlib import Path
from typing import Any

from generator.codegen import generate_scene_py


OUTPUTS_DIR = Path(__file__).resolve().parents[1] / "outputs"


def render_scene(scene: dict[str, Any], quality: str = "l") -> dict[str, Any]:
    """
    Renders a scene by generating a temporary manim file and executing manim.

    quality:
      - "l" => -pql
      - "m" => -pqm
      - "h" => -pqh
    """
    flag = {"l": "-pql", "m": "-pqm", "h": "-pqh"}.get(quality, "-pql")
    manim_bin = shutil.which("manim")
    if not manim_bin:
        return {
            "ok": False,
            "error": "manim executable not found on PATH",
            "hint": "Install manim and ensure the `manim` command is available, then restart the backend.",
        }

    with tempfile.TemporaryDirectory(prefix="manim-gui-") as tmp:
        tmp_path = Path(tmp)
        generated = generate_scene_py(scene)
        scene_py = tmp_path / generated.filename
        scene_py.write_text(generated.content, encoding="utf-8")

        pixel_height = _resolution_height_px(str(scene.get("settings", {}).get("resolution", "1080p")))
        pixel_width = int(round(pixel_height * (16 / 9)))
        cmd = [manim_bin, str(scene_py), "GeneratedScene", flag, "-r", f"{pixel_width},{pixel_height}"]
        proc = subprocess.run(cmd, cwd=str(tmp_path), capture_output=True, text=True)
        if proc.returncode != 0:
            return {
                "ok": False,
                "error": "manim failed",
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "cmd": cmd,
            }

        media_dir = tmp_path / "media"
        mp4s = sorted(media_dir.rglob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not mp4s:
            return {"ok": False, "error": "render succeeded but no mp4 found", "media_dir": str(media_dir)}

        OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
        out_id = uuid.uuid4().hex
        out_dir = OUTPUTS_DIR / out_id
        out_dir.mkdir(parents=True, exist_ok=True)

        out_video = out_dir / "video.mp4"
        out_video.write_bytes(mp4s[0].read_bytes())

        out_scene = out_dir / "scene.py"
        out_scene.write_text(generated.content, encoding="utf-8")

        return {
            "ok": True,
            "id": out_id,
            "video_path": str(out_video),
            "scene_path": str(out_scene),
        }


def _resolution_height_px(resolution: str) -> int:
    r = resolution.strip().lower()
    if r in ("2160p", "4k"):
        return 2160
    if r == "1440p":
        return 1440
    if r == "1080p":
        return 1080
    if r == "720p":
        return 720
    if r == "480p":
        return 480
    if r.endswith("p"):
        try:
            return int(r[:-1])
        except ValueError:
            return 1080
    return 1080
