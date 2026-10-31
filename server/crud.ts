import { Router } from "express";
import { q } from "./db.js";
import { HttpError, idParam, parse, type Schema } from "./http.js";

interface CrudOptions {
  /** Base SELECT using alias `t` for the main table; must expose `t.id`. */
  select: string;
  table: string;
  schema: Schema;
  orderBy: string;
  /** Columns searched by ?q= */
  search: string[];
  /** Query-string filters: { param: "column" } */
  filters?: Record<string, string>;
}

/** Standard list / get / create / update / delete for one table. */
export function crud(o: CrudOptions) {
  const r = Router();
  const one = async (id: number) => (await q(`${o.select} WHERE t.id = $1`, [id]))[0];

  r.get("/", async (req, res) => {
    const where: string[] = [];
    const params: unknown[] = [];
    const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (search) {
      params.push(`%${search}%`);
      where.push(`(${o.search.map((c) => `${c} ILIKE $${params.length}`).join(" OR ")})`);
    }
    for (const [param, col] of Object.entries(o.filters ?? {})) {
      const v = req.query[param];
      if (typeof v === "string" && v) { params.push(v); where.push(`${col} = $${params.length}`); }
    }
    res.json(await q(`${o.select} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${o.orderBy} LIMIT 1000`, params));
  });

  r.get("/:id", async (req, res) => {
    const row = await one(idParam(req));
    if (!row) throw new HttpError(404, "Not found.");
    res.status(200).json(row);
  });

  r.post("/", async (req, res) => {
    const data = parse(req.body, o.schema);
    const cols = Object.keys(data);
    if (!cols.length) throw new HttpError(400, "Nothing to save.");
    const [{ id }] = await q(
      `INSERT INTO ${o.table} (${cols.join(", ")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      cols.map((c) => data[c]),
    );
    res.status(201).json(await one(id));
  });

  r.patch("/:id", async (req, res) => {
    const id = idParam(req);
    const data = parse(req.body, o.schema, true);
    const cols = Object.keys(data);
    if (!cols.length) throw new HttpError(400, "Nothing to update.");
    const rows = await q(
      `UPDATE ${o.table} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(", ")} WHERE id = $${cols.length + 1} RETURNING id`,
      [...cols.map((c) => data[c]), id],
    );
    if (!rows.length) throw new HttpError(404, "Not found.");
    res.json(await one(id));
  });

  r.delete("/:id", async (req, res) => {
    const rows = await q(`DELETE FROM ${o.table} WHERE id = $1 RETURNING id`, [idParam(req)]);
    if (!rows.length) throw new HttpError(404, "Not found.");
    res.json({ ok: true });
  });

  return r;
}
