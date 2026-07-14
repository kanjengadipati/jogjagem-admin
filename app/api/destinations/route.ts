import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
  
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081";
  
  const res = await fetch(`${BACKEND_URL}/destinations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
