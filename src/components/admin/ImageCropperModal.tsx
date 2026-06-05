"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Focus, Image as ImageIcon, RotateCcw, X, ZoomIn } from "lucide-react";

type ImageCropperModalProps = {
  file: File;
  memberName: string;
  onCancel: () => void;
  onApply: (file: File) => Promise<void>;
};

type CropMode = "smart" | "fit" | "close";
type ImageSize = { height: number; width: number };
type DragState = { offsetX: number; offsetY: number; startX: number; startY: number } | null;

const DEFAULT_FRAME_SIZE = 320;
const EXPORT_SIZE = 720;

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
      0.92,
    );
  });
}

function modeZoom(mode: CropMode) {
  if (mode === "fit") return 1;
  if (mode === "close") return 1.28;
  return 1.08;
}

function baseScale(size: ImageSize, frameSize: number, mode: CropMode) {
  if (mode === "fit") {
    return Math.min(frameSize / size.width, frameSize / size.height);
  }

  return Math.max(frameSize / size.width, frameSize / size.height);
}

function imageRect(
  size: ImageSize,
  frameSize: number,
  mode: CropMode,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  const scale = baseScale(size, frameSize, mode) * zoom;
  const width = size.width * scale;
  const height = size.height * scale;

  return {
    height,
    width,
    x: frameSize / 2 + offsetX - width / 2,
    y: frameSize / 2 + offsetY - height / 2,
  };
}

function clampOffset(
  size: ImageSize,
  frameSize: number,
  mode: CropMode,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  if (mode === "fit") {
    return { offsetX: 0, offsetY: 0 };
  }

  const rect = imageRect(size, frameSize, mode, zoom, 0, 0);
  const maxX = Math.max(0, (rect.width - frameSize) / 2);
  const maxY = Math.max(0, (rect.height - frameSize) / 2);

  return {
    offsetX: clamp(offsetX, -maxX, maxX),
    offsetY: clamp(offsetY, -maxY, maxY),
  };
}

export function ImageCropperModal({
  file,
  memberName,
  onCancel,
  onApply,
}: ImageCropperModalProps) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const [mode, setMode] = useState<CropMode>("smart");
  const [zoom, setZoom] = useState(modeZoom("smart"));
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imageSizeState, setImageSizeState] = useState<ImageSize | null>(null);
  const [frameSize, setFrameSize] = useState(DEFAULT_FRAME_SIZE);
  const [drag, setDrag] = useState<DragState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const updateSize = () => {
      const nextSize = Math.round(element.getBoundingClientRect().width);
      if (nextSize > 0) {
        setFrameSize(nextSize);
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ignore = false;
    loadImage(previewUrl).then((image) => {
      if (!ignore) {
        setImageSizeState({ height: image.naturalHeight, width: image.naturalWidth });
      }
    });

    return () => {
      ignore = true;
    };
  }, [previewUrl]);

  const rect = imageSizeState
    ? imageRect(imageSizeState, frameSize, mode, zoom, offsetX, offsetY)
    : null;
  const fitRect = imageSizeState
    ? imageRect(imageSizeState, frameSize, "fit", 1, 0, 0)
    : null;

  function applyMode(nextMode: CropMode) {
    setMode(nextMode);
    setZoom(modeZoom(nextMode));
    setOffsetX(0);
    setOffsetY(nextMode === "smart" ? 8 : 0);
  }

  function updateZoom(nextZoom: number) {
    if (!imageSizeState) {
      setZoom(nextZoom);
      return;
    }

    const clampedZoom = clamp(nextZoom, 1, 2.6);
    const nextOffset = clampOffset(
      imageSizeState,
      frameSize,
      mode,
      clampedZoom,
      offsetX,
      offsetY,
    );
    setZoom(clampedZoom);
    setOffsetX(nextOffset.offsetX);
    setOffsetY(nextOffset.offsetY);
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!drag || !imageSizeState || mode === "fit") return;

    const nextOffset = clampOffset(
      imageSizeState,
      frameSize,
      mode,
      zoom,
      drag.offsetX + clientX - drag.startX,
      drag.offsetY + clientY - drag.startY,
    );

    setOffsetX(nextOffset.offsetX);
    setOffsetY(nextOffset.offsetY);
  }

  async function applyCrop() {
    setSaving(true);
    setError(null);
    try {
      const image = await loadImage(previewUrl);
      const size = { height: image.naturalHeight, width: image.naturalWidth };
      const canvas = document.createElement("canvas");
      canvas.height = EXPORT_SIZE;
      canvas.width = EXPORT_SIZE;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("تعذر تجهيز الصورة");
      }

      context.fillStyle = "#07111f";
      context.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

      if (mode === "fit") {
        const background = imageRect(size, EXPORT_SIZE, "smart", 1.1, 0, 0);
        context.filter = "blur(22px)";
        context.globalAlpha = 0.55;
        context.drawImage(image, background.x, background.y, background.width, background.height);
        context.filter = "none";
        context.globalAlpha = 1;
      }

      const scale = EXPORT_SIZE / frameSize;
      const exportRect = imageRect(
        size,
        EXPORT_SIZE,
        mode,
        zoom,
        offsetX * scale,
        offsetY * scale,
      );

      context.drawImage(image, exportRect.x, exportRect.y, exportRect.width, exportRect.height);
      const blob = await toJpegBlob(canvas);
      const safeName = file.name.replace(/\.[^.]+$/, "") || "member-image";
      await onApply(new File([blob], `${safeName}.jpg`, { type: "image/jpeg" }));
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "تعذر حفظ الصورة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="glass-card max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-200">ضبط صورة البروفايل</p>
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

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.92fr]">
          <div className="mx-auto w-full max-w-[320px]">
            <div
              ref={frameRef}
              className="relative mx-auto aspect-square w-full max-w-[320px] touch-none overflow-hidden rounded-full border border-amber-300/40 bg-slate-950 shadow-2xl"
              onPointerDown={(event) => {
                if (mode === "fit") return;
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
              onWheel={(event) => {
                event.preventDefault();
                updateZoom(zoom + (event.deltaY > 0 ? -0.05 : 0.05));
              }}
            >
              {mode === "fit" && fitRect ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
                  draggable={false}
                />
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                draggable={false}
                className="absolute max-w-none select-none"
                style={
                  rect
                    ? {
                        height: `${rect.height}px`,
                        transform: `translate(${rect.x}px, ${rect.y}px)`,
                        transformOrigin: "top left",
                        width: `${rect.width}px`,
                      }
                    : { height: "100%", objectFit: "cover", width: "100%" }
                }
              />
              <div className="pointer-events-none absolute inset-4 rounded-full border border-white/40" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(2,6,23,0.45)_61%)]" />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              اسحب الصورة داخل الدائرة، أو استخدم عجلة الماوس للتكبير والتصغير.
            </p>
          </div>

          <div className="grid content-start gap-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyMode("smart")}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-2 text-sm font-bold transition ${
                  mode === "smart"
                    ? "border-amber-300 bg-amber-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-amber-300/50 hover:text-amber-100"
                }`}
              >
                <Focus className="h-4 w-4" aria-hidden="true" />
                ذكي
              </button>
              <button
                type="button"
                onClick={() => applyMode("fit")}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-2 text-sm font-bold transition ${
                  mode === "fit"
                    ? "border-amber-300 bg-amber-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-amber-300/50 hover:text-amber-100"
                }`}
              >
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                كاملة
              </button>
              <button
                type="button"
                onClick={() => applyMode("close")}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-2 text-sm font-bold transition ${
                  mode === "close"
                    ? "border-amber-300 bg-amber-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-amber-300/50 hover:text-amber-100"
                }`}
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
                قريبة
              </button>
            </div>

            <label className="text-sm font-bold text-slate-200">
              حجم الصورة
              <input
                type="range"
                min="1"
                max="2.6"
                step="0.01"
                value={zoom}
                onChange={(event) => updateZoom(Number(event.target.value))}
                className="mt-3 w-full accent-amber-300"
              />
            </label>

            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-300">
              {mode === "fit"
                ? "الوضع الكامل يحافظ على الصورة كاملة ويملأ الخلفية بنسخة ناعمة منها."
                : "الوضع الحالي يملأ إطار البروفايل. حرّك الصورة حتى تكون أهم التفاصيل في المنتصف."}
            </div>

            {error ? (
              <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm font-bold leading-6 text-red-100">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={applyCrop}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-70"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                {saving ? "جاري الحفظ..." : "اعتماد الصورة"}
              </button>
              <button
                type="button"
                onClick={() => applyMode(mode)}
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
