-- RakhiGlam Database Migration: Add field_options table and advanced product fields
-- Run this in Supabase SQL Editor

-- Field options table for dynamic category management
CREATE TABLE IF NOT EXISTS field_options (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO field_options (key, value) VALUES
  ('categories', '["Newly Launched","Necklaces","Rings","Bracelets","Earrings","Bangle Bracelets","Anklets","Jhumkas","Watches"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add advanced product columns (if not already present)
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add shipping columns to orders (if not already present)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_weight NUMERIC(8,2);

-- Enable RLS on field_options
ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;

-- Admin policies for field_options
CREATE POLICY "Admins can manage field_options" ON field_options FOR ALL USING (true) WITH CHECK (true);

-- Auto-update trigger for field_options
CREATE TRIGGER update_field_options_updated_at BEFORE UPDATE ON field_options FOR EACH ROW EXECUTE FUNCTION update_updated_at();
