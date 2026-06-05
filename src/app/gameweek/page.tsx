import { Crown, Flame, Gauge, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { PublicNav } from "@/components/PublicNav";
import { StatusBanner } from "@/components/StatusBanner";
import { formatNumber } from "@/lib/format";
import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";

export default async function GameweekPage() {
  const arena = await getArenaState();
  const seasonEnded = arena.seasonSummary.seasonEnded;
  const snapshots = arena.latestSnapshot?.normalizedPayload.managerGameweeks ?? [];
  const captainRows = snapshots
    .filter((snapshot) => typeof snapshot.captainPoints === "number")
    .map((snapshot) => ({
      snapshot,
      standing: arena.standings.find((row) => row.managerId === snapshot.managerId) ?? null,
    }))
    .filter((row) => row.standing);
  const bestCaptain = captainRows.length
    ? [...captainRows].sort((a, b) => (b.snapshot.captainPoints ?? 0) - (a.snapshot.captainPoints ?? 0))[0]
    : null;
  const worstCaptain = captainRows.length
    ? [...captainRows].sort((a, b) => (a.snapshot.captainPoints ?? 0) - (b.snapshot.captainPoints ?? 0))[0]
    : null;
  const biggestRise = arena.standings
    .filter((row) => typeof row.rankMovement === "number" && row.rankMovement > 0)
    .sort((a, b) => (b.rankMovement ?? 0) - (a.rankMovement ?? 0))[0];
  const biggestFall = arena.standings
    .filter((row) => typeof row.rankMovement === "number" && row.rankMovement < 0)
    .sort((a, b) => (a.rankMovement ?? 0) - (b.rankMovement ?? 0))[0];

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-bold text-amber-200">{arena.latestEvent?.name ?? "الجولة الحالية"}</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            {seasonEnded ? "تقرير الجولة الأخيرة" : "تقرير الجولة العائلي"}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">{arena.insights.weeklyDrama}</p>
        </div>
        {arena.warning ? <StatusBanner tone="warning" title="تنبيه المزامنة" body={arena.warning} /> : null}
        {arena.dataAvailable && seasonEnded ? (
          <StatusBanner
            tone="success"
            title="أرقام نهائية"
            body={`الموسم انتهى بعد ${formatNumber(arena.seasonSummary.totalEvents)} جولة، ولا توجد جولات متبقية.`}
          />
        ) : null}
        <StatusBanner
          tone="info"
          title="محاولة تعويض"
          body="في ناس بدأت تلمّح لفانتسي كأس العالم كأنه فرصة رد اعتبار... عادي نحلم، لكن السجل الرسمي هنا يبقى فانتسي الدوري الإنجليزي. الأصل أصل."
        />
        {!arena.dataAvailable ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="أفضل نتيجة"
                value={formatNumber(arena.insights.bestGw?.gwPoints)}
                detail={arena.insights.bestGw?.nickname}
                icon={Flame}
              />
              <MetricCard
                label="أقل نتيجة"
                value={formatNumber(arena.insights.worstGw?.gwPoints)}
                detail={arena.insights.worstGw?.nickname}
                icon={ShieldAlert}
              />
              <MetricCard
                label="متوسط المجموعة"
                value={formatNumber(arena.insights.averageGw)}
                detail="محسوب من نتائج الجولة الحية"
                icon={Gauge}
              />
              <MetricCard
                label="المتصدر"
                value={arena.insights.leader?.nickname ?? "—"}
                detail={arena.insights.leader ? `${arena.insights.leader.totalPoints} نقطة` : undefined}
                icon={Crown}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="glass-card rounded-lg p-5">
                <h2 className="text-2xl font-black text-white">الكابتن</h2>
                {!bestCaptain || !worstCaptain ? (
                  <p className="mt-4 rounded-lg bg-white/[0.04] p-4 text-slate-300">
                    بيانات الكابتن غير متاحة حالياً
                  </p>
                ) : (
                  <div className="mt-5 grid gap-3">
                    {[bestCaptain, worstCaptain].map(({ snapshot, standing }, index) => (
                      <div key={`${snapshot.managerId}-${index}`} className="flex items-center justify-between gap-4 rounded-lg bg-white/[0.04] p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            name={standing!.displayName}
                            imageUrl={standing!.profileImageUrl}
                            color={standing!.customColor}
                          />
                          <div>
                            <p className="font-black text-white">{index === 0 ? "أفضل اختيار كابتن" : "أضعف اختيار كابتن"}</p>
                            <p className="text-sm text-slate-400">
                              {standing!.nickname} · {snapshot.captainPlayerName ?? "لاعب غير معروف"}
                            </p>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-amber-200">{formatNumber(snapshot.captainPoints)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card rounded-lg p-5">
                <h2 className="text-2xl font-black text-white">حركة الترتيب</h2>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-lg bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <TrendingUp className="h-5 w-5" aria-hidden="true" />
                      <p className="font-bold">أكبر صعود</p>
                    </div>
                    <p className="mt-2 text-xl font-black text-white">
                      {biggestRise ? `${biggestRise.nickname} +${formatNumber(biggestRise.rankMovement)}` : "لا توجد حركة مثبتة حالياً"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-rose-300">
                      <TrendingDown className="h-5 w-5" aria-hidden="true" />
                      <p className="font-bold">أكبر تراجع</p>
                    </div>
                    <p className="mt-2 text-xl font-black text-white">
                      {biggestFall ? `${biggestFall.nickname} ${formatNumber(biggestFall.rankMovement)}` : "لا توجد حركة مثبتة حالياً"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
