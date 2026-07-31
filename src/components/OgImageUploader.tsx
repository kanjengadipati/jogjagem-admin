"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Download } from "lucide-react";

interface OgImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function OgImageUploader({ value, onChange }: OgImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kompresi gambar di client-side menggunakan HTML5 Canvas
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Target ideal OG Image: 1200x630
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 630;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert ke JPEG dengan kualitas 0.8 (dikompres padat)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Canvas toBlob failed"));
              }
            },
            "image/jpeg",
            0.75
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      };
      reader.onerror = () => reject(new Error("FileReader error"));
    });
  };

  // Convert blob to Data URL (base64)
  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError("");

      // 1. Kompres gambar (1200x630, JPEG 75% quality agar sangat ringan < 50KB)
      const compressedBlob = await compressImage(file);

      // 2. Convert langsung ke Base64 Data URL
      const dataUrl = await blobToDataURL(compressedBlob);

      onChange(dataUrl);
    } catch (err: any) {
      setError(err.message || "Failed to process image");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Download gambar dari URL publik di server, kompres 1200x630 JPEG, simpan sebagai Base64
  const handleDownloadFromUrl = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      setUrlLoading(true);
      setError("");

      const res = await fetch("/api/og-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to download image");
      }

      onChange(data.dataUrl as string);
    } catch (err: any) {
      setError(err.message || "Failed to download image");
    } finally {
      setUrlLoading(false);
    }
  };

  const isUrl = value.startsWith("http://") || value.startsWith("https://");
  const isDataUrl = value.startsWith("data:image");

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
        OG Image (Compressed 1200x630 JPEG)
      </label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden aspect-video border border-border group bg-black/5">
          <img src={value} alt="OG Image Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-gray-400 bg-bg hover:bg-white rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="text-xs font-semibold">Compressing & Uploading locally...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-accent/10 flex items-center justify-center mb-2 transition-colors">
                <Upload className="w-5 h-5 text-gray-500 group-hover:text-accent" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Click to upload & compress OG Image</p>
              <p className="text-[10px] text-gray-400 mt-1">Automatically resized to 1200x630 JPEG (Max 80% quality)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 shrink-0">Or enter external URL:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full bg-bg focus:bg-white text-xs px-3 py-1.5 rounded-lg border border-transparent focus:border-border outline-none font-medium text-gray-600"
        />
        {isUrl && (
          <button
            type="button"
            onClick={handleDownloadFromUrl}
            disabled={urlLoading}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            title="Download, compress, and store as Base64 like manual upload"
          >
            {urlLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {urlLoading ? "Downloading..." : "Download & compress"}
          </button>
        )}
      </div>
      {isDataUrl && (
        <p className="text-[10px] text-emerald-600 font-medium">
          Stored as compressed Base64 (1200x630 JPEG) — same as manual upload.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
