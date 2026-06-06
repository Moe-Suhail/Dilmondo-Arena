"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Crown,
  Gauge,
  Home,
  Sparkles,
} from "lucide-react";

const links = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/standings", label: "الترتيب", icon: BarChart3 },
  { href: "/gameweek", label: "تقرير الجولة", icon: Gauge },
  { href: "/fixtures", label: "المباريات", icon: CalendarDays },
  { href: "/hall-of-fame", label: "قاعة المجد", icon: Crown },
  { href: "/did-you-know", label: "هل تعلم؟", icon: Sparkles },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050712]/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-lg border border-amber-300/35 bg-slate-950 shadow-lg">
              <Image
                src="/images/dilmondo-logo.png"
                alt=""
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </span>
            <span>
              <span className="block text-lg font-black text-white">
                ساحة <bdi dir="ltr">Dilmondo</bdi>
              </span>
              <span className="block text-xs text-slate-400">Family FPL Arena</span>
            </span>
          </Link>
        </div>
        <nav aria-label="صفحات الموقع" className="grid grid-cols-2 gap-2 pb-1 min-[360px]:grid-cols-3 sm:flex sm:flex-wrap">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-bold transition sm:px-3 sm:text-sm ${
                  active
                    ? "border-amber-200/70 bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/25 hover:bg-amber-200"
                    : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-amber-300/50 hover:bg-amber-300/10 hover:text-amber-100"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
