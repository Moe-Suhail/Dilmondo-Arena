import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { normalizeStore } from "@/lib/storage-utils";
import type {
  BanterLevel,
  BanterTemplate,
  DilmondoStore,
  HallOfFameEntry,
  HomepageAnnouncement,
  LeagueSettings,
  ManagerGameweekSnapshot,
  Member,
  MemberStatus,
  SeasonStatus,
  StandingsSnapshot,
  SyncStatus,
} from "@/lib/types";

type JsonRecord = Record<string, unknown>;

async function must<T>(promise: PromiseLike<{ data: T; error: unknown }>, context: string) {
  const { data, error } = await promise;
  if (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(`${context}: ${message}`);
  }
  return data;
}

function mapLeagueSettings(row: JsonRecord | null | undefined): LeagueSettings | null {
  if (!row) return null;

  return {
    id: String(row.id),
    leagueId: Number(row.league_id),
    leagueName: String(row.league_name),
    seasonName: String(row.season_name),
    seasonStatus: row.season_status as SeasonStatus,
    lastSyncAt: (row.last_sync_at as string | null) ?? null,
    syncStatus: row.sync_status as SyncStatus,
    syncError: (row.sync_error as string | null) ?? null,
  };
}

function leagueSettingsRow(settings: LeagueSettings) {
  return {
    id: settings.id,
    league_id: settings.leagueId,
    league_name: settings.leagueName,
    season_name: settings.seasonName,
    season_status: settings.seasonStatus,
    last_sync_at: settings.lastSyncAt,
    sync_status: settings.syncStatus,
    sync_error: settings.syncError,
    updated_at: new Date().toISOString(),
  };
}

function mapMember(row: JsonRecord): Member {
  return {
    id: String(row.id),
    fplManagerId: row.fpl_manager_id === null ? null : Number(row.fpl_manager_id),
    fplTeamName: (row.fpl_team_name as string | null) ?? null,
    fplManagerName: (row.fpl_manager_name as string | null) ?? null,
    standingReference: row.standing_reference === null ? null : Number(row.standing_reference),
    displayNameAr: String(row.display_name_ar),
    shortName: String(row.short_name),
    nickname: String(row.nickname),
    profileImageUrl: (row.profile_image_url as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    customColor: String(row.custom_color),
    banterLevel: row.banter_level as BanterLevel,
    active: Boolean(row.active),
    status: row.status as MemberStatus,
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function memberRow(member: Member) {
  return {
    id: member.id,
    fpl_manager_id: member.fplManagerId,
    fpl_team_name: member.fplTeamName,
    fpl_manager_name: member.fplManagerName,
    standing_reference: member.standingReference,
    display_name_ar: member.displayNameAr,
    short_name: member.shortName,
    nickname: member.nickname,
    profile_image_url: member.profileImageUrl,
    avatar_url: member.avatarUrl,
    custom_color: member.customColor,
    banter_level: member.banterLevel,
    active: member.active,
    status: member.status,
    notes: member.notes,
    created_at: member.createdAt,
    updated_at: member.updatedAt,
  };
}

function mapStandingSnapshot(row: JsonRecord): StandingsSnapshot {
  return {
    id: String(row.id),
    leagueId: Number(row.league_id),
    eventId: row.event_id === null ? null : Number(row.event_id),
    syncedAt: String(row.synced_at),
    rawPayload: row.raw_payload,
    normalizedPayload: row.normalized_payload as StandingsSnapshot["normalizedPayload"],
  };
}

function standingSnapshotRow(snapshot: StandingsSnapshot) {
  return {
    id: snapshot.id,
    league_id: snapshot.leagueId,
    event_id: snapshot.eventId,
    synced_at: snapshot.syncedAt,
    raw_payload: snapshot.rawPayload,
    normalized_payload: snapshot.normalizedPayload,
  };
}

function mapManagerGameweek(row: JsonRecord): ManagerGameweekSnapshot {
  return {
    id: String(row.id),
    managerId: Number(row.manager_id),
    eventId: Number(row.event_id),
    gwPoints: row.gw_points === null ? null : Number(row.gw_points),
    totalPoints: row.total_points === null ? null : Number(row.total_points),
    rank: row.rank === null ? null : Number(row.rank),
    picksPayload: row.picks_payload ?? null,
    captainPlayerId: row.captain_player_id === null ? null : Number(row.captain_player_id),
    captainPlayerName: (row.captain_player_name as string | null) ?? null,
    captainPoints: row.captain_points === null ? null : Number(row.captain_points),
    syncedAt: String(row.synced_at),
  };
}

function managerGameweekRow(snapshot: ManagerGameweekSnapshot) {
  return {
    id: snapshot.id,
    manager_id: snapshot.managerId,
    event_id: snapshot.eventId,
    gw_points: snapshot.gwPoints,
    total_points: snapshot.totalPoints,
    rank: snapshot.rank,
    picks_payload: snapshot.picksPayload,
    captain_player_id: snapshot.captainPlayerId,
    captain_player_name: snapshot.captainPlayerName,
    captain_points: snapshot.captainPoints,
    synced_at: snapshot.syncedAt,
  };
}

function mapBanterTemplate(row: JsonRecord): BanterTemplate {
  return {
    id: String(row.id),
    name: String(row.name),
    triggerKey: String(row.trigger_key),
    conditionConfig: (row.condition_config as Record<string, unknown>) ?? {},
    textAr: String(row.text_ar),
    banterLevel: row.banter_level as BanterLevel,
    active: Boolean(row.active),
  };
}

function banterTemplateRow(template: BanterTemplate) {
  return {
    id: template.id,
    name: template.name,
    trigger_key: template.triggerKey,
    condition_config: template.conditionConfig,
    text_ar: template.textAr,
    banter_level: template.banterLevel,
    active: template.active,
  };
}

function mapHallOfFame(row: JsonRecord): HallOfFameEntry {
  return {
    id: String(row.id),
    season: String(row.season),
    winnerMemberId: (row.winner_member_id as string | null) ?? null,
    runnerUpMemberId: (row.runner_up_member_id as string | null) ?? null,
    lastPlaceMemberId: (row.last_place_member_id as string | null) ?? null,
    title: String(row.title),
    description: String(row.description),
    awardsPayload: (row.awards_payload as HallOfFameEntry["awardsPayload"]) ?? [],
    imageUrl: (row.image_url as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

function hallOfFameRow(entry: HallOfFameEntry) {
  return {
    id: entry.id,
    season: entry.season,
    winner_member_id: entry.winnerMemberId,
    runner_up_member_id: entry.runnerUpMemberId,
    last_place_member_id: entry.lastPlaceMemberId,
    title: entry.title,
    description: entry.description,
    awards_payload: entry.awardsPayload,
    image_url: entry.imageUrl,
    created_at: entry.createdAt,
  };
}

function mapAnnouncement(row: JsonRecord): HomepageAnnouncement {
  return {
    id: String(row.id),
    title: String(row.title),
    body: String(row.body),
    active: Boolean(row.active),
    createdAt: String(row.created_at),
  };
}

function announcementRow(announcement: HomepageAnnouncement) {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    active: announcement.active,
    created_at: announcement.createdAt,
  };
}

async function replaceTable(table: string, rows: unknown[]) {
  const supabase = getSupabaseAdminClient();
  await must(supabase.from(table).delete().neq("id", "__never__"), `Clear ${table}`);
  if (rows.length) {
    await must(supabase.from(table).insert(rows), `Insert ${table}`);
  }
}

async function seedIfMissing(store: DilmondoStore, missing: boolean) {
  if (!missing) {
    return store;
  }

  return saveSupabaseStore(store);
}

export async function getSupabaseStore(): Promise<DilmondoStore> {
  const supabase = getSupabaseAdminClient();
  const [
    settingsRows,
    membersRows,
    snapshotRows,
    gameweekRows,
    templateRows,
    hallRows,
    announcementRows,
  ] = await Promise.all([
    must(supabase.from("league_settings").select("*").eq("id", "primary").limit(1), "Read league_settings"),
    must(supabase.from("members").select("*").order("created_at", { ascending: true }), "Read members"),
    must(
      supabase.from("standings_snapshots").select("*").order("synced_at", { ascending: true }),
      "Read standings_snapshots",
    ),
    must(
      supabase
        .from("manager_gameweek_snapshots")
        .select("*")
        .order("synced_at", { ascending: true }),
      "Read manager_gameweek_snapshots",
    ),
    must(supabase.from("banter_templates").select("*").order("id"), "Read banter_templates"),
    must(supabase.from("hall_of_fame").select("*").order("created_at", { ascending: false }), "Read hall_of_fame"),
    must(
      supabase
        .from("homepage_announcements")
        .select("*")
        .order("created_at", { ascending: false }),
      "Read homepage_announcements",
    ),
  ]);

  const settings = (settingsRows ?? []) as JsonRecord[];
  const members = (membersRows ?? []) as JsonRecord[];
  const snapshots = (snapshotRows ?? []) as JsonRecord[];
  const gameweeks = (gameweekRows ?? []) as JsonRecord[];
  const templates = (templateRows ?? []) as JsonRecord[];
  const hall = (hallRows ?? []) as JsonRecord[];
  const announcements = (announcementRows ?? []) as JsonRecord[];

  const missingDefaults =
    !settings.length || !members.length || !templates.length || !announcements.length;

  const store = normalizeStore({
    leagueSettings: mapLeagueSettings(settings[0]) ?? undefined,
    members: members.map(mapMember),
    standingsSnapshots: snapshots.map(mapStandingSnapshot),
    managerGameweekSnapshots: gameweeks.map(mapManagerGameweek),
    banterTemplates: templates.map(mapBanterTemplate),
    hallOfFame: hall.map(mapHallOfFame),
    homepageAnnouncements: announcements.map(mapAnnouncement),
  });

  return seedIfMissing(store, missingDefaults);
}

export async function saveSupabaseStore(store: DilmondoStore): Promise<DilmondoStore> {
  const supabase = getSupabaseAdminClient();
  const normalized = normalizeStore(store);

  await must(
    supabase.from("league_settings").upsert(leagueSettingsRow(normalized.leagueSettings)),
    "Save league_settings",
  );

  if (normalized.members.length) {
    await must(supabase.from("members").upsert(normalized.members.map(memberRow)), "Save members");
  }

  await Promise.all([
    replaceTable("banter_templates", normalized.banterTemplates.map(banterTemplateRow)),
    replaceTable("hall_of_fame", normalized.hallOfFame.map(hallOfFameRow)),
    replaceTable("homepage_announcements", normalized.homepageAnnouncements.map(announcementRow)),
  ]);

  if (normalized.standingsSnapshots.length) {
    await must(
      supabase
        .from("standings_snapshots")
        .upsert(normalized.standingsSnapshots.map(standingSnapshotRow)),
      "Save standings_snapshots",
    );
  }

  if (normalized.managerGameweekSnapshots.length) {
    await must(
      supabase
        .from("manager_gameweek_snapshots")
        .upsert(normalized.managerGameweekSnapshots.map(managerGameweekRow)),
      "Save manager_gameweek_snapshots",
    );
  }

  return normalized;
}
