from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from models.scene import ScenePayload
from renderer.render import OUTPUTS_DIR, render_scene

app = FastAPI(title="Manim GUI Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/validate")
def validate_scene(payload: ScenePayload) -> dict:
    # Pydantic + shared JSON schema validation runs in the model.
    return {"ok": True}


@app.post("/render")
def render(payload: ScenePayload) -> dict:
    try:
        result = render_scene(payload.scene, quality="l")
        if not result.get("ok"):
            return {"status": "error", "error": result.get("error", "render failed")}
        render_id = result.get("id")
        return {"status": "success", "video_url": f"/outputs/{render_id}/video.mp4", "id": render_id}
    except Exception as e:
        # Always return JSON so the frontend can display a usable error.
        return {"status": "error", "error": str(e)}


@app.get("/outputs/{render_id}/video.mp4")
def get_video(render_id: str) -> FileResponse:
    path = (OUTPUTS_DIR / render_id / "video.mp4").resolve()
    if OUTPUTS_DIR.resolve() not in path.parents:
        raise HTTPException(status_code=400, detail="Invalid render id")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)


@app.get("/outputs/{render_id}/scene.py")
def get_scene(render_id: str) -> FileResponse:
    path = (OUTPUTS_DIR / render_id / "scene.py").resolve()
    if OUTPUTS_DIR.resolve() not in path.parents:
        raise HTTPException(status_code=400, detail="Invalid render id")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)
