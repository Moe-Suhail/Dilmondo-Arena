"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

function getRemaining(deadline: string | null) {
  if (!deadline) {
    return null;
  }

  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

export function CountdownCard({
  deadline,
  label,
  emptyText = "موعد الجولة القادمة غير متاح حالياً",
}: {
  deadline: string | null | undefined;
  label: string;
  emptyText?: string;
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(deadline ?? null));

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(getRemaining(deadline ?? null)), 30000);
    return () => window.clearInterval(id);
  }, [deadline]);

  const text = useMemo(() => {
    if (!remaining) {
      return emptyText;
    }

    return `${remaining.days} يوم · ${remaining.hours} ساعة · ${remaining.minutes} دقيقة`;
  }, [emptyText, remaining]);

  return (
    <div className="glass-card rounded-lg p-5">
      <div className="flex items-center gap-3 text-amber-200">
        <CalendarClock className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm font-bold">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-black leading-8 text-white sm:text-3xl">{text}</p>
      {deadline ? <p className="mt-2 text-sm text-slate-400">{new Date(deadline).toLocaleString("ar-EG")}</p> : null}
    </div>
  );
}
