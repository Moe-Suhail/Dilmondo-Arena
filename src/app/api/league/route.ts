import { NextResponse } from "next/server";

import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const arena = await getArenaState();
  return NextResponse.json(arena);
}
