"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ZoomIn } from "lucide-react";
import { AD_PLACEMENTS } from "@/lib/adPlacements";

/**
 * Target dimensions per ad / house-ad placement.
 *
 * Aspect ratio is enforced by CROPPING (not "contain"-style downscale like
 * OgImageUploader does). The stored image always matches exactly what the
 * fixed aspect-ratio slot on the page will show, so the runtime
 * `object-fit: cover` in AdBanner.tsx / HouseAd.tsx never has to guess.
 *
 * Specs come from src/lib/adPlacements.ts (single source of truth).
 */
const PLACEMENT_SPECS: Record<string, { width: number; height: number; label: string }> =
  Object.fromEntries(
    Object.entries(AD_PLACEMENTS).map(([key, info]) => [key, info.imageSpec])
  );

/** Same quality standard as OgImageUploader.tsx — keeps files well under 50KB */
const JPEG_QUALITY = 0.75;

export interface AdImageUploaderProps {
  placement: string;
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}

export default function AdImageUploader({
  placement,
  value,
  onChange,
  label,
}: AdImageUploaderProps) {
  const spec = PLACEMENT_SPECS[placement] ?? { width: 1200, height: 400, label: "custom" };
  const [rawImage, setRawImage] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0.5, y: 0.5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  /* ─── File pick ─────────────────────────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImage(ev.target?.result as string);
      setZoom(1);
      setOffset({ x: 0.5, y: 0.5 });
    };
    reader.onerror = () => setError("Gagal membaca file.");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ─── Drag-to-pan ───────────────────────────────────────────────── */
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !previewRef.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    const rect = previewRef.current.getBoundingClientRect();
    setOffset((prev) => ({
      x: Math.min(1, Math.max(0, prev.x - dx / rect.width / zoom)),
      y: Math.min(1, Math.max(0, prev.y - dy / rect.height / zoom)),
    }));
  }, [zoom]);

  const handleMouseUp = () => { dragging.current = false; };

  /* ─── Canvas crop + compress ────────────────────────────────────── */
  const confirmCrop = useCallback(() => {
    const img = imgElRef.current;
    if (!img) return;
    setLoading(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = spec.width;
      canvas.height = spec.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const targetRatio = spec.width / spec.height;
      const srcRatio = img.naturalWidth / img.naturalHeight;

      let cropW: number, cropH: number;
      if (srcRatio > targetRatio) {
        cropH = img.naturalHeight;
        cropW = cropH * targetRatio;
      } else {
        cropW = img.naturalWidth;
        cropH = cropW / targetRatio;
      }
      cropW /= zoom;
      cropH /= zoom;

      const maxX = img.naturalWidth - cropW;
      const maxY = img.naturalHeight - cropH;
      const srcX = Math.min(Math.max(offset.x * img.naturalWidth - cropW / 2, 0), maxX);
      const srcY = Math.min(Math.max(offset.y * img.naturalHeight - cropH / 2, 0), maxY);

      ctx.drawImage(img, srcX, srcY, cropW, cropH, 0, 0, spec.width, spec.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Gagal memproses gambar.");
            setLoading(false);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            onChange(reader.result as string);
            setRawImage("");
            setLoading(false);
          };
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memproses gambar.");
      setLoading(false);
    }
  }, [spec, zoom, offset, onChange]);

  /* ─── Derived ───────────────────────────────────────────────────── */
  const aspectStyle: React.CSSProperties = { aspectRatio: `${spec.width} / ${spec.height}` };
  const displayLabel = label ?? `Gambar iklan — ${spec.label} (JPEG, dikompres otomatis)`;

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {displayLabel}
      </p>

      {rawImage ? (
        <div className="space-y-3">
          <div
            ref={previewRef}
            className="relative rounded-xl overflow-hidden border border-gray-200 bg-black cursor-grab active:cursor-grabbing select-none"
            style={aspectStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgElRef}
              src={rawImage}
              alt="Crop preview"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                objectPosition: `${offset.x * 100}% ${offset.y * 100}%`,
                transform: `scale(${zoom})`,
                transformOrigin: `${offset.x * 100}% ${offset.y * 100}%`,
              }}
            />
            {/* Rule-of-thirds grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)
                `,
                backgroundSize: "33.33% 33.33%",
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <span className="text-[10px] text-gray-400 w-8 text-right">{zoom.toFixed(1)}×</span>
          </div>

          <p className="text-[10px] text-gray-400">
            Drag untuk menggeser · Hasil akhir {spec.width}×{spec.height}px JPEG
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmCrop}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? "Memproses…" : "Gunakan crop ini"}
            </button>
            <button
              type="button"
              onClick={() => { setRawImage(""); setError(""); }}
              className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ) : value ? (
        <div
          className="relative rounded-xl overflow-hidden border border-gray-200 group bg-black/5"
          style={aspectStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Ad image preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-xs font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Hapus gambar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-white rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all text-center group p-6"
          style={aspectStyle}
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center mb-2 transition-colors">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
          </div>
          <p className="text-xs font-semibold text-gray-600">Klik untuk upload gambar</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Akan di-crop ke {spec.width}:{spec.height} sebelum disimpan
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">PNG · JPG · WebP · maks 10MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500">
          <span className="font-bold mr-1">!</span>{error}
        </p>
      )}
    </div>
  );
}
