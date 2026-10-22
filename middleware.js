import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { REMEMBER_COOKIE, REMEMBER_MAX_AGE } from "@/constants";

export async function middleware(request) {
    console.log(process.versions.node);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};