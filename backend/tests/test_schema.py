import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator

import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class TestSchema(unittest.TestCase):
    def test_sample_scene_validates(self) -> None:
        root = Path(__file__).resolve().parents[2]
        schema = json.loads((root / "shared" / "scene.schema.json").read_text(encoding="utf-8"))
        validator = Draft202012Validator(schema)

        sample = {
            "meta": {"name": "Scene 1", "duration": 5},
            "objects": [
                {
                    "id": "obj_1",
                    "name": "Circle",
                    "type": "Circle",
                    "props": {
                        "radius": 2,
                        "stroke_color": "BLUE",
                        "stroke_width": 4,
                        "fill_opacity": 0,
                    },
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

        errors = sorted(validator.iter_errors(sample), key=lambda e: list(e.path))
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
