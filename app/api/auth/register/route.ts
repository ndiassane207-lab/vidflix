import { NextRequest, NextResponse } from 'next/server';
import {
  hashPassword, createUser, findUserByEmail, generateId,
  createSessionToken, makeSessionCookie, type StoredUser,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; username?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }); }

  const email = (body.email || '').toLowerCase().trim();
  const password = (body.password || '').trim();
  const username = (body.username || '').trim();

  // Validation
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Mot de passe trop court (8 caractères min)' }, { status: 400 });
  }
  if (!username || username.length < 2) {
    return NextResponse.json({ error: 'Nom d\'utilisateur trop court (2 caractères min)' }, { status: 400 });
  }

  // Check existing
  if (findUserByEmail(email)) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
  }

  // Create user
  const passwordHash = await hashPassword(password);
  const user: StoredUser = {
    id: generateId(),
    email,
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  createUser(user);

  // Create session
  const token = await createSessionToken({ id: user.id, email: user.email, username: user.username, createdAt: user.createdAt });
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
  });
  res.headers.set('Set-Cookie', makeSessionCookie(token));
  return res;
}
