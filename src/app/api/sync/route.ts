import { NextResponse } from "next/server";

import { buildArenaState } from "@/lib/arena";
import { requireAdminRequest } from "@/lib/auth";
import { syncLeague } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!requireAdminRequest(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const store = await syncLeague();
  return NextResponse.json(buildArenaState(store));
}
