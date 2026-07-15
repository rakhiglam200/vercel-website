import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "rg_admin_session";
const SESSION_DAYS = 7;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "rakhiglam-admin-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "rakhiglam200@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email);
}

export async function signToken(payload: { email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function requireAdmin(): Promise<{ email: string }> {
  const session = await getSession();
  if (session && isAdminEmail(session.email)) return session;

  const customer = await getCustomerSession();
  if (customer && isAdminEmail(customer.email)) return { email: customer.email };

  throw new Error("Not authorized");
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}

const CUSTOMER_COOKIE = "rg_customer_session";

export interface CustomerProfile {
  email: string;
  name: string;
  picture?: string;
}

export async function signCustomerToken(profile: CustomerProfile): Promise<string> {
  return new SignJWT({ ...profile })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
}

export async function verifyCustomerToken(token: string): Promise<CustomerProfile | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as CustomerProfile;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export async function setCustomerSessionCookie(profile: CustomerProfile): Promise<void> {
  const token = await signCustomerToken(profile);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, "", { maxAge: 0, path: "/" });
}
