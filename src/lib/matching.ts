import type { FplStanding, Member } from "@/lib/types";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
}

export function findMemberForStanding(members: Member[], standing: FplStanding): Member | null {
  return (
    members.find((member) => member.fplManagerId === standing.managerId) ??
    members.find(
      (member) =>
        normalizeText(member.fplTeamName) === normalizeText(standing.fplTeamName) &&
        normalizeText(member.fplManagerName) === normalizeText(standing.fplManagerName),
    ) ??
    members.find((member) => normalizeText(member.fplTeamName) === normalizeText(standing.fplTeamName)) ??
    members.find(
      (member) => normalizeText(member.fplManagerName) === normalizeText(standing.fplManagerName),
    ) ??
    null
  );
}
