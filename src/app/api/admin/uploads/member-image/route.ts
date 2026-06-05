import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { MEMBER_UPLOAD_DIR, memberUploadUrl } from "@/lib/paths";
import { getStore, updateMember } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}

export async function POST(request: Request) {
  if (!requireAdminRequest(request)) return unauthorized();

  const formData = await request.formData();
  const memberId = String(formData.get("memberId") ?? "");
  const file = formData.get("file");

  if (!memberId || !(file instanceof File)) {
    return NextResponse.json({ error: "بيانات الرفع غير مكتملة" }, { status: 400 });
  }

  const store = await getStore();
  const memberExists = store.members.some((member) => member.id === memberId);

  if (!memberExists) {
    return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
  }

  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "حجم الصورة يجب أن يكون أقل من 3MB" }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase();
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

  if (!allowed.has(extension)) {
    return NextResponse.json({ error: "صيغة الصورة غير مدعومة" }, { status: 400 });
  }

  const safeMemberId = memberId.replace(/[^a-z0-9_-]/gi, "-").slice(0, 80);
  const safeName = `${safeMemberId}-${Date.now()}${extension}`;
  const absolutePath = path.join(MEMBER_UPLOAD_DIR, safeName);
  await fs.mkdir(MEMBER_UPLOAD_DIR, { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));
  const profileImageUrl = memberUploadUrl(safeName);
  const member = await updateMember(memberId, { profileImageUrl });

  return NextResponse.json({ profileImageUrl, member });
}
