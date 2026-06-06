import Image from "next/image";
import { Crown, Gem, Medal, ScrollText, ShieldCheck, Trophy } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { PublicNav } from "@/components/PublicNav";
import { getStore } from "@/lib/storage";
import type { HallOfFameEntry, Member } from "@/lib/types";

export const dynamic = "force-dynamic";

function byId(members: Member[]) {
  return new Map(members.map((member) => [member.id, member]));
}

function getMember(members: Map<string, Member>, id: string | null) {
  return id ? members.get(id) ?? null : null;
}

function ChampionSeal({
  member,
  season,
}: {
  member: Member | null;
  season: string;
}) {
  return (
    <div className="hall-seal mx-auto">
      <div className="hall-seal-crown">
        <Crown className="h-6 w-6" aria-hidden="true" />
      </div>
      <Avatar
        name={member?.displayNameAr ?? "بطل الموسم"}
        imageUrl={member?.profileImageUrl}
        color={member?.customColor ?? "#f5c542"}
        size="xl"
      />
      <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-amber-200">
        Champion
      </p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
        {member?.displayNameAr ?? "بطل لم يتم تحديده"}
      </h2>
      {member?.nickname ? <p className="mt-1 text-sm text-slate-300">{member.nickname}</p> : null}
      <p className="mt-3 inline-flex rounded-full border border-amber-200/35 bg-amber-200/10 px-3 py-1 text-sm font-bold text-amber-100">
        {season}
      </p>
    </div>
  );
}

function AwardRibbons({
  entry,
  members,
}: {
  entry: HallOfFameEntry;
  members: Map<string, Member>;
}) {
  if (!entry.awardsPayload.length) return null;

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {entry.awardsPayload.map((award, index) => {
        const member = getMember(members, award.memberId);
        return (
          <div key={`${award.title}-${index}`} className="hall-ribbon">
            <Gem className="h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-black text-white">{award.title || "وسام الموسم"}</p>
              {member ? <p className="mt-1 text-sm font-bold text-amber-100">{member.displayNameAr}</p> : null}
              {award.note ? <p className="mt-2 text-sm leading-6 text-slate-300">{award.note}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RunnerUpLine({
  member,
}: {
  member: Member | null;
}) {
  if (!member) return null;

  return (
    <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
      <Medal className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
      <span className="truncate text-sm text-slate-300">
        الوصيف: <strong className="text-white">{member.displayNameAr}</strong>
      </span>
    </div>
  );
}

function EmptyHall() {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-amber-200/20 bg-white/[0.04] p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-200/30 bg-amber-200/10 text-amber-200">
        <Trophy className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-3xl font-black text-white">القاعة تنتظر أول لوحة</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        أضف أول موسم من لوحة الأدمن، وستتحول هذه الصفحة إلى أرشيف رسمي للأبطال.
      </p>
    </div>
  );
}

export default async function HallOfFamePage() {
  const store = await getStore();
  const entries = [...store.hallOfFame].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const members = byId(store.members);
  const featured = entries[0] ?? null;
  const featuredChampion = featured ? getMember(members, featured.winnerMemberId) : null;
  const leagueName = store.leagueSettings.leagueName.replace("🏆", "").trim() || "Dilmondo";

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />

      <section
        className="relative overflow-hidden border-b border-white/10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5,7,18,0.72), rgba(5,7,18,0.94)), url('/images/arena-hero.png')",
        }}
      >
        <div className="mx-auto flex min-h-[520px] max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-amber-200/40 bg-slate-950 shadow-2xl shadow-black/40">
            <Image
              src="/images/dilmondo-logo.png"
              alt=""
              fill
              sizes="96px"
              className="object-cover"
              priority
            />
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-black text-amber-200">
            <Crown className="h-4 w-4" aria-hidden="true" />
            قاعة المجد
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight text-white sm:text-6xl">
            سجل أبطال <bdi dir="ltr">{leagueName}</bdi>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            صفحة التتويج الرسمية: لا ازدحام ولا أرقام جانبية، فقط أسماء صنعت الموسم
            ولوحات تبقى شاهدة على من رفع الكأس.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {featured ? (
          <article className="hall-plaque relative overflow-hidden rounded-lg p-5 sm:p-8">
            {featured.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-[0.16]"
              />
            ) : null}
            <div className="relative grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
              <ChampionSeal member={featuredChampion} season={featured.season} />

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-200/[0.12] px-3 py-1 text-sm font-black text-amber-100">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  لوحة البطل
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">
                  {featured.description || "موسم دخل الأرشيف من غير حاجة لخطاب طويل؛ اسم البطل يكفي."}
                </p>
                <RunnerUpLine member={getMember(members, featured.runnerUpMemberId)} />
                <AwardRibbons entry={featured} members={members} />
              </div>
            </div>
          </article>
        ) : (
          <EmptyHall />
        )}

        {entries.length > 1 ? (
          <section className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-amber-200" aria-hidden="true" />
              <h2 className="text-2xl font-black text-white">اللوحات السابقة</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entries.slice(1).map((entry) => {
                const champion = getMember(members, entry.winnerMemberId);
                const runnerUp = getMember(members, entry.runnerUpMemberId);
                return (
                  <article key={entry.id} className="hall-archive-card rounded-lg p-5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={champion?.displayNameAr ?? "بطل الموسم"}
                        imageUrl={champion?.profileImageUrl}
                        color={champion?.customColor ?? "#f5c542"}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-amber-200">{entry.season}</p>
                        <h3 className="truncate text-lg font-black text-white">
                          {champion?.displayNameAr ?? "بطل غير محدد"}
                        </h3>
                      </div>
                    </div>
                    <h4 className="mt-5 text-xl font-black leading-7 text-white">{entry.title}</h4>
                    <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-300">
                      {entry.description || "لوحة محفوظة في الأرشيف الرسمي."}
                    </p>
                    {runnerUp ? (
                      <p className="mt-4 border-t border-white/10 pt-3 text-sm text-slate-400">
                        الوصيف: <span className="font-bold text-slate-200">{runnerUp.displayNameAr}</span>
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {entries.length ? (
          <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
              <p className="text-sm leading-7 text-slate-200">
                الدخول إلى هذه القاعة لا يُمنح بالمجاملة. موسم كامل، قرارات ثابتة،
                وكأس يضع الاسم في مكانه الطبيعي.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
