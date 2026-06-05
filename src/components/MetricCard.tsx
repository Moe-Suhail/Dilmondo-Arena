import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm leading-6 text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-black leading-7 text-white sm:text-2xl">{value}</p>
          {detail ? <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p> : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-300/10 text-amber-200">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
