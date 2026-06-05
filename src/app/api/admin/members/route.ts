import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { getStore, saveStore } from "@/lib/storage";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const store = await getStore();
  return NextResponse.json(store.members);
}

export async function POST(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const body = (await request.json()) as Partial<Member>;
  const store = await getStore();
  const now = new Date().toISOString();
  const member: Member = {
    id: body.id ?? randomUUID(),
    fplManagerId: body.fplManagerId ?? null,
    fplTeamName: body.fplTeamName ?? null,
    fplManagerName: body.fplManagerName ?? null,
    standingReference: body.standingReference ?? null,
    displayNameAr: body.displayNameAr ?? "عضو جديد",
    shortName: body.shortName ?? body.displayNameAr ?? "عضو جديد",
    nickname: body.nickname ?? "بدون لقب",
    profileImageUrl: body.profileImageUrl ?? null,
    avatarUrl: body.avatarUrl ?? null,
    customColor: body.customColor ?? "#f5c542",
    banterLevel: body.banterLevel ?? "normal",
    active: body.active ?? true,
    status: body.status ?? "active",
    notes: body.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  store.members.push(member);
  await saveStore(store);
  return NextResponse.json(member);
}
