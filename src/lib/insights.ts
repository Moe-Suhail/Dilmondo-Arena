import type {
  ArenaInsights,
  ArenaStanding,
  ManagerGameweekSnapshot,
  SeasonSummary,
} from "@/lib/types";

function display(row: ArenaStanding | null | undefined): string {
  if (!row) {
    return "البيانات غير متاحة حالياً";
  }

  return row.nickname || row.shortName || row.fplTeamName;
}

function byGwDesc(a: ArenaStanding, b: ArenaStanding) {
  return b.gwPoints - a.gwPoints;
}

function buildWeeklyDrama(standings: ArenaStanding[], seasonEnded = false): string {
  if (!standings.length) {
    return "البيانات غير متاحة حالياً";
  }

  const leader = standings[0];
  const second = standings[1];
  const best = [...standings].sort(byGwDesc)[0];
  const worst = [...standings].sort((a, b) => a.gwPoints - b.gwPoints)[0];
  const leaderGap = second ? leader.totalPoints - second.totalPoints : null;

  if (seasonEnded) {
    return `${display(leader)} أغلق الموسم على الصدارة رسمياً: ${leader.totalPoints} نقطة وفارق ${leaderGap ?? 0} نقطة عن أقرب مطارد. ملف اللقب حُسم، وما تبقى مجرد مرافعات بعد صافرة النهاية.`;
  }

  if (leaderGap !== null && leaderGap <= 25) {
    return `الصدارة قابلة للاشتعال... ${display(second)} قريب بما يكفي ليحوّل هدوء ${display(leader)} إلى اجتماع طوارئ.`;
  }

  if (leaderGap !== null && leaderGap >= 50) {
    return `${display(leader)} يوسّع الفارق بثبات... المطاردة هنا تحتاج خطة إنقاذ لا مجرد تفاؤل قبل الديدلاين.`;
  }

  if (best.managerId !== leader.managerId && best.gwPoints >= leader.gwPoints + 10) {
    return `${display(best)} سرق أضواء الجولة، لكن ${display(leader)} ما زال يحتفظ بالمشهد الرئيسي والكرسي الأمامي.`;
  }

  if (worst.gwPoints < 40) {
    return `${display(worst)} قدّم جولة لا تحتاج تعليقاً قاسياً... الأرقام قامت بالمهمة كاملة.`;
  }

  return "الصراع ما زال مفتوحاً، والفوارق لا تسمح لأي مدير أن يتعامل مع الديدلاين كأنه إشعار عادي.";
}

function buildFacts(
  standings: ArenaStanding[],
  managerGameweeks: ManagerGameweekSnapshot[],
): string[] {
  if (!standings.length) {
    return [];
  }

  const facts: string[] = [];
  const leader = standings[0];
  const second = standings[1];
  const best = [...standings].sort(byGwDesc)[0];
  const worst = [...standings].sort((a, b) => a.gwPoints - b.gwPoints)[0];
  const last = standings[standings.length - 1];

  if (second) {
    const gap = leader.totalPoints - second.totalPoints;
    facts.push(
      `هل تعلم أن الفارق بين ${display(leader)} و${display(second)} هو ${gap} نقطة فقط؟`,
    );
  }

  facts.push(`هل تعلم أن أفضل نتيجة في الجولة الحالية هي ${best.gwPoints} نقطة مع ${display(best)}؟`);
  facts.push(`هل تعلم أن أقل نتيجة في الجولة الحالية هي ${worst.gwPoints} نقطة مع ${display(worst)}؟`);

  if (last && last.managerId !== leader.managerId) {
    facts.push(
      `هل تعلم أن الفارق بين المتصدر والمركز الأخير وصل إلى ${leader.totalPoints - last.totalPoints} نقطة؟`,
    );
  }

  const captainSnapshot = managerGameweeks.find(
    (snapshot) => typeof snapshot.captainPoints === "number" && snapshot.captainPoints <= 4,
  );
  const captainOwner = standings.find((row) => row.managerId === captainSnapshot?.managerId);

  if (captainSnapshot && captainOwner) {
    facts.push(
      `هل تعلم أن كابتن ${display(captainOwner)} حقق ${captainSnapshot.captainPoints} نقطة فقط؟`,
    );
  }

  return facts.slice(0, 6);
}

function buildWhatsapp(standings: ArenaStanding[], drama: string, seasonEnded = false): string {
  if (!standings.length) {
    return "ساحة Dilmondo Arena\n\nالبيانات غير متاحة حالياً";
  }

  const leader = standings[0];
  const second = standings[1];
  const best = [...standings].sort(byGwDesc)[0];
  const worst = [...standings].sort((a, b) => a.gwPoints - b.gwPoints)[0];
  const gwLabel = seasonEnded ? "آخر جولة" : "الجولة الحالية";
  const lines = [
    "ساحة Dilmondo Arena",
    "====================",
    seasonEnded ? "تقرير الموسم النهائي" : "تقرير الجولة",
    "",
    `${seasonEnded ? "البطل الرسمي" : "المتصدر"}: ${display(leader)}`,
    `النقاط: ${leader.totalPoints}`,
  ];

  if (second) {
    lines.push(`الفارق عن أقرب مطارد: ${leader.totalPoints - second.totalPoints} نقطة`);
  }

  lines.push(`أفضل نتيجة في ${gwLabel}: ${display(best)} - ${best.gwPoints} نقطة`);
  lines.push(`أقل نتيجة في ${gwLabel}: ${display(worst)} - ${worst.gwPoints} نقطة`);
  lines.push("", "قراءة سريعة:", drama);

  return lines.join("\n");
}

export function createInsights(
  standings: ArenaStanding[],
  managerGameweeks: ManagerGameweekSnapshot[],
  seasonSummary?: SeasonSummary,
): ArenaInsights {
  const leader = standings[0] ?? null;
  const closestCompetitors = standings.slice(1, 4);
  const bestGw = standings.length ? [...standings].sort(byGwDesc)[0] : null;
  const worstGw = standings.length
    ? [...standings].sort((a, b) => a.gwPoints - b.gwPoints)[0]
    : null;
  const averageGw = standings.length
    ? Math.round(standings.reduce((sum, row) => sum + row.gwPoints, 0) / standings.length)
    : null;

  const consecutive = standings
    .slice(0, -1)
    .map((row, index) => ({
      from: row,
      to: standings[index + 1],
      gap: row.totalPoints - standings[index + 1].totalPoints,
    }))
    .filter((gap) => Number.isFinite(gap.gap));

  const closestChase = consecutive.length
    ? [...consecutive].sort((a, b) => a.gap - b.gap)[0]
    : null;
  const biggestGap = consecutive.length
    ? [...consecutive].sort((a, b) => b.gap - a.gap)[0]
    : null;
  const weeklyDrama = buildWeeklyDrama(standings, seasonSummary?.seasonEnded);

  return {
    leader,
    closestCompetitors,
    bestGw,
    worstGw,
    closestChase,
    biggestGap,
    averageGw,
    weeklyDrama,
    didYouKnowFacts: buildFacts(standings, managerGameweeks),
    whatsappSummary: buildWhatsapp(standings, weeklyDrama, seasonSummary?.seasonEnded),
  };
}
