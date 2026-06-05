import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { PublicNav } from "@/components/PublicNav";
import { StatusBanner } from "@/components/StatusBanner";
import { formatNumber } from "@/lib/format";
import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";

function formatKickoff(value: string | null) {
  if (!value) {
    return "موعد غير متاح";
  }

  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function FixturesPage() {
  const arena = await getArenaState();
  const seasonEnded = arena.seasonSummary.seasonEnded;
  const latestEventId = arena.latestEvent?.id ?? null;
  const upcomingFixtures = arena.fixtures.filter((fixture) => !fixture.finished);
  const shouldShowLatestRound = seasonEnded || !arena.nextEvent || upcomingFixtures.length === 0;
  const fixtures = shouldShowLatestRound
    ? arena.fixtures.filter((fixture) => fixture.eventId === latestEventId)
    : upcomingFixtures;
  const visibleFixtures = fixtures.slice(0, 40);

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-bold text-amber-200">Fixtures</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            {shouldShowLatestRound ? "مباريات آخر جولة" : "المباريات القادمة"}
          </h1>
          <p className="mt-3 max-w-3xl leading-8 text-slate-300">
            {shouldShowLatestRound
              ? `لا توجد جولة قادمة محفوظة حالياً. هنا تظهر مباريات ${arena.latestEvent?.name ?? "آخر جولة"} من FPL.`
              : `المتبقي ${formatNumber(arena.seasonSummary.remainingEvents)} جولة حسب بيانات FPL.`}
          </p>
        </div>

        {arena.warning ? <StatusBanner tone="warning" title="تنبيه المزامنة" body={arena.warning} /> : null}

        {!visibleFixtures.length ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleFixtures.map((fixture) => (
              <article key={fixture.id} className="glass-card rounded-lg p-5">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-amber-200" aria-hidden="true" />
                    {fixture.eventId ? `GW${fixture.eventId}` : "GW غير متاحة"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    {fixture.finished ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <Clock className="h-4 w-4 text-sky-300" aria-hidden="true" />
                    )}
                    {fixture.finished ? "انتهت" : formatKickoff(fixture.kickoffTime)}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                  <p className="font-black text-white">{fixture.homeTeam}</p>
                  <div className="rounded-lg bg-white/[0.05] px-3 py-2 text-lg font-black text-amber-100">
                    {fixture.finished
                      ? `${formatNumber(fixture.homeScore)} - ${formatNumber(fixture.awayScore)}`
                      : "vs"}
                  </div>
                  <p className="font-black text-white">{fixture.awayTeam}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
