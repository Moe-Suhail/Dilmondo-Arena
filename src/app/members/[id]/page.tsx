import { notFound } from "next/navigation";
import { Award, Crown, Gauge, ShieldAlert, Sparkles } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { MetricCard } from "@/components/MetricCard";
import { PublicNav } from "@/components/PublicNav";
import { StatusBanner } from "@/components/StatusBanner";
import { fetchManagerHistory } from "@/lib/fpl";
import { formatGap, formatNumber } from "@/lib/format";
import { getMemberProfile } from "@/lib/arena";

export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { arena, standing, member } = await getMemberProfile(id);

  if (!member && !standing) {
    notFound();
  }

  const history = standing ? await fetchManagerHistory(standing.managerId).catch(() => null) : null;
  const historyRows = history?.current ?? [];
  const best = historyRows.length ? [...historyRows].sort((a, b) => b.points - a.points)[0] : null;
  const worst = historyRows.length ? [...historyRows].sort((a, b) => a.points - b.points)[0] : null;
  const recent = historyRows.slice(-5).map((row) => row.points);
  const name = standing?.displayName ?? member!.displayNameAr;

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {arena.warning ? <StatusBanner tone="warning" title="تنبيه المزامنة" body={arena.warning} /> : null}

        <div className="glass-card rounded-lg p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                name={name}
                imageUrl={standing?.profileImageUrl ?? member?.profileImageUrl}
                color={standing?.customColor ?? member?.customColor}
                size="xl"
              />
              <div>
                <p className="text-sm font-bold text-amber-200">{standing?.statusBadge ?? member?.status}</p>
                <h1 className="mt-2 text-4xl font-black text-white">{name}</h1>
                <p className="mt-2 text-slate-300">
                  {(standing?.nickname ?? member?.nickname) || "بدون لقب"} · {standing?.fplTeamName ?? member?.fplTeamName ?? "غير مرتبط بفريق FPL"}
                </p>
              </div>
            </div>
            <Crown className="h-14 w-14 text-amber-200" aria-hidden="true" />
          </div>
          <p className="mt-6 text-lg leading-8 text-slate-200">
            {standing
              ? `${standing.nickname} يملك ${standing.totalPoints} نقطة حالياً، والفارق عن المتصدر ${standing.gapFromLeader} نقطة.`
              : "عضو محلي غير ظاهر في الترتيب الحي لأنه غير مرتبط بفريق FPL صالح."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="الترتيب الحالي" value={standing ? `#${formatNumber(standing.rank)}` : "—"} icon={Crown} />
          <MetricCard label="إجمالي النقاط" value={formatNumber(standing?.totalPoints)} icon={Gauge} />
          <MetricCard label="نقاط الجولة" value={formatNumber(standing?.gwPoints)} icon={Sparkles} />
          <MetricCard label="عن المتصدر" value={standing ? formatGap(standing.gapFromLeader) : "—"} icon={ShieldAlert} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-amber-200" aria-hidden="true" />
              <h2 className="text-2xl font-black text-white">سجل الموسم</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <p className="rounded-lg bg-white/[0.04] p-4 text-slate-300">
                أفضل جولة: {best ? `${best.points} نقطة في GW${best.event}` : "البيانات غير متاحة حالياً"}
              </p>
              <p className="rounded-lg bg-white/[0.04] p-4 text-slate-300">
                أهدأ جولة: {worst ? `${worst.points} نقطة في GW${worst.event}` : "البيانات غير متاحة حالياً"}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-lg p-5">
            <h2 className="text-2xl font-black text-white">الفورمة الأخيرة</h2>
            {recent.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {recent.map((points, index) => (
                  <span key={`${points}-${index}`} className="rounded-lg bg-amber-300/10 px-4 py-3 font-black text-amber-100">
                    {points}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-lg bg-white/[0.04] p-4 text-slate-300">البيانات غير متاحة حالياً</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
