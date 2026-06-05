import {
  CalendarDays,
  Crown,
  Flame,
  Gauge,
  Medal,
  PartyPopper,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { CountdownCard } from "@/components/CountdownCard";
import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { PublicNav } from "@/components/PublicNav";
import { ShareButton } from "@/components/ShareButton";
import { StandingsView } from "@/components/StandingsView";
import { StatusBanner } from "@/components/StatusBanner";
import { formatDateTime, formatGap, formatNumber } from "@/lib/format";
import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";

export default async function Home() {
  const arena = await getArenaState();
  const leader = arena.insights.leader;
  const second = arena.standings[1] ?? null;
  const seasonEnded = arena.seasonSummary.seasonEnded;
  const leagueName = arena.settings.leagueName.replace("🏆", "").trim() || "Dilmondo 7th";

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />
      <section
        className="relative overflow-hidden border-b border-white/10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(5,7,18,0.78), rgba(5,7,18,0.48), rgba(5,7,18,0.2)), url('/images/arena-hero.png')",
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="flex min-h-[420px] flex-col justify-center">
            <p className="text-sm font-bold text-amber-200">ساحة Dilmondo</p>
            <h1 className="hero-league-title mt-4 flex max-w-4xl flex-wrap items-center gap-3 font-black tracking-normal text-white">
              <bdi dir="ltr">{leagueName}</bdi>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/45 bg-amber-300/15 text-amber-100 shadow-lg shadow-amber-950/30 sm:h-16 sm:w-16">
                <Trophy className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
              </span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
              منتدى وصحيفة فكاهية لدوري العائلة في الفانتسي: نوثّق البطولات،
              نرفع مستوى التحدي، ونترك أثراً مكتوباً يجعل الانسحاب في المواسم القادمة
              قراراً يحتاج شجاعة أكثر من اختيار الكابتن.
            </p>
            {arena.announcement ? (
              <p className="mt-6 max-w-xl rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">
                {arena.announcement.title}: {arena.announcement.body}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              {arena.dataAvailable ? <ShareButton text={arena.insights.whatsappSummary} /> : null}
            </div>
          </div>

          {leader ? (
            <div
              className={`glass-card relative self-end overflow-hidden rounded-lg p-5 ${
                seasonEnded ? "champion-card" : ""
              }`}
            >
              {seasonEnded ? (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                  <span className="champion-confetti confetti-1" />
                  <span className="champion-confetti confetti-2" />
                  <span className="champion-confetti confetti-3" />
                  <span className="champion-confetti confetti-4" />
                  <span className="champion-balloon balloon-1" />
                  <span className="champion-balloon balloon-2" />
                </div>
              ) : null}
              <div className="relative z-10">
                {seasonEnded ? (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-200/15 px-3 py-1 text-sm font-black text-amber-100">
                  <Crown className="h-4 w-4" aria-hidden="true" />
                  التتويج الرسمي للموسم
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
              ) : null}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar
                    name={leader.displayName}
                    imageUrl={leader.profileImageUrl}
                    color={leader.customColor}
                    size="xl"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-amber-200">
                      {seasonEnded ? "بطل الموسم الرسمي" : "مرشح البطولة الحالي"}
                    </p>
                    <h2 className="mobile-card-title mt-2 text-2xl font-black text-white sm:text-3xl">
                      {leader.displayName}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-300 sm:text-base">
                      {leader.nickname} · {leader.fplTeamName}
                    </p>
                  </div>
                </div>
                {seasonEnded ? (
                  <PartyPopper className="h-10 w-10 text-amber-100" aria-hidden="true" />
                ) : (
                  <Trophy className="h-10 w-10 text-amber-200" aria-hidden="true" />
                )}
              </div>
              <p className="mt-6 text-base leading-8 text-slate-200 sm:text-lg">
                {seasonEnded
                  ? `اللقب حُسم رسمياً لصالح ${leader.nickname}. الأرقام النهائية لا تترك مساحة للاجتهاد: صدارة، فارق واضح، وموسم كامل انتهى على منصة واحدة. من أراد الاعتراض فليحضّر ما هو أقوى من جدول الترتيب.`
                  : "معالي الأسطورة يتصدر المشهد... والبقية يحاولون فهم ما حدث."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="min-w-0 rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">الترتيب</p>
                  <p className="mt-1 text-2xl font-black text-white">#{formatNumber(leader.rank)}</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">الإجمالي</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatNumber(leader.totalPoints)}</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">الجولة</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatNumber(leader.gwPoints)}</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">عن الثاني</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {second ? formatGap(leader.totalPoints - second.totalPoints) : "لا يوجد"}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-400">آخر تحديث: {formatDateTime(arena.lastSyncAt)}</p>
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {arena.warning ? <StatusBanner tone="warning" title="تنبيه المزامنة" body={arena.warning} /> : null}
        {arena.dataAvailable ? (
          <StatusBanner
            tone={seasonEnded ? "success" : "info"}
            title={seasonEnded ? "الموسم انتهى" : "الموسم مستمر"}
            body={
              seasonEnded
                ? `تم لعب ${formatNumber(arena.seasonSummary.finishedEvents)} من ${formatNumber(arena.seasonSummary.totalEvents)} جولة. الموسم أُغلق رسمياً، والجولات المتبقية ${formatNumber(arena.seasonSummary.remainingEvents)}.`
                : `تم لعب ${formatNumber(arena.seasonSummary.finishedEvents)} من ${formatNumber(arena.seasonSummary.totalEvents)} جولة، والمتبقي ${formatNumber(arena.seasonSummary.remainingEvents)}.`
            }
          />
        ) : null}
        {!arena.dataAvailable ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                label="أفضل نتيجة في الجولة"
                value={`${arena.insights.bestGw?.gwPoints ?? "—"}`}
                detail={arena.insights.bestGw?.nickname}
                icon={Flame}
              />
              <MetricCard
                label="أقل نتيجة في الجولة"
                value={`${arena.insights.worstGw?.gwPoints ?? "—"}`}
                detail={arena.insights.worstGw?.nickname}
                icon={ShieldAlert}
              />
              <MetricCard
                label="أقرب مطاردة"
                value={arena.insights.closestChase ? formatGap(arena.insights.closestChase.gap) : "—"}
                detail={
                  arena.insights.closestChase
                    ? `${arena.insights.closestChase.from.nickname} × ${arena.insights.closestChase.to.nickname}`
                    : undefined
                }
                icon={Users}
              />
              <MetricCard
                label="متوسط الجولة"
                value={arena.insights.averageGw === null ? "—" : formatNumber(arena.insights.averageGw)}
                detail={arena.latestEvent?.name}
                icon={Gauge}
              />
              <MetricCard
                label="الجولات المتبقية"
                value={formatNumber(arena.seasonSummary.remainingEvents)}
                detail={seasonEnded ? "الموسم انتهى" : `${formatNumber(arena.seasonSummary.finishedEvents)} / ${formatNumber(arena.seasonSummary.totalEvents)}`}
                icon={CalendarDays}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div className="glass-card rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <Medal className="h-5 w-5 text-amber-200" aria-hidden="true" />
                <h2 className="text-xl font-black text-white sm:text-2xl">أقرب المنافسين</h2>
                </div>
                <div className="mt-5 grid gap-3">
                  {arena.insights.closestCompetitors.map((row) => (
                    <div key={row.managerId} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] p-3 sm:p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={row.displayName} imageUrl={row.profileImageUrl} color={row.customColor} />
                        <div className="min-w-0">
                          <p className="truncate font-black text-white">{row.displayName}</p>
                          <p className="truncate text-sm text-slate-400">{row.nickname}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-left">
                        <p className="font-black text-white">{formatNumber(row.totalPoints)}</p>
                        <p className="text-sm text-amber-200">{formatGap(row.gapFromLeader)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <div className="glass-card rounded-lg p-5">
                  <p className="text-sm font-bold text-amber-200">تعليق الجولة</p>
                  <p className="mt-3 text-lg font-black leading-8 text-white sm:text-xl sm:leading-9">{arena.insights.weeklyDrama}</p>
                </div>
                <CountdownCard
                  deadline={arena.nextEvent?.deadlineTime}
                  label={
                    seasonEnded
                      ? "حالة الموسم"
                      : arena.nextEvent
                        ? `العد التنازلي إلى ${arena.nextEvent.name}`
                        : "العد التنازلي"
                  }
                  emptyText={seasonEnded ? "انتهى الموسم، لا توجد جولة قادمة حالياً" : undefined}
                />
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h2 className="text-2xl font-black text-white">الترتيب الحي</h2>
                <p className="text-sm leading-6 text-slate-400">مصدر الأرقام: Fantasy Premier League</p>
              </div>
              <StandingsView inactiveMembers={arena.inactiveMembers} standings={arena.standings} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
