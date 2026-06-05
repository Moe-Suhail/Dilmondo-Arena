import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { getStore, updateAnnouncement } from "@/lib/storage";
import type { HomepageAnnouncement } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const store = await getStore();
  return NextResponse.json(store.homepageAnnouncements.find((item) => item.active) ?? null);
}

export async function PATCH(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const body = (await request.json()) as Partial<HomepageAnnouncement>;
  return NextResponse.json(await updateAnnouncement(body));
}
