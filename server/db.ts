import { neon } from "@neondatabase/serverless";

export type Row = Record<string, any>;

/** Runs one parameterised query (a single statement is atomic) and returns the rows. */
export async function q(text: string, params: unknown[] = []): Promise<Row[]> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return (await neon(process.env.DATABASE_URL).query(text, params)) as Row[];
}
