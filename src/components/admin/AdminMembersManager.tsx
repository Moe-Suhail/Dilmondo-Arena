"use client";

import { ChangeEvent, useState } from "react";
import { ImageUp, Plus, Save } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import type { BanterLevel, Member, MemberStatus } from "@/lib/types";

function toPatch(member: Member) {
  return {
    ...member,
    fplManagerId: member.fplManagerId ? Number(member.fplManagerId) : null,
  };
}

export function AdminMembersManager({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<{ memberId: string; file: File } | null>(null);

  function updateLocal(memberId: string, patch: Partial<Member>) {
    setMembers((current) =>
      current.map((member) => (member.id === memberId ? { ...member, ...patch } : member)),
    );
  }

  async function save(member: Member) {
    setSavingId(member.id);
    const response = await fetch(`/api/admin/members/${member.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPatch(member)),
    });
    const updated = (await response.json()) as Member;
    updateLocal(member.id, updated);
    setSavingId(null);
  }

  async function upload(memberId: string, file: File) {
    const formData = new FormData();
    formData.append("memberId", memberId);
    formData.append("file", file);
    const response = await fetch("/api/admin/uploads/member-image", {
      method: "POST",
      body: formData,
    });
    const body = (await response.json()) as { profileImageUrl?: string };
    if (body.profileImageUrl) {
      updateLocal(memberId, { profileImageUrl: body.profileImageUrl });
    }
  }

  function chooseImage(memberId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setCropTarget({ memberId, file });
  }

  async function addMember() {
    const response = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayNameAr: "عضو جديد", shortName: "عضو جديد", nickname: "بدون لقب" }),
    });
    const member = (await response.json()) as Member;
    setMembers((current) => [member, ...current]);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={addMember}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        إضافة عضو محلي
      </button>

      <div className="grid gap-4">
        {members.map((member) => (
          <section key={member.id} className="glass-card rounded-lg p-5">
            <div className="flex flex-col gap-5 xl:flex-row">
              <div className="w-full xl:w-64">
                <div className="flex items-center gap-4">
                  <Avatar
                    name={member.displayNameAr}
                    imageUrl={member.profileImageUrl}
                    color={member.customColor}
                    size="xl"
                  />
                  <div>
                    <p className="font-black text-white">{member.displayNameAr}</p>
                    <p className="text-sm text-slate-400">{member.nickname}</p>
                  </div>
                </div>
                <label className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200">
                  <ImageUp className="h-4 w-4" aria-hidden="true" />
                  صورة
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => chooseImage(member.id, event)} />
                </label>
              </div>

              <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="text-sm font-bold text-slate-200">
                  FPL Manager ID
                  <input
                    className="input-field mt-2"
                    value={member.fplManagerId ?? ""}
                    onChange={(event) =>
                      updateLocal(member.id, { fplManagerId: event.target.value ? Number(event.target.value) : null })
                    }
                  />
                </label>
                <label className="text-sm font-bold text-slate-200">
                  FPL Team
                  <input className="input-field mt-2" value={member.fplTeamName ?? ""} onChange={(event) => updateLocal(member.id, { fplTeamName: event.target.value || null })} />
                </label>
                <label className="text-sm font-bold text-slate-200">
                  FPL Manager
                  <input className="input-field mt-2" value={member.fplManagerName ?? ""} onChange={(event) => updateLocal(member.id, { fplManagerName: event.target.value || null })} />
                </label>
                <label className="text-sm font-bold text-slate-200">
                  الاسم العربي
                  <input className="input-field mt-2" value={member.displayNameAr} onChange={(event) => updateLocal(member.id, { displayNameAr: event.target.value })} />
                </label>
                <label className="text-sm font-bold text-slate-200">
                  الاسم المختصر
                  <input className="input-field mt-2" value={member.shortName} onChange={(event) => updateLocal(member.id, { shortName: event.target.value })} />
                </label>
                <label className="text-sm font-bold text-slate-200">
                  اللقب
                  <input className="input-field mt-2" value={member.nickname} onChange={(event) => updateLocal(member.id, { nickname: event.target.value })} />
                </label>
                <label className="text-sm font-bold text-slate-200">
                  اللون
                  <input className="input-field mt-2 h-12 p-1" type="color" value={member.customColor} onChange={(event) => updateLocal(member.id, { customColor: event.target.value })} />
                </label>
                <label className="text-sm font-bold text-slate-200">
                  مستوى المزاح
                  <select className="input-field mt-2" value={member.banterLevel} onChange={(event) => updateLocal(member.id, { banterLevel: event.target.value as BanterLevel })}>
                    <option value="light">light</option>
                    <option value="normal">normal</option>
                    <option value="strong">strong</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-200">
                  الحالة
                  <select className="input-field mt-2" value={member.status} onChange={(event) => updateLocal(member.id, { status: event.target.value as MemberStatus })}>
                    <option value="active">active</option>
                    <option value="withdrawn">withdrawn</option>
                    <option value="archived">archived</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={member.active}
                    onChange={(event) => updateLocal(member.id, { active: event.target.checked })}
                    className="h-5 w-5 accent-amber-300"
                  />
                  نشط
                </label>
                <label className="md:col-span-2 xl:col-span-3 text-sm font-bold text-slate-200">
                  ملاحظات
                  <textarea className="input-field mt-2 min-h-24" value={member.notes ?? ""} onChange={(event) => updateLocal(member.id, { notes: event.target.value || null })} />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => save(member)}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {savingId === member.id ? "جاري الحفظ..." : "حفظ العضو"}
            </button>
          </section>
        ))}
      </div>
      {cropTarget ? (
        <ImageCropperModal
          file={cropTarget.file}
          memberName={
            members.find((member) => member.id === cropTarget.memberId)?.displayNameAr ?? "العضو"
          }
          onCancel={() => setCropTarget(null)}
          onApply={async (file) => {
            await upload(cropTarget.memberId, file);
            setCropTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}
