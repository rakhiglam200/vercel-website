import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { setCustomerSessionCookie, isAdminEmail, setSessionCookie } from "@/lib/auth";

const STATE_COOKIE = "google_oauth_state";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieStore = await cookies();
  const stateCookieRaw = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (error) {
    return NextResponse.redirect(`${url.origin}/account?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state || !stateCookieRaw) {
    return NextResponse.redirect(`${url.origin}/account?error=missing_state`);
  }

  let expectedState: string;
  let returnTo: string;
  try {
    const parsed = JSON.parse(stateCookieRaw);
    expectedState = parsed.state;
    returnTo = typeof parsed.returnTo === "string" ? parsed.returnTo : "/";
  } catch {
    return NextResponse.redirect(`${url.origin}/account?error=bad_state`);
  }

  if (state !== expectedState) {
    return NextResponse.redirect(`${url.origin}/account?error=state_mismatch`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${url.origin}/account?error=not_configured`);
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${url.origin}/account?error=token_exchange_failed`);
  }

  const tokenData = await tokenRes.json();
  const idToken = tokenData.id_token as string | undefined;
  if (!idToken) {
    return NextResponse.redirect(`${url.origin}/account?error=no_id_token`);
  }

  let payload;
  try {
    const verified = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });
    payload = verified.payload;
  } catch {
    return NextResponse.redirect(`${url.origin}/account?error=invalid_id_token`);
  }

  const email = payload.email as string | undefined;
  const emailVerified = payload.email_verified as boolean | undefined;
  const name = (payload.name as string | undefined) || email || "Customer";
  const picture = payload.picture as string | undefined;

  if (!email || !emailVerified) {
    return NextResponse.redirect(`${url.origin}/account?error=email_not_verified`);
  }

  await setCustomerSessionCookie({ email, name, picture });

  if (isAdminEmail(email)) {
    const auth = await import("@/lib/auth");
    const adminToken = await auth.signToken({ email });
    await auth.setSessionCookie(adminToken);
  }

  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/";
  return NextResponse.redirect(`${url.origin}${safeReturnTo}`);
}
