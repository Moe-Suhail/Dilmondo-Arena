import { AdminMembersManager } from "@/components/admin/AdminMembersManager";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const store = await getStore();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-amber-200">Members Management</p>
        <h1 className="mt-2 text-4xl font-black text-white">إدارة الأعضاء</h1>
        <p className="mt-3 text-slate-300">
          حقول FPL تتحدث من المزامنة، وحقول الهوية المحلية قابلة للتعديل هنا.
        </p>
      </div>
      <AdminMembersManager initialMembers={store.members} />
    </div>
  );
}
