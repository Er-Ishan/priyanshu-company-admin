// Changed by Qasim - 2025-02-20
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, mirrorSetCookieForSameOrigin } from "@/lib/session-proxy";

type RouteParams = { path?: string[] };

async function proxy(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
  }

  const { path } = await context.params;
  const pathSegments = path && path.length ? path : [];
  const apiPath = pathSegments.join("/");

  // Preserve query parameters
  const { search } = new URL(request.url);
  const url = `${backend}/${apiPath}${search}`;

  const cookie = request.headers.get("cookie") || "";
  const contentType = request.headers.get("content-type");
  const headers: Record<string, string> = { cookie };
  if (contentType) headers["Content-Type"] = contentType;

  // Retrieve auth session and attach x-company-id
  let session;
  try {
    const { auth } = await import("@/auth");
    session = await auth();
  } catch (authErr: any) {
    console.error("[PROXY-AUTH-ERROR]:", authErr);
    // Continue without session if auth fails, or handle as needed
  }

  const companyId = session?.user?.company_id;
  if (companyId) {
    headers["x-company-id"] = companyId.toString();
  }

  const userId = (session?.user as any)?.id;
  if (userId) {
    headers["x-user-id"] = userId.toString();
  }



  const method = request.method;
  let body: any = undefined;
  if (method !== "GET" && method !== "HEAD") {
    // Check if it's multipart or binary
    if (contentType?.includes("multipart/form-data") || contentType?.includes("image/")) {
      body = await request.arrayBuffer();
    } else {
      body = await request.text();
    }
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (fetchErr: any) {
    console.error(`Proxy fetch error for ${url}:`, fetchErr);
    return NextResponse.json({
       _isError: true, 
       _raw: `Fetch failed: ${fetchErr.message}`,
       status: 502
    }, { status: 502 });
  }

  const isLogin =
    method === "POST" &&
    pathSegments[pathSegments.length - 2] === "session" &&
    pathSegments[pathSegments.length - 1] === "login";
  
  const responseContentType = res.headers.get("content-type") || "";
  
  if (responseContentType.includes("image/")) {
    const blob = await res.blob();
    return new Response(blob, {
      status: res.status,
      headers: {
        "Content-Type": responseContentType,
        "Cache-Control": "no-store",
      },
    });
  }

  const cloneForStatus = res.clone();
  let data;
  try {
    data = await res.json();
  } catch (err) {
    const text = await cloneForStatus.text().catch(() => "");
    console.error(`Proxy JSON error for ${url}:`, text);
    data = { _isError: true, _raw: text, status: res.status };
  }
  const nextRes = NextResponse.json(data, { status: res.status });

  if (isLogin && res.ok) {
    const setCookie = cloneForStatus.headers.getSetCookie?.();
    let raw: string | null | undefined;
    if (Array.isArray(setCookie) && setCookie.length > 0) {
      raw = setCookie.join(", ");
    } else {
      raw = cloneForStatus.headers.get("set-cookie");
    }

    if (raw) {
      mirrorSetCookieForSameOrigin(raw).forEach((c) =>
        nextRes.headers.append("Set-Cookie", c)
      );
    }
  }

  return nextRes;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
