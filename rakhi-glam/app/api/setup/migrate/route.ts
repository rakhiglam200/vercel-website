import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== "rakhiglam-migrate-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase: any = getSupabaseAdmin();

    const statements = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

      `CREATE TABLE IF NOT EXISTS products (
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
      )`,

      `CREATE TABLE IF NOT EXISTS collections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        address JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS orders (
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
        status TEXT DEFAULT 'pending',
        payment_method TEXT DEFAULT 'razorpay',
        payment_id TEXT,
        payment_status TEXT DEFAULT 'pending',
        tracking_number TEXT,
        shipping_carrier TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'admin',
        password_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    ];

    const results: string[] = [];
    for (const sql of statements) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql_text: sql }).single();
        if (error) {
          results.push(`WARN: ${sql.substring(0, 50)}... -> ${error.message}`);
        } else {
          results.push(`OK: ${sql.substring(0, 50)}...`);
        }
      } catch (e: any) {
        results.push(`SKIP: ${sql.substring(0, 50)}... -> ${e.message}`);
      }
    }

    return NextResponse.json({
      message: "Migration attempted via RPC. If tables don't exist, run SQL in Supabase Dashboard.",
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST with { secret: 'rakhiglam-migrate-2024' } to run migration",
  });
}
