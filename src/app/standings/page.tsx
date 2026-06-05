import { PublicNav } from "@/components/PublicNav";
import { StandingsView } from "@/components/StandingsView";
import { StatusBanner } from "@/components/StatusBanner";
import { EmptyState } from "@/components/EmptyState";
import { formatDateTime } from "@/lib/format";
import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const arena = await getArenaState();

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-bold text-amber-200">الترتيب الرسمي</p>
          <h1 className="mt-2 text-4xl font-black text-white">جدول Dilmondo الحي</h1>
          <p className="mt-3 text-slate-300">آخر مزامنة: {formatDateTime(arena.lastSyncAt)}</p>
        </div>
        {arena.warning ? <StatusBanner tone="warning" title="تنبيه المزامنة" body={arena.warning} /> : null}
        {arena.dataAvailable ? <StandingsView standings={arena.standings} /> : <EmptyState />}
      </section>
    </main>
  );
}
