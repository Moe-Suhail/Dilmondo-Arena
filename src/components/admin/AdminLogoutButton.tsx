"use client";

import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 transition hover:border-rose-300/50 hover:text-rose-200"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      خروج
    </button>
  );
}
