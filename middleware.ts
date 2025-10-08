import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // 🔎 Call your Supabase edge function to check maintenance
  const res = await fetch(`${process.env.SUPABASE_EDGE_URL}/check-maintenance`);
  const data = await res.json();

  // If maintenance is ON and user is not admin → show maintenance.html
  if (data?.allowed === false) {
    return NextResponse.rewrite(new URL("/maintenance.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // apply to all routes except static files
};
