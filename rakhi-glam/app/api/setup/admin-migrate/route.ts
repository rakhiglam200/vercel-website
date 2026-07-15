import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.secret !== "rakhiglam-migrate-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase: any = getSupabaseAdmin();

    const statements = [
      // Create field_options table
      `CREATE TABLE IF NOT EXISTS field_options (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Insert default categories
      `INSERT INTO field_options (key, value) VALUES
        ('categories', '["Newly Launched","Necklaces","Rings","Bracelets","Earrings","Bangle Bracelets","Anklets","Jhumkas","Watches"]'::jsonb)
      ON CONFLICT (key) DO NOTHING`,

      // Add advanced product columns
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(8,2)`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}'`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`,

      // Add shipping columns to orders
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill_number TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_weight NUMERIC(8,2)`,

      // Enable RLS on field_options
      `ALTER TABLE field_options ENABLE ROW LEVEL SECURITY`,

      // Admin policies for field_options
      `CREATE POLICY IF NOT EXISTS "Admins can manage field_options" ON field_options FOR ALL USING (true) WITH CHECK (true)`,
    ];

    const results: string[] = [];
    for (const sql of statements) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql_text: sql });
        if (error) {
          // Try direct query as fallback
          const { error: directError } = await supabase.from("_rpc_result").select("*").limit(0);
          results.push(`WARN: ${sql.substring(0, 60)}... -> ${error.message}`);
        } else {
          results.push(`OK: ${sql.substring(0, 60)}...`);
        }
      } catch (e: any) {
        results.push(`SKIP: ${sql.substring(0, 60)}... -> ${e.message}`);
      }
    }

    return NextResponse.json({
      message: "Admin migration attempted. Check results for details.",
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST with { secret: 'rakhiglam-migrate-2024' } to run admin migration",
  });
}
