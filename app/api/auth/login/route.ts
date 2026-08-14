import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPassword, findUserByEmail,
  createSessionToken, makeSessionCookie,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }); }

  const email = (body.email || '').toLowerCase().trim();
  const password = (body.password || '').trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const user = findUserByEmail(email);
  // Same error for unknown user and wrong password (constant-time)
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  const token = await createSessionToken({ id: user.id, email: user.email, username: user.username, createdAt: user.createdAt });
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
  });
  res.headers.set('Set-Cookie', makeSessionCookie(token));
  return res;
}
