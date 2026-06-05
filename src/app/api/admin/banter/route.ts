import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { getStore, saveStore } from "@/lib/storage";
import type { BanterTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const store = await getStore();
  return NextResponse.json(store.banterTemplates);
}

export async function PATCH(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const templates = (await request.json()) as BanterTemplate[];
  const store = await getStore();
  store.banterTemplates = templates;
  await saveStore(store);
  return NextResponse.json(store.banterTemplates);
}
