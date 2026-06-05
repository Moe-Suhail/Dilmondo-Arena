"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";

type ImageCropperModalProps = {
  file: File;
  memberName: string;
  onCancel: () => void;
  onApply: (file: File) => Promise<void>;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function toJpegBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("تعذر تجهيز الصورة"));
      },
      "image/jpeg",
      0.9,
    );
  });
}

export function ImageCropperModal({
  file,
  memberName,
  onCancel,
  onApply,
}: ImageCropperModalProps) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const [zoom, setZoom] = useState(1.15);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  async function applyCrop() {
    setSaving(true);
    try {
      const image = await loadImage(previewUrl);
      const size = 640;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("تعذر تجهيز الصورة");
      }

      context.fillStyle = "#0f172a";
      context.fillRect(0, 0, size, size);

      const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
      const scale = baseScale * zoom;
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const maxOffsetX = Math.max(0, (width - size) / 2);
      const maxOffsetY = Math.max(0, (height - size) / 2);
      const drawX = (size - width) / 2 + (offsetX / 100) * maxOffsetX;
      const drawY = (size - height) / 2 + (offsetY / 100) * maxOffsetY;

      context.drawImage(image, drawX, drawY, width, height);
      const blob = await toJpegBlob(canvas);
      const safeName = file.name.replace(/\.[^.]+$/, "") || "member-image";
      await onApply(new File([blob], `${safeName}.jpg`, { type: "image/jpeg" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="glass-card max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-200">ضبط صورة العضو</p>
            <h2 className="mt-1 text-2xl font-black text-white">{memberName}</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-72">
            <div className="aspect-square overflow-hidden rounded-full border border-amber-300/35 bg-slate-950 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  transform: `translate(${offsetX / 3}%, ${offsetY / 3}%) scale(${zoom})`,
                  transformOrigin: "center",
                }}
              />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              هذا الشكل هو الذي سيظهر داخل الدوائر في الموقع.
            </p>
          </div>

          <div className="grid content-start gap-4">
            <label className="text-sm font-bold text-slate-200">
              التكبير
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-3 w-full accent-amber-300"
              />
            </label>
            <label className="text-sm font-bold text-slate-200">
              تحريك أفقي
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={offsetX}
                onChange={(event) => setOffsetX(Number(event.target.value))}
                className="mt-3 w-full accent-amber-300"
              />
            </label>
            <label className="text-sm font-bold text-slate-200">
              تحريك رأسي
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={offsetY}
                onChange={(event) => setOffsetY(Number(event.target.value))}
                className="mt-3 w-full accent-amber-300"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={applyCrop}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-70"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                {saving ? "جاري الحفظ..." : "حفظ الصورة"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 items-center rounded-lg border border-white/10 px-4 text-sm font-bold text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
