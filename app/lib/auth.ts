import crypto from 'crypto';

const DEFAULT_PASSWORD = '135700';
const AUTH_COOKIE_NAME = 'orb_admin_token';
const TOKEN_MAX_AGE_DAYS = 30;

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD;
}

function getSecretKey(): string {
  // Use a combination of admin password and secret for HMAC key
  const baseKey = process.env.ADMIN_SECRET || getAdminPassword();
  return crypto.createHash('sha256').update(baseKey + '_orb_salt_2026').digest('hex');
}

export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  const currentPassword = getAdminPassword();
  return password.trim() === currentPassword;
}

export function createAdminToken(): string {
  const timestamp = Date.now().toString();
  const payload = `orb-admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');
  return `${timestamp}.${hmac}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, receivedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (30 days)
  const maxAgeMs = TOKEN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  const payload = `orb-admin:${timestampStr}`;
  const expectedHmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');

  // Constant time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export function getAuthTokenFromRequest(req: Request): string | null {
  // 1. Try Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Try cookie header
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith(`${AUTH_COOKIE_NAME}=`)) {
        return decodeURIComponent(c.substring(AUTH_COOKIE_NAME.length + 1).trim());
      }
    }
  }

  return null;
}

export function isAdminAuthenticated(req: Request): boolean {
  const token = getAuthTokenFromRequest(req);
  return verifyAdminToken(token);
}

export { AUTH_COOKIE_NAME };
