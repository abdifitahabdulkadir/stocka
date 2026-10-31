import { Router } from "express";
import { q } from "../db";
import { HttpError, idParam, parse } from "../http";
import { hashPassword } from "../auth";

const r = Router();

const SELECT = `SELECT id, 'USR-' || lpad(id::text, 3, '0') AS code, email, name, role, status, department, last_login_at, created_at FROM users`;

const schema = {
  name: { type: "string", max: 100 },
  role: { type: "enum", values: ["admin", "staff"] },
  status: { type: "enum", values: ["active", "inactive"] },
  department: { type: "string", max: 100 },
} as const;

const passwordOf = (body: any) => {
  const p = typeof body?.password === "string" ? body.password : "";
  if (p.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
  if (p.length > 200) throw new HttpError(400, "Password is too long.");
  return p;
};

r.get("/", async (_req, res) => {
  res.json(await q(`${SELECT} ORDER BY created_at, id`));
});

/** Admin creates a user with a starting password to hand over. */
r.post("/", async (req, res) => {
  const data = parse(req.body, { ...schema, email: { type: "email", required: true, max: 200 } });
  const hash = await hashPassword(passwordOf(req.body));
  const [user] = await q(
    `INSERT INTO users (email, password_hash, name, role, status, department)
     VALUES ($1, $2, $3, COALESCE($4, 'staff'), COALESCE($5, 'active'), $6)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [data.email, hash, data.name ?? "", data.role ?? null, data.status ?? null, data.department ?? ""],
  );
  if (!user) throw new HttpError(409, "A user with this email already exists.");
  res.status(201).json((await q(`${SELECT} WHERE id = $1`, [user.id]))[0]);
});

/** Refuses a change that would leave no active admin. */
async function assertAdminRemains(id: number) {
  const [{ n }] = await q("SELECT count(*)::int AS n FROM users WHERE role = 'admin' AND status = 'active' AND id <> $1", [id]);
  if (n === 0) throw new HttpError(409, "There must be at least one active admin.");
}

r.patch("/:id", async (req, res) => {
  const id = idParam(req);
  const data = parse(req.body, schema, true);
  const [target] = await q("SELECT role, status FROM users WHERE id = $1", [id]);
  if (!target) throw new HttpError(404, "Not found.");

  const losesAdmin = target.role === "admin" && target.status === "active" &&
    ((data.role && data.role !== "admin") || (data.status && data.status !== "active"));
  if (losesAdmin) await assertAdminRemains(id);

  const cols = Object.keys(data);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`);
  const params: unknown[] = cols.map((c) => data[c]);
  if (req.body?.password !== undefined) { sets.push(`password_hash = $${params.length + 1}`); params.push(await hashPassword(passwordOf(req.body))); }
  if (!sets.length) throw new HttpError(400, "Nothing to update.");
  await q(`UPDATE users SET ${sets.join(", ")} WHERE id = $${params.length + 1}`, [...params, id]);
  if (data.status === "inactive") await q("DELETE FROM sessions WHERE user_id = $1", [id]);
  res.json((await q(`${SELECT} WHERE id = $1`, [id]))[0]);
});

r.delete("/:id", async (req, res) => {
  const id = idParam(req);
  if (id === req.user!.id) throw new HttpError(409, "You can't delete your own account.");
  const [target] = await q("SELECT role, status FROM users WHERE id = $1", [id]);
  if (!target) throw new HttpError(404, "Not found.");
  if (target.role === "admin" && target.status === "active") await assertAdminRemains(id);
  await q("DELETE FROM users WHERE id = $1", [id]);
  res.json({ ok: true });
});

export default r;
