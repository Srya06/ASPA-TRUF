/**
 * Drop all TRUF tables and re-run migrations + seed.
 * Usage: npm run db:reset
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

  console.log("Dropping existing schema...");
  await client.query(`
    DROP TABLE IF EXISTS admin_notifications CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS bookings CASCADE;
    DROP TABLE IF EXISTS slot_locks CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS slots CASCADE;
    DROP TABLE IF EXISTS pricing_rules CASCADE;
    DROP TABLE IF EXISTS courts CASCADE;
    DROP TABLE IF EXISTS sports CASCADE;
    DROP TABLE IF EXISTS venues CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    DROP TYPE IF EXISTS booking_status CASCADE;
    DROP TYPE IF EXISTS slot_status CASCADE;
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP FUNCTION IF EXISTS set_updated_at CASCADE;
  `);

  const migrationsDir = join(process.cwd(), "db", "migrations");
  for (const file of ["001_schema.sql", "002_rls.sql"]) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    console.log(`Running ${file}...`);
    await client.query(sql);
  }

  const seed = readFileSync(join(process.cwd(), "db", "seed.sql"), "utf-8");
  console.log("Seeding...");
  await client.query(seed);

  await client.end();
  console.log("✓ Database reset complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
