module.exports = {

"[project]/.next-internal/server/app/api/backend/[[...path]]/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/lib/session-proxy.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * Session proxy helpers for same-origin cookies (fixes Safari/iOS login redirect issues).
 * Backend may set cookies on a different domain; we mirror them to our domain so the
 * browser treats them as first-party and sends them on every request.
 * Changed by Qasim - 2025-02-20
 *
 * IMPORTANT for Safari/iOS: Client must call same-origin URLs (/api/session/*). This
 * file is used only on the server: API_BACKEND_URL should point to the real backend
 * (e.g. https://hmpbackend.bookheathrowparking.co.uk). Do not set NEXT_PUBLIC_API_BASE_URL
 * to the backend URL or Safari will not send cookies on session/check.
 */ // Server-side: use API_BACKEND_URL for proxying to the real backend (required for Safari)
__turbopack_context__.s({
    "getBackendUrl": (()=>getBackendUrl),
    "mirrorSetCookieForSameOrigin": (()=>mirrorSetCookieForSameOrigin)
});
const BACKEND_URL = typeof process !== "undefined" && process.env.API_BACKEND_URL || ("TURBOPACK compile-time value", "https://adminback.fleetcart.co.uk") || "";
function getBackendUrl() {
    return BACKEND_URL.replace(/\/$/, "");
}
function mirrorSetCookieForSameOrigin(setCookieHeader) {
    if (!setCookieHeader) return [];
    const cookies = [];
    // Handle multiple Set-Cookie (array in Node fetch, or single string)
    const parts = Array.isArray(setCookieHeader) ? setCookieHeader : [
        setCookieHeader
    ];
    for (const raw of parts){
        if (!raw || typeof raw !== "string") continue;
        const idx = raw.indexOf(";");
        const nameValue = idx >= 0 ? raw.slice(0, idx).trim() : raw.trim();
        if (!nameValue) continue;
        // Re-set for our domain: Path=/; HttpOnly; SameSite=Lax; Secure (when HTTPS)
        const secure = typeof process !== "undefined" && ("TURBOPACK compile-time value", "development") === "production";
        const opts = [
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            ...("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : []
        ];
        cookies.push(`${nameValue}; ${opts.join("; ")}`);
    }
    return cookies;
}
}}),
"[project]/app/api/backend/[[...path]]/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// Changed by Qasim - 2025-02-20
__turbopack_context__.s({
    "DELETE": (()=>DELETE),
    "GET": (()=>GET),
    "HEAD": (()=>HEAD),
    "PATCH": (()=>PATCH),
    "POST": (()=>POST),
    "PUT": (()=>PUT)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session-proxy.ts [app-route] (ecmascript)");
;
;
async function proxy(request, context) {
    const backend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBackendUrl"])();
    if (!backend) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Server misconfiguration"
        }, {
            status: 500
        });
    }
    const { path } = await context.params;
    const pathSegments = path && path.length ? path : [];
    const apiPath = pathSegments.join("/");
    // Preserve query parameters
    const { search } = new URL(request.url);
    const url = `${backend}/${apiPath}${search}`;
    const cookie = request.headers.get("cookie") || "";
    const contentType = request.headers.get("content-type");
    const headers = {
        cookie
    };
    if (contentType) headers["Content-Type"] = contentType;
    // Retrieve auth session and attach x-company-id
    let session;
    try {
        const { auth } = await __turbopack_context__.r("[project]/auth.ts [app-route] (ecmascript, async loader)")(__turbopack_context__.i);
        session = await auth();
    } catch (authErr) {
        console.error("[PROXY-AUTH-ERROR]:", authErr);
    // Continue without session if auth fails, or handle as needed
    }
    const companyId = session?.user?.company_id;
    if (companyId) {
        headers["x-company-id"] = companyId.toString();
    }
    const userId = session?.user?.id;
    if (userId) {
        headers["x-user-id"] = userId.toString();
    }
    const method = request.method;
    let body = undefined;
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
            cache: "no-store"
        });
    } catch (fetchErr) {
        console.error(`Proxy fetch error for ${url}:`, fetchErr);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            _isError: true,
            _raw: `Fetch failed: ${fetchErr.message}`,
            status: 502
        }, {
            status: 502
        });
    }
    const isLogin = method === "POST" && pathSegments[pathSegments.length - 2] === "session" && pathSegments[pathSegments.length - 1] === "login";
    const responseContentType = res.headers.get("content-type") || "";
    if (responseContentType.includes("image/")) {
        const blob = await res.blob();
        return new Response(blob, {
            status: res.status,
            headers: {
                "Content-Type": responseContentType,
                "Cache-Control": "no-store"
            }
        });
    }
    const cloneForStatus = res.clone();
    let data;
    try {
        data = await res.json();
    } catch (err) {
        const text = await cloneForStatus.text().catch(()=>"");
        console.error(`Proxy JSON error for ${url}:`, text);
        data = {
            _isError: true,
            _raw: text,
            status: res.status
        };
    }
    const nextRes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, {
        status: res.status
    });
    if (isLogin && res.ok) {
        const setCookie = cloneForStatus.headers.getSetCookie?.();
        let raw;
        if (Array.isArray(setCookie) && setCookie.length > 0) {
            raw = setCookie.join(", ");
        } else {
            raw = cloneForStatus.headers.get("set-cookie");
        }
        if (raw) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mirrorSetCookieForSameOrigin"])(raw).forEach((c)=>nextRes.headers.append("Set-Cookie", c));
        }
    }
    return nextRes;
}
const GET = proxy;
const POST = proxy;
const PUT = proxy;
const PATCH = proxy;
const DELETE = proxy;
const HEAD = proxy;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__902574fe._.js.map