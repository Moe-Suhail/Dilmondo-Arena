import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { getStore, updateLeagueSettings } from "@/lib/storage";
import type { LeagueSettings, SeasonStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const store = await getStore();
  return NextResponse.json(store.leagueSettings);
}

export async function PATCH(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();
  const body = (await request.json()) as Partial<LeagueSettings>;
  const seasonStatus: SeasonStatus | undefined = ["active", "finished", "pre-season"].includes(
    body.seasonStatus ?? "",
  )
    ? body.seasonStatus
    : undefined;

  const store = await updateLeagueSettings({
    leagueId: Number(body.leagueId) || undefined,
    leagueName: body.leagueName,
    seasonName: body.seasonName,
    seasonStatus,
  });

  return NextResponse.json(store.leagueSettings);
}
