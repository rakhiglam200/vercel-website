import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { clearCustomerSessionCookie } from "@/lib/auth";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearCustomerSessionCookie();
  return NextResponse.json({ message: "Logged out" });
}
