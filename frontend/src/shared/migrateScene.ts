import type { Scene } from "../../../shared/types";

export function migrateScene(input: any): any {
  if (!input || typeof input !== "object") return input;
  if (!Array.isArray(input.objects)) return input;

  const migrated = structuredClone(input);

  migrated.objects = migrated.objects.map((o: any) => migrateObject(o));
  migrated.animations = Array.isArray(migrated.animations) ? migrated.animations.map((a: any) => migrateAnimation(a)) : [];

  return migrated as Scene;
}

function migrateObject(o: any): any {
  if (!o || typeof o !== "object") return o;
  if (o.type === "Circle") {
    if (o.props && typeof o.props === "object") {
      if (o.props.color && !o.props.stroke_color) {
        o.props.stroke_color = o.props.color;
        delete o.props.color;
      }
      if (o.props.fill_opacity == null) o.props.fill_opacity = 0;
      if (o.props.stroke_width == null) o.props.stroke_width = 4;
    }
  }
  return o;
}

function migrateAnimation(a: any): any {
  if (!a || typeof a !== "object") return a;
  if (a.rate_function == null) a.rate_function = "linear";
  return a;
}

