"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";

import { SyncButton } from "@/components/SyncButton";
import type { LeagueSettings, SeasonStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function AdminSettingsForm({
  initialSettings,
  storageMode,
}: {
  initialSettings: LeagueSettings;
  storageMode: "local-json" | "supabase";
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    const updated = (await response.json()) as LeagueSettings;
    setSettings(updated);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <form onSubmit={save} className="glass-card rounded-lg p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-slate-200">
          League ID
          <input
            type="number"
            className="input-field mt-2"
            value={settings.leagueId}
            onChange={(event) => setSettings((current) => ({ ...current, leagueId: Number(event.target.value) }))}
          />
        </label>
        <label className="block text-sm font-bold text-slate-200">
          اسم الدوري
          <input
            className="input-field mt-2"
            value={settings.leagueName}
            onChange={(event) => setSettings((current) => ({ ...current, leagueName: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-slate-200">
          الموسم
          <input
            className="input-field mt-2"
            value={settings.seasonName}
            onChange={(event) => setSettings((current) => ({ ...current, seasonName: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-slate-200">
          حالة الموسم
          <select
            className="input-field mt-2"
            value={settings.seasonStatus}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                seasonStatus: event.target.value as SeasonStatus,
              }))
            }
          >
            <option value="active">active</option>
            <option value="finished">finished</option>
            <option value="pre-season">pre-season</option>
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg bg-white/[0.04] p-4 text-sm text-slate-300 md:grid-cols-2">
        <p>آخر مزامنة: {formatDateTime(settings.lastSyncAt)}</p>
        <p>حالة المزامنة: {settings.syncStatus}</p>
        <p>التخزين: {storageMode === "local-json" ? "Local JSON للتطوير" : "Supabase Production"}</p>
        <p>آخر خطأ: {settings.syncError ?? "لا يوجد"}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saved ? "تم الحفظ" : "حفظ الإعدادات"}
        </button>
        <SyncButton />
      </div>
    </form>
  );
}
