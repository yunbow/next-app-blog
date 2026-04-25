import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfigEdge } from "@/lib/auth/config.edge";

// Edge Runtimeで動作するため、定数を定義
const LOCALE_COOKIE_NAME = "locale";
const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = ["ja", "en"];

/**
 * Accept-Languageヘッダーからロケールを検出
 */
function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (SUPPORTED_LOCALES.includes(code)) {
      return code;
    }
  }

  return DEFAULT_LOCALE;
}

const { auth } = NextAuth(authConfigEdge);

export default auth(async function middleware(request) {
  const response = NextResponse.next();

  // Request IDの生成と付与（トレーシング用）
  const requestId = crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  // ロケールCookieが未設定の場合、Accept-Languageヘッダーから検出して設定
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME);
  if (!localeCookie) {
    const acceptLanguage = request.headers.get("accept-language");
    const detectedLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
    response.cookies.set(LOCALE_COOKIE_NAME, detectedLocale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  // CSRF protection
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    const isValidOrigin = origin && origin.includes(host ?? "");
    const isValidReferer = referer && referer.includes(host ?? "");

    if (!isValidOrigin && !isValidReferer) {
      // Edge Runtime では Pino logger が使用不可のため console.warn を使用
      console.warn("[CSRF] Invalid origin/referer", { origin, referer, host });
      return NextResponse.json(
        { error: "Invalid origin or referer" },
        { status: 403 }
      );
    }
  }

  // CSP headers
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Nonce", nonce);

  // Auth check for protected routes using NextAuth session (Edge-safe)
  const protectedPaths = ["/settings", "/notifications", "/articles/new", "/dashboard"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const session = request.auth;

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
