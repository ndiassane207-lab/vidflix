/**
 * Auth utilities — Edge-compatible (Web Crypto API)
 * No Node.js crypto, no external deps, no DB required.
 * Sessions stored as signed JWT-like tokens in HttpOnly cookies.
 * User accounts stored in a KV-style approach via signed token only
 * (stateless sessions: the user record is embedded in the session token).
 */

const SESSION_COOKIE = 'vidflix_session';
const SALT_ITERATIONS = 100_000;

// ── PBKDF2 password hashing ──────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = btoa(String.fromCharCode(...saltBytes));

  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: SALT_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return `pbkdf2:${SALT_ITERATIONS}:${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const expectedHash = parts[3];

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));

  // Constant-time compare
  if (hash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ── Session tokens (HMAC-signed) ─────────────────────────────────────────────

function getSecret(): string {
  return process.env.SESSION_SECRET || 'vidflix-default-secret-change-in-prod-32chars';
}

async function hmacSign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function hmacVerify(data: string, sig: string): Promise<boolean> {
  const expected = await hmacSign(data);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = btoa(JSON.stringify({ ...user, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
  const sig = await hmacSign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const valid = await hmacVerify(payload, sig);
    if (!valid) return null;
    const data = JSON.parse(atob(payload));
    if (data.exp < Date.now()) return null;
    return { id: data.id, email: data.email, username: data.username, createdAt: data.createdAt };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAge}`;
}

export function makeSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const maxAge = 30 * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getSessionTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

// ── Simple in-memory user store (edge-compatible, persists per instance) ─────
// For production scale use a DB. For Cloudflare Workers KV or D1, replace this.

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

// Global store (survives across requests in same worker instance)
declare global {
  // eslint-disable-next-line no-var
  var _vidflixUsers: Map<string, StoredUser> | undefined;
}
if (!globalThis._vidflixUsers) globalThis._vidflixUsers = new Map();
const USERS: Map<string, StoredUser> = globalThis._vidflixUsers;

export function findUserByEmail(email: string): StoredUser | undefined {
  const norm = email.toLowerCase().trim();
  for (const u of USERS.values()) {
    if (u.email === norm) return u;
  }
  return undefined;
}

export function findUserById(id: string): StoredUser | undefined {
  return USERS.get(id);
}

export function createUser(user: StoredUser): void {
  USERS.set(user.id, user);
}

export function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
