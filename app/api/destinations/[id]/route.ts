import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  const res = await fetch(`${BACKEND_URL}/destinations/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  const res = await fetch(`${BACKEND_URL}/destinations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
