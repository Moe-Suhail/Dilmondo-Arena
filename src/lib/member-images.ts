import { promises as fs } from "fs";
import path from "path";

import { MEMBER_UPLOAD_DIR, memberUploadUrl } from "@/lib/paths";
import { getStorageMode } from "@/lib/storage";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

export const MEMBER_AVATARS_BUCKET = "member-avatars";

function safeMemberId(memberId: string) {
  return memberId.replace(/[^a-z0-9_-]/gi, "-").slice(0, 80);
}

function safeExtension(fileName: string, type: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension) {
    return extension;
  }

  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}

function supabaseObjectPathFromPublicUrl(url: string | null | undefined) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${MEMBER_AVATARS_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index < 0) return null;
    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function uploadLocalMemberImage(memberId: string, file: File) {
  const extension = safeExtension(file.name, file.type);
  const safeName = `${safeMemberId(memberId)}-${Date.now()}${extension}`;
  const absolutePath = path.join(MEMBER_UPLOAD_DIR, safeName);
  await fs.mkdir(MEMBER_UPLOAD_DIR, { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));
  return memberUploadUrl(safeName);
}

async function uploadSupabaseMemberImage(
  memberId: string,
  file: File,
  previousUrl: string | null,
) {
  const supabase = getSupabaseAdminClient();
  const extension = safeExtension(file.name, file.type);
  const objectPath = `${safeMemberId(memberId)}/${Date.now()}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(MEMBER_AVATARS_BUCKET).upload(objectPath, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(`Supabase avatar upload failed: ${error.message}`);
  }

  const previousObjectPath = supabaseObjectPathFromPublicUrl(previousUrl);
  if (previousObjectPath) {
    await supabase.storage.from(MEMBER_AVATARS_BUCKET).remove([previousObjectPath]);
  }

  const { data } = supabase.storage.from(MEMBER_AVATARS_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function uploadMemberImage(memberId: string, file: File, previousUrl: string | null) {
  return getStorageMode() === "supabase"
    ? uploadSupabaseMemberImage(memberId, file, previousUrl)
    : uploadLocalMemberImage(memberId, file);
}
