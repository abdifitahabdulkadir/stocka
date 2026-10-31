import type { Request, Response, NextFunction } from "express";
import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { q } from "./db.js";
import { HttpError } from "./http.js";

const SESSION_DAYS = 30;
const COOKIE_RE = /(?:^|;\s*)session=([a-f0-9]+)/;

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "staff";
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

const scryptAsync = (password: string, salt: Buffer, len: number) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, len, (err, key) => (err ? reject(err) : resolve(key))),
  );

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${(await scryptAsync(password, salt, 64)).toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  return timingSafeEqual(expected, await scryptAsync(password, Buffer.from(salt, "hex"), expected.length));
}

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

const sessionToken = (req: Request) => COOKIE_RE.exec(req.headers.cookie || "")?.[1];

export async function startSession(res: Response, userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await q("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [sha256(token), userId, expires.toISOString()]);
  await q("UPDATE users SET last_login_at = now() WHERE id = $1", [userId]);
  res.cookie("session", token, { ...cookieOptions(), maxAge: SESSION_DAYS * 864e5 });
}

export async function endSession(req: Request, res: Response) {
  const token = sessionToken(req);
  if (token) await q("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
  res.clearCookie("session", cookieOptions());
}

export async function currentUser(req: Request): Promise<SessionUser | null> {
  const token = sessionToken(req);
  if (!token) return null;
  const [row] = await q(
    `SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND u.status = 'active'`,
    [sha256(token)],
  );
  return row ? (row as SessionUser) : null;
}

declare global {
  namespace Express {
    interface Request { user?: SessionUser }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Not signed in.");
  req.user = user;
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") throw new HttpError(403, "Admins only.");
  next();
}
