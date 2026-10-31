import { Router } from "express";
import { q } from "../db.js";
import { HttpError, parse } from "../http.js";
import { currentUser, endSession, hashPassword, requireAuth, startSession, verifyPassword } from "../auth.js";

const r = Router();

const credentials = (body: any) => ({
  email: typeof body?.email === "string" ? body.email.trim().toLowerCase() : "",
  password: typeof body?.password === "string" ? body.password : "",
});

const checkNewPassword = (password: string) => {
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
  if (password.length > 200) throw new HttpError(400, "Password is too long.");
};

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const dummyHash = hashPassword("dummy-password");

/** Tells the sign-in screen whether to show first-run setup. */
r.get("/setup", async (_req, res) => {
  const [{ n }] = await q("SELECT count(*)::int AS n FROM users");
  res.json({ needsSetup: n === 0 });
});

/** Creates the first admin. Later sign-ups are closed unless ALLOW_SIGNUP=true (admins add users instead). */
r.post("/register", async (req, res) => {
  const { email, password } = credentials(req.body);
  const { name } = parse(req.body, { name: { type: "string", max: 100 } });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");
  checkNewPassword(password);

  const open = process.env.ALLOW_SIGNUP === "true";
  const [user] = await q(
    `INSERT INTO users (email, password_hash, name, role)
     SELECT $1, $2, $3, CASE WHEN EXISTS (SELECT 1 FROM users) THEN 'staff' ELSE 'admin' END
     WHERE NOT EXISTS (SELECT 1 FROM users) OR $4::boolean
     ON CONFLICT (email) DO NOTHING RETURNING id, email, name, role`,
    [email, await hashPassword(password), name ?? "", open],
  );
  if (!user) {
    const [{ n }] = await q("SELECT count(*)::int AS n FROM users");
    if (n > 0 && !open) throw new HttpError(403, "Sign-up is closed. Ask an admin to create your account.");
    throw new HttpError(409, "An account with this email already exists.");
  }
  await startSession(res, user.id);
  res.status(201).json({ user });
});

r.post("/login", async (req, res) => {
  const { email, password } = credentials(req.body);
  const [row] = await q("SELECT id, email, name, role, status, password_hash FROM users WHERE email = $1", [email]);
  const ok = await verifyPassword(password, row ? row.password_hash : await dummyHash);
  if (!row || !ok) throw new HttpError(401, "Invalid email or password.");
  if (row.status !== "active") throw new HttpError(403, "This account is inactive. Contact an admin.");
  await startSession(res, row.id);
  res.json({ user: { id: row.id, email: row.email, name: row.name, role: row.role } });
});

r.post("/logout", async (req, res) => {
  await endSession(req, res);
  res.json({ ok: true });
});

r.get("/me", async (req, res) => {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Not signed in.");
  res.json({ user });
});

r.patch("/me", requireAuth, async (req, res) => {
  const data = parse(req.body, { name: { type: "string", max: 100 } }, true);
  if (data.name !== undefined) await q("UPDATE users SET name = $1 WHERE id = $2", [data.name, req.user!.id]);
  res.json({ user: await currentUser(req) });
});

r.post("/me/password", requireAuth, async (req, res) => {
  const current = typeof req.body?.current === "string" ? req.body.current : "";
  const next = typeof req.body?.next === "string" ? req.body.next : "";
  checkNewPassword(next);
  const [row] = await q("SELECT password_hash FROM users WHERE id = $1", [req.user!.id]);
  if (!(await verifyPassword(current, row.password_hash))) throw new HttpError(400, "Current password is incorrect.");
  await q("UPDATE users SET password_hash = $1 WHERE id = $2", [await hashPassword(next), req.user!.id]);
  res.json({ ok: true });
});

export default r;
