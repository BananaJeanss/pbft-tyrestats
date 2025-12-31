import { Pool } from "pg";

const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

postgresPool.on("error", (err) => {
  console.error("Postgres pool error", err);
});

export default postgresPool;
