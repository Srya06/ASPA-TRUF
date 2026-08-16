/**
 * Seed development data (is_seed = true).
 * Usage: npm run db:seed
 */
import { readFileSync } from "fs";
import { join } from "path";
import pg from "pg";

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required. See SANDBOX.md");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const sql = readFileSync(join(process.cwd(), "db", "seed.sql"), "utf-8");
  console.log("Seeding development data...");
  await client.query(sql);
  await client.end();
  console.log("✓ Seed complete (all rows tagged is_seed = true).");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
