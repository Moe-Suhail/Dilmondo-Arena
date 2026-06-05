import { promises as fs } from "fs";
import path from "path";

import { MEMBER_UPLOAD_DIR } from "@/lib/paths";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const safeName = path.basename(decodeURIComponent(file));

  if (safeName !== decodeURIComponent(file)) {
    return new Response("Not found", { status: 404 });
  }

  const extension = path.extname(safeName).toLowerCase();
  const contentType = contentTypes[extension];

  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const bytes = await fs.readFile(path.join(MEMBER_UPLOAD_DIR, safeName));

    return new Response(bytes, {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": contentType,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
