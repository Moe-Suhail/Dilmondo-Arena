"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Crown, Megaphone, MessageSquareText, Settings, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "الرئيسية", icon: BarChart3 },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/members", label: "الأعضاء", icon: Users },
  { href: "/admin/banter", label: "القوالب", icon: MessageSquareText },
  { href: "/admin/hall-of-fame", label: "قاعة المجد", icon: Crown },
  { href: "/admin/announcement", label: "الإعلان", icon: Megaphone },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="تبويبات لوحة التحكم" className="flex gap-2 overflow-x-auto pb-1">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
              active
                ? "border-amber-200/70 bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/25 hover:bg-amber-200"
                : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-amber-300/50 hover:text-amber-200"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
