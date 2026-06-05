import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Gauge,
  Home,
  Sparkles,
} from "lucide-react";

const links = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/standings", label: "الترتيب", icon: BarChart3 },
  { href: "/gameweek", label: "تقرير الجولة", icon: Gauge },
  { href: "/fixtures", label: "المباريات", icon: CalendarDays },
  { href: "/did-you-know", label: "هل تعلم؟", icon: Sparkles },
];

export function PublicNav() {
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
              <span className="block text-lg font-black text-white">ساحة Dilmondo</span>
              <span className="block text-xs text-slate-400">Family FPL Arena</span>
            </span>
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-slate-200 transition hover:border-amber-300/50 hover:bg-amber-300/10 hover:text-amber-100"
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
