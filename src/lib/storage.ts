import { getLocalStore, saveLocalStore } from "@/lib/local-storage";
import { hasSupabaseAdminEnv } from "@/lib/supabase-server";
import { getSupabaseStore, saveSupabaseStore } from "@/lib/supabase-storage";
import type {
  DilmondoStore,
  HallOfFameEntry,
  HomepageAnnouncement,
  LeagueSettings,
  Member,
} from "@/lib/types";

type StorageMode = "local-json" | "supabase";

function shouldUseSupabase() {
  if (hasSupabaseAdminEnv()) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Production storage must use Supabase. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return false;
}

export function getStorageMode(): StorageMode {
  return shouldUseSupabase() ? "supabase" : "local-json";
}

export async function getStore(): Promise<DilmondoStore> {
  return shouldUseSupabase() ? getSupabaseStore() : getLocalStore();
}

export async function saveStore(store: DilmondoStore): Promise<DilmondoStore> {
  return shouldUseSupabase() ? saveSupabaseStore(store) : saveLocalStore(store);
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
