"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";

import type { HomepageAnnouncement } from "@/lib/types";

export function AdminAnnouncementForm({
  initialAnnouncement,
}: {
  initialAnnouncement: HomepageAnnouncement | null;
}) {
  const [announcement, setAnnouncement] = useState(
    initialAnnouncement ?? { title: "", body: "", active: true },
  );
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/announcement", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(announcement),
    });
    setAnnouncement((await response.json()) as HomepageAnnouncement);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <form onSubmit={submit} className="glass-card rounded-lg p-5">
      <div className="grid gap-4">
        <label className="text-sm font-bold text-slate-200">
          العنوان
          <input className="input-field mt-2" value={announcement.title} onChange={(event) => setAnnouncement((current) => ({ ...current, title: event.target.value }))} />
        </label>
        <label className="text-sm font-bold text-slate-200">
          الرسالة
          <textarea className="input-field mt-2 min-h-32" value={announcement.body} onChange={(event) => setAnnouncement((current) => ({ ...current, body: event.target.value }))} />
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-slate-200">
          <input type="checkbox" className="h-5 w-5 accent-amber-300" checked={announcement.active} onChange={(event) => setAnnouncement((current) => ({ ...current, active: event.target.checked }))} />
          ظاهر في الصفحة الرئيسية
        </label>
      </div>
      <button type="submit" className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950">
        <Save className="h-4 w-4" aria-hidden="true" />
        {saved ? "تم الحفظ" : "حفظ الإعلان"}
      </button>
    </form>
  );
}
