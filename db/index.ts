import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Configure it in .env.local for development or via ECS environment for production.",
      );
    }
    pool = new Pool({ connectionString: url, max: 10 });
  }
  return pool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}
