import Link from "next/link";
import { BarChart3, Crown, Megaphone, MessageSquareText, Settings, Users } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { requireAdmin } from "@/lib/auth";

const links = [
  { href: "/admin", label: "الرئيسية", icon: BarChart3 },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/members", label: "الأعضاء", icon: Users },
  { href: "/admin/banter", label: "القوالب", icon: MessageSquareText },
  { href: "/admin/hall-of-fame", label: "قاعة المجد", icon: Crown },
  { href: "/admin/announcement", label: "الإعلان", icon: Megaphone },
];

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
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
