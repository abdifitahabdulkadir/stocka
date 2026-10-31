import { Router } from "express";
import { q } from "../db.js";
import { HttpError, idParam } from "../http.js";
import { requireAdmin } from "../auth.js";

/* ---------- notifications ---------- */
export const notifications = Router();

notifications.get("/", async (_req, res) => {
  res.json(await q("SELECT id, type, title, body, read, created_at FROM notifications ORDER BY created_at DESC, id DESC LIMIT 200"));
});
notifications.post("/read-all", async (_req, res) => {
  await q("UPDATE notifications SET read = true WHERE NOT read");
  res.json({ ok: true });
});
notifications.patch("/:id", async (req, res) => {
  const read = req.body?.read !== false;
  const rows = await q("UPDATE notifications SET read = $2 WHERE id = $1 RETURNING id, type, title, body, read, created_at", [idParam(req), read]);
  if (!rows.length) throw new HttpError(404, "Not found.");
  res.json(rows[0]);
});
notifications.delete("/:id", async (req, res) => {
  await q("DELETE FROM notifications WHERE id = $1", [idParam(req)]);
  res.json({ ok: true });
});

/* ---------- settings (key/value; admin-only writes) ---------- */
export const settings = Router();

settings.get("/", async (_req, res) => {
  const rows = await q("SELECT key, value FROM settings");
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
settings.put("/", requireAdmin, async (req, res) => {
  const entries = Object.entries(req.body ?? {});
  if (entries.length > 50) throw new HttpError(400, "Too many settings.");
  for (const [k, v] of entries) {
    if (!/^[\w.-]{1,60}$/.test(k) || typeof v !== "string" || v.length > 1000) throw new HttpError(400, "Invalid setting.");
  }
  if (entries.length)
    await q(
      `INSERT INTO settings (key, value) SELECT * FROM jsonb_each_text($1::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(Object.fromEntries(entries))],
    );
  const rows = await q("SELECT key, value FROM settings");
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
