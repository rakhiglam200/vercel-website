-- RakhiGlam FULL Database Setup
-- Run this in Supabase SQL Editor (creates everything from scratch)

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
  waybill_number TEXT,
  tracking_url TEXT,
  shipment_status TEXT,
  shipping_label_url TEXT,
  shipping_weight NUMERIC(8,2),
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

-- Field options table (for dynamic category management)
CREATE TABLE IF NOT EXISTS field_options (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Auto-update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (DROP IF EXISTS first, since PostgreSQL doesn't support CREATE TRIGGER IF NOT EXISTS)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_field_options_updated_at ON field_options;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_field_options_updated_at BEFORE UPDATE ON field_options FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Default collections
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

-- Default categories in field_options
INSERT INTO field_options (key, value) VALUES
  ('categories', '["Newly Launched","Necklaces","Rings","Bracelets","Earrings","Bangle Bracelets","Anklets","Jhumkas","Watches"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Default admin user
INSERT INTO admin_users (email, name, role) VALUES
  ('rakhiglam200@gmail.com', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Collections are viewable by everyone" ON collections FOR SELECT USING (true);

-- Admin full access policies
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage collections" ON collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage field_options" ON field_options FOR ALL USING (true) WITH CHECK (true);

-- Customer policies
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Customers can create own data" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (true);
