'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <p className="text-sm text-gray-500">Logging out...</p>
    </div>
  );
}
