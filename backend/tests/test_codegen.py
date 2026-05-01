import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import unittest

from generator.codegen import generate_scene_py


class TestCodegen(unittest.TestCase):
    def test_generates_basic_scene(self) -> None:
        scene = {
            "meta": {"name": "Scene 1", "duration": 5},
            "objects": [
                {
                    "id": "obj_1",
                    "name": "Circle",
                    "type": "Circle",
                    "props": {"radius": 2, "stroke_color": "BLUE", "stroke_width": 4, "fill_opacity": 0},
                    "transform": {"position": [0, 0], "scale": 1, "rotation": 0},
                }
            ],
            "animations": [
                {
                    "id": "anim_1",
                    "type": "FadeIn",
                    "targets": ["obj_1"],
                    "start": 0,
                    "duration": 1,
                    "rate_function": "linear",
                    "props": {},
                }
            ],
            "timeline": {"tracks": [{"id": "track_1", "items": ["anim_1"]}]},
            "settings": {"fps": 30, "resolution": "1080p", "background_color": "BLACK"},
        }

        gen = generate_scene_py(scene)
        self.assertIn("class GeneratedScene(Scene):", gen.content)
        self.assertIn("= Circle", gen.content)
        self.assertIn("self.play(FadeIn(", gen.content)


if __name__ == "__main__":
    unittest.main()
