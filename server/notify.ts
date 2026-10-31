import { q } from "./db.js";

/** Raises a notification for each given product that is now at or below its reorder level (once, until read). */
export async function notifyLowStock(productIds: number[]) {
  if (!productIds.length) return;
  const [off] = await q("SELECT 1 FROM settings WHERE key = 'lowStockAlerts' AND value = 'false'");
  if (off) return;
  await q(
    `INSERT INTO notifications (type, title, body)
     SELECT 'low_stock',
       CASE WHEN p.stock = 0 THEN p.name || ' is out of stock' ELSE p.name || ' is low on stock' END,
       p.stock || ' left (reorder level ' || p.reorder || ')'
     FROM products p
     WHERE p.id = ANY($1::int[]) AND p.stock <= p.reorder
       AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.type = 'low_stock' AND NOT n.read AND n.title LIKE p.name || ' is %')`,
    [productIds],
  );
}
