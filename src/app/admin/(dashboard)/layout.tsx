import Link from "next/link";

import { AdminDashboardNav } from "@/components/admin/AdminDashboardNav";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <main className="arena-shell min-h-screen">
      <header className="border-b border-white/10 bg-[#050712]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin" className="text-xl font-black text-white">
              لوحة Dilmondo Arena
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex h-10 items-center rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200">
                الموقع
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
          <AdminDashboardNav />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
