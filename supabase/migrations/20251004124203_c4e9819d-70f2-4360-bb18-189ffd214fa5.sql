-- Create a test short-stay property with dummy data (using monthly price type)
INSERT INTO properties (
  id,
  user_id,
  title,
  location,
  city,
  district,
  full_address,
  price,
  price_type,
  category,
  property_type,
  bedrooms,
  bathrooms,
  area,
  description,
  contact_name,
  contact_phone,
  contact_email,
  images,
  status,
  is_verified,
  is_hot_deal,
  features,
  created_at
)
SELECT
  'a0000000-0000-0000-0000-000000000001'::uuid,
  id as user_id,
  'Luxury Beachfront Apartment - Test Property',
  'Algiers Beach Resort Area',
  'Algiers',
  'Sidi Fredj',
  '123 Coastal Drive, Sidi Fredj, Algiers',
  '15000',
  'monthly',
  'short-stay',
  'apartment',
  '2',
  '2',
  '95',
  'Beautiful beachfront apartment with stunning sea views. This test property features modern amenities, a fully equipped kitchen, spacious living areas, and direct beach access. Perfect for a relaxing coastal getaway. The apartment includes high-speed WiFi, air conditioning, and a private balcony overlooking the Mediterranean Sea.',
  'Test Host',
  '+213 555 123 456',
  'testhost@holibayt.com',
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
  ],
  'active',
  true,
  false,
  jsonb_build_object(
    'wifi', true,
    'parking', true,
    'ac', true,
    'kitchen', true,
    'tv', true,
    'balcony', true,
    'sea_view', true,
    'beach_access', true
  ),
  now() - interval '60 days'
FROM profiles
WHERE role = 'admin'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Create a completed booking for this property (past checkout date)
INSERT INTO bookings (
  id,
  user_id,
  property_id,
  check_in_date,
  check_out_date,
  guests_count,
  status,
  total_amount,
  booking_fee,
  security_deposit,
  created_at
)
SELECT
  'b0000000-0000-0000-0000-000000000001'::uuid,
  id as user_id,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  (CURRENT_DATE - interval '10 days')::date,
  (CURRENT_DATE - interval '3 days')::date,
  2,
  'completed',
  105000,
  5000,
  10000,
  now() - interval '15 days'
FROM profiles
WHERE role = 'admin'
LIMIT 1
ON CONFLICT (id) DO NOTHING;