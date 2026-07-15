import { NextResponse } from "next/server";
import { getSession, getCustomerSession, isAdminEmail } from "@/lib/auth";

export async function GET() {
  // Check admin session first
  const session = await getSession();
  if (session) {
    return NextResponse.json({ email: session.email });
  }

  // Fall back to customer session — allow if email is in ADMIN_EMAILS
  const customer = await getCustomerSession();
  if (customer && isAdminEmail(customer.email)) {
    return NextResponse.json({ email: customer.email });
  }

  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}
