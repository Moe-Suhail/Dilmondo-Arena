import { getStore, getStorageMode } from "@/lib/storage";
import { syncLeague } from "@/lib/sync";
import { createInsights } from "@/lib/insights";
import { findMemberForStanding } from "@/lib/matching";
import type {
  ArenaStanding,
  ArenaState,
  DilmondoStore,
  FplStanding,
  Member,
  StandingsSnapshot,
} from "@/lib/types";

function latestSnapshots(store: DilmondoStore) {
  return [...store.standingsSnapshots].sort(
    (a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime(),
  );
}

function statusBadge(row: FplStanding, index: number, totalRows: number, gapFromLeader: number) {
  if (index === 0) return "المتصدر";
  if (index === 1 && gapFromLeader <= 50) return "المطارد";
  if (index === totalRows - 1) return "القاع التاريخي";
  if (gapFromLeader > 150) return "خارج التغطية";
  if (gapFromLeader > 100) return "يحتاج معجزة";
  if (row.gwPoints >= 70) return "عودة قوية";
  if (row.gwPoints < 40) return "سقوط حر";
  if (gapFromLeader <= 25) return "قريب من الخطر";
  return "في قلب المنافسة";
}

function toArenaStanding(
  standing: FplStanding,
  index: number,
  all: FplStanding[],
  latestSnapshot: StandingsSnapshot,
  previousSnapshot: StandingsSnapshot | null,
  members: Member[],
): ArenaStanding {
  const leader = all[0];
  const previous = all[index - 1] ?? null;
  const member = findMemberForStanding(members, standing);
  const previousStanding = previousSnapshot?.normalizedPayload.standings.find(
    (item) => item.managerId === standing.managerId,
  );
  const rankMovement =
    typeof standing.lastRank === "number"
      ? standing.lastRank - standing.rank
      : typeof previousStanding?.rank === "number"
        ? previousStanding.rank - standing.rank
        : null;
  const gapFromLeader = leader ? leader.totalPoints - standing.totalPoints : 0;

  return {
    ...standing,
    member,
    displayName: member?.displayNameAr ?? standing.fplManagerName,
    shortName: member?.shortName ?? standing.fplManagerName,
    nickname: member?.nickname ?? standing.fplTeamName,
    profileImageUrl: member?.profileImageUrl ?? null,
    avatarUrl: member?.avatarUrl ?? null,
    customColor: member?.customColor ?? "#f5c542",
    gapFromLeader,
    gapFromPrevious: previous ? previous.totalPoints - standing.totalPoints : null,
    rankMovement,
    statusBadge: statusBadge(standing, index, all.length, gapFromLeader),
    memberUrl: `/members/${member?.id ?? standing.managerId}`,
  };
}

export function buildArenaState(store: DilmondoStore): ArenaState {
  const snapshots = latestSnapshots(store);
  const latestSnapshot = snapshots[0] ?? null;
  const previousSnapshot = snapshots[1] ?? null;
  const rawStandings = latestSnapshot?.normalizedPayload.standings ?? [];
  const standings = latestSnapshot
    ? rawStandings.map((standing, index, all) =>
        toArenaStanding(standing, index, all, latestSnapshot, previousSnapshot, store.members),
      )
    : [];
  const latestEvent = latestSnapshot?.normalizedPayload.latestEvent ?? null;
  const nextEvent = latestSnapshot?.normalizedPayload.nextEvent ?? null;
  const seasonSummary =
    latestSnapshot?.normalizedPayload.seasonSummary ?? {
      totalEvents: latestEvent?.id ?? 0,
      finishedEvents: latestEvent?.finished || latestEvent?.dataChecked ? latestEvent.id : 0,
      remainingEvents: nextEvent ? 1 : 0,
      seasonEnded:
        store.leagueSettings.seasonStatus === "finished" ||
        Boolean(latestEvent?.finished && !nextEvent),
    };
  const fixtures = latestSnapshot?.normalizedPayload.fixtures ?? [];
  const managerGameweeks = latestSnapshot?.normalizedPayload.managerGameweeks ?? [];
  const activeAnnouncement =
    store.homepageAnnouncements.find((announcement) => announcement.active) ?? null;
  const warning =
    store.leagueSettings.syncStatus === "failed" && store.leagueSettings.lastSyncAt
      ? "تعذر جلب بيانات Fantasy Premier League حالياً. يتم عرض آخر نسخة محفوظة وقد تكون قديمة."
      : store.leagueSettings.syncStatus === "failed"
        ? "تعذر جلب بيانات Fantasy Premier League حالياً، ولا توجد نسخة محفوظة بعد."
        : null;

  return {
    settings: store.leagueSettings,
    members: store.members,
    inactiveMembers: store.members.filter(
      (member) => !member.active || member.status === "withdrawn" || member.status === "archived",
    ),
    standings,
    latestSnapshot,
    previousSnapshot,
    latestEvent,
    nextEvent,
    seasonSummary,
    fixtures,
    lastSyncAt: store.leagueSettings.lastSyncAt,
    warning,
    dataAvailable: standings.length > 0,
    insights: createInsights(standings, managerGameweeks, seasonSummary),
    hallOfFame: store.hallOfFame,
    announcement: activeAnnouncement,
    storageMode: getStorageMode(),
  };
}

export async function getArenaState(options: { syncIfEmpty?: boolean } = {}): Promise<ArenaState> {
  const syncIfEmpty = options.syncIfEmpty ?? true;
  let store = await getStore();

  if (syncIfEmpty && store.standingsSnapshots.length === 0) {
    store = await syncLeague();
  }

  return buildArenaState(store);
}

export async function getMemberProfile(identifier: string) {
  const arena = await getArenaState();
  const standing =
    arena.standings.find((row) => row.member?.id === identifier) ??
    arena.standings.find((row) => String(row.managerId) === identifier);
  const member =
    standing?.member ??
    arena.members.find((item) => item.id === identifier) ??
    arena.members.find((item) => String(item.fplManagerId) === identifier) ??
    null;

  return { arena, standing, member };
}
