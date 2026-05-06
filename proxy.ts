import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["es", "en", "pt-br"] as const;
const DEFAULT = "es";

function pickLocale(req: NextRequest): string {
  const accept = req.headers.get("accept-language") ?? "";
  const codes = accept
    .split(",")
    .map((s) => s.split(";")[0].trim().toLowerCase());
  for (const code of codes) {
    if (code.startsWith("pt")) return "pt-br";
    if (code.startsWith("en")) return "en";
    if (code.startsWith("es")) return "es";
  }
  return DEFAULT;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml|woff|woff2)).*)"],
};
