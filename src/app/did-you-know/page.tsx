import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { PublicNav } from "@/components/PublicNav";
import { StatusBanner } from "@/components/StatusBanner";
import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";

export default async function DidYouKnowPage() {
  const arena = await getArenaState();

  return (
    <main className="arena-shell min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-bold text-amber-200">حقائق مثبتة فقط</p>
          <h1 className="mt-2 text-4xl font-black text-white">هل تعلم؟</h1>
          <p className="mt-3 text-slate-300">
            لا توجد قصص مؤلفة هنا. كل سطر مبني على آخر نسخة FPL محفوظة.
          </p>
        </div>
        {arena.warning ? <StatusBanner tone="warning" title="تنبيه المزامنة" body={arena.warning} /> : null}
        {!arena.dataAvailable ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {arena.insights.didYouKnowFacts.map((fact) => (
              <div key={fact} className="glass-card rounded-lg p-5">
                <div className="flex gap-3">
                  <Sparkles className="mt-1 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
                  <p className="text-xl font-black leading-9 text-white">{fact}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
