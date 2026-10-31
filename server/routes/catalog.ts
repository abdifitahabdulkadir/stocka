import { crud } from "../crud.js";

const lpad = (prefix: string, n = 3) => `'${prefix}-' || lpad(t.id::text, ${n}, '0')`;

export const categories = crud({
  table: "categories",
  select: `SELECT t.id, t.name, t.description, t.color, t.created_at, ${lpad("CAT")} AS code,
    (SELECT count(*)::int FROM products p WHERE p.category_id = t.id) AS products
    FROM categories t`,
  schema: {
    name: { type: "string", required: true, max: 100 },
    description: { type: "string", max: 500 },
    color: { type: "string", max: 20 },
  },
  orderBy: "t.name",
  search: ["t.name", "t.description"],
});

export const products = crud({
  table: "products",
  select: `SELECT t.id, t.sku, t.name, t.description, t.category_id, c.name AS category,
    t.price::float8 AS price, t.cost::float8 AS cost, t.stock, t.reorder, t.created_at, ${lpad("PRD")} AS code,
    CASE WHEN t.stock = 0 THEN 'Out of Stock' WHEN t.stock <= t.reorder THEN 'Low Stock' ELSE 'In Stock' END AS status
    FROM products t LEFT JOIN categories c ON c.id = t.category_id`,
  schema: {
    sku: { type: "string", required: true, max: 60 },
    name: { type: "string", required: true, max: 200 },
    category_id: { type: "id", nullable: true },
    description: { type: "string", max: 1000 },
    price: { type: "number", required: true, max: 1e8 },
    cost: { type: "number", max: 1e8 },
    stock: { type: "int", max: 1e8 },
    reorder: { type: "int", max: 1e8 },
  },
  orderBy: "t.name",
  search: ["t.name", "t.sku", "c.name"],
  filters: { category_id: "t.category_id" },
});

export const customers = crud({
  table: "customers",
  select: `SELECT t.id, t.name, t.email, t.phone, t.city, t.status, t.created_at, ${lpad("CUS")} AS code,
    (SELECT count(*)::int FROM orders o WHERE o.customer_id = t.id AND o.status <> 'Cancelled') AS orders,
    (SELECT COALESCE(sum(o.total), 0)::float8 FROM orders o WHERE o.customer_id = t.id AND o.status <> 'Cancelled') AS spent
    FROM customers t`,
  schema: {
    name: { type: "string", required: true, max: 200 },
    email: { type: "email", max: 200 },
    phone: { type: "string", max: 50 },
    city: { type: "string", max: 100 },
    status: { type: "enum", values: ["Active", "Inactive"] },
  },
  orderBy: "t.name",
  search: ["t.name", "t.email", "t.city"],
  filters: { status: "t.status" },
});

export const suppliers = crud({
  table: "suppliers",
  select: `SELECT t.id, t.name, t.contact, t.email, t.phone, t.country, t.lead_days, t.status, t.created_at, ${lpad("SUP")} AS code,
    (SELECT count(DISTINCT i.product_id)::int FROM purchase_order_items i JOIN purchase_orders po ON po.id = i.po_id WHERE po.supplier_id = t.id) AS products
    FROM suppliers t`,
  schema: {
    name: { type: "string", required: true, max: 200 },
    contact: { type: "string", max: 200 },
    email: { type: "email", max: 200 },
    phone: { type: "string", max: 50 },
    country: { type: "string", max: 100 },
    lead_days: { type: "int", max: 3650 },
    status: { type: "enum", values: ["Preferred", "Active", "Suspended"] },
  },
  orderBy: "t.name",
  search: ["t.name", "t.contact", "t.email", "t.country"],
  filters: { status: "t.status" },
});
