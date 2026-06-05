"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

function cleanWhatsappText(value: string) {
  return value
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u200D\uFE0E\uFE0F]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.insetInlineStart = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const cleanText = useMemo(() => cleanWhatsappText(text), [text]);
  const whatsappUrl = useMemo(
    () => `https://wa.me/?text=${encodeURIComponent(cleanText)}`,
    [cleanText],
  );

  async function copy() {
    try {
      await copyText(cleanText);
      setCopied(true);
      setFailed(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 2200);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-400 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        واتساب
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-amber-300/50 hover:text-amber-200"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {failed ? "تعذر النسخ" : copied ? "تم النسخ" : "نسخ"}
      </button>
    </div>
  );
}
