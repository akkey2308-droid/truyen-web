import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminToken = request.cookies.get("admin-token")?.value;
  const secret = process.env.ADMIN_COOKIE_SECRET;

  if (adminToken === secret) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin-login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};