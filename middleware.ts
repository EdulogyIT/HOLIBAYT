import { NextRequest, NextResponse } from 'next/server';

// Cache maintenance status for 10 seconds to reduce DB calls
let maintenanceCache: { status: boolean; timestamp: number } | null = null;
const CACHE_TTL = 10000; // 10 seconds

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|maintenance.html|holibayt-logo.*|robots.txt).*)',
  ],
};

async function checkMaintenanceStatus(): Promise<boolean> {
  // Check cache first
  if (maintenanceCache && Date.now() - maintenanceCache.timestamp < CACHE_TTL) {
    return maintenanceCache.status;
  }

  try {
    const SUPABASE_URL = 'https://vsruezynaanqprobpvrr.supabase.co';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not found');
      return false;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/platform_settings?setting_key=eq.general_settings&select=setting_value`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch maintenance status:', response.statusText);
      return false;
    }

    const data = await response.json();
    const maintenanceMode = data[0]?.setting_value?.maintenance_mode || false;

    // Update cache
    maintenanceCache = {
      status: maintenanceMode,
      timestamp: Date.now(),
    };

    return maintenanceMode;
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    return false;
  }
}

async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      // Check for session cookie
      const cookies = request.cookies;
      const sessionCookie = cookies.get('sb-vsruezynaanqprobpvrr-auth-token');
      
      if (!sessionCookie) {
        return false;
      }
    }

    // For now, we'll verify admin status by checking user_roles table
    // This requires the JWT token to be valid
    const SUPABASE_URL = 'https://vsruezynaanqprobpvrr.supabase.co';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_KEY) {
      return false;
    }

    const token = authHeader?.replace('Bearer ', '') || sessionCookie?.value;
    if (!token) {
      return false;
    }

    // Verify JWT and check if user has admin role
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _user_id: null, // Will use auth.uid() from JWT
        _role: 'admin',
      }),
    });

    if (!response.ok) {
      return false;
    }

    const isAdminUser = await response.json();
    return isAdminUser === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check maintenance status
  const maintenanceMode = await checkMaintenanceStatus();

  if (!maintenanceMode) {
    // Maintenance is off, allow all traffic
    return NextResponse.next();
  }

  // Maintenance is on, check if user is admin
  const userIsAdmin = await isAdmin(request);

  if (userIsAdmin) {
    // Admin bypass - allow access
    return NextResponse.next();
  }

  // Check if already on maintenance page to prevent redirect loop
  if (pathname === '/maintenance.html') {
    return NextResponse.next();
  }

  // Redirect to maintenance page
  return NextResponse.rewrite(new URL('/maintenance.html', request.url), {
    status: 503,
  });
}
