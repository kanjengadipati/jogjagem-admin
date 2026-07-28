export interface JwtPayload {
  user_id?: number;
  role?: string;
  exp?: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    return JSON.parse(Buffer.from(base64, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}
