-- ==========================================
-- BUYNIC: FULL DATABASE RESET SCRIPT
-- ==========================================
-- ⚠️ WARNING: THIS SCRIPT DELETES ALL EXISTING DATA!
-- Run this in the Supabase SQL Editor to verify your schema is 100% correct.

-- 1. DROP EXISTING TABLES (Clean Slate)
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- 2. CREATE PRODUCTS TABLE
CREATE TABLE products (
  product_id TEXT PRIMARY KEY, -- Manual ID (e.g., "NIKE-AIR-01")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  actual_price NUMERIC,
  wholesale_price NUMERIC, -- Added for profit calculation
  sale_price NUMERIC NOT NULL,
  image_url TEXT,
  return_available BOOLEAN DEFAULT TRUE,
  stock_status TEXT DEFAULT 'in_stock', -- 'in_stock', 'out_of_stock', 'fast_selling'
  
  -- Rating Aggregates (Denormalized for performance)
  average_rating NUMERIC DEFAULT 0, 
  total_reviews INTEGER DEFAULT 0
);

-- 3. CREATE ORDERS TABLE
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL,               -- Links to auth.users.id
  product_id TEXT REFERENCES products(product_id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC,
  status TEXT DEFAULT 'pending',        -- 'pending', 'ordered', 'shipped', 'delivered'
  
  -- Delivery Details
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_pincode TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  
  -- Payment
  payment_method TEXT DEFAULT 'COD',
  
  -- Customer Info (Snapshot)
  email TEXT
);

-- 4. CREATE REVIEWS TABLE
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  product_id TEXT REFERENCES products(product_id) ON DELETE CASCADE,
  user_id UUID, -- Can be null for admin-seeded reviews
  reviewer_name TEXT, -- For admin-seeded or user name
  rating NUMERIC CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_image_url TEXT, -- User uploaded or admin seeded photo
  verified_purchase BOOLEAN DEFAULT FALSE
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 5.1 ENABLE REALTIME
-- Crucial for instant updates on the frontend
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;



-- 6. ACCESS POLICIES

-- Products Policies
CREATE POLICY "Public read products" ON products FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage products" ON products FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'buynic.shop@gmail.com') 
WITH CHECK (auth.jwt() ->> 'email' = 'buynic.shop@gmail.com');

-- Orders Policies
CREATE POLICY "Users view own orders" ON orders FOR SELECT TO authenticated 
USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON orders FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin view all orders" ON orders FOR SELECT TO authenticated 
USING (auth.jwt() ->> 'email' = 'buynic.shop@gmail.com');
CREATE POLICY "Admin update all orders" ON orders FOR UPDATE TO authenticated 
USING (auth.jwt() ->> 'email' = 'buynic.shop@gmail.com');

-- Reviews Policies
CREATE POLICY "Public read reviews" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "Users create reviews" ON reviews FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON reviews FOR DELETE TO authenticated 
USING (auth.uid() = user_id);
CREATE POLICY "Admin delete any review" ON reviews FOR DELETE TO authenticated 
USING (auth.jwt() ->> 'email' = 'buynic.shop@gmail.com');



-- 8. CREATE ADDRESSES TABLE (For History)
CREATE TABLE user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

-- Addresses Policies
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own addresses" ON user_addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- End of Schema
