'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon, Link2 } from 'lucide-react';

interface CoverImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  aspectClassName?: string;
}

export default function CoverImageUpload({
  value,
  onChange,
  label = 'Cover Image',
  folder = 'explore-jogja/articles',
  aspectClassName = 'aspect-[16/7]',
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value ?? '');

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // 1. Get signed params from our API
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
      const sig = await sigRes.json() as {
        signature: string;
        timestamp: number;
        api_key: string;
        cloud_name: string;
        folder: string;
        upload_url: string;
      };

      // 2. Upload directly to Cloudinary
      const form = new FormData();
      form.append('file', file);
      form.append('signature', sig.signature);
      form.append('timestamp', String(sig.timestamp));
      form.append('api_key', sig.api_key);
      form.append('folder', sig.folder);

      const uploadRes = await fetch(sig.upload_url, { method: 'POST', body: form });
      if (!uploadRes.ok) throw new Error('Upload failed');

      const data = await uploadRes.json() as { secure_url: string };
      onChange(data.secure_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function applyUrl() {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
  }

  function clear() {
    onChange('');
    setUrlInput('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </label>

      {/* Tab switch */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['upload', 'url'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'upload' ? <Upload className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
            {t === 'upload' ? 'Upload' : 'URL'}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl transition cursor-pointer ${
            uploading
              ? 'border-primary/40 bg-primary/5'
              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
          }`}
        >
          {value ? (
            /* Preview */
            <div className={`relative w-full ${aspectClassName} rounded-xl overflow-hidden`}>
              <Image
                src={value}
                alt="Cover preview"
                fill
                className="object-cover"
                sizes="600px"
                unoptimized={value.startsWith('/')}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg">
                  Click to replace
                </span>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); clear(); }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-xs font-medium text-gray-500">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">
                    Drop image here or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-[10px] text-gray-400">PNG, JPG, WEBP — max 10MB</p>
                </>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyUrl()}
            placeholder="https://res.cloudinary.com/..."
            className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
          >
            Apply
          </button>
          {value && (
            <button
              type="button"
              onClick={clear}
              className="px-3 py-2.5 rounded-xl border border-border text-gray-500 hover:bg-gray-50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* URL preview for tab=url */}
      {tab === 'url' && value && (
        <div className={`relative w-full ${aspectClassName} rounded-xl overflow-hidden border border-border`}>
          <Image
            src={value}
            alt="Cover preview"
            fill
            className="object-cover"
            sizes="600px"
            unoptimized={value.startsWith('/')}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
