# TRUF — Local Sandbox Database

This guide explains how to run an **isolated local/dev PostgreSQL** that mirrors production schema but contains **zero real customer data**.

## Principles

1. **One database per environment** — never point dev at staging or production.
2. **All dev data is tagged** — seed rows have `is_seed = true` and are excluded from KPIs/analytics.
3. **No client-side DB access** — the Next.js app only talks to Postgres through server actions/API routes using `DATABASE_URL` (server-only).
4. **RLS is always on** — even in dev, policies are applied so you catch permission bugs early.

---

## Option A: Docker (recommended)

```bash
docker run --name truf-dev-db \
  -e POSTGRES_USER=truf \
  -e POSTGRES_PASSWORD=truf_dev_secret \
  -e POSTGRES_DB=truf_dev \
  -p 5433:5432 \
  -d postgres:16
```

Connection string:

```
DATABASE_URL=postgresql://truf:truf_dev_secret@localhost:5433/truf_dev
APP_ENV=development
```

Apply schema + RLS + seed:

```bash
npm run db:migrate
npm run db:seed
```

---

## Option B: Neon / Supabase (cloud dev project)

1. Create a **separate** Neon or Supabase project named `truf-dev` (not shared with staging/prod).
2. Copy the connection string into `.env.local`:

```
DATABASE_URL=postgresql://...
APP_ENV=development
```

3. Run migrations and seed:

```bash
npm run db:migrate
npm run db:seed
```

For Supabase, use the **direct connection** string (not the anon key) in `DATABASE_URL`. The anon key must never be used from the Next.js server for writes.

---

## Option C: No database (UI preview only)

If `DATABASE_URL` is unset, the app falls back to **in-memory seed data** with a console warning. This is for UI preview only — not for testing booking correctness.

---

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Server-only Postgres connection (service role) |
| `APP_ENV` | `development` \| `staging` \| `production` |
| `NEXT_PUBLIC_APP_URL` | Public site URL |

Never commit `.env.local`. Use separate secrets per environment in Vercel.

---

## Reset dev data

```bash
npm run db:reset
```

This drops and recreates the schema, reapplies RLS, and re-seeds tagged demo data.

---

## Verifying RLS

Connect with a restricted role (not the table owner) and confirm denied access:

```sql
SET app.environment = 'production';
SET app.user_role = 'customer';
SET app.user_id = '00000000-0000-0000-0000-000000000001';

-- Should return 0 rows (seed data hidden in production mode)
SELECT * FROM sports;
```

In development mode with `APP_ENV=development`, the server sets `app.environment = 'development'` so seed rows are visible for local testing.
