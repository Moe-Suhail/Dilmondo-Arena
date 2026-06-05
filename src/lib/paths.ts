import path from "path";

const persistentRoot = process.env.DILMONDO_DATA_DIR
  ? path.resolve(process.env.DILMONDO_DATA_DIR)
  : path.join(process.cwd(), "data");

export const DATA_DIR = persistentRoot;
export const DATA_FILE = path.join(DATA_DIR, "dilmondo-store.json");

export const MEMBER_UPLOAD_DIR = process.env.DILMONDO_UPLOAD_DIR
  ? path.resolve(process.env.DILMONDO_UPLOAD_DIR)
  : process.env.DILMONDO_DATA_DIR
    ? path.join(persistentRoot, "uploads", "members")
    : path.join(process.cwd(), "public", "uploads", "members");

export function memberUploadUrl(fileName: string) {
  return `/api/uploads/members/${encodeURIComponent(fileName)}`;
}
