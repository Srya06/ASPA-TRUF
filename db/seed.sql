-- TRUF Development Seed Data
-- All rows tagged is_seed = true — excluded from production analytics.

BEGIN;

-- Venue: TRUF Hunsur
INSERT INTO venues (id, name, slug, address_line1, city, state, pincode, latitude, longitude, phone, email, is_seed)
VALUES (
  'a1000000-0000-4000-8000-000000000001',
  'TRUF Sports Arena',
  'truf-hunsur',
  'Near KSRTC Bus Stand, Hunsur Main Road',
  'Hunsur',
  'Karnataka',
  '571105',
  12.3047,
  76.2904,
  '+919876543210',
  'hello@truf.in',
  true
);

-- Sports
INSERT INTO sports (id, venue_id, name, slug, description, icon_name, image_url, display_order, is_seed) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'Football', 'football',
   'Full-size 7-a-side turf with FIFA-quality artificial grass.', 'football',
   'https://images.unsplash.com/photo-1574629810360-7abbc94d50a5?w=800&q=80', 1, true),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'Cricket', 'cricket',
   'Box cricket nets with bowling machine available on request.', 'cricket',
   'https://images.unsplash.com/photo-1531419140115-29d9249d319c?w=800&q=80', 2, true),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'Badminton', 'badminton',
   'Indoor synthetic courts with professional lighting.', 'badminton',
   'https://images.unsplash.com/photo-1626224583764-f87db7ac2ed9?w=800&q=80', 3, true);

-- Courts
INSERT INTO courts (id, venue_id, sport_id, name, slug, capacity, is_seed) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'Turf A', 'turf-a', 14, true),
  ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'Net 1', 'net-1', 12, true),
  ('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'Court 1', 'court-1', 4, true),
  ('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'Court 2', 'court-2', 4, true);

-- Pricing (paise)
INSERT INTO pricing_rules (court_id, base_price_paise, peak_multiplier, is_seed) VALUES
  ('c1000000-0000-4000-8000-000000000001', 150000, 1.25, true),
  ('c1000000-0000-4000-8000-000000000002', 120000, 1.20, true),
  ('c1000000-0000-4000-8000-000000000003', 40000, 1.15, true),
  ('c1000000-0000-4000-8000-000000000004', 40000, 1.15, true);

-- Generate today's and tomorrow's slots (6 AM – 10 PM, hourly)
DO $$
DECLARE
  d DATE;
  t TIME;
  court RECORD;
  slot_status slot_status;
  r INT;
BEGIN
  FOR d IN SELECT CURRENT_DATE UNION SELECT CURRENT_DATE + 1 LOOP
    FOR court IN SELECT id, sport_id FROM courts WHERE is_seed = true LOOP
      t := '06:00'::TIME;
      WHILE t < '22:00'::TIME LOOP
        r := floor(random() * 10)::INT;
        IF r < 6 THEN
          slot_status := 'available';
        ELSIF r < 8 THEN
          slot_status := 'booked';
        ELSE
          slot_status := 'blocked';
        END IF;

        INSERT INTO slots (court_id, slot_date, start_time, end_time, status, is_seed)
        VALUES (
          court.id,
          d,
          t,
          t + INTERVAL '1 hour',
          slot_status,
          true
        )
        ON CONFLICT (court_id, slot_date, start_time) DO NOTHING;

        t := t + INTERVAL '1 hour';
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

COMMIT;
