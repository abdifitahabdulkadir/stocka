import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Field = {
  type: "string" | "email" | "int" | "number" | "bool" | "date" | "enum" | "id";
  required?: boolean;
  max?: number;
  min?: number;
  values?: readonly string[];
  /** Allow null (clears the column). */
  nullable?: boolean;
};
export type Schema = Record<string, Field>;

/** Validates a request body against a schema. With `partial`, absent keys are skipped (for PATCH). */
export function parse(body: any, schema: Schema, partial = false): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, f] of Object.entries(schema)) {
    let v = body?.[key];
    if (v === undefined || (v === "" && f.type !== "string")) {
      if (v === "" && f.nullable) v = null;
      else if (partial || !f.required) { if (v === null || v === undefined || v === "") continue; }
      else throw new HttpError(400, `${key} is required.`);
    }
    if (v === null) {
      if (!f.nullable) throw new HttpError(400, `${key} cannot be empty.`);
      out[key] = null;
      continue;
    }
    switch (f.type) {
      case "string":
      case "email":
        if (typeof v !== "string") throw new HttpError(400, `${key} must be text.`);
        v = v.trim();
        if (f.required && !v) throw new HttpError(400, `${key} is required.`);
        if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new HttpError(400, "Enter a valid email address.");
        if (v.length > (f.max ?? 500)) throw new HttpError(400, `${key} is too long.`);
        if (f.type === "email") v = v.toLowerCase();
        break;
      case "int":
      case "id":
      case "number": {
        const n = typeof v === "string" ? Number(v) : v;
        if (typeof n !== "number" || !Number.isFinite(n)) throw new HttpError(400, `${key} must be a number.`);
        if (f.type !== "number" && !Number.isInteger(n)) throw new HttpError(400, `${key} must be a whole number.`);
        if (n < (f.min ?? (f.type === "id" ? 1 : 0))) throw new HttpError(400, `${key} is too small.`);
        if (n > (f.max ?? 1e9)) throw new HttpError(400, `${key} is too large.`);
        v = n;
        break;
      }
      case "bool":
        if (typeof v !== "boolean") throw new HttpError(400, `${key} must be true or false.`);
        break;
      case "date":
        if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new HttpError(400, `${key} must be a date (YYYY-MM-DD).`);
        break;
      case "enum":
        if (typeof v !== "string" || !f.values!.includes(v)) throw new HttpError(400, `${key} must be one of: ${f.values!.join(", ")}.`);
        break;
    }
    out[key] = v;
  }
  return out;
}

export const idParam = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, "Not found.");
  return id;
};

export const onError: ErrorRequestHandler = (err, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
  if (err?.type === "entity.parse.failed" || err?.type === "entity.too.large")
    return void res.status(400).json({ error: "Invalid request." });
  // Postgres errors (surfaced by the Neon driver)
  if (err?.code === "23505") return void res.status(409).json({ error: "That value already exists." });
  if (err?.code === "23503") return void res.status(409).json({ error: "This record is used by other records." });
  if (err?.code === "23514")
    return void res.status(409).json({ error: err.constraint === "products_stock_check" ? "Not enough stock." : "Invalid value." });
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
};
