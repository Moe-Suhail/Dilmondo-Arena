import { createDefaultStore, createSeedMembers } from "@/lib/seed";
import type { DilmondoStore, Member } from "@/lib/types";

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

export function normalizeStore(value: Partial<DilmondoStore> | null): DilmondoStore {
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
