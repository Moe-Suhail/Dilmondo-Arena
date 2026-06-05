import type {
  FplEventSummary,
  FplFixtureSummary,
  FplStanding,
  SeasonSummary,
} from "@/lib/types";

const FPL_BASE_URL = "https://fantasy.premierleague.com/api";

interface FplLeagueResult {
  entry: number;
  entry_name: string;
  event_total: number;
  id: number;
  last_rank: number | null;
  player_name: string;
  rank: number;
  rank_sort: number;
  total: number;
}

interface FplLeagueResponse {
  league: {
    id: number;
    name: string;
  };
  standings: {
    has_next: boolean;
    page: number;
    results: FplLeagueResult[];
  };
}

interface FplBootstrapEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  data_checked: boolean;
  is_current: boolean;
  is_next: boolean;
}

interface FplBootstrapElement {
  id: number;
  web_name: string;
  event_points: number | null;
}

interface FplBootstrapTeam {
  id: number;
  name: string;
  short_name: string;
}

export interface FplBootstrapResponse {
  events: FplBootstrapEvent[];
  elements: FplBootstrapElement[];
  teams: FplBootstrapTeam[];
}

export interface FplManagerHistoryResponse {
  current: Array<{
    event: number;
    points: number;
    total_points: number;
    rank: number | null;
    rank_sort: number | null;
  }>;
}

export interface FplPicksResponse {
  picks: Array<{
    element: number;
    multiplier: number;
    is_captain: boolean;
  }>;
  entry_history?: unknown;
}

interface FplFixtureResponse {
  id: number;
  event: number | null;
  kickoff_time: string | null;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  started: boolean;
  finished: boolean;
}

async function fplFetch<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${FPL_BASE_URL}${path}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      "user-agent": "DilmondoArena/1.0 private-family-dashboard",
    },
  });

  if (!response.ok) {
    throw new Error(`FPL request failed (${response.status}) for ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchLeagueStandings(leagueId: number) {
  return fplFetch<FplLeagueResponse>(`/leagues-classic/${leagueId}/standings/`);
}

export async function fetchBootstrap() {
  return fplFetch<FplBootstrapResponse>("/bootstrap-static/");
}

export async function fetchFixtures() {
  return fplFetch<FplFixtureResponse[]>("/fixtures/");
}

export async function fetchManagerHistory(managerId: number) {
  return fplFetch<FplManagerHistoryResponse>(`/entry/${managerId}/history/`);
}

export async function fetchManagerPicks(managerId: number, eventId: number) {
  return fplFetch<FplPicksResponse>(`/entry/${managerId}/event/${eventId}/picks/`);
}

export function normalizeStandings(response: FplLeagueResponse): FplStanding[] {
  return response.standings.results
    .map((result) => ({
      managerId: result.entry,
      rank: result.rank,
      lastRank: result.last_rank,
      rankSort: result.rank_sort,
      gwPoints: result.event_total,
      totalPoints: result.total,
      fplTeamName: result.entry_name,
      fplManagerName: result.player_name,
    }))
    .sort((a, b) => a.rank - b.rank || b.totalPoints - a.totalPoints);
}

function toEventSummary(event: FplBootstrapEvent | undefined): FplEventSummary | null {
  if (!event) {
    return null;
  }

  return {
    id: event.id,
    name: event.name,
    deadlineTime: event.deadline_time ?? null,
    finished: event.finished,
    dataChecked: event.data_checked,
    isCurrent: event.is_current,
    isNext: event.is_next,
  };
}

export function selectRelevantEvents(bootstrap: FplBootstrapResponse) {
  const current = bootstrap.events.find((event) => event.is_current);
  const latestFinished = [...bootstrap.events]
    .filter((event) => event.finished || event.data_checked)
    .sort((a, b) => b.id - a.id)[0];
  const latest = current ?? latestFinished ?? bootstrap.events[0];
  const next =
    bootstrap.events.find((event) => event.is_next) ??
    bootstrap.events.find((event) => !event.finished && new Date(event.deadline_time) > new Date());

  return {
    latestEvent: toEventSummary(latest),
    nextEvent: toEventSummary(next),
  };
}

export function buildSeasonSummary(bootstrap: FplBootstrapResponse): SeasonSummary {
  const totalEvents = bootstrap.events.length;
  const finishedEvents = bootstrap.events.filter(
    (event) => event.finished || event.data_checked,
  ).length;
  const remainingEvents = Math.max(0, totalEvents - finishedEvents);

  return {
    totalEvents,
    finishedEvents,
    remainingEvents,
    seasonEnded: totalEvents > 0 && remainingEvents === 0,
  };
}

export function normalizeFixtures(
  bootstrap: FplBootstrapResponse,
  fixtures: FplFixtureResponse[],
): FplFixtureSummary[] {
  const teams = new Map(
    bootstrap.teams.map((team) => [team.id, team.name || team.short_name || `Team ${team.id}`]),
  );

  return fixtures
    .map((fixture) => ({
      id: fixture.id,
      eventId: fixture.event,
      kickoffTime: fixture.kickoff_time,
      homeTeam: teams.get(fixture.team_h) ?? `Team ${fixture.team_h}`,
      awayTeam: teams.get(fixture.team_a) ?? `Team ${fixture.team_a}`,
      homeScore: fixture.team_h_score,
      awayScore: fixture.team_a_score,
      started: fixture.started,
      finished: fixture.finished,
    }))
    .sort((a, b) => {
      if (a.eventId !== b.eventId) {
        return (a.eventId ?? 999) - (b.eventId ?? 999);
      }

      return new Date(a.kickoffTime ?? 0).getTime() - new Date(b.kickoffTime ?? 0).getTime();
    });
}

export function extractCaptainData(
  bootstrap: FplBootstrapResponse,
  picks: FplPicksResponse | null,
): { captainPlayerId: number | null; captainPlayerName: string | null; captainPoints: number | null } {
  const captain = picks?.picks.find((pick) => pick.is_captain);
  if (!captain) {
    return { captainPlayerId: null, captainPlayerName: null, captainPoints: null };
  }

  const player = bootstrap.elements.find((element) => element.id === captain.element);
  const basePoints = typeof player?.event_points === "number" ? player.event_points : null;

  return {
    captainPlayerId: captain.element,
    captainPlayerName: player?.web_name ?? null,
    captainPoints: basePoints === null ? null : basePoints * captain.multiplier,
  };
}
