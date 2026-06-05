import { randomUUID } from "crypto";

import {
  extractCaptainData,
  buildSeasonSummary,
  fetchBootstrap,
  fetchFixtures,
  fetchLeagueStandings,
  fetchManagerHistory,
  fetchManagerPicks,
  normalizeFixtures,
  normalizeStandings,
  selectRelevantEvents,
  type FplBootstrapResponse,
  type FplManagerHistoryResponse,
  type FplPicksResponse,
} from "@/lib/fpl";
import { findMemberForStanding } from "@/lib/matching";
import { getStore, saveStore } from "@/lib/storage";
import type {
  DilmondoStore,
  FplStanding,
  ManagerGameweekSnapshot,
  Member,
} from "@/lib/types";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown sync error";
}

function mergeMembersWithFpl(members: Member[], standings: FplStanding[]): Member[] {
  const next = [...members];
  const now = new Date().toISOString();

  for (const standing of standings) {
    const existing = findMemberForStanding(next, standing);

    if (existing) {
      existing.fplManagerId = standing.managerId;
      existing.fplTeamName = standing.fplTeamName;
      existing.fplManagerName = standing.fplManagerName;
      existing.updatedAt = now;
      continue;
    }

    next.push({
      id: `fpl-${standing.managerId}`,
      fplManagerId: standing.managerId,
      fplTeamName: standing.fplTeamName,
      fplManagerName: standing.fplManagerName,
      standingReference: null,
      displayNameAr: standing.fplManagerName,
      shortName: standing.fplManagerName,
      nickname: standing.fplTeamName,
      profileImageUrl: null,
      avatarUrl: null,
      customColor: "#f5c542",
      banterLevel: "normal",
      active: true,
      status: "active",
      notes: "تمت إضافته تلقائياً من FPL. يمكن للمشرف تعديل الهوية المحلية.",
      createdAt: now,
      updatedAt: now,
    });
  }

  return next;
}

async function settledValue<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

function historyForEvent(history: FplManagerHistoryResponse | null, eventId: number) {
  return (
    history?.current.find((item) => item.event === eventId) ??
    history?.current[history.current.length - 1] ??
    null
  );
}

async function buildManagerSnapshot(
  standing: FplStanding,
  eventId: number,
  bootstrap: FplBootstrapResponse,
  syncedAt: string,
): Promise<ManagerGameweekSnapshot> {
  const [history, picks] = await Promise.all([
    settledValue(fetchManagerHistory(standing.managerId)),
    settledValue(fetchManagerPicks(standing.managerId, eventId)),
  ]);
  const eventHistory = historyForEvent(history, eventId);
  const captain = extractCaptainData(bootstrap, picks as FplPicksResponse | null);

  return {
    id: randomUUID(),
    managerId: standing.managerId,
    eventId,
    gwPoints: eventHistory?.points ?? standing.gwPoints ?? null,
    totalPoints: eventHistory?.total_points ?? standing.totalPoints ?? null,
    rank: standing.rank,
    picksPayload: picks,
    captainPlayerId: captain.captainPlayerId,
    captainPlayerName: captain.captainPlayerName,
    captainPoints: captain.captainPoints,
    syncedAt,
  };
}

export async function syncLeague(): Promise<DilmondoStore> {
  const store = await getStore();
  const syncedAt = new Date().toISOString();
  store.leagueSettings.syncStatus = "syncing";
  store.leagueSettings.syncError = null;

  try {
    const [leagueResponse, bootstrap, fixturesResponse] = await Promise.all([
      fetchLeagueStandings(store.leagueSettings.leagueId),
      fetchBootstrap(),
      settledValue(fetchFixtures()),
    ]);
    const standings = normalizeStandings(leagueResponse);
    const { latestEvent, nextEvent } = selectRelevantEvents(bootstrap);
    const seasonSummary = buildSeasonSummary(bootstrap);
    const fixtures = fixturesResponse ? normalizeFixtures(bootstrap, fixturesResponse) : [];
    const eventId = latestEvent?.id ?? null;
    const managerGameweeks = eventId
      ? await Promise.all(
          standings.map((standing) => buildManagerSnapshot(standing, eventId, bootstrap, syncedAt)),
        )
      : [];

    store.members = mergeMembersWithFpl(store.members, standings);
    store.standingsSnapshots.push({
      id: randomUUID(),
      leagueId: store.leagueSettings.leagueId,
      eventId,
      syncedAt,
      rawPayload: {
        league: leagueResponse.league,
        standings: leagueResponse.standings,
      },
      normalizedPayload: {
        standings,
        latestEvent,
        nextEvent,
        seasonSummary,
        fixtures,
        managerGameweeks,
      },
    });
    store.standingsSnapshots = store.standingsSnapshots.slice(-30);
    store.managerGameweekSnapshots.push(...managerGameweeks);
    store.managerGameweekSnapshots = store.managerGameweekSnapshots.slice(-500);
    store.leagueSettings.leagueName = leagueResponse.league.name || store.leagueSettings.leagueName;
    store.leagueSettings.seasonStatus = seasonSummary.seasonEnded
      ? "finished"
      : bootstrap.events.some((event) => event.is_current)
        ? "active"
        : "pre-season";
    store.leagueSettings.lastSyncAt = syncedAt;
    store.leagueSettings.syncStatus = "success";
    store.leagueSettings.syncError = null;

    return saveStore(store);
  } catch (error) {
    store.leagueSettings.syncStatus = "failed";
    store.leagueSettings.syncError = errorMessage(error);
    return saveStore(store);
  }
}
