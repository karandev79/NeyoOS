import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const session = request.cookies.get("neyo_session");
    const { pathname } = request.nextUrl;

    const protectedPaths = ['/dashboard', '/tasks', '/mood', '/settings', '/habits'];
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if(!session && isProtected) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (session && pathname ==='/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};