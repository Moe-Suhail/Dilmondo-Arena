import path from "path";

import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth";
import { uploadMemberImage } from "@/lib/member-images";
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
  const existingMember = store.members.find((member) => member.id === memberId);

  if (!existingMember) {
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

  const profileImageUrl = await uploadMemberImage(
    memberId,
    file,
    existingMember.profileImageUrl,
  );
  const member = await updateMember(memberId, { profileImageUrl });

  return NextResponse.json({ profileImageUrl, member });
}
