import { Pool } from "pg";

// Hindari membuat pool baru setiap hot-reload saat development
const g = globalThis;
export const pool =
  g.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") g.__pgPool = pool;
