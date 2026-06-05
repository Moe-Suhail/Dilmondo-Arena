import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { getStore, upsertHallOfFameEntry } from "@/lib/storage";
import type { HallOfFameEntry } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const store = await getStore();
  return NextResponse.json(store.hallOfFame);
}

export async function POST(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const body = (await request.json()) as Partial<HallOfFameEntry>;
  const entry: HallOfFameEntry = {
    id: body.id ?? randomUUID(),
    season: body.season ?? "موسم جديد",
    winnerMemberId: body.winnerMemberId ?? null,
    runnerUpMemberId: body.runnerUpMemberId ?? null,
    lastPlaceMemberId: body.lastPlaceMemberId ?? null,
    title: body.title ?? "لقب جديد",
    description: body.description ?? "",
    awardsPayload: body.awardsPayload ?? [],
    imageUrl: body.imageUrl ?? null,
    createdAt: body.createdAt ?? new Date().toISOString(),
  };

  return NextResponse.json(await upsertHallOfFameEntry(entry));
}
