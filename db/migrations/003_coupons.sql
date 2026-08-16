CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value INTEGER NOT NULL, -- percentage (e.g. 10 for 10%) or flat paise (e.g. 50000 for Rs. 500)
  max_discount_paise INTEGER, -- maximum absolute discount for percentage types
  min_order_value_paise INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER, -- total times this coupon can be used
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep track of which user used which coupon to enforce per-user limits if needed later
CREATE TABLE user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add discount fields to bookings table
ALTER TABLE bookings
ADD COLUMN coupon_id UUID REFERENCES coupons(id),
ADD COLUMN discount_paise INTEGER DEFAULT 0;
