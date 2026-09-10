import { NextResponse, type NextRequest } from "next/server";
import { AUTH_GUARD_COOKIE_NAME } from "@/lib/auth-constants";

export function proxy(request: NextRequest): NextResponse {
  if (request.cookies.get(AUTH_GUARD_COOKIE_NAME)?.value === "1") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/home", request.url);
  loginUrl.searchParams.set("login", "1");
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/comic/:path*",
    "/project/:path*",
    "/library/:path*",
    "/create/:path*",
    "/skill/:path*",
    "/publish/:path*",
    "/team/:path*",
    "/admin/:path*",
  ],
};
