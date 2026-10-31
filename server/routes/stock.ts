import { Router } from "express";
import { q } from "../db";
import { HttpError, parse } from "../http";
import { notifyLowStock } from "../notify";
import { parseItems } from "./orders";

const r = Router();

const SELECT = `SELECT m.id, m.ref, m.type, m.product_id, p.name AS product, p.sku, m.qty, m.reason,
  m.supplier_id, s.name AS supplier, m.unit_cost::float8 AS unit_cost, m.note, u.email AS "user", m.created_at
  FROM stock_movements m
  JOIN products p ON p.id = m.product_id
  LEFT JOIN suppliers s ON s.id = m.supplier_id
  LEFT JOIN users u ON u.id = m.user_id`;

r.get("/", async (req, res) => {
  const where: string[] = [];
  const params: unknown[] = [];
  for (const [param, col] of [["type", "m.type"], ["product_id", "m.product_id"]] as const) {
    const v = req.query[param];
    if (typeof v === "string" && v) { params.push(v); where.push(`${col} = $${params.length}`); }
  }
  res.json(await q(`${SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY m.created_at DESC, m.id DESC LIMIT 500`, params));
});

/**
 * Records stock coming in or going out, one row per line, and updates product stock in the same statement.
 * Body: { type: "in" | "out", supplier_id?, note?, lines: [{ product_id, qty, reason?, unit_cost? }] }
 */
r.post("/", async (req, res) => {
  const head = parse(req.body, {
    type: { type: "enum", required: true, values: ["in", "out"] },
    supplier_id: { type: "id", nullable: true },
    note: { type: "string", max: 500 },
  });
  const lines = parseItems(req.body?.lines, {
    product_id: { type: "id", required: true },
    qty: { type: "int", required: true, min: 1, max: 1e6 },
    reason: { type: "string", max: 200 },
    unit_cost: { type: "number", nullable: true, max: 1e8 },
  });
  const ids = [...new Set(lines.map((l) => l.product_id))];
  const [{ n }] = await q("SELECT count(*)::int AS n FROM products WHERE id = ANY($1::int[])", [ids]);
  if (n !== ids.length) throw new HttpError(400, "One of the products no longer exists.");

  const ref = `${head.type === "in" ? "SI" : "SO"}-${Date.now().toString(36).toUpperCase()}`;
  await q(
    `WITH l AS (
       SELECT * FROM jsonb_to_recordset($1::jsonb) AS x(product_id int, qty int, reason text, unit_cost numeric)),
     ins AS (
       INSERT INTO stock_movements (ref, type, product_id, qty, reason, supplier_id, unit_cost, note, user_id)
       SELECT $5, $2::text, product_id, qty, COALESCE(reason, ''), $3::int, unit_cost, $4::text, $6::int FROM l),
     agg AS (SELECT product_id, sum(qty)::int AS qty FROM l GROUP BY product_id)
     UPDATE products p SET stock = p.stock + CASE WHEN $2::text = 'in' THEN a.qty ELSE -a.qty END
     FROM agg a WHERE p.id = a.product_id`,
    [JSON.stringify(lines), head.type, head.supplier_id ?? null, head.note ?? "", ref, req.user!.id],
  );
  if (head.type === "out") await notifyLowStock(ids);
  res.status(201).json({ ref });
});

export default r;
