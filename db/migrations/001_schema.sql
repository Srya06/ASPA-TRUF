-- TRUF PostgreSQL Schema
-- Run against a dedicated database per environment (dev / staging / production).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE slot_status AS ENUM ('available', 'locked', 'booked', 'blocked');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- ─── Venues ──────────────────────────────────────────────────────────────────

CREATE TABLE venues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  phone           TEXT,
  email           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_seed         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Sports ──────────────────────────────────────────────────────────────────

CREATE TABLE sports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  icon_name       TEXT,
  image_url       TEXT,
  display_order   INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_seed         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (venue_id, slug)
);

-- ─── Courts ──────────────────────────────────────────────────────────────────

CREATE TABLE courts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  sport_id        UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  capacity        INT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_seed         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sport_id, slug)
);

-- ─── Pricing ─────────────────────────────────────────────────────────────────

CREATE TABLE pricing_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id        UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  base_price_paise INT NOT NULL CHECK (base_price_paise >= 0),
  peak_multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_seed         BOOLEAN NOT NULL DEFAULT false,
  effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Slots ───────────────────────────────────────────────────────────────────

CREATE TABLE slots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id            UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  slot_date           DATE NOT NULL,
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  status              slot_status NOT NULL DEFAULT 'available',
  price_override_paise INT CHECK (price_override_paise IS NULL OR price_override_paise >= 0),
  is_seed             BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (court_id, slot_date, start_time)
);

CREATE INDEX idx_slots_date_status ON slots (slot_date, status);
CREATE INDEX idx_slots_court_date ON slots (court_id, slot_date);

-- ─── Users ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           TEXT UNIQUE,
  email           TEXT UNIQUE,
  name            TEXT,
  password_hash   TEXT,
  role            user_role NOT NULL DEFAULT 'customer',
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  is_seed         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Slot locks (checkout TTL) ───────────────────────────────────────────────

CREATE TABLE slot_locks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  session_token   TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slot_id)
);

CREATE INDEX idx_slot_locks_expires ON slot_locks (expires_at);

-- ─── Bookings ────────────────────────────────────────────────────────────────

CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref         TEXT NOT NULL UNIQUE,
  slot_id             UUID NOT NULL REFERENCES slots(id),
  user_id             UUID NOT NULL REFERENCES users(id),
  status              booking_status NOT NULL DEFAULT 'pending_payment',
  customer_name       TEXT NOT NULL,
  customer_phone      TEXT NOT NULL,
  base_price_paise    INT NOT NULL CHECK (base_price_paise >= 0),
  discount_paise      INT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  fees_paise          INT NOT NULL DEFAULT 0 CHECK (fees_paise >= 0),
  tax_paise           INT NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  final_amount_paise  INT NOT NULL CHECK (final_amount_paise >= 0),
  notes               TEXT,
  is_seed             BOOLEAN NOT NULL DEFAULT false,
  confirmed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_user ON bookings (user_id);

-- ─── Payments ────────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature  TEXT,
  amount_paise        INT NOT NULL CHECK (amount_paise >= 0),
  status              payment_status NOT NULL DEFAULT 'pending',
  is_seed             BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reviews ─────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  is_seed         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Admin notifications ─────────────────────────────────────────────────────

CREATE TABLE admin_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  payload         JSONB,
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  is_seed         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_notifications_unread ON admin_notifications (is_read, created_at DESC);

-- ─── Updated-at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER slots_updated_at BEFORE UPDATE ON slots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
