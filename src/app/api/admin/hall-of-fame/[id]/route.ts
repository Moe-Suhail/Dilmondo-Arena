import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { getStore, saveStore } from "@/lib/storage";
import type { HallOfFameEntry } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdminRequest(request)) return unauthorized();
  const { id } = await params;
  const body = (await request.json()) as Partial<HallOfFameEntry>;
  const store = await getStore();
  let updated: HallOfFameEntry | null = null;
  store.hallOfFame = store.hallOfFame.map((entry) => {
    if (entry.id !== id) return entry;
    updated = { ...entry, ...body };
    return updated;
  });
  await saveStore(store);

  if (!updated) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdminRequest(request)) return unauthorized();
  const { id } = await params;
  const store = await getStore();
  const exists = store.hallOfFame.some((entry) => entry.id === id);

  if (!exists) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  store.hallOfFame = store.hallOfFame.filter((entry) => entry.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
