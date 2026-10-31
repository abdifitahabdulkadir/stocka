import { Router } from "express";
import { q } from "../db.js";
import { HttpError, idParam, parse } from "../http.js";
import { notifyLowStock } from "../notify.js";

const r = Router();

const SELECT = `SELECT o.id, 'ORD-' || lpad(o.id::text, 4, '0') AS code, o.customer_id, c.name AS customer,
  o.status, o.source, o.total::float8 AS total, o.created_at,
  COALESCE((SELECT sum(qty) FROM order_items i WHERE i.order_id = o.id), 0)::int AS items
  FROM orders o LEFT JOIN customers c ON c.id = o.customer_id`;

const itemsSchema = { product_id: { type: "id", required: true }, qty: { type: "int", required: true, min: 1, max: 1e6 } } as const;

export function parseItems(raw: unknown, schema: Record<string, any> = itemsSchema) {
  if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(400, "Add at least one item.");
  if (raw.length > 200) throw new HttpError(400, "Too many items.");
  return raw.map((it) => parse(it, schema));
}

r.get("/", async (req, res) => {
  const where: string[] = [];
  const params: unknown[] = [];
  const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (search) { params.push(`%${search}%`); where.push(`(c.name ILIKE $${params.length} OR ('ORD-' || lpad(o.id::text, 4, '0')) ILIKE $${params.length})`); }
  for (const col of ["status", "source", "customer_id"] as const) {
    const v = req.query[col];
    if (typeof v === "string" && v) { params.push(v); where.push(`o.${col} = $${params.length}`); }
  }
  res.json(await q(`${SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY o.created_at DESC, o.id DESC LIMIT 1000`, params));
});

r.get("/:id", async (req, res) => {
  const id = idParam(req);
  const [order] = await q(`${SELECT} WHERE o.id = $1`, [id]);
  if (!order) throw new HttpError(404, "Not found.");
  const items = await q(
    "SELECT id, product_id, name, qty, unit_price::float8 AS unit_price FROM order_items WHERE order_id = $1 ORDER BY id",
    [id],
  );
  res.json({ ...order, lines: items });
});

/** Creates an order (or POS sale) and decrements stock atomically; fails with 409 if stock is short. */
r.post("/", async (req, res) => {
  const data = parse(req.body, {
    customer_id: { type: "id", nullable: true },
    status: { type: "enum", values: ["Processing", "Shipped", "Delivered", "Cancelled"] },
    source: { type: "enum", values: ["order", "pos"] },
  });
  const items = parseItems(req.body?.items);
  const ids = [...new Set(items.map((i) => i.product_id))];
  const [{ n }] = await q("SELECT count(*)::int AS n FROM products WHERE id = ANY($1::int[])", [ids]);
  if (n !== ids.length) throw new HttpError(400, "One of the products no longer exists.");

  const [created] = await q(
    `WITH items AS (
       SELECT product_id, sum(qty)::int AS qty FROM jsonb_to_recordset($1::jsonb) AS x(product_id int, qty int) GROUP BY product_id),
     priced AS (SELECT i.product_id, i.qty, p.name, p.price FROM items i JOIN products p ON p.id = i.product_id),
     o AS (
       INSERT INTO orders (customer_id, status, source, total)
       SELECT $2::int, $3::text, $4::text, COALESCE(sum(qty * price), 0) FROM priced RETURNING id),
     oi AS (
       INSERT INTO order_items (order_id, product_id, name, qty, unit_price)
       SELECT o.id, pr.product_id, pr.name, pr.qty, pr.price FROM o, priced pr),
     st AS (UPDATE products p SET stock = p.stock - pr.qty FROM priced pr WHERE p.id = pr.product_id RETURNING p.id)
     SELECT id FROM o`,
    [JSON.stringify(items), data.customer_id ?? null, data.status ?? "Processing", data.source ?? "order"],
  );
  await notifyLowStock(ids);
  const [order] = await q(`${SELECT} WHERE o.id = $1`, [created.id]);
  res.status(201).json(order);
});

/** Changes status / customer. Cancelling returns the items to stock; a cancelled order is final. */
r.patch("/:id", async (req, res) => {
  const id = idParam(req);
  const data = parse(
    req.body,
    {
      customer_id: { type: "id", nullable: true },
      status: { type: "enum", values: ["Processing", "Shipped", "Delivered", "Cancelled"] },
    },
    true,
  );
  const [current] = await q("SELECT status FROM orders WHERE id = $1", [id]);
  if (!current) throw new HttpError(404, "Not found.");
  if (current.status === "Cancelled") throw new HttpError(409, "Cancelled orders can't be changed.");

  await q(
    `WITH o AS (
       UPDATE orders SET status = COALESCE($2::text, status),
         customer_id = CASE WHEN $4::boolean THEN $3::int ELSE customer_id END
       WHERE id = $1 AND status <> 'Cancelled' RETURNING id, status),
     st AS (
       UPDATE products p SET stock = p.stock + s.qty
       FROM (SELECT oi.product_id, sum(oi.qty)::int AS qty FROM order_items oi JOIN o ON o.id = oi.order_id
             WHERE o.status = 'Cancelled' AND oi.product_id IS NOT NULL GROUP BY oi.product_id) s
       WHERE p.id = s.product_id)
     SELECT id FROM o`,
    [id, data.status ?? null, data.customer_id ?? null, "customer_id" in data],
  );
  const [order] = await q(`${SELECT} WHERE o.id = $1`, [id]);
  res.json(order);
});

/** Deleting a live order returns its items to stock. */
r.delete("/:id", async (req, res) => {
  const rows = await q(
    `WITH o AS (DELETE FROM orders WHERE id = $1 RETURNING id, status),
     st AS (
       UPDATE products p SET stock = p.stock + s.qty
       FROM (SELECT oi.product_id, sum(oi.qty)::int AS qty FROM order_items oi JOIN o ON o.id = oi.order_id
             WHERE o.status <> 'Cancelled' AND oi.product_id IS NOT NULL GROUP BY oi.product_id) s
       WHERE p.id = s.product_id)
     SELECT id FROM o`,
    [idParam(req)],
  );
  if (!rows.length) throw new HttpError(404, "Not found.");
  res.json({ ok: true });
});

export default r;
