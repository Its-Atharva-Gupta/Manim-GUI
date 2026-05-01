import Ajv2020 from "ajv/dist/2020";
import { z } from "zod";
import sceneSchemaJson from "../../../shared/scene.schema.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(sceneSchemaJson as object);

const SceneSchema = z.any().superRefine((value, ctx) => {
  const ok = validate(value);
  if (ok) return;

  const msg =
    validate.errors
      ?.map((e) => `${e.instancePath || "(root)"}: ${e.message ?? "invalid"}`)
      .join("\n") ?? "Scene is invalid";

  ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
});

export function validateScene(value: unknown): { ok: true } | { ok: false; error: string } {
  const result = SceneSchema.safeParse(value);
  if (result.success) return { ok: true };
  return { ok: false, error: result.error.issues.map((i) => i.message).join("\n") };
}
