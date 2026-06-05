"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import type { BanterLevel, BanterTemplate } from "@/lib/types";

export function AdminBanterManager({ initialTemplates }: { initialTemplates: BanterTemplate[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [saved, setSaved] = useState(false);

  function update(index: number, patch: Partial<BanterTemplate>) {
    setTemplates((current) =>
      current.map((template, itemIndex) => itemIndex === index ? { ...template, ...patch } : template),
    );
  }

  async function save() {
    const response = await fetch("/api/admin/banter", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(templates),
    });
    setTemplates((await response.json()) as BanterTemplate[]);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-4">
      {templates.map((template, index) => (
        <section key={template.id} className="glass-card rounded-lg p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="input-field" value={template.name} onChange={(event) => update(index, { name: event.target.value })} />
            <input className="input-field" value={template.triggerKey} onChange={(event) => update(index, { triggerKey: event.target.value })} />
            <select className="input-field" value={template.banterLevel} onChange={(event) => update(index, { banterLevel: event.target.value as BanterLevel })}>
              <option value="light">light</option>
              <option value="normal">normal</option>
              <option value="strong">strong</option>
            </select>
            <label className="flex items-center gap-3 text-sm font-bold text-slate-200">
              <input type="checkbox" checked={template.active} onChange={(event) => update(index, { active: event.target.checked })} className="h-5 w-5 accent-amber-300" />
              نشط
            </label>
            <textarea className="input-field min-h-24 md:col-span-2" value={template.textAr} onChange={(event) => update(index, { textAr: event.target.value })} />
          </div>
        </section>
      ))}
      <button type="button" onClick={save} className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950">
        <Save className="h-4 w-4" aria-hidden="true" />
        {saved ? "تم الحفظ" : "حفظ القوالب"}
      </button>
    </div>
  );
}
