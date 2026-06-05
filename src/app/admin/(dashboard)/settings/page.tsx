import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { getArenaState } from "@/lib/arena";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const arena = await getArenaState({ syncIfEmpty: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-amber-200">League Settings</p>
        <h1 className="mt-2 text-4xl font-black text-white">إعدادات الدوري</h1>
      </div>
      <AdminSettingsForm initialSettings={arena.settings} storageMode={arena.storageMode} />
    </div>
  );
}
