import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { formatGap, formatNumber } from "@/lib/format";
import type { ArenaStanding } from "@/lib/types";

function Movement({ value }: { value: number | null }) {
  if (!value) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-400">
        <Minus className="h-4 w-4" aria-hidden="true" />
        ثابت
      </span>
    );
  }

  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-300">
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
        +{formatNumber(value)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-rose-300">
      <ArrowDown className="h-4 w-4" aria-hidden="true" />
      {formatNumber(value)}
    </span>
  );
}

export function StandingsView({ standings }: { standings: ArenaStanding[] }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:hidden">
        {standings.map((row) => (
          <Link key={row.managerId} href={row.memberUrl} className="glass-card block rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-300/12 text-lg font-black text-amber-200">
                  {formatNumber(row.rank)}
                </span>
                <Avatar name={row.displayName} imageUrl={row.profileImageUrl} color={row.customColor} />
                <div className="min-w-0">
                  <p className="truncate font-black text-white">{row.displayName}</p>
                  <p className="truncate text-sm text-slate-400">{row.nickname} · {row.fplTeamName}</p>
                </div>
              </div>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                {row.statusBadge}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-slate-400">الجولة</p>
                <p className="mt-1 font-black text-white">{formatNumber(row.gwPoints)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-slate-400">الإجمالي</p>
                <p className="mt-1 font-black text-white">{formatNumber(row.totalPoints)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-slate-400">عن المتصدر</p>
                <p className="mt-1 font-black text-white">{formatGap(row.gapFromLeader)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-white/10 lg:block">
        <table className="w-full border-collapse text-right">
          <thead className="bg-white/[0.05] text-sm text-slate-300">
            <tr>
              <th className="px-4 py-4">الترتيب</th>
              <th className="px-4 py-4">المدير</th>
              <th className="px-4 py-4">فريق FPL</th>
              <th className="px-4 py-4">الجولة</th>
              <th className="px-4 py-4">الإجمالي</th>
              <th className="px-4 py-4">الفارق</th>
              <th className="px-4 py-4">الحركة</th>
              <th className="px-4 py-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {standings.map((row) => (
              <tr key={row.managerId} className="bg-white/[0.02] transition hover:bg-white/[0.05]">
                <td className="px-4 py-4 text-xl font-black text-amber-200">{formatNumber(row.rank)}</td>
                <td className="px-4 py-4">
                  <Link href={row.memberUrl} className="flex items-center gap-3">
                    <Avatar name={row.displayName} imageUrl={row.profileImageUrl} color={row.customColor} />
                    <span>
                      <span className="block font-black text-white">{row.displayName}</span>
                      <span className="block text-sm text-slate-400">{row.nickname}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-4 text-slate-300">
                  <span className="block font-bold text-white">{row.fplTeamName}</span>
                  <span className="text-sm text-slate-400">{row.fplManagerName}</span>
                </td>
                <td className="px-4 py-4 font-black text-white">{formatNumber(row.gwPoints)}</td>
                <td className="px-4 py-4 font-black text-white">{formatNumber(row.totalPoints)}</td>
                <td className="px-4 py-4 text-slate-300">{formatGap(row.gapFromLeader)}</td>
                <td className="px-4 py-4 text-sm"><Movement value={row.rankMovement} /></td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                    {row.statusBadge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
