"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Maximize2, Minimize2, RotateCcw, X } from "lucide-react";

type ImageCropperModalProps = {
  file: File;
  memberName: string;
  onCancel: () => void;
  onApply: (file: File) => Promise<void>;
};

type CropMode = "contain" | "cover";
type DragState = { startX: number; startY: number; offsetX: number; offsetY: number } | null;

const EXPORT_SIZE = 640;
const PREVIEW_SIZE = 288;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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

function getDrawRect(
  imageWidth: number,
  imageHeight: number,
  frameSize: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
  mode: CropMode,
) {
  const baseScale =
    mode === "cover"
      ? Math.max(frameSize / imageWidth, frameSize / imageHeight)
      : Math.min(frameSize / imageWidth, frameSize / imageHeight);
  const scale = baseScale * zoom;
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const maxOffsetX = Math.abs(width - frameSize) / 2;
  const maxOffsetY = Math.abs(height - frameSize) / 2;

  return {
    height,
    width,
    x: (frameSize - width) / 2 + (offsetX / 100) * maxOffsetX,
    y: (frameSize - height) / 2 + (offsetY / 100) * maxOffsetY,
  };
}

export function ImageCropperModal({
  file,
  memberName,
  onCancel,
  onApply,
}: ImageCropperModalProps) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const [mode, setMode] = useState<CropMode>("contain");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  useEffect(() => {
    let ignore = false;
    loadImage(previewUrl).then((image) => {
      if (!ignore) {
        setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
      }
    });

    return () => {
      ignore = true;
    };
  }, [previewUrl]);

  const previewRect = imageSize
    ? getDrawRect(
        imageSize.width,
        imageSize.height,
        PREVIEW_SIZE,
        zoom,
        offsetX,
        offsetY,
        mode,
      )
    : null;

  function resetCrop(nextMode = mode) {
    setMode(nextMode);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!drag) {
      return;
    }

    setOffsetX(clamp(drag.offsetX + ((clientX - drag.startX) / PREVIEW_SIZE) * 200, -100, 100));
    setOffsetY(clamp(drag.offsetY + ((clientY - drag.startY) / PREVIEW_SIZE) * 200, -100, 100));
  }

  async function applyCrop() {
    setSaving(true);
    try {
      const image = await loadImage(previewUrl);
      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_SIZE;
      canvas.height = EXPORT_SIZE;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("تعذر تجهيز الصورة");
      }

      context.fillStyle = "#0f172a";
      context.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

      const rect = getDrawRect(
        image.naturalWidth,
        image.naturalHeight,
        EXPORT_SIZE,
        zoom,
        offsetX,
        offsetY,
        mode,
      );

      context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
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
            <div
              className="relative mx-auto aspect-square w-72 max-w-full touch-none overflow-hidden rounded-full border border-amber-300/35 bg-slate-950 shadow-2xl"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDrag({
                  offsetX,
                  offsetY,
                  startX: event.clientX,
                  startY: event.clientY,
                });
              }}
              onPointerMove={(event) => moveDrag(event.clientX, event.clientY)}
              onPointerUp={() => setDrag(null)}
              onPointerCancel={() => setDrag(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                draggable={false}
                className="absolute select-none"
                style={
                  previewRect
                    ? {
                        height: `${previewRect.height}px`,
                        transform: `translate(${previewRect.x}px, ${previewRect.y}px)`,
                        transformOrigin: "top left",
                        width: `${previewRect.width}px`,
                      }
                    : {
                        height: "100%",
                        inset: 0,
                        objectFit: "contain",
                        width: "100%",
                      }
                }
              />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              المعاينة النهائية للصورة داخل دوائر الموقع.
            </p>
          </div>

          <div className="grid content-start gap-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => resetCrop("contain")}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                  mode === "contain"
                    ? "border-amber-300 bg-amber-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-amber-300/50 hover:text-amber-100"
                }`}
              >
                <Minimize2 className="h-4 w-4" aria-hidden="true" />
                الصورة كاملة
              </button>
              <button
                type="button"
                onClick={() => resetCrop("cover")}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                  mode === "cover"
                    ? "border-amber-300 bg-amber-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-amber-300/50 hover:text-amber-100"
                }`}
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                ملء الدائرة
              </button>
            </div>
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
                onClick={() => resetCrop()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:border-amber-300/50 hover:text-amber-200"
                aria-label="إعادة الضبط"
                title="إعادة الضبط"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
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
