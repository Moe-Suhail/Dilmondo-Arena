"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";

import type { HallOfFameEntry, Member } from "@/lib/types";

export function AdminHallManager({
  initialEntries,
  members,
}: {
  initialEntries: HallOfFameEntry[];
  members: Member[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState({
    season: "",
    title: "",
    description: "",
    winnerMemberId: "",
    runnerUpMemberId: "",
    lastPlaceMemberId: "",
    awardTitle: "",
    awardNote: "",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/hall-of-fame", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        season: form.season,
        title: form.title,
        description: form.description,
        winnerMemberId: form.winnerMemberId || null,
        runnerUpMemberId: form.runnerUpMemberId || null,
        lastPlaceMemberId: form.lastPlaceMemberId || null,
        awardsPayload: form.awardTitle
          ? [{ title: form.awardTitle, memberId: form.winnerMemberId || null, note: form.awardNote }]
          : [],
      }),
    });
    const entry = (await response.json()) as HallOfFameEntry;
    setEntries((current) => [entry, ...current.filter((item) => item.id !== entry.id)]);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1fr]">
      <form onSubmit={submit} className="glass-card rounded-lg p-5">
        <h2 className="text-2xl font-black text-white">إضافة موسم</h2>
        <div className="mt-5 grid gap-4">
          <input className="input-field" placeholder="الموسم" value={form.season} onChange={(event) => setForm((current) => ({ ...current, season: event.target.value }))} />
          <input className="input-field" placeholder="العنوان" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <textarea className="input-field min-h-28" placeholder="الوصف" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          {[
            ["winnerMemberId", "البطل"],
            ["runnerUpMemberId", "الوصيف"],
            ["lastPlaceMemberId", "المركز الأخير"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-bold text-slate-200">
              {label}
              <select className="input-field mt-2" value={form[key as keyof typeof form]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}>
                <option value="">غير محدد</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.displayNameAr}</option>
                ))}
              </select>
            </label>
          ))}
          <input className="input-field" placeholder="جائزة مضحكة" value={form.awardTitle} onChange={(event) => setForm((current) => ({ ...current, awardTitle: event.target.value }))} />
          <input className="input-field" placeholder="ملاحظة الجائزة" value={form.awardNote} onChange={(event) => setForm((current) => ({ ...current, awardNote: event.target.value }))} />
        </div>
        <button type="submit" className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950">
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة
        </button>
      </form>

      <div className="glass-card rounded-lg p-5">
        <h2 className="text-2xl font-black text-white">الإدخالات</h2>
        <div className="mt-5 grid gap-3">
          {entries.length ? entries.map((entry) => (
            <article key={entry.id} className="rounded-lg bg-white/[0.04] p-4">
              <p className="text-sm font-bold text-amber-200">{entry.season}</p>
              <h3 className="mt-1 font-black text-white">{entry.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{entry.description}</p>
            </article>
          )) : <p className="text-slate-300">لا توجد إدخالات بعد.</p>}
        </div>
      </div>
    </div>
  );
}
