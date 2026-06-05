"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function SyncButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function sync() {
    setLoading(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={sync}
      disabled={loading}
      className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-70"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
      {compact ? "مزامنة" : loading ? "جاري تحديث بيانات الدوري..." : "تحديث بيانات الدوري"}
    </button>
  );
}
