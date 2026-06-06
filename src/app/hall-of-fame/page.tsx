import { Crown, Gem, Medal, ShieldCheck, Sparkles, Star, Trophy } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { PublicNav } from "@/components/PublicNav";
import { getStore } from "@/lib/storage";
import type { HallOfFameEntry, Member } from "@/lib/types";

export const dynamic = "force-dynamic";

function byId(members: Member[]) {
  return new Map(members.map((member) => [member.id, member]));
}

function memberName(member: Member | null | undefined, fallback = "لم يتم التحديد") {
  return member?.displayNameAr ?? fallback;
}

function HallMemberBadge({
  label,
  member,
  fallback,
  tone = "amber",
}: {
  label: string;
  member: Member | null | undefined;
  fallback?: string;
  tone?: "amber" | "slate";
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
      {member ? (
        <Avatar
          name={member.displayNameAr}
          imageUrl={member.profileImageUrl}
          color={member.customColor}
          size="md"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-400">
          <Star className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <p className={`text-xs font-bold ${tone === "amber" ? "text-amber-200" : "text-slate-400"}`}>
          {label}
        </p>
        <p className="truncate font-black text-white">{memberName(member, fallback)}</p>
        {member?.nickname ? <p className="truncate text-xs text-slate-400">{member.nickname}</p> : null}
      </div>
    </div>
  );
}

function EntryAwards({
  entry,
  members,
}: {
  entry: HallOfFameEntry;
  members: Map<string, Member>;
}) {
  if (!entry.awardsPayload.length) {
    return null;
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {entry.awardsPayload.map((award, index) => {
        const member = award.memberId ? members.get(award.memberId) : null;
        return (
          <div key={`${award.title}-${index}`} className="rounded-lg border border-amber-200/15 bg-amber-200/10 p-3">
            <div className="flex items-start gap-3">
              <Gem className="mt-1 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-black text-white">{award.title}</p>
                {member ? <p className="mt-1 text-sm font-bold text-amber-100">{member.displayNameAr}</p> : null}
                {award.note ? <p className="mt-2 text-sm leading-6 text-slate-300">{award.note}</p> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function HallOfFamePage() {
  const store = await getStore();
  const entries = [...store.hallOfFame].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const members = byId(store.members);
  const featured = entries[0] ?? null;
  const leagueName = store.leagueSettings.leagueName.replace("🏆", "").trim() || "Dilmondo";
  const championCount = new Set(entries.map((entry) => entry.winnerMemberId).filter(Boolean)).size;

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />

      <section
        className="relative overflow-hidden border-b border-white/10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(5,7,18,0.9), rgba(5,7,18,0.64), rgba(5,7,18,0.3)), url('/images/arena-hero.png')",
        }}
      >
        <div className="mx-auto grid min-h-[420px] max-w-7xl content-center gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-amber-200">
              <Crown className="h-4 w-4" aria-hidden="true" />
              قاعة المجد الرسمية
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
              أرشيف أبطال <bdi dir="ltr">{leagueName}</bdi>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
              هنا لا نعلّق على جولة عابرة؛ هنا نعلّق اللوحات. سجل للبطولات السابقة،
              للوصافة التي اقتربت ولم تلمس الكأس، وللمراكز الأخيرة التي دخلت التاريخ
              من الباب الجانبي.
            </p>
          </div>

          <div className="grid content-end gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-amber-200/25 bg-amber-200/10 p-4">
              <p className="text-sm font-bold text-amber-100">المواسم المؤرشفة</p>
              <p className="mt-2 text-4xl font-black text-white">{entries.length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm font-bold text-slate-300">أبطال مختلفون</p>
              <p className="mt-2 text-4xl font-black text-white">{championCount}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm font-bold text-slate-300">حالة الأرشيف</p>
              <p className="mt-2 text-2xl font-black text-white">{entries.length ? "مفتوح للجمهور" : "ينتظر أول بطل"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {featured ? (
          <article className="glass-card relative overflow-hidden rounded-lg p-5 sm:p-6">
            {featured.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_35%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-200/15 px-3 py-1 text-sm font-black text-amber-100">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  أحدث لوحة في القاعة
                </div>
                <p className="mt-5 text-sm font-bold text-amber-200">{featured.season}</p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-5xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-200">
                  {featured.description || "إدخال محفوظ في قاعة المجد بانتظار صياغة البيان الرسمي."}
                </p>
                <p className="mt-4 text-sm text-slate-400">أضيفت اللوحة: {dateLabel(featured.createdAt)}</p>
              </div>
              <div className="grid content-start gap-3">
                <HallMemberBadge
                  label="البطل المتوّج"
                  member={featured.winnerMemberId ? members.get(featured.winnerMemberId) : null}
                  fallback="بطل لم يتم ربطه بعضو"
                />
                <HallMemberBadge
                  label="الوصيف"
                  member={featured.runnerUpMemberId ? members.get(featured.runnerUpMemberId) : null}
                  fallback="وصيف غير محدد"
                  tone="slate"
                />
                <HallMemberBadge
                  label="حامل الفانوس التاريخي"
                  member={featured.lastPlaceMemberId ? members.get(featured.lastPlaceMemberId) : null}
                  fallback="المركز الأخير غير محدد"
                  tone="slate"
                />
                <EntryAwards entry={featured} members={members} />
              </div>
            </div>
          </article>
        ) : (
          <div className="glass-card rounded-lg p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-300/10 text-amber-200">
              <Trophy className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-3xl font-black text-white">القاعة تنتظر أول لوحة</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              عندما تُضاف البطولات من لوحة الأدمن ستظهر هنا كأرشيف رسمي للأبطال السابقين.
            </p>
          </div>
        )}

        {entries.length > 1 ? (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-200" aria-hidden="true" />
              <h2 className="text-2xl font-black text-white">سجل اللوحات السابقة</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entries.slice(1).map((entry) => (
                <article key={entry.id} className="glass-card rounded-lg p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-amber-200">{entry.season}</p>
                      <h3 className="mt-2 text-xl font-black leading-7 text-white">{entry.title}</h3>
                    </div>
                    <Medal className="h-7 w-7 shrink-0 text-amber-200" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {entry.description || "لوحة محفوظة بلا بيان طويل؛ الأرقام كانت كافية."}
                  </p>
                  <div className="mt-5 grid gap-2">
                    <HallMemberBadge
                      label="البطل"
                      member={entry.winnerMemberId ? members.get(entry.winnerMemberId) : null}
                      fallback="غير محدد"
                    />
                    {entry.runnerUpMemberId ? (
                      <HallMemberBadge label="الوصيف" member={members.get(entry.runnerUpMemberId)} tone="slate" />
                    ) : null}
                  </div>
                  <EntryAwards entry={entry} members={members} />
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {entries.length ? (
          <div className="rounded-lg border border-amber-200/20 bg-amber-200/10 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
              <p className="text-sm leading-7 text-amber-50">
                قاعة المجد لا تمحو المنافسة؛ هي فقط ترفع سقفها. من يريد اسمه هنا يعرف الطريق:
                موسم كامل، أعصاب ثابتة، وقرارات كابتن لا تحتاج لجنة تحقيق.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
