import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
  
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  
  const res = await fetch(`${NEXT_PUBLIC_API_BASE}/destinations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
