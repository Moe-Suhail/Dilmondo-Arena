"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit3, Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import type { HallOfFameEntry, Member } from "@/lib/types";

type AwardForm = {
  title: string;
  memberId: string;
  note: string;
};

type HallForm = {
  id: string | null;
  season: string;
  title: string;
  description: string;
  winnerMemberId: string;
  runnerUpMemberId: string;
  lastPlaceMemberId: string;
  imageUrl: string;
  awardsPayload: AwardForm[];
};

type ApiError = { error?: string };

const emptyForm: HallForm = {
  id: null,
  season: "",
  title: "",
  description: "",
  winnerMemberId: "",
  runnerUpMemberId: "",
  lastPlaceMemberId: "",
  imageUrl: "",
  awardsPayload: [{ title: "", memberId: "", note: "" }],
};

function entryToForm(entry: HallOfFameEntry): HallForm {
  return {
    id: entry.id,
    season: entry.season,
    title: entry.title,
    description: entry.description,
    winnerMemberId: entry.winnerMemberId ?? "",
    runnerUpMemberId: entry.runnerUpMemberId ?? "",
    lastPlaceMemberId: entry.lastPlaceMemberId ?? "",
    imageUrl: entry.imageUrl ?? "",
    awardsPayload: entry.awardsPayload.length
      ? entry.awardsPayload.map((award) => ({
          title: award.title,
          memberId: award.memberId ?? "",
          note: award.note,
        }))
      : [{ title: "", memberId: "", note: "" }],
  };
}

function formToPayload(form: HallForm) {
  return {
    season: form.season.trim() || "موسم جديد",
    title: form.title.trim() || "لقب جديد",
    description: form.description.trim(),
    winnerMemberId: form.winnerMemberId || null,
    runnerUpMemberId: form.runnerUpMemberId || null,
    lastPlaceMemberId: form.lastPlaceMemberId || null,
    imageUrl: form.imageUrl.trim() || null,
    awardsPayload: form.awardsPayload
      .map((award) => ({
        title: award.title.trim(),
        memberId: award.memberId || null,
        note: award.note.trim(),
      }))
      .filter((award) => award.title || award.note),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & ApiError;

  if (!response.ok) {
    throw new Error(body.error ?? "تعذر حفظ قاعة المجد");
  }

  return body;
}

export function AdminHallManager({
  initialEntries,
  members,
}: {
  initialEntries: HallOfFameEntry[];
  members: Member[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState<HallForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const editing = Boolean(form.id);

  const memberOptions = useMemo(
    () =>
      members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.displayNameAr}
        </option>
      )),
    [members],
  );

  function updateForm(patch: Partial<HallForm>) {
    setMessage(null);
    setForm((current) => ({ ...current, ...patch }));
  }

  function updateAward(index: number, patch: Partial<AwardForm>) {
    setMessage(null);
    setForm((current) => ({
      ...current,
      awardsPayload: current.awardsPayload.map((award, itemIndex) =>
        itemIndex === index ? { ...award, ...patch } : award,
      ),
    }));
  }

  function addAward() {
    setForm((current) => ({
      ...current,
      awardsPayload: [...current.awardsPayload, { title: "", memberId: "", note: "" }],
    }));
  }

  function removeAward(index: number) {
    setForm((current) => ({
      ...current,
      awardsPayload:
        current.awardsPayload.length === 1
          ? [{ title: "", memberId: "", note: "" }]
          : current.awardsPayload.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setMessage(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const endpoint = form.id ? `/api/admin/hall-of-fame/${form.id}` : "/api/admin/hall-of-fame";
      const response = await fetch(endpoint, {
        method: form.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const entry = await parseResponse<HallOfFameEntry>(response);
      setEntries((current) => [entry, ...current.filter((item) => item.id !== entry.id)]);
      setForm(entryToForm(entry));
      setMessage("تم حفظ الإدخال بنجاح.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ قاعة المجد");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(entry: HallOfFameEntry) {
    const confirmed = window.confirm(`حذف "${entry.title}" من قاعة المجد؟`);
    if (!confirmed) return;

    setDeletingId(entry.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/hall-of-fame/${entry.id}`, {
        method: "DELETE",
      });
      await parseResponse<{ ok: true }>(response);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      if (form.id === entry.id) {
        resetForm();
      }
      setMessage("تم حذف الإدخال.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حذف الإدخال");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1fr]">
      <form onSubmit={submit} className="glass-card rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-amber-200">
              {editing ? "تعديل إدخال محفوظ" : "إضافة موسم جديد"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">بيانات قاعة المجد</h2>
          </div>
          {editing ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-bold text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              إدخال جديد
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4">
          <label className="text-sm font-bold text-slate-200">
            الموسم
            <input
              className="input-field mt-2"
              placeholder="مثال: 2025/26"
              value={form.season}
              onChange={(event) => updateForm({ season: event.target.value })}
            />
          </label>
          <label className="text-sm font-bold text-slate-200">
            عنوان التتويج
            <input
              className="input-field mt-2"
              placeholder="مثال: موسم السيطرة الكاملة"
              value={form.title}
              onChange={(event) => updateForm({ title: event.target.value })}
            />
          </label>
          <label className="text-sm font-bold text-slate-200">
            الوصف
            <textarea
              className="input-field mt-2 min-h-28"
              placeholder="اكتب ملخص الموسم، سبب دخول البطل القاعة، وأهم اللحظات."
              value={form.description}
              onChange={(event) => updateForm({ description: event.target.value })}
            />
          </label>
          <label className="text-sm font-bold text-slate-200">
            رابط صورة اختيارية
            <input
              className="input-field mt-2"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(event) => updateForm({ imageUrl: event.target.value })}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["winnerMemberId", "البطل"],
              ["runnerUpMemberId", "الوصيف"],
              ["lastPlaceMemberId", "المركز الأخير"],
            ].map(([key, label]) => (
              <label key={key} className="text-sm font-bold text-slate-200">
                {label}
                <select
                  className="input-field mt-2"
                  value={form[key as keyof HallForm] as string}
                  onChange={(event) => updateForm({ [key]: event.target.value } as Partial<HallForm>)}
                >
                  <option value="">غير محدد</option>
                  {memberOptions}
                </select>
              </label>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-black text-white">جوائز الموسم</h3>
              <button
                type="button"
                onClick={addAward}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-bold text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                جائزة
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {form.awardsPayload.map((award, index) => (
                <div key={index} className="grid gap-3 rounded-lg bg-slate-950/35 p-3 md:grid-cols-[1fr_0.8fr_1fr_auto]">
                  <input
                    className="input-field"
                    placeholder="اسم الجائزة"
                    value={award.title}
                    onChange={(event) => updateAward(index, { title: event.target.value })}
                  />
                  <select
                    className="input-field"
                    value={award.memberId}
                    onChange={(event) => updateAward(index, { memberId: event.target.value })}
                  >
                    <option value="">بدون عضو</option>
                    {memberOptions}
                  </select>
                  <input
                    className="input-field"
                    placeholder="ملاحظة قصيرة"
                    value={award.note}
                    onChange={(event) => updateAward(index, { note: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeAward(index)}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 px-3 text-slate-200 transition hover:border-red-300/50 hover:text-red-200"
                    aria-label="حذف الجائزة"
                    title="حذف الجائزة"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-200">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-70"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? "جاري الحفظ..." : editing ? "حفظ التعديل" : "إضافة إلى القاعة"}
        </button>
      </form>

      <div className="glass-card rounded-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-amber-200">الأرشيف</p>
            <h2 className="mt-1 text-2xl font-black text-white">إدخالات قاعة المجد</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-sm font-bold text-slate-300">
            {entries.length}
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {entries.length ? (
            entries.map((entry) => (
              <article
                key={entry.id}
                className={`rounded-lg border p-4 transition ${
                  form.id === entry.id
                    ? "border-amber-300/70 bg-amber-300/10"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-amber-200">{entry.season}</p>
                    <h3 className="mt-1 break-words font-black text-white">{entry.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
                      {entry.description || "لا يوجد وصف بعد."}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(entryToForm(entry));
                        setMessage(null);
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200"
                      aria-label="تعديل"
                      title="تعديل"
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEntry(entry)}
                      disabled={deletingId === entry.id}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:border-red-300/50 hover:text-red-200 disabled:cursor-wait disabled:opacity-60"
                      aria-label="حذف"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-300">
              لا توجد إدخالات بعد. أضف أول بطل يستحق الدخول من الباب الكبير.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
