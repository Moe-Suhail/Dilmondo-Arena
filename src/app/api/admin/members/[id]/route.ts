import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { updateMember } from "@/lib/storage";
import type { Member } from "@/lib/types";

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
  const body = (await request.json()) as Partial<Member>;
  const updated = await updateMember(id, {
    fplManagerId: body.fplManagerId === null ? null : Number(body.fplManagerId) || undefined,
    fplTeamName: body.fplTeamName ?? null,
    fplManagerName: body.fplManagerName ?? null,
    displayNameAr: body.displayNameAr,
    shortName: body.shortName,
    nickname: body.nickname,
    profileImageUrl: body.profileImageUrl,
    avatarUrl: body.avatarUrl,
    customColor: body.customColor,
    banterLevel: body.banterLevel,
    active: body.active,
    status: body.status,
    notes: body.notes,
  });

  return NextResponse.json(updated);
}
