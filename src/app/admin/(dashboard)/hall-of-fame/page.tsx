import { AdminHallManager } from "@/components/admin/AdminHallManager";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminHallOfFamePage() {
  const store = await getStore();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-amber-200">Hall of Fame</p>
        <h1 className="mt-2 text-4xl font-black text-white">إدارة قاعة المجد</h1>
      </div>
      <AdminHallManager initialEntries={store.hallOfFame} members={store.members} />
    </div>
  );
}
