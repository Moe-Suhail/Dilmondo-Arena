"use client";

import { FormEvent, useState } from "react";
import { Lock } from "lucide-react";

export function AdminLoginForm({ notice }: { notice: string | null }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "تعذر تسجيل الدخول");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form onSubmit={submit} className="glass-card w-full max-w-md rounded-lg p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-300/10 text-amber-200">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-black text-white">دخول المشرف</h1>
          <p className="text-sm text-slate-400">لوحة Dilmondo Arena</p>
        </div>
      </div>

      <label className="mt-6 block text-sm font-bold text-slate-200" htmlFor="password">
        كلمة المرور
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="input-field mt-2"
        autoComplete="current-password"
      />

      {notice ? <p className="mt-3 rounded-lg bg-amber-300/10 p-3 text-sm text-amber-100">{notice}</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}
