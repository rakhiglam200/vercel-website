-- RakhiGlam Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  badge TEXT,
  images TEXT[] DEFAULT '{}',
  alt TEXT,
  category TEXT NOT NULL,
  collection_slug TEXT NOT NULL,
  material TEXT,
  weight NUMERIC(8,2),
  in_stock BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_method TEXT DEFAULT 'razorpay',
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'captured', 'failed', 'refunded')),
  tracking_number TEXT,
  shipping_carrier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default collections
INSERT INTO collections (slug, label, description, sort_order) VALUES
  ('newly-launched', 'Newly Launched', 'Fresh arrivals just for you', 1),
  ('necklaces', 'Necklaces', 'Elegant chains & pendants', 2),
  ('rings', 'Rings', 'Stylish rings for every occasion', 3),
  ('bracelets', 'Bracelets', 'Charm & chain bracelets', 4),
  ('earrings', 'Earrings', 'Studs, hoops & drops', 5),
  ('bangle-bracelets', 'Bangle Bracelets', 'Classic bangles', 6),
  ('anklets', 'Anklets', 'Delicate ankle chains', 7),
  ('jhumkas', 'Jhumkas', 'Traditional jhumka earrings', 8),
  ('watches', 'Watches', 'Timeless timepieces', 9)
ON CONFLICT (slug) DO NOTHING;

-- Insert products from data/products.ts
INSERT INTO products (slug, title, description, long_description, price, original_price, badge, images, alt, category, collection_slug, material, weight, in_stock, features) VALUES
('long-rose-gold-necklace', 'Long Rose Gold Necklace', 'A stunning long rose gold chain necklace', 'Elevate your style with this elegant long rose gold necklace. Crafted with precision, this piece features a delicate chain that drapes beautifully.', 199, 399, 'Best Seller', ARRAY['/images/products/long-rose-gold-necklace.jpg'], 'Long Rose Gold Necklace', 'Necklaces', 'necklaces', 'Rose Gold Plated', 15, true, ARRAY['Rose gold plated', 'Hypoallergenic', 'Tarnish resistant', 'Adjustable length']),
('heart-silver-necklace', 'Heart Silver Necklace', 'Beautiful heart pendant in sterling silver', 'Express your love with this charming heart silver necklace.', 199, 399, NULL, ARRAY['/images/products/heart-silver-necklace.jpg'], 'Heart Silver Necklace', 'Necklaces', 'necklaces', 'Silver Plated', 12, true, ARRAY['Silver plated', 'Heart pendant design', 'Lightweight', 'Gift ready']),
('snake-chain-gold-bracelet', 'Snake Chain Gold Bracelet', 'Sleek snake chain bracelet in gold finish', 'This sleek snake chain bracelet features a smooth, fluid design.', 149, 299, 'Popular', ARRAY['/images/products/snake-chain-gold-bracelet.jpg'], 'Snake Chain Gold Bracelet', 'Bracelets', 'bracelets', 'Gold Plated', 10, true, ARRAY['Gold plated', 'Flexible snake chain', 'Secure clasp', 'Everyday wear']),
('flower-pearl-gold-earrings', 'Flower Pearl Gold Earrings', 'Elegant floral earrings with pearl accents', 'These exquisite flower pearl gold earrings combine delicate floral design with lustrous pearl accents.', 149, 299, NULL, ARRAY['/images/products/flower-pearl-gold-earrings.jpg'], 'Flower Pearl Gold Earrings', 'Earrings', 'earrings', 'Gold Plated with Pearl', 8, true, ARRAY['Gold plated', 'Pearl accents', 'Floral design', 'Lightweight']),
('bamboo-gold-bangle-bracelet', 'Bamboo Gold Bangle Bracelet', 'Textured bamboo-inspired gold bangle', 'Make a statement with this textured bamboo-inspired gold bangle bracelet.', 249, 499, NULL, ARRAY['/images/products/bamboo-gold-bangle.jpg'], 'Bamboo Gold Bangle Bracelet', 'Bangle Bracelets', 'bangle-bracelets', 'Gold Plated', 25, true, ARRAY['Gold plated', 'Bamboo texture', 'Stackable design', 'Durable finish']),
('infinity-gold-bangle-bracelet', 'Infinity Gold Bangle Bracelet', 'Elegant infinity symbol gold bangle', 'Symbolize endless style with this infinity gold bangle bracelet.', 369, 599, 'New', ARRAY['/images/products/infinity-gold-bangle.jpg'], 'Infinity Gold Bangle Bracelet', 'Bangle Bracelets', 'bangle-bracelets', 'Gold Plated', 20, true, ARRAY['Gold plated', 'Infinity symbol', 'Polished finish', 'Adjustable']),
('star-gold-bangle-bracelet', 'Star Gold Bangle Bracelet', 'Charming star-accented gold bangle', 'Add a touch of celestial charm to your wrist.', 499, 799, NULL, ARRAY['/images/products/star-gold-bangle.jpg'], 'Star Gold Bangle Bracelet', 'Bangle Bracelets', 'bangle-bracelets', 'Gold Plated', 22, true, ARRAY['Gold plated', 'Star accents', 'High polish', 'Comfortable fit']),
('classic-gold-choker', 'Classic Gold Choker', 'Timeless gold choker necklace', 'This classic gold choker necklace is a must-have staple.', 299, 599, 'Best Seller', ARRAY['/images/products/classic-gold-choker.jpg'], 'Classic Gold Choker', 'Necklaces', 'necklaces', 'Gold Plated', 18, true, ARRAY['Gold plated', 'Choker style', 'Adjustable closure', 'Versatile']),
('dainty-layering-necklace', 'Dainty Layering Necklace', 'Fine chain perfect for layering', 'This dainty layering necklace features a fine chain with a small pendant.', 169, 349, NULL, ARRAY['/images/products/dainty-layering-necklace.jpg'], 'Dainty Layering Necklace', 'Necklaces', 'necklaces', 'Gold Plated', 8, true, ARRAY['Fine chain', 'Small pendant', 'Layer-friendly', 'Everyday wear']),
('twisted-rope-bracelet', 'Twisted Rope Bracelet', 'Textured twisted rope design bracelet', 'This twisted rope bracelet features a unique textured design.', 249, 449, NULL, ARRAY['/images/products/twisted-rope-bracelet.jpg'], 'Twisted Rope Bracelet', 'Bracelets', 'bracelets', 'Gold Plated', 15, true, ARRAY['Twisted rope design', 'Gold plated', 'Textured finish', 'Secure clasp']),
('crystal-drop-earrings', 'Crystal Drop Earrings', 'Sparkling crystal drop earrings', 'These sparkling crystal drop earrings are perfect for adding glamour.', 299, 549, 'New', ARRAY['/images/products/crystal-drop-earrings.jpg'], 'Crystal Drop Earrings', 'Earrings', 'earrings', 'Gold Plated with Crystal', 10, true, ARRAY['Crystal accents', 'Drop design', 'Gold plated', 'Light-catching']),
('traditional-jhumka-earrings', 'Traditional Jhumka Earrings', 'Classic gold jhumka earrings', 'Embrace tradition with these classic gold jhumka earrings.', 399, 799, 'Popular', ARRAY['/images/products/traditional-jhumka.jpg'], 'Traditional Jhumka Earrings', 'Jhumkas', 'jhumkas', 'Gold Plated', 20, true, ARRAY['Traditional design', 'Gold plated', 'Bell-shaped', 'Festive wear']),
('anklet-chain-gold', 'Gold Anklet Chain', 'Delicate gold anklet with charm', 'This delicate gold anklet features a fine chain with a small charm.', 179, 349, NULL, ARRAY['/images/products/anklet-chain-gold.jpg'], 'Gold Anklet Chain', 'Anklets', 'anklets', 'Gold Plated', 6, true, ARRAY['Fine chain', 'Small charm', 'Adjustable', 'Lightweight']),
('minimalist-watch-gold', 'Minimalist Gold Watch', 'Sleek minimalist watch in gold', 'This minimalist gold watch combines functionality with elegance.', 999, 1499, 'Premium', ARRAY['/images/products/minimalist-watch-gold.jpg'], 'Minimalist Gold Watch', 'Watches', 'watches', 'Gold Plated Stainless Steel', 50, true, ARRAY['Gold plated', 'Mineral glass', 'Quartz movement', 'Water resistant']),
('charm-bracelet-gold', 'Gold Charm Bracelet', 'Beautiful charm bracelet with multiple charms', 'This beautiful gold charm bracelet features an assortment of delicate charms.', 449, 799, NULL, ARRAY['/images/products/charm-bracelet-gold.jpg'], 'Gold Charm Bracelet', 'Bracelets', 'bracelets', 'Gold Plated', 18, true, ARRAY['Multiple charms', 'Gold plated', 'Lobster clasp', 'Unique design']),
('pearl-stud-earrings', 'Pearl Stud Earrings', 'Classic pearl stud earrings', 'These classic pearl stud earrings are a timeless addition.', 199, 399, NULL, ARRAY['/images/products/pearl-stud-earrings.jpg'], 'Pearl Stud Earrings', 'Earrings', 'earrings', 'Gold Plated with Pearl', 5, true, ARRAY['Pearl studs', 'Gold setting', 'Secure back', 'Everyday wear'])
ON CONFLICT (slug) DO NOTHING;

-- Insert default admin user
INSERT INTO admin_users (email, name, role) VALUES
  ('rakhiglam200@gmail.com', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read policies for products and collections
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Collections are viewable by everyone" ON collections FOR SELECT USING (true);

-- Admin policies (using service role key bypasses RLS)
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage collections" ON collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (true);

-- Customers can insert their own data
CREATE POLICY "Customers can create own data" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (true);
