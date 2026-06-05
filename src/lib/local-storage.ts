import { promises as fs } from "fs";

import { DATA_DIR, DATA_FILE } from "@/lib/paths";
import { normalizeStore } from "@/lib/storage-utils";
import type { DilmondoStore } from "@/lib/types";

let cachedStore: DilmondoStore | null = null;

export async function getLocalStore(): Promise<DilmondoStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cachedStore = normalizeStore(JSON.parse(raw) as Partial<DilmondoStore>);
    return cachedStore;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("Failed to read Dilmondo local store", error);
    }
    cachedStore = normalizeStore(null);
    await saveLocalStore(cachedStore);
    return cachedStore;
  }
}

export async function saveLocalStore(store: DilmondoStore): Promise<DilmondoStore> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const normalized = normalizeStore(store);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  cachedStore = normalized;
  return normalized;
}
