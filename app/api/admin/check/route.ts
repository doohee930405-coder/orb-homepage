import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '../../../lib/auth';

export async function GET(req: Request) {
  const authenticated = isAdminAuthenticated(req);
  return NextResponse.json({ authenticated });
}
