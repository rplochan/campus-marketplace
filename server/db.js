import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2, // small pool: serverless functions each get their own
});

export const query = (text, params) => pool.query(text, params);