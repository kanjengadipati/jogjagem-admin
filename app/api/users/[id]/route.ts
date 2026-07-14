import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_token')?.value;
}

const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${NEXT_PUBLIC_API_BASE}/auth/admin/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${NEXT_PUBLIC_API_BASE}/auth/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
