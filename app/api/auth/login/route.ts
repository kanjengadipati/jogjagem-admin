import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081";

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, device_name: "explore-jogja-admin" }),
    });
    
    const data = await res.json();
    
    const response = NextResponse.json(data);
    if (res.status === 200 && data?.data?.access_token) {
      response.cookies.set('admin_token', data.data.access_token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 24h
        sameSite: 'lax',
      });
    }
    
    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}
