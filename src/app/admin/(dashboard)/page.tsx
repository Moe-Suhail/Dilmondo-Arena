import { Crown, Database, Gauge, Users } from "lucide-react";

import { MetricCard } from "@/components/MetricCard";
import { StatusBanner } from "@/components/StatusBanner";
import { SyncButton } from "@/components/SyncButton";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const arena = await getArenaState({ syncIfEmpty: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-amber-200">لوحة التحكم</p>
          <h1 className="mt-2 text-4xl font-black text-white">مركز إدارة الدوري</h1>
          <p className="mt-3 text-slate-300">آخر مزامنة: {formatDateTime(arena.lastSyncAt)}</p>
        </div>
        <SyncButton />
      </div>

      {arena.warning ? <StatusBanner tone="warning" title="تنبيه المزامنة" body={arena.warning} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="الأعضاء المحليون" value={formatNumber(arena.members.length)} detail="يشمل المنسحبين" icon={Users} />
        <MetricCard label="الترتيب الحي" value={formatNumber(arena.standings.length)} detail="من FPL فقط" icon={Gauge} />
        <MetricCard label="المتصدر" value={arena.insights.leader?.nickname ?? "—"} detail={arena.insights.leader?.fplTeamName} icon={Crown} />
        <MetricCard
          label="التخزين"
          value={arena.storageMode === "local-json" ? "Local" : "Supabase"}
          detail={arena.storageMode === "local-json" ? "للتطوير فقط" : "جاهز لـ Vercel"}
          icon={Database}
        />
      </div>

      <div className="glass-card rounded-lg p-5">
        <h2 className="text-2xl font-black text-white">قواعد البيانات الحية</h2>
        <p className="mt-3 max-w-3xl leading-8 text-slate-300">
          الأرقام التنافسية تأتي من FPL فقط. تعديلات المشرف تغير الهوية المحلية والصور
          والألقاب والقوالب، لكنها لا تغير النقاط أو الترتيب.
        </p>
      </div>
    </div>
  );
}
