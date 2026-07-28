import React, { useState } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function SocialLoginButtons({ onError, onSuccess }: { onError?: (msg: string) => void; onSuccess?: () => void }) {
  const [loading, setLoading] = useState<'google' | null>(null);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) return;

    // Use OAuth redirect flow
    const redirectUri = window.location.origin + window.location.pathname;
    const nonce = Math.random().toString(36).substring(2);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}&prompt=select_account`;
    window.location.href = googleAuthUrl;
  };

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-stone-400">Atau masuk dengan</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50 transition-all"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading === 'google' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
        ) : (
          'Google'
        )}
      </button>
    </div>
  );
}
