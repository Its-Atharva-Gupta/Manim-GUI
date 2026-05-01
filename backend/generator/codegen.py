from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable
import ast
import re

from .templates import SCENE_TEMPLATE


@dataclass(frozen=True)
class GeneratedFile:
    filename: str
    content: str


def generate_scene_py(scene: dict[str, Any]) -> GeneratedFile:
    objects = scene.get("objects", [])
    animations = scene.get("animations", [])
    settings = scene.get("settings", {})
    relationships = scene.get("relationships", [])

    id_to_var: dict[str, str] = {}
    used_vars: set[str] = set()
    lines: list[str] = []
    groups: list[dict[str, Any]] = []

    def emit(line: str = "") -> None:
        lines.append(line)

    emit("# scene settings")
    bg = settings.get("background_color")
    if bg:
        emit(f"self.camera.background_color = {bg}")
        emit()

    emit("# objects")
    for obj in objects:
        obj_id = obj["id"]
        var = _make_var(obj, used_vars)
        id_to_var[obj_id] = var

        if obj["type"] == "Group":
            groups.append(obj)
            continue

        if obj["type"] == "Circle":
            radius = obj["props"]["radius"]
            stroke_color = obj["props"]["stroke_color"]
            emit(f"{var} = Circle(radius={radius}, color={stroke_color})")
            _emit_style(emit, var, obj["props"], default_stroke_color=stroke_color)
        elif obj["type"] == "Square":
            side = obj["props"]["side_length"]
            emit(f"{var} = Square(side_length={side})")
            _emit_style(emit, var, obj["props"])
        elif obj["type"] == "Rectangle":
            width = obj["props"]["width"]
            height = obj["props"]["height"]
            emit(f"{var} = Rectangle(width={width}, height={height})")
            _emit_style(emit, var, obj["props"])
        elif obj["type"] == "Triangle":
            emit(f"{var} = Triangle()")
            _emit_style(emit, var, obj["props"])
        elif obj["type"] == "RegularPolygon":
            n = obj["props"]["n"]
            emit(f"{var} = RegularPolygon(n={n})")
            _emit_style(emit, var, obj["props"])
        elif obj["type"] == "Ellipse":
            width = obj["props"]["width"]
            height = obj["props"]["height"]
            emit(f"{var} = Ellipse(width={width}, height={height})")
            _emit_style(emit, var, obj["props"])
        elif obj["type"] == "Line":
            a = obj["props"]["start"]
            b = obj["props"]["end"]
            emit(f"{var} = Line([{a[0]}, {a[1]}, 0], [{b[0]}, {b[1]}, 0])")
            _emit_line_style(emit, var, obj["props"])
        elif obj["type"] == "Arrow":
            a = obj["props"]["start"]
            b = obj["props"]["end"]
            emit(f"{var} = Arrow([{a[0]}, {a[1]}, 0], [{b[0]}, {b[1]}, 0])")
            _emit_line_style(emit, var, obj["props"])
        elif obj["type"] == "Vector":
            a = obj["props"]["start"]
            b = obj["props"]["end"]
            emit(f"{var} = Arrow([{a[0]}, {a[1]}, 0], [{b[0]}, {b[1]}, 0])")
            _emit_line_style(emit, var, obj["props"])
        elif obj["type"] == "Axes":
            xr = obj["props"]["x_range"]
            yr = obj["props"]["y_range"]
            xlen = obj["props"].get("x_length")
            ylen = obj["props"].get("y_length")
            tips = obj["props"].get("tips")
            args = [f"x_range={xr}", f"y_range={yr}"]
            if xlen is not None:
                args.append(f"x_length={xlen}")
            if ylen is not None:
                args.append(f"y_length={ylen}")
            if tips is not None:
                args.append(f"tips={tips}")
            emit(f"{var} = Axes({', '.join(args)})")
        elif obj["type"] == "NumberPlane":
            xr = obj["props"]["x_range"]
            yr = obj["props"]["y_range"]
            flr = obj["props"].get("faded_line_ratio")
            args = [f"x_range={xr}", f"y_range={yr}"]
            if flr is not None:
                args.append(f"faded_line_ratio={flr}")
            emit(f"{var} = NumberPlane({', '.join(args)})")
        elif obj["type"] == "FunctionPlot":
            axes_id = obj["props"]["axes_id"]
            if axes_id not in id_to_var:
                raise ValueError(f"FunctionPlot {obj_id} references missing axes_id {axes_id}")
            axes_var = id_to_var[axes_id]
            expr = _to_numpy_expr(str(obj["props"]["expr"]))
            xmin, xmax = obj["props"]["domain"]
            fn_name = f"_f_{var}"
            emit(f"def {fn_name}(x):")
            emit(_indent(f"return {expr}", 1))
            emit(f"{var} = {axes_var}.plot({fn_name}, x_range=[{xmin}, {xmax}, 0.01])")
            _emit_line_style(emit, var, obj["props"])
        elif obj["type"] == "Text":
            text = _py_str(obj["props"]["text"])
            color = obj["props"]["color"]
            font_size = obj["props"]["font_size"]
            emit(f'{var} = Text({text}, color={color}, font_size={font_size}, font="Times New Roman")')
            stroke_width = obj["props"].get("stroke_width")
            stroke_color = obj["props"].get("stroke_color")
            if stroke_width is not None and stroke_width > 0:
                sc = stroke_color if stroke_color is not None else color
                emit(f"{var}.set_stroke(color={sc}, width={stroke_width})")
        elif obj["type"] == "Tex":
            tex = _py_str(obj["props"]["tex"])
            color = obj["props"]["color"]
            font_size = obj["props"]["font_size"]
            emit(f"{var} = Tex({tex}, color={color}, font_size={font_size})")
            _emit_text_stroke(emit, var, obj["props"], default_color=color)
        elif obj["type"] == "MathTex":
            tex = _py_str(obj["props"]["tex"])
            color = obj["props"]["color"]
            font_size = obj["props"]["font_size"]
            emit(f"{var} = MathTex({tex}, color={color}, font_size={font_size})")
            _emit_text_stroke(emit, var, obj["props"], default_color=color)
        elif obj["type"] == "BraceBetweenPoints":
            a = obj["props"]["a"]
            b = obj["props"]["b"]
            direction = obj["props"].get("direction", "DOWN")
            color = obj["props"].get("color", "WHITE")
            emit(f"{var} = BraceBetweenPoints([{a[0]}, {a[1]}, 0], [{b[0]}, {b[1]}, 0], direction={direction}, color={color})")
            label = obj["props"].get("label")
            if label and isinstance(label, dict) and label.get("value"):
                ltype = label.get("type", "MathTex")
                lval = _py_str(str(label.get("value")))
                lcolor = label.get("color", color)
                lfs = label.get("font_size")
                if ltype == "Text":
                    if lfs is None:
                        emit(f"{var}_label = Text({lval}, color={lcolor})")
                    else:
                        emit(f"{var}_label = Text({lval}, color={lcolor}, font_size={lfs}, font=\"Times New Roman\")")
                elif ltype == "Tex":
                    if lfs is None:
                        emit(f"{var}_label = Tex({lval}, color={lcolor})")
                    else:
                        emit(f"{var}_label = Tex({lval}, color={lcolor}, font_size={lfs})")
                else:
                    if lfs is None:
                        emit(f"{var}_label = MathTex({lval}, color={lcolor})")
                    else:
                        emit(f"{var}_label = MathTex({lval}, color={lcolor}, font_size={lfs})")
                emit(f"{var}_label.next_to({var}, {direction})")
        elif obj["type"] == "Arc":
            r = obj["props"]["radius"]
            start_angle = obj["props"]["start_angle"]
            angle = obj["props"]["angle"]
            emit(f"{var} = Arc(radius={r}, start_angle={start_angle}, angle={angle})")
            _emit_style(emit, var, obj["props"])
        elif obj["type"] == "Angle":
            a = obj["props"]["a"]
            b = obj["props"]["b"]
            c = obj["props"]["c"]
            radius = obj["props"].get("radius")
            other = obj["props"].get("other_angle")
            args = [f"Line([{b[0]}, {b[1]}, 0], [{a[0]}, {a[1]}, 0])", f"Line([{b[0]}, {b[1]}, 0], [{c[0]}, {c[1]}, 0])"]
            kw: list[str] = []
            if radius is not None:
                kw.append(f"radius={radius}")
            if other is not None:
                kw.append(f"other_angle={other}")
            emit(f"{var} = Angle({args[0]}, {args[1]}{', ' if kw else ''}{', '.join(kw)})")
            _emit_style(emit, var, obj["props"])
        elif obj["type"] == "VerticalLineAtX":
            axes_id = obj["props"]["axes_id"]
            if axes_id not in id_to_var:
                raise ValueError(f"VerticalLineAtX {obj_id} references missing axes_id {axes_id}")
            axes_var = id_to_var[axes_id]
            x_value = obj["props"]["x_value"]
            plot_id = obj["props"].get("plot_id")
            y_range = obj["props"].get("y_range")
            stroke_color = obj["props"].get("stroke_color")
            stroke_width = obj["props"].get("stroke_width")
            if plot_id and plot_id in id_to_var:
                graph_var = id_to_var[plot_id]
                emit(f"{var} = {axes_var}.get_vertical_line({axes_var}.input_to_graph_point({x_value}, {graph_var}))")
            elif y_range is None:
                emit(f"{var} = {axes_var}.get_vertical_line({axes_var}.c2p({x_value}, 0))")
            else:
                emit(f"{var} = Line({axes_var}.c2p({x_value}, {y_range[0]}), {axes_var}.c2p({x_value}, {y_range[1]}))")
            if stroke_color is not None or stroke_width is not None:
                args: list[str] = []
                if stroke_color is not None:
                    args.append(f"color={stroke_color}")
                if stroke_width is not None:
                    args.append(f"width={stroke_width}")
                emit(f"{var}.set_stroke({', '.join(args)})")
        elif obj["type"] == "HighlightPoint":
            axes_id = obj["props"]["axes_id"]
            if axes_id not in id_to_var:
                raise ValueError(f"HighlightPoint {obj_id} references missing axes_id {axes_id}")
            axes_var = id_to_var[axes_id]
            x_value = obj["props"]["x_value"]
            y_value = obj["props"]["y_value"]
            radius = obj["props"].get("radius", 0.08)
            color = obj["props"].get("color", "YELLOW")
            emit(f"{var} = Dot({axes_var}.c2p({x_value}, {y_value}), radius={radius}, color={color})")
        elif obj["type"] == "GraphLabel":
            plot_id = obj["props"]["plot_id"]
            plot_obj = next((o for o in objects if o.get("id") == plot_id), None)
            if not plot_obj or plot_id not in id_to_var:
                raise ValueError(f"GraphLabel {obj_id} references missing plot_id {plot_id}")
            axes_id = plot_obj["props"]["axes_id"]
            axes_var = id_to_var[axes_id]
            graph_var = id_to_var[plot_id]
            x_value = obj["props"]["x_value"]
            label = obj["props"]["label"]
            offset = obj["props"].get("offset", [0, 0])
            ltype = label.get("type", "MathTex")
            lval = _py_str(str(label.get("value", "")))
            lcolor = label.get("color", "WHITE")
            lfs = label.get("font_size")
            if ltype == "Text":
                if lfs is None:
                    emit(f"{var} = Text({lval}, color={lcolor})")
                else:
                    emit(f"{var} = Text({lval}, color={lcolor}, font_size={lfs}, font=\"Times New Roman\")")
            elif ltype == "Tex":
                if lfs is None:
                    emit(f"{var} = Tex({lval}, color={lcolor})")
                else:
                    emit(f"{var} = Tex({lval}, color={lcolor}, font_size={lfs})")
            else:
                if lfs is None:
                    emit(f"{var} = MathTex({lval}, color={lcolor})")
                else:
                    emit(f"{var} = MathTex({lval}, color={lcolor}, font_size={lfs})")
            emit(f"{var}.move_to({axes_var}.input_to_graph_point({x_value}, {graph_var}) + [{offset[0]}, {offset[1]}, 0])")
        else:
            raise ValueError(f"Unsupported object type: {obj['type']}")

        x, y = obj["transform"]["position"]
        emit(f"{var}.move_to([{x}, {y}, 0])")
        if obj["transform"]["scale"] != 1:
            emit(f"{var}.scale({obj['transform']['scale']})")
        if obj["transform"]["rotation"] != 0:
            emit(f"{var}.rotate({obj['transform']['rotation']})")
        emit()

    if groups:
        emit("# groups")
        for g in groups:
            var = id_to_var[g["id"]]
            children = [id_to_var[c] for c in g["props"]["children"] if c in id_to_var]
            emit(f"{var} = VGroup({', '.join(children)})")
            x, y = g["transform"]["position"]
            emit(f"{var}.move_to([{x}, {y}, 0])")
            if g["transform"]["scale"] != 1:
                emit(f"{var}.scale({g['transform']['scale']})")
            if g["transform"]["rotation"] != 0:
                emit(f"{var}.rotate({g['transform']['rotation']})")
            emit()

    if relationships:
        emit("# relationships (updaters)")
        # Deterministic order by relationship id
        for rel in sorted(relationships, key=lambda r: str(r.get("id", ""))):
            rtype = rel.get("type")
            if rtype == "LineBetweenObjects":
                line_id = rel["line_id"]
                a_id = rel["a_id"]
                b_id = rel["b_id"]
                if line_id not in id_to_var or a_id not in id_to_var or b_id not in id_to_var:
                    continue
                line_obj = next((o for o in objects if o.get("id") == line_id), None)
                line_type = (line_obj or {}).get("type", "Line")
                cls = "Line" if line_type == "Line" else "Arrow"
                stroke_color = (line_obj or {}).get("props", {}).get("stroke_color")
                stroke_width = (line_obj or {}).get("props", {}).get("stroke_width")
                style = []
                if stroke_color is not None:
                    style.append(f"color={stroke_color}")
                if stroke_width is not None:
                    style.append(f"width={stroke_width}")
                style_expr = f".set_stroke({', '.join(style)})" if style else ""
                emit(
                    f"{id_to_var[line_id]}.add_updater(lambda z: z.become({cls}({id_to_var[a_id]}.get_center(), {id_to_var[b_id]}.get_center()){style_expr}))"
                )
            elif rtype == "LabelFollowsObject":
                label_id = rel["label_id"]
                target_id = rel["target_id"]
                offset = rel.get("offset", [0, 0])
                if label_id not in id_to_var or target_id not in id_to_var:
                    continue
                emit(
                    f"{id_to_var[label_id]}.add_updater(lambda z: z.move_to({id_to_var[target_id]}.get_center() + [{offset[0]}, {offset[1]}, 0]))"
                )
            elif rtype == "BraceFollows":
                brace_id = rel["brace_id"]
                a_id = rel["a_id"]
                b_id = rel["b_id"]
                direction = rel.get("direction", "DOWN")
                if brace_id not in id_to_var or a_id not in id_to_var or b_id not in id_to_var:
                    continue
                brace_obj = next((o for o in objects if o.get("id") == brace_id), None)
                color = (brace_obj or {}).get("props", {}).get("color", "WHITE")
                emit(
                    f"{id_to_var[brace_id]}.add_updater(lambda z: z.become(BraceBetweenPoints({id_to_var[a_id]}.get_center(), {id_to_var[b_id]}.get_center(), direction={direction}, color={color})))"
                )
        emit()

    emit("# animations")
    # Deterministic play: sort by start then id; for same start, group by (duration, rate_function)
    animations_sorted = sorted(animations, key=lambda a: (a.get("start", 0), a.get("id", "")))
    current_time = 0.0
    i = 0
    while i < len(animations_sorted):
        start = float(animations_sorted[i].get("start", 0))
        if start > current_time:
            emit(f"self.wait({start - current_time})")
            current_time = start

        same_start: list[dict[str, Any]] = []
        j = i
        while j < len(animations_sorted) and float(animations_sorted[j].get("start", 0)) == start:
            same_start.append(animations_sorted[j])
            j += 1

        for subgroup in _group_by_duration_and_rate(same_start):
            run_time = float(subgroup[0].get("duration", 0))
            rate = subgroup[0].get("rate_function", "linear")
            play_args = [_anim_to_manim(a, id_to_var) for a in subgroup]
            rate_expr = _rate_func_expr(rate)
            emit(f"self.play({', '.join(play_args)}, run_time={run_time}, rate_func={rate_expr})")
            current_time += run_time

        i = j

    body = "\n".join([_indent(l, 2) for l in lines if l is not None])
    preamble = _preamble(settings)
    return GeneratedFile(
        filename="scene.py",
        content=SCENE_TEMPLATE.format(preamble=preamble, body=body),
    )



def _preamble(settings: dict[str, Any]) -> str:
    # Keep frame logical units aligned with frontend preview.
    frame_height = 8.0
    frame_width = frame_height * (16 / 9)

    res = settings.get("resolution", "1080p")
    pixel_height = _resolution_height_px(str(res))
    pixel_width = int(round(pixel_height * (16 / 9)))

    return "\n".join(
        [
            f"config.frame_height = {frame_height}",
            f"config.frame_width = {frame_width}",
            f"config.pixel_height = {pixel_height}",
            f"config.pixel_width = {pixel_width}",
        ]
    )


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


def _anim_to_manim(anim: dict[str, Any], id_to_var: dict[str, str]) -> str:
    typ = anim["type"]
    targets = anim.get("targets", [])
    if not targets:
        raise ValueError(f"Animation {anim['id']} has no targets")

    if typ in ("FadeIn", "FadeOut"):
        mob = id_to_var[targets[0]]
        return f"{typ}({mob})"

    if typ in ("Create", "Write"):
        mob = id_to_var[targets[0]]
        return f"{typ}({mob})"

    if typ == "Move":
        mob = id_to_var[targets[0]]
        x, y = anim["props"]["to"]
        return f"{mob}.animate.move_to([{x}, {y}, 0])"

    if typ == "Transform":
        src = id_to_var[targets[0]]
        target_id = anim["props"]["target"]
        dst = id_to_var[target_id]
        return f"Transform({src}, {dst})"

    if typ == "ReplacementTransform":
        src = id_to_var[targets[0]]
        target_id = anim["props"]["target"]
        dst = id_to_var[target_id]
        return f"ReplacementTransform({src}, {dst})"

    if typ == "Scale":
        mob = id_to_var[targets[0]]
        factor = anim["props"]["factor"]
        return f"{mob}.animate.scale({factor})"

    if typ == "Rotate":
        mob = id_to_var[targets[0]]
        angle = anim["props"]["angle"]
        return f"{mob}.animate.rotate({angle})"

    raise ValueError(f"Unsupported animation type: {typ}")


def _safe_var(obj_id: str) -> str:
    return obj_id.replace("-", "_")


def _make_var(obj: dict[str, Any], used: set[str]) -> str:
    base = str(obj.get("name") or obj.get("type") or "obj")
    base = re.sub(r"[^a-zA-Z0-9_]+", "_", base).strip("_").lower()
    if not base:
        base = "obj"
    obj_id = str(obj.get("id", "obj"))
    m = re.search(r"(\d+)$", obj_id)
    suffix = m.group(1) if m else re.sub(r"[^a-zA-Z0-9]+", "", obj_id)[-6:] or "1"
    candidate = f"{base}_{suffix}"
    if candidate[0].isdigit():
        candidate = f"obj_{candidate}"
    var = candidate
    i = 2
    while var in used:
        var = f"{candidate}_{i}"
        i += 1
    used.add(var)
    return var


def _py_str(s: str) -> str:
    return repr(s)


def _indent(line: str, level: int) -> str:
    return (" " * (4 * level)) + line if line else ""


def _emit_style(emit: Any, var: str, props: dict[str, Any], default_stroke_color: str | None = None) -> None:
    stroke_color = props.get("stroke_color") or default_stroke_color
    stroke_width = props.get("stroke_width")
    if stroke_color is not None or stroke_width is not None:
        args: list[str] = []
        if stroke_color is not None:
            args.append(f"color={stroke_color}")
        if stroke_width is not None:
            args.append(f"width={stroke_width}")
        emit(f"{var}.set_stroke({', '.join(args)})")

    fill_color = props.get("fill_color")
    fill_opacity = props.get("fill_opacity")
    if fill_color is not None or fill_opacity is not None:
        fc = fill_color if fill_color is not None else (stroke_color if stroke_color is not None else "WHITE")
        fo = fill_opacity if fill_opacity is not None else 0
        emit(f"{var}.set_fill(color={fc}, opacity={fo})")


def _emit_line_style(emit: Any, var: str, props: dict[str, Any]) -> None:
    stroke_color = props.get("stroke_color")
    stroke_width = props.get("stroke_width")
    args: list[str] = []
    if stroke_color is not None:
        args.append(f"color={stroke_color}")
    if stroke_width is not None:
        args.append(f"width={stroke_width}")
    if args:
        emit(f"{var}.set_stroke({', '.join(args)})")


def _emit_text_stroke(emit: Any, var: str, props: dict[str, Any], default_color: str) -> None:
    stroke_width = props.get("stroke_width")
    stroke_color = props.get("stroke_color")
    if stroke_width is not None and stroke_width > 0:
        sc = stroke_color if stroke_color is not None else default_color
        emit(f"{var}.set_stroke(color={sc}, width={stroke_width})")


def _group_by_duration_and_rate(anims: Iterable[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    buckets: dict[tuple[float, str], list[dict[str, Any]]] = {}
    for a in anims:
        dur = float(a.get("duration", 0))
        rate = str(a.get("rate_function", "linear"))
        buckets.setdefault((dur, rate), []).append(a)
    # stable order: by duration then rate then id
    out: list[list[dict[str, Any]]] = []
    for key in sorted(buckets.keys(), key=lambda k: (k[0], k[1])):
        group = buckets[key]
        group.sort(key=lambda a: str(a.get("id", "")))
        out.append(group)
    return out


def _rate_func_expr(rate: str) -> str:
    if rate in ("linear", "smooth", "rush_into", "rush_from"):
        return rate
    return "linear"


_ALLOWED_FUNCS = {
    "sin": "np.sin",
    "cos": "np.cos",
    "tan": "np.tan",
    "exp": "np.exp",
    "log": "np.log",
    "sqrt": "np.sqrt",
    "abs": "np.abs",
}


def _to_numpy_expr(expr: str) -> str:
    """
    Convert a math-like expression into a numpy-safe python expression.
    Safety: parse to AST and reject any node types outside a safe subset.
    """
    e = expr.strip()
    if not e:
        return "0"
    e = e.replace("^", "**")
    for name, rep in _ALLOWED_FUNCS.items():
        e = _replace_func_name(e, name, rep)

    tree = ast.parse(e, mode="eval")
    _validate_expr_ast(tree)
    return e


def _replace_func_name(expr: str, name: str, rep: str) -> str:
    # naive but safe enough after AST validation; only replaces function calls like name(...)
    return expr.replace(f"{name}(", f"{rep}(")


_ALLOWED_NODES = (
    ast.Expression,
    ast.BinOp,
    ast.UnaryOp,
    ast.Call,
    ast.Attribute,
    ast.Name,
    ast.Load,
    ast.Constant,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.Pow,
    ast.USub,
    ast.UAdd,
)


def _validate_expr_ast(tree: ast.AST) -> None:
    for node in ast.walk(tree):
        if not isinstance(node, _ALLOWED_NODES):
            raise ValueError(f"Unsupported expression element: {type(node).__name__}")
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                raise ValueError("Bare function calls are not allowed")
            if isinstance(node.func, ast.Attribute):
                if not isinstance(node.func.value, ast.Name) or node.func.value.id != "np":
                    raise ValueError("Only numpy functions are allowed")
                if node.func.attr not in {v.split(".")[1] for v in _ALLOWED_FUNCS.values()}:
                    raise ValueError(f"Unsupported function: np.{node.func.attr}")
        if isinstance(node, ast.Name):
            if node.id != "x" and node.id != "np":
                raise ValueError(f"Unsupported name: {node.id}")
