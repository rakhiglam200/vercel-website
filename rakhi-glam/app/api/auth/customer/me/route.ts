import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.json({
      customer: {
        email: user.email,
        name: user.user_metadata?.name ?? user.email,
        picture: user.user_metadata?.picture ?? user.user_metadata?.avatar_url,
      },
    });
  }

  const googleCustomer = await getCustomerSession();
  if (googleCustomer) {
    return NextResponse.json({ customer: googleCustomer });
  }

  return NextResponse.json({ customer: null }, { status: 401 });
}
