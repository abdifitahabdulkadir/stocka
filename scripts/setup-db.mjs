// Creates the tables in db/schema.sql. Safe to run repeatedly.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env (see .env.example).");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const statements = readFileSync("db/schema.sql", "utf8").split(";").map((s) => s.trim()).filter(Boolean);
for (const stmt of statements) await sql.query(stmt);
console.log("Database ready.");
