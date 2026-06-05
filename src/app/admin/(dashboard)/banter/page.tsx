import { AdminBanterManager } from "@/components/admin/AdminBanterManager";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminBanterPage() {
  const store = await getStore();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-amber-200">Banter Templates</p>
        <h1 className="mt-2 text-4xl font-black text-white">قوالب المزاح</h1>
        <p className="mt-3 text-slate-300">كل قالب يجب أن يبقى عائلياً ومرتبطاً بشرط رقمي واضح.</p>
      </div>
      <AdminBanterManager initialTemplates={store.banterTemplates} />
    </div>
  );
}
