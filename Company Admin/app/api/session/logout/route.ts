import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const nextRes = NextResponse.json({ success: true, message: "Logged out" }, { status: 200 });

  // Clear out NextAuth specific cookies
  // This explicitly destroys local session persistence allowing NextAuth to re-evaluate auth status.
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieNames = cookieHeader.split(";").map((p) => p.trim().split("=")[0].trim()).filter(Boolean);

  cookieNames.forEach((name) => {
    // Target commonly used NextAuth session tokens
    if (name.includes("next-auth.session-token") || name.includes("next-auth.csrf-token") || name.includes("next-auth.callback-url")) {
      nextRes.cookies.delete(name);
    }
  });

  return nextRes;
}
