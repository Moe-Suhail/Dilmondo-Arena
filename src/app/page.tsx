import { CalendarDays, Flame, Gauge, Medal, ShieldAlert, Trophy, Users } from "lucide-react";

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
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="flex min-h-[440px] flex-col justify-center">
            <p className="text-sm font-bold text-amber-200">Dilmondo 7th 🏆</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              ساحة Dilmondo
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              دوري العائلة في الفانتسي... حيث تُكتب البطولات وتُفضح القرارات.
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
            <div className="glass-card self-end rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    name={leader.displayName}
                    imageUrl={leader.profileImageUrl}
                    color={leader.customColor}
                    size="xl"
                  />
                  <div>
                    <p className="text-sm font-bold text-amber-200">
                      {seasonEnded ? "بطل الموسم" : "مرشح البطولة الحالي"}
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-white">{leader.displayName}</h2>
                    <p className="mt-1 text-slate-300">{leader.nickname} · {leader.fplTeamName}</p>
                  </div>
                </div>
                <Trophy className="h-10 w-10 text-amber-200" aria-hidden="true" />
              </div>
              <p className="mt-6 text-lg leading-8 text-slate-200">
                {seasonEnded
                  ? `${leader.nickname} حسم الموسم بالأرقام النهائية... البطولة انتهت والاعتراضات تنتظر اجتماع العائلة.`
                  : "معالي الأسطورة يتصدر المشهد... والبقية يحاولون فهم ما حدث."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">الترتيب</p>
                  <p className="mt-1 text-2xl font-black text-white">#{formatNumber(leader.rank)}</p>
                </div>
                <div className="rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">الإجمالي</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatNumber(leader.totalPoints)}</p>
                </div>
                <div className="rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">الجولة</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatNumber(leader.gwPoints)}</p>
                </div>
                <div className="rounded-lg bg-white/[0.05] p-3">
                  <p className="text-xs text-slate-400">عن الثاني</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {second ? formatGap(leader.totalPoints - second.totalPoints) : "لا يوجد"}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-400">آخر تحديث: {formatDateTime(arena.lastSyncAt)}</p>
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
                ? `تم لعب ${formatNumber(arena.seasonSummary.finishedEvents)} من ${formatNumber(arena.seasonSummary.totalEvents)} جولة. البطل معروف، والجولات المتبقية ${formatNumber(arena.seasonSummary.remainingEvents)}.`
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
                  <h2 className="text-2xl font-black text-white">أقرب المنافسين</h2>
                </div>
                <div className="mt-5 grid gap-3">
                  {arena.insights.closestCompetitors.map((row) => (
                    <div key={row.managerId} className="flex items-center justify-between gap-4 rounded-lg bg-white/[0.04] p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={row.displayName} imageUrl={row.profileImageUrl} color={row.customColor} />
                        <div className="min-w-0">
                          <p className="truncate font-black text-white">{row.displayName}</p>
                          <p className="truncate text-sm text-slate-400">{row.nickname}</p>
                        </div>
                      </div>
                      <div className="text-left">
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
                  <p className="mt-3 text-xl font-black leading-9 text-white">{arena.insights.weeklyDrama}</p>
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
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-white">الترتيب الحي</h2>
                <p className="text-sm text-slate-400">مصدر الأرقام: Fantasy Premier League</p>
              </div>
              <StandingsView standings={arena.standings} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
