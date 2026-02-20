-- ==========================================
-- BUYNIC: ADD SAMPLE PRODUCTS
-- ==========================================

INSERT INTO products (
  product_id, 
  name, 
  description, 
  category, 
  actual_price, 
  wholesale_price, 
  sale_price, 
  image_url, 
  stock_status
) VALUES 
-- 1. Urban Comfort Hoodie
(
  'BN-APP-001',
  'Urban Comfort Hoodie',
  'Crafted from 100% organic cotton, this hoodie offers a perfect blend of style and comfort. Features a relaxed fit and durable stitching for everyday wear.',
  'Apparel',
  89.99, -- Start Price (MSRP)
  35.00, -- Wholesale Cost
  59.99, -- Sale Price
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  'in_stock'
),
-- 2. Minimalist Leather Wallet
(
  'BN-ACC-002',
  'Minimalist Leather Wallet',
  'Sleek and slim, this genuine leather wallet is designed for the modern minimalist. Holds up to 8 cards and cash without the bulk.',
  'Accessories',
  45.00,
  15.00,
  29.99,
  'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
  'in_stock'
),
-- 3. Pro Wireless Earbuds
(
  'BN-ELE-003',
  'Pro Wireless Earbuds',
  'Experience immersive sound with active noise cancellation and 24-hour battery life. Water-resistant and perfect for workouts or commuting.',
  'Electronics',
  129.99,
  50.00,
  89.99,
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  'fast_selling'
),
-- 4. Weekender Canvas Backpack
(
  'BN-TRV-004',
  'Weekender Canvas Backpack',
  'A versatile and rugged backpack made from weather-resistant canvas. Features a padded laptop sleeve and ample storage for short trips.',
  'Travel',
  79.99,
  30.00,
  54.99,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  'in_stock'
),
-- 5. Smart Fitness Tracker
(
  'BN-WBL-005',
  'Smart Fitness Tracker',
  'Track your steps, heart rate, and sleep quality with precision. Lightweight design with a 7-day battery life and smartphone synchronization.',
  'Wearables',
  59.99,
  20.00,
  39.99,
  'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
  'out_of_stock'
),
-- 6. Modern Ceramic Coffee Set
(
  'BN-HOM-006',
  'Modern Ceramic Coffee Set',
  'Elevate your morning ritual with this artisanal ceramic coffee set. Includes two mugs and a pour-over dripper in a matte styling.',
  'Home',
  65.00,
  25.00,
  49.99,
  'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  'in_stock'
)
ON CONFLICT (product_id) DO NOTHING;
