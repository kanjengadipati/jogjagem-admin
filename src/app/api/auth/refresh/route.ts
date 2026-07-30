import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export async function POST(req: NextRequest) {
  // Forward all cookies to the backend so it can read pleco_refresh_token + pleco_device_id
  const backendRes = await fetch(`${BACKEND}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: req.headers.get('cookie') || '' },
  }).catch(() => null);

  if (!backendRes || !backendRes.ok) {
    return NextResponse.json({ status: 'error', message: 'Refresh failed' }, { status: 401 });
  }

  const data = await backendRes.json().catch(() => ({}));
  
  const response = NextResponse.json({ status: 'success', data: data.data });

  // Forward the rotated pleco_refresh_token and pleco_device_id cookies from the backend
  // so the browser keeps the latest refresh token for the next rotation cycle.
  const setCookieHeaders = backendRes.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookieHeaders) {
    response.headers.append('Set-Cookie', cookie);
  }

  return response;
}
