import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest, verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = getSessionTokenFromRequest(req);
  if (!token) return NextResponse.json({ authorized: false }, { status: 401 });

  const user = await verifySessionToken(token);
  if (!user) return NextResponse.json({ authorized: false }, { status: 401 });

  return NextResponse.json({ authorized: true, user });
}
