'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Mail, Lock, ArrowRight } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && token.length > 10) {
      document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-gray-800 bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] border border-gray-200 shadow-xl space-y-8 relative overflow-hidden">
        
        <div className="text-center space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5E3C] to-[#B68D40] flex items-center justify-center text-white mx-auto shadow-lg shadow-[#8B5E3C]/10">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-[#8B5E3C]">EXPLORE JOGJA</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-0.5">Ecosystem Operations Console</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#8B5E3C]/5 border border-[#8B5E3C]/10 text-center space-y-1 relative z-10">
          <p className="text-xs font-bold text-[#8B5E3C]">Authorized Operator Access Only</p>
          <p className="text-[10px] text-gray-500 leading-normal">Use your Jogjagem admin credentials to log in.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-center relative z-10">
            <p className="text-xs font-semibold text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block">Operator Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full bg-gray-50 focus:bg-white text-xs pl-10 pr-4 py-3.5 rounded-xl border border-transparent focus:border-gray-200 outline-none transition duration-200 font-medium" 
                placeholder="admin@mail.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full bg-gray-50 focus:bg-white text-xs pl-10 pr-4 py-3.5 rounded-xl border border-transparent focus:border-gray-200 outline-none transition duration-200 font-medium" 
                placeholder="Password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#8B5E3C] hover:bg-[#6e4a2e] text-white py-3.5 rounded-xl text-xs font-semibold shadow-lg shadow-[#8B5E3C]/20 transition duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Authenticate Account'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 relative z-10">
          <p className="text-[10px] text-gray-400 font-mono">Jogjagem Tourism Platform · v3.5.0-v6</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg"><p>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
