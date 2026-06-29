import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log("[SESSION-ME] Session check:", !!session?.user);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch branding info from backend to avoid bloating JWT cookie
    let companyLogo = null;
    const companyId = (session.user as any).company_id;
    if (companyId) {
      try {
        const backendBase = process.env.API_BACKEND_URL || "http://localhost:9000";
        const brandingRes = await fetch(`${backendBase}/api/branding`, {
          headers: {
            "x-company-id": companyId.toString()
          }
        });
        if (brandingRes.ok) {
          const brandingData = await brandingRes.json();
          companyLogo = brandingData.logo_url;
        }
      } catch (err) {
        console.error("[SESSION-ME] Branding fetch error:", err);
      }
    }

    // NextAuth stores role inside session.user.role if it was assigned during jwt/session callbacks
    return NextResponse.json(
      {
        success: true,
        user: {
          ...session.user,
          company_logo: companyLogo
        },
        role: (session.user as any).role || "admin"
      }, { status: 200 });
  } catch (error: any) {
    console.error("[SESSION-ME] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal Server Error", 
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}
