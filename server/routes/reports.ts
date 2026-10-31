import { Router } from "express";
import { q } from "../db";

const r = Router();

/** Last 7 calendar months (including empty ones): revenue, order count, cancelled count. */
const monthly = () =>
  q(`SELECT to_char(m, 'Mon') AS month, to_char(m, 'YYYY-MM') AS key,
       COALESCE(sum(o.total) FILTER (WHERE o.status <> 'Cancelled'), 0)::float8 AS revenue,
       (count(o.id) FILTER (WHERE o.status <> 'Cancelled'))::int AS orders,
       (count(o.id) FILTER (WHERE o.status = 'Cancelled'))::int AS returns
     FROM generate_series(date_trunc('month', now()) - interval '6 months', date_trunc('month', now()), interval '1 month') m
     LEFT JOIN orders o ON date_trunc('month', o.created_at) = m
     GROUP BY m ORDER BY m`);

const alerts = () =>
  q(`SELECT p.id, p.name AS product, p.sku, p.stock, p.reorder,
       (SELECT s.name FROM stock_movements m JOIN suppliers s ON s.id = m.supplier_id
         WHERE m.product_id = p.id AND m.type = 'in' ORDER BY m.created_at DESC LIMIT 1) AS supplier
     FROM products p WHERE p.stock <= p.reorder ORDER BY p.stock, p.name LIMIT 20`);

const categoryShare = () =>
  q(`SELECT COALESCE(c.name, 'Uncategorised') AS name, COALESCE(c.color, '#94a3b8') AS color, count(p.id)::int AS value
     FROM products p LEFT JOIN categories c ON c.id = p.category_id GROUP BY c.id, c.name, c.color ORDER BY value DESC`);

r.get("/dashboard", async (_req, res) => {
  const [[totals], salesByMonth, categoryData, recentOrders, inventoryAlerts] = await Promise.all([
    q(`SELECT
         (SELECT count(*)::int FROM products) AS products,
         (SELECT COALESCE(sum(stock * cost), 0)::float8 FROM products) AS stock_value,
         (SELECT count(*)::int FROM products WHERE stock > 0 AND stock <= reorder) AS low_stock,
         (SELECT count(*)::int FROM products WHERE stock = 0) AS out_of_stock,
         (SELECT count(*)::int FROM customers) AS customers,
         (SELECT count(*)::int FROM orders WHERE status = 'Processing') AS open_orders,
         (SELECT COALESCE(sum(total), 0)::float8 FROM orders WHERE status <> 'Cancelled' AND created_at >= date_trunc('month', now())) AS revenue_month,
         (SELECT COALESCE(sum(total), 0)::float8 FROM orders WHERE status <> 'Cancelled' AND created_at >= date_trunc('month', now()) - interval '1 month' AND created_at < date_trunc('month', now())) AS revenue_prev_month,
         (SELECT count(*)::int FROM orders WHERE status <> 'Cancelled' AND created_at >= date_trunc('month', now())) AS orders_month`),
    monthly(),
    categoryShare(),
    q(`SELECT o.id, 'ORD-' || lpad(o.id::text, 4, '0') AS code, c.name AS customer, o.created_at AS date, o.status, o.total::float8 AS total,
         COALESCE((SELECT sum(qty) FROM order_items i WHERE i.order_id = o.id), 0)::int AS items
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id ORDER BY o.created_at DESC, o.id DESC LIMIT 5`),
    alerts(),
  ]);
  res.json({ totals, salesByMonth, categoryData, recentOrders, inventoryAlerts });
});

r.get("/inventory", async (_req, res) => {
  const [[totals], stockByCategory, movements, inventoryAlerts] = await Promise.all([
    q(`SELECT count(*)::int AS products, COALESCE(sum(stock), 0)::int AS units,
         COALESCE(sum(stock * cost), 0)::float8 AS stock_value,
         (count(*) FILTER (WHERE stock > 0 AND stock <= reorder))::int AS low_stock,
         (count(*) FILTER (WHERE stock = 0))::int AS out_of_stock FROM products`),
    q(`SELECT COALESCE(c.name, 'Uncategorised') AS category, COALESCE(sum(p.stock), 0)::int AS stock, count(p.id)::int AS products
       FROM products p LEFT JOIN categories c ON c.id = p.category_id GROUP BY c.id, c.name ORDER BY stock DESC`),
    q(`SELECT m.id, m.ref, m.type, p.name AS product, m.qty, m.reason, m.created_at
       FROM stock_movements m JOIN products p ON p.id = m.product_id ORDER BY m.created_at DESC, m.id DESC LIMIT 20`),
    alerts(),
  ]);
  res.json({ totals, stockByCategory, movements, inventoryAlerts });
});

r.get("/reports", async (_req, res) => {
  const [[kpis], salesByMonth, topProducts, categoryData] = await Promise.all([
    q(`SELECT
         (SELECT COALESCE(sum(total), 0)::float8 FROM orders WHERE status <> 'Cancelled') AS revenue,
         (SELECT count(*)::int FROM orders WHERE status <> 'Cancelled') AS orders,
         (SELECT COALESCE(avg(total), 0)::float8 FROM orders WHERE status <> 'Cancelled') AS avg_order,
         (SELECT count(*)::int FROM orders WHERE status = 'Cancelled') AS cancelled,
         (SELECT count(*)::int FROM customers) AS customers,
         (SELECT COALESCE(sum(stock * cost), 0)::float8 FROM products) AS stock_value`),
    monthly(),
    q(`SELECT i.name, sum(i.qty)::int AS units, sum(i.qty * i.unit_price)::float8 AS revenue
       FROM order_items i JOIN orders o ON o.id = i.order_id WHERE o.status <> 'Cancelled'
       GROUP BY i.name ORDER BY revenue DESC LIMIT 10`),
    categoryShare(),
  ]);
  res.json({ kpis, salesByMonth, topProducts, categoryData });
});

export default r;
