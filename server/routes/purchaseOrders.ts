import { Router } from "express";
import { q } from "../db.js";
import { HttpError, idParam, parse } from "../http.js";
import { parseItems } from "./orders.js";

const r = Router();

const SELECT = `SELECT po.id, 'PO-' || lpad(po.id::text, 4, '0') AS code, po.supplier_id, s.name AS supplier, po.status,
  po.expected_date, po.note, po.created_at,
  COALESCE((SELECT sum(qty) FROM purchase_order_items i WHERE i.po_id = po.id), 0)::int AS items,
  COALESCE((SELECT sum(qty * unit_cost) FROM purchase_order_items i WHERE i.po_id = po.id), 0)::float8 AS total
  FROM purchase_orders po LEFT JOIN suppliers s ON s.id = po.supplier_id`;

const lineSchema = {
  product_id: { type: "id", required: true },
  qty: { type: "int", required: true, min: 1, max: 1e6 },
  unit_cost: { type: "number", max: 1e8 },
} as const;

r.get("/", async (req, res) => {
  const where: string[] = [];
  const params: unknown[] = [];
  const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (search) { params.push(`%${search}%`); where.push(`(s.name ILIKE $${params.length} OR ('PO-' || lpad(po.id::text, 4, '0')) ILIKE $${params.length})`); }
  const status = req.query.status;
  if (typeof status === "string" && status) { params.push(status); where.push(`po.status = $${params.length}`); }
  res.json(await q(`${SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY po.created_at DESC, po.id DESC LIMIT 1000`, params));
});

r.get("/:id", async (req, res) => {
  const id = idParam(req);
  const [po] = await q(`${SELECT} WHERE po.id = $1`, [id]);
  if (!po) throw new HttpError(404, "Not found.");
  const lines = await q(
    `SELECT i.id, i.product_id, p.name AS product, p.sku, i.qty, i.unit_cost::float8 AS unit_cost
     FROM purchase_order_items i JOIN products p ON p.id = i.product_id WHERE i.po_id = $1 ORDER BY i.id`,
    [id],
  );
  res.json({ ...po, lines });
});

r.post("/", async (req, res) => {
  const data = parse(req.body, {
    supplier_id: { type: "id", required: true },
    status: { type: "enum", values: ["Draft", "Sent"] },
    expected_date: { type: "date", nullable: true },
    note: { type: "string", max: 1000 },
  });
  const lines = parseItems(req.body?.items, lineSchema);
  const ids = [...new Set(lines.map((l) => l.product_id))];
  const [{ n }] = await q("SELECT count(*)::int AS n FROM products WHERE id = ANY($1::int[])", [ids]);
  if (n !== ids.length) throw new HttpError(400, "One of the products no longer exists.");

  const [created] = await q(
    `WITH po AS (
       INSERT INTO purchase_orders (supplier_id, status, expected_date, note) VALUES ($2, $3, $4, $5) RETURNING id),
     ins AS (
       INSERT INTO purchase_order_items (po_id, product_id, qty, unit_cost)
       SELECT po.id, x.product_id, x.qty, COALESCE(x.unit_cost, 0)
       FROM po, jsonb_to_recordset($1::jsonb) AS x(product_id int, qty int, unit_cost numeric))
     SELECT id FROM po`,
    [JSON.stringify(lines), data.supplier_id, data.status ?? "Draft", data.expected_date ?? null, data.note ?? ""],
  );
  const [po] = await q(`${SELECT} WHERE po.id = $1`, [created.id]);
  res.status(201).json(po);
});

/** Edit status / date / note. Received orders are final; use /receive to receive. */
r.patch("/:id", async (req, res) => {
  const id = idParam(req);
  const data = parse(
    req.body,
    {
      status: { type: "enum", values: ["Draft", "Sent", "Cancelled"] },
      expected_date: { type: "date", nullable: true },
      note: { type: "string", max: 1000 },
    },
    true,
  );
  const cols = Object.keys(data);
  if (!cols.length) throw new HttpError(400, "Nothing to update.");
  const rows = await q(
    `UPDATE purchase_orders SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(", ")}
     WHERE id = $${cols.length + 1} AND status NOT IN ('Received', 'Cancelled') RETURNING id`,
    [...cols.map((c) => data[c]), id],
  );
  if (!rows.length) throw new HttpError(409, "This purchase order can't be changed.");
  const [po] = await q(`${SELECT} WHERE po.id = $1`, [id]);
  res.json(po);
});

/** Marks the order received, adds its items to stock and logs the stock-in movements. */
r.post("/:id/receive", async (req, res) => {
  const id = idParam(req);
  const ref = `SI-${Date.now().toString(36).toUpperCase()}`;
  const rows = await q(
    `WITH po AS (
       UPDATE purchase_orders SET status = 'Received' WHERE id = $1 AND status IN ('Draft', 'Sent') RETURNING id, supplier_id),
     mv AS (
       INSERT INTO stock_movements (ref, type, product_id, qty, reason, supplier_id, unit_cost, user_id)
       SELECT $2, 'in', i.product_id, i.qty, 'Purchase order', po.supplier_id, i.unit_cost, $3::int
       FROM purchase_order_items i JOIN po ON po.id = i.po_id),
     st AS (
       UPDATE products p SET stock = p.stock + s.qty
       FROM (SELECT i.product_id, sum(i.qty)::int AS qty FROM purchase_order_items i JOIN po ON po.id = i.po_id GROUP BY i.product_id) s
       WHERE p.id = s.product_id)
     SELECT id FROM po`,
    [id, ref, req.user!.id],
  );
  if (!rows.length) throw new HttpError(409, "This purchase order was already received or cancelled.");
  const [po] = await q(`${SELECT} WHERE po.id = $1`, [id]);
  res.json(po);
});

r.delete("/:id", async (req, res) => {
  const rows = await q("DELETE FROM purchase_orders WHERE id = $1 AND status <> 'Received' RETURNING id", [idParam(req)]);
  if (!rows.length) throw new HttpError(409, "Received purchase orders can't be deleted.");
  res.json({ ok: true });
});

export default r;
