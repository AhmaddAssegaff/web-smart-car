import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isAuthenticated = async (req: NextRequest): Promise<boolean> => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!token;
};

const isAdmin = async (req: NextRequest): Promise<boolean> => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token && token.role === "admin") {
    return true;
  }

  return false;
};

const redirectTo = (
  url: string,
  req: NextRequest,
  error: string | null = null,
): NextResponse => {
  const redirectUrl = new URL(url, req.url);
  if (error) redirectUrl.searchParams.set("error", error);
  return NextResponse.redirect(redirectUrl);
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authenticated = await isAuthenticated(req);
  const admin = await isAdmin(req);

  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // console.log(token);

  if (!admin && pathname.startsWith("/admin/dashboard")) {
    return redirectTo("/", req);
  }

  if (!authenticated && pathname.startsWith("/auth/token")) {
    return redirectTo("/auth/sign-in", req, "not-logged-in");
  }

  if (authenticated && pathname.startsWith("/auth/sign-in")) {
    return redirectTo("/", req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/token/:path*", "/auth/sign-in/:path*"],
};
