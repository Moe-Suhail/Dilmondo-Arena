export const DATA_UNAVAILABLE = "البيانات غير متاحة حالياً";

export type BanterLevel = "light" | "normal" | "strong";
export type MemberStatus = "active" | "withdrawn" | "archived";
export type SeasonStatus = "active" | "finished" | "pre-season";
export type SyncStatus = "idle" | "syncing" | "success" | "failed";

export interface LeagueSettings {
  id: string;
  leagueId: number;
  leagueName: string;
  seasonName: string;
  seasonStatus: SeasonStatus;
  lastSyncAt: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
}

export interface Member {
  id: string;
  fplManagerId: number | null;
  fplTeamName: string | null;
  fplManagerName: string | null;
  standingReference: number | null;
  displayNameAr: string;
  shortName: string;
  nickname: string;
  profileImageUrl: string | null;
  avatarUrl: string | null;
  customColor: string;
  banterLevel: BanterLevel;
  active: boolean;
  status: MemberStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FplStanding {
  managerId: number;
  rank: number;
  lastRank: number | null;
  rankSort: number | null;
  gwPoints: number;
  totalPoints: number;
  fplTeamName: string;
  fplManagerName: string;
}

export interface FplEventSummary {
  id: number;
  name: string;
  deadlineTime: string | null;
  finished: boolean;
  dataChecked: boolean;
  isCurrent: boolean;
  isNext: boolean;
}

export interface SeasonSummary {
  totalEvents: number;
  finishedEvents: number;
  remainingEvents: number;
  seasonEnded: boolean;
}

export interface FplFixtureSummary {
  id: number;
  eventId: number | null;
  kickoffTime: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  started: boolean;
  finished: boolean;
}

export interface ManagerGameweekSnapshot {
  id: string;
  managerId: number;
  eventId: number;
  gwPoints: number | null;
  totalPoints: number | null;
  rank: number | null;
  picksPayload: unknown | null;
  captainPlayerId: number | null;
  captainPlayerName: string | null;
  captainPoints: number | null;
  syncedAt: string;
}

export interface SnapshotPayload {
  standings: FplStanding[];
  latestEvent: FplEventSummary | null;
  nextEvent: FplEventSummary | null;
  seasonSummary?: SeasonSummary;
  fixtures?: FplFixtureSummary[];
  managerGameweeks: ManagerGameweekSnapshot[];
}

export interface StandingsSnapshot {
  id: string;
  leagueId: number;
  eventId: number | null;
  syncedAt: string;
  rawPayload: unknown;
  normalizedPayload: SnapshotPayload;
}

export interface BanterTemplate {
  id: string;
  name: string;
  triggerKey: string;
  conditionConfig: Record<string, unknown>;
  textAr: string;
  banterLevel: BanterLevel;
  active: boolean;
}

export interface HallOfFameEntry {
  id: string;
  season: string;
  winnerMemberId: string | null;
  runnerUpMemberId: string | null;
  lastPlaceMemberId: string | null;
  title: string;
  description: string;
  awardsPayload: Array<{ title: string; memberId: string | null; note: string }>;
  imageUrl: string | null;
  createdAt: string;
}

export interface HomepageAnnouncement {
  id: string;
  title: string;
  body: string;
  active: boolean;
  createdAt: string;
}

export interface DilmondoStore {
  leagueSettings: LeagueSettings;
  members: Member[];
  standingsSnapshots: StandingsSnapshot[];
  managerGameweekSnapshots: ManagerGameweekSnapshot[];
  banterTemplates: BanterTemplate[];
  hallOfFame: HallOfFameEntry[];
  homepageAnnouncements: HomepageAnnouncement[];
}

export interface ArenaStanding extends FplStanding {
  member: Member | null;
  displayName: string;
  shortName: string;
  nickname: string;
  profileImageUrl: string | null;
  avatarUrl: string | null;
  customColor: string;
  gapFromLeader: number;
  gapFromPrevious: number | null;
  rankMovement: number | null;
  statusBadge: string;
  memberUrl: string;
}

export interface ArenaInsights {
  leader: ArenaStanding | null;
  closestCompetitors: ArenaStanding[];
  bestGw: ArenaStanding | null;
  worstGw: ArenaStanding | null;
  closestChase: { from: ArenaStanding; to: ArenaStanding; gap: number } | null;
  biggestGap: { from: ArenaStanding; to: ArenaStanding; gap: number } | null;
  averageGw: number | null;
  weeklyDrama: string;
  didYouKnowFacts: string[];
  whatsappSummary: string;
}

export interface ArenaState {
  settings: LeagueSettings;
  members: Member[];
  inactiveMembers: Member[];
  standings: ArenaStanding[];
  latestSnapshot: StandingsSnapshot | null;
  previousSnapshot: StandingsSnapshot | null;
  latestEvent: FplEventSummary | null;
  nextEvent: FplEventSummary | null;
  seasonSummary: SeasonSummary;
  fixtures: FplFixtureSummary[];
  lastSyncAt: string | null;
  warning: string | null;
  dataAvailable: boolean;
  insights: ArenaInsights;
  hallOfFame: HallOfFameEntry[];
  announcement: HomepageAnnouncement | null;
  storageMode: "local-json" | "supabase";
}
