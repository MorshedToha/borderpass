/**
 * src/middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * NextAuth v5 middleware — protects dashboard and admin routes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session;

    const isProtected = nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/live") ||
        nextUrl.pathname.startsWith("/admin");

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    if (isAdminRoute && !isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*", "/live/:path*", "/admin/:path*"],
};
