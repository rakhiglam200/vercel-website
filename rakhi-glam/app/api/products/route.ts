import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";
import { products as hardcodedProducts } from "@/data/products";

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const dbList = dbProducts || [];
    const dbBySlug = new Map<string, any>(dbList.map((p: any) => [p.slug, p]));

    const merged = hardcodedProducts.map((hp) => {
      const db = dbBySlug.get(hp.slug);
      if (db) {
        return {
          id: db.id,
          slug: db.slug,
          title: db.title,
          description: db.description || "",
          long_description: db.long_description || "",
          price: db.price,
          original_price: db.original_price,
          badge: db.badge,
          category: db.category,
          collection_slug: db.collection_slug,
          in_stock: db.in_stock,
          images: db.images || [],
          alt: db.alt || db.title,
          material: db.material,
          weight: db.weight,
          features: db.features || [],
          source: "db" as const,
        };
      }
      return {
        id: hp.slug,
        slug: hp.slug,
        title: hp.title,
        description: hp.description,
        long_description: hp.longDescription,
        price: hp.price,
        original_price: hp.originalPrice,
        badge: hp.badge,
        category: hp.category,
        collection_slug: hp.collection,
        in_stock: hp.inStock,
        images: hp.images,
        alt: hp.alt,
        material: hp.material,
        weight: hp.weight,
        features: hp.features || [],
        source: "hardcoded" as const,
      };
    });

    const dbOnlySlugs = new Set(hardcodedProducts.map((p) => p.slug));
    const extraDb = dbList
      .filter((p: any) => !dbOnlySlugs.has(p.slug))
      .map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description || "",
        long_description: p.long_description || "",
        price: p.price,
        original_price: p.original_price,
        badge: p.badge,
        category: p.category,
        collection_slug: p.collection_slug,
        in_stock: p.in_stock,
        images: p.images || [],
        alt: p.alt || p.title,
        material: p.material,
        weight: p.weight,
        features: p.features || [],
        source: "db" as const,
      }));

    return NextResponse.json({ products: [...merged, ...extraDb] });
  } catch (error: any) {
    return NextResponse.json({ products: hardcodedProducts.map((p) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      description: p.description,
      long_description: p.longDescription,
      price: p.price,
      original_price: p.originalPrice,
      badge: p.badge,
      category: p.category,
      collection_slug: p.collection,
      in_stock: p.inStock,
      images: p.images,
      alt: p.alt,
      material: p.material,
      weight: p.weight,
      features: p.features || [],
      source: "hardcoded" as const,
    })) });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .insert({
        title: body.title,
        slug: body.slug,
        description: body.description,
        long_description: body.long_description,
        price: body.price,
        original_price: body.original_price,
        badge: body.badge,
        category: body.category,
        collection_slug: body.collection,
        in_stock: body.in_stock ?? true,
        images: body.images || [],
        alt: body.alt || body.title,
        material: body.material,
        weight: body.weight,
        features: body.features || [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
