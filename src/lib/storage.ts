import { promises as fs } from "fs";

import { DATA_DIR, DATA_FILE } from "@/lib/paths";
import { createDefaultStore, createSeedMembers } from "@/lib/seed";
import type {
  DilmondoStore,
  HallOfFameEntry,
  HomepageAnnouncement,
  LeagueSettings,
  Member,
} from "@/lib/types";

let cachedStore: DilmondoStore | null = null;

function storageMode() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase-ready"
    : "local-json";
}

export function getStorageMode(): "local-json" | "supabase-ready" {
  return storageMode();
}

function mergeSeedMembers(existing: Member[]): Member[] {
  const now = new Date().toISOString();
  const seed = createSeedMembers(now);
  const byId = new Map(existing.map((member) => [member.id, member]));

  for (const member of seed) {
    if (!byId.has(member.id)) {
      byId.set(member.id, member);
    }
  }

  return Array.from(byId.values());
}

function normalizeStore(value: Partial<DilmondoStore> | null): DilmondoStore {
  const base = createDefaultStore();
  const incoming = value ?? {};

  return {
    ...base,
    ...incoming,
    leagueSettings: {
      ...base.leagueSettings,
      ...(incoming.leagueSettings ?? {}),
    },
    members: mergeSeedMembers(incoming.members?.length ? incoming.members : base.members),
    standingsSnapshots: incoming.standingsSnapshots ?? [],
    managerGameweekSnapshots: incoming.managerGameweekSnapshots ?? [],
    banterTemplates: incoming.banterTemplates?.length
      ? incoming.banterTemplates
      : base.banterTemplates,
    hallOfFame: incoming.hallOfFame ?? [],
    homepageAnnouncements: incoming.homepageAnnouncements?.length
      ? incoming.homepageAnnouncements
      : base.homepageAnnouncements,
  };
}

export async function getStore(): Promise<DilmondoStore> {
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
    await saveStore(cachedStore);
    return cachedStore;
  }
}

export async function saveStore(store: DilmondoStore): Promise<DilmondoStore> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const normalized = normalizeStore(store);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  cachedStore = normalized;
  return normalized;
}

export async function updateStore(
  mutator: (store: DilmondoStore) => Promise<void> | void,
): Promise<DilmondoStore> {
  const store = await getStore();
  await mutator(store);
  return saveStore(store);
}

export async function updateLeagueSettings(
  patch: Partial<LeagueSettings>,
): Promise<DilmondoStore> {
  return updateStore((store) => {
    store.leagueSettings = {
      ...store.leagueSettings,
      ...patch,
    };
  });
}

export async function updateMember(memberId: string, patch: Partial<Member>): Promise<Member> {
  let updated: Member | null = null;

  await updateStore((store) => {
    store.members = store.members.map((member) => {
      if (member.id !== memberId) {
        return member;
      }

      updated = {
        ...member,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
  });

  if (!updated) {
    throw new Error("Member not found");
  }

  return updated;
}

export async function upsertHallOfFameEntry(entry: HallOfFameEntry): Promise<HallOfFameEntry> {
  await updateStore((store) => {
    const index = store.hallOfFame.findIndex((item) => item.id === entry.id);
    if (index >= 0) {
      store.hallOfFame[index] = entry;
    } else {
      store.hallOfFame.unshift(entry);
    }
  });

  return entry;
}

export async function updateAnnouncement(
  patch: Partial<HomepageAnnouncement>,
): Promise<HomepageAnnouncement> {
  let updated: HomepageAnnouncement | null = null;
  await updateStore((store) => {
    const active = store.homepageAnnouncements.find((item) => item.active);
    const target = active ?? store.homepageAnnouncements[0];
    if (!target) {
      updated = {
        id: "announcement",
        title: patch.title ?? "",
        body: patch.body ?? "",
        active: patch.active ?? true,
        createdAt: new Date().toISOString(),
      };
      store.homepageAnnouncements.unshift(updated);
      return;
    }

    updated = { ...target, ...patch };
    store.homepageAnnouncements = store.homepageAnnouncements.map((item) =>
      item.id === target.id ? updated! : item,
    );
  });

  if (!updated) {
    throw new Error("Announcement update failed");
  }

  return updated;
}
