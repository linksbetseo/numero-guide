import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("ng_session");
  const protectedPath =
    request.nextUrl.pathname.startsWith("/app") || request.nextUrl.pathname.startsWith("/admin");

  if (protectedPath && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
