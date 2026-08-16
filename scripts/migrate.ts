/**
 * Apply migrations and seed to DATABASE_URL.
 * Usage: npm run db:migrate && npm run db:seed
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

  const migrationsDir = join(process.cwd(), "db", "migrations");
  const files = ["001_schema.sql", "002_rls.sql"];

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log(`✓ ${file}`);
  }

  await client.end();
  console.log("Migrations complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
