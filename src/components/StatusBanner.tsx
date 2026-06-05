import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type StatusBannerProps = {
  tone?: "warning" | "success" | "info";
  title: string;
  body?: string | null;
};

const styles = {
  warning: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  success: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  info: "border-sky-300/30 bg-sky-300/10 text-sky-100",
};

const icons = {
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export function StatusBanner({ tone = "info", title, body }: StatusBannerProps) {
  const Icon = icons[tone];

  return (
    <div className={`rounded-lg border p-4 ${styles[tone]}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-bold">{title}</p>
          {body ? <p className="mt-1 text-sm opacity-85">{body}</p> : null}
        </div>
      </div>
    </div>
  );
}
