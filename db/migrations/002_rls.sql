-- TRUF Row-Level Security Policies
-- The public app connects via a service-role pool (server-only).
-- RLS limits blast radius if anon/authenticated keys are ever exposed.

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- ─── Service role bypass (used by Next.js server actions / API routes) ────────
-- In Supabase: the service_role key bypasses RLS automatically.
-- For raw Postgres, connect with a role that owns the tables or use BYPASSRLS.

-- ─── Public read: active venue catalog (no PII) ─────────────────────────────

CREATE POLICY sports_public_read ON sports
  FOR SELECT
  USING (is_active = true AND is_seed = false OR current_setting('app.environment', true) = 'development');

CREATE POLICY courts_public_read ON courts
  FOR SELECT
  USING (is_active = true AND is_seed = false OR current_setting('app.environment', true) = 'development');

CREATE POLICY slots_public_read ON slots
  FOR SELECT
  USING (
    status IN ('available', 'locked')
    AND is_seed = false
    OR current_setting('app.environment', true) = 'development'
  );

CREATE POLICY venues_public_read ON venues
  FOR SELECT
  USING (is_active = true AND is_seed = false OR current_setting('app.environment', true) = 'development');

CREATE POLICY pricing_public_read ON pricing_rules
  FOR SELECT
  USING (is_active = true AND is_seed = false OR current_setting('app.environment', true) = 'development');

CREATE POLICY reviews_public_read ON reviews
  FOR SELECT
  USING (is_published = true AND is_seed = false);

-- ─── Customer policies (authenticated customer role) ──────────────────────────

CREATE POLICY users_self_read ON users
  FOR SELECT
  USING (id = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE POLICY users_self_update ON users
  FOR UPDATE
  USING (id = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE POLICY bookings_customer_read ON bookings
  FOR SELECT
  USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND is_seed = false
  );

CREATE POLICY bookings_customer_insert ON bookings
  FOR INSERT
  WITH CHECK (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND status = 'pending_payment'
  );

CREATE POLICY slot_locks_customer_manage ON slot_locks
  FOR ALL
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- ─── Staff / Admin policies ───────────────────────────────────────────────────

CREATE POLICY admin_full_access ON venues
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_sports ON sports
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_courts ON courts
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_pricing ON pricing_rules
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_slots ON slots
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_bookings ON bookings
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_payments ON payments
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_reviews ON reviews
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_notifications ON admin_notifications
  FOR ALL
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'))
  WITH CHECK (current_setting('app.user_role', true) IN ('staff', 'admin'));

CREATE POLICY admin_users_read ON users
  FOR SELECT
  USING (current_setting('app.user_role', true) IN ('staff', 'admin'));

-- ─── Deny-by-default note ─────────────────────────────────────────────────────
-- With RLS enabled and no matching policy, access is denied.
-- Server layer MUST set session vars before queries when using non-service roles:
--   SET LOCAL app.user_id = '<uuid>';
--   SET LOCAL app.user_role = 'customer' | 'staff' | 'admin';
--   SET LOCAL app.environment = 'development' | 'staging' | 'production';
