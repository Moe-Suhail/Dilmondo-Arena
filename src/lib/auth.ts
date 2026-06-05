import { createHmac, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "dilmondo_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function adminPassword() {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }

  return isProduction() ? null : "dilmondo-admin";
}

function sessionSecret() {
  if (process.env.ADMIN_SESSION_SECRET) {
    return process.env.ADMIN_SESSION_SECRET;
  }

  return isProduction() ? null : "dilmondo-local-dev-session-secret";
}

function sign(payload: string) {
  const secret = sessionSecret();
  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createAdminSessionToken() {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const signature = sign(issuedAt);

  if (!signature) {
    throw new Error("Admin session secret is not configured");
  }

  return `${issuedAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) {
    return false;
  }

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) {
    return false;
  }

  const expected = sign(issuedAt);
  if (!expected || !safeEqual(signature, expected)) {
    return false;
  }

  const issuedAtNumber = Number(issuedAt);
  if (!Number.isFinite(issuedAtNumber)) {
    return false;
  }

  return Math.floor(Date.now() / 1000) - issuedAtNumber <= SESSION_MAX_AGE_SECONDS;
}

export function verifyAdminPassword(password: string) {
  const expected = adminPassword();
  return Boolean(expected && password === expected);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login");
  }
}

export function requireAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`))
    ?.slice(ADMIN_COOKIE_NAME.length + 1);

  if (!verifyAdminSessionToken(token)) {
    return false;
  }

  return true;
}

export function adminLoginNotice() {
  if (!process.env.ADMIN_PASSWORD && !isProduction()) {
    return "كلمة مرور التطوير الافتراضية: dilmondo-admin";
  }

  if (!process.env.ADMIN_PASSWORD && isProduction()) {
    return "يجب ضبط ADMIN_PASSWORD قبل استخدام لوحة التحكم في الإنتاج.";
  }

  return null;
}
