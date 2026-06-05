import type {
  ArenaInsights,
  ArenaStanding,
  ManagerGameweekSnapshot,
  SeasonSummary,
} from "@/lib/types";
import { formatNumber } from "@/lib/format";

function display(row: ArenaStanding | null | undefined): string {
  if (!row) {
    return "البيانات غير متاحة حالياً";
  }

  return row.nickname || row.shortName || row.fplTeamName;
}

function byGwDesc(a: ArenaStanding, b: ArenaStanding) {
  return b.gwPoints - a.gwPoints;
}

function eventDisplayName(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const gameweek = value.match(/^Gameweek\s+(\d+)$/i);
  if (gameweek) {
    return `الجولة ${formatNumber(Number(gameweek[1]))}`;
  }

  return value;
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
    return `${display(leader)} أغلق الموسم على الصدارة رسمياً: ${formatNumber(leader.totalPoints)} نقطة، وفارق ${formatNumber(leaderGap ?? 0)} نقطة عن أقرب مطارد. المطاردة كانت قريبة بما يكفي لتشعل الكلام، لكنها لم تكن كافية لتغيير اسم البطل.`;
  }

  if (leaderGap !== null && leaderGap <= 25) {
    return `الصدارة قابلة للاشتعال: ${display(second)} لا يطارد من بعيد، الفارق ${formatNumber(leaderGap)} نقطة فقط. أي كابتن خاطئ هنا قد يحوّل القمة إلى تحقيق علني.`;
  }

  if (leaderGap !== null && leaderGap >= 50) {
    return `${display(leader)} يوسّع الفارق بثبات. المطاردة تحتاج قرارات حقيقية، لا مجرد رسالة ثقة قبل الديدلاين.`;
  }

  if (best.managerId !== leader.managerId && best.gwPoints >= leader.gwPoints + 10) {
    return `${display(best)} خطف جولة قوية بـ${formatNumber(best.gwPoints)} نقطة، لكن ${display(leader)} ما زال يحتفظ بالمشهد الرئيسي. الفوز بالجولة جميل، لكن الجدول لا يصفق إلا للإجمالي.`;
  }

  if (worst.gwPoints < 40) {
    return `${display(worst)} خرج من الجولة بـ${formatNumber(worst.gwPoints)} نقطة فقط. هذه ليست كارثة درامية، لكنها لقطة كافية لتذكير الجميع أن الديدلاين لا يرحم الغفلة.`;
  }

  return "الصراع ما زال مفتوحاً، والفوارق لا تسمح لأي مدير أن يتعامل مع الديدلاين كأنه إشعار عادي.";
}

function buildFacts(
  standings: ArenaStanding[],
  managerGameweeks: ManagerGameweekSnapshot[],
  latestEventName?: string | null,
): string[] {
  if (!standings.length) {
    return [];
  }

  const facts: string[] = [];
  const leader = standings[0];
  const second = standings[1];
  const third = standings[2];
  const best = [...standings].sort(byGwDesc)[0];
  const worst = [...standings].sort((a, b) => a.gwPoints - b.gwPoints)[0];
  const last = standings[standings.length - 1];
  const eventLabel = eventDisplayName(
    latestEventName,
    managerGameweeks[0]?.eventId ? `الجولة ${formatNumber(managerGameweeks[0].eventId)}` : "الجولة",
  );
  const averageGw = Math.round(standings.reduce((sum, row) => sum + row.gwPoints, 0) / standings.length);
  const overAverage = standings.filter((row) => row.gwPoints > averageGw).length;
  const closeRows = standings.filter((row) => row.gapFromLeader <= 100);
  const biggestRise = standings
    .filter((row) => typeof row.rankMovement === "number" && row.rankMovement > 0)
    .sort((a, b) => (b.rankMovement ?? 0) - (a.rankMovement ?? 0))[0];
  const biggestFall = standings
    .filter((row) => typeof row.rankMovement === "number" && row.rankMovement < 0)
    .sort((a, b) => (a.rankMovement ?? 0) - (b.rankMovement ?? 0))[0];

  if (second) {
    const gap = leader.totalPoints - second.totalPoints;
    facts.push(
      `سباق القمة انتهى بفارق ${formatNumber(gap)} نقطة بين ${display(leader)} و${display(second)}؛ فارق صغير بما يكفي للحديث، لكنه كبير بما يكفي لتثبيت الكأس.`,
    );
  }

  if (third) {
    facts.push(
      `المراكز الثلاثة الأولى: ${display(leader)} ثم ${display(second)} ثم ${display(third)}. المنصة واضحة، والباقي يحتاج أكثر من "كنت ناوي أعمل ترانسفر".`,
    );
  }

  facts.push(`خبر الجولة: ${display(best)} سجّل أفضل نتيجة بـ${formatNumber(best.gwPoints)} نقطة.`);
  facts.push(
    `أضعف نتيجة في الجولة كانت مع ${display(worst)}: ${formatNumber(worst.gwPoints)} نقطة. التعليق هنا اختياري لأن الرقم قال ما يكفي.`,
  );
  facts.push(
    `متوسط الجولة داخل المجموعة ${formatNumber(averageGw)} نقطة، و${formatNumber(overAverage)} مدراء فقط تخطّوا المتوسط.`,
  );

  if (closeRows.length > 1) {
    facts.push(
      `${formatNumber(closeRows.length)} مدراء ضمن أول ${formatNumber(100)} نقطة من المتصدر. المنافسة ليست مغلقة؛ هي فقط لا ترحم القرارات الكسولة.`,
    );
  }

  if (last && last.managerId !== leader.managerId) {
    facts.push(
      `الفارق بين القمة والقاع وصل إلى ${formatNumber(leader.totalPoints - last.totalPoints)} نقطة. هذا ليس جدول ترتيب فقط؛ هذا كشف حساب موسم كامل.`,
    );
  }

  if (biggestRise) {
    facts.push(
      `${display(biggestRise)} حقق أكبر صعود مثبت في الترتيب: +${formatNumber(biggestRise.rankMovement)} مركز.`,
    );
  }

  if (biggestFall) {
    facts.push(
      `${display(biggestFall)} سجّل أكبر تراجع مثبت: ${formatNumber(biggestFall.rankMovement)} مركز. الحركة موجودة، لكنها للأسف للأسفل.`,
    );
  }

  const captainSnapshot = managerGameweeks
    .filter(
      (snapshot) =>
        typeof snapshot.captainPoints === "number" &&
        snapshot.captainPoints <= 4 &&
        Boolean(snapshot.captainPlayerName),
    )
    .sort((a, b) => (a.captainPoints ?? 0) - (b.captainPoints ?? 0))[0];
  const captainOwner = standings.find((row) => row.managerId === captainSnapshot?.managerId);

  if (captainSnapshot && captainOwner) {
    facts.push(
      `في ${eventLabel} كابتن ${display(captainOwner)} كان ${captainSnapshot.captainPlayerName}، والعائد ${formatNumber(captainSnapshot.captainPoints)} نقطة. المعلومة دقيقة، والقرار نفسه كفيل بالتعليق.`,
    );
  }

  return facts.slice(0, 10);
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
    `النقاط: ${formatNumber(leader.totalPoints)}`,
  ];

  if (second) {
    lines.push(`الفارق عن أقرب مطارد: ${formatNumber(leader.totalPoints - second.totalPoints)} نقطة`);
  }

  lines.push(`أفضل نتيجة في ${gwLabel}: ${display(best)} - ${formatNumber(best.gwPoints)} نقطة`);
  lines.push(`أقل نتيجة في ${gwLabel}: ${display(worst)} - ${formatNumber(worst.gwPoints)} نقطة`);
  lines.push("", "قراءة سريعة:", drama);

  return lines.join("\n");
}

export function createInsights(
  standings: ArenaStanding[],
  managerGameweeks: ManagerGameweekSnapshot[],
  seasonSummary?: SeasonSummary,
  latestEventName?: string | null,
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
    didYouKnowFacts: buildFacts(standings, managerGameweeks, latestEventName),
    whatsappSummary: buildWhatsapp(standings, weeklyDrama, seasonSummary?.seasonEnded),
  };
}
