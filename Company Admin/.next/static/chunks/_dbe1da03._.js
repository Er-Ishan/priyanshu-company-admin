(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/lib/apiFetch.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "apiFetch": (()=>apiFetch)
});
async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers || {}
        },
        ...options
    });
    // 🔐 Session expired or missing
    if (res.status === 401) {
        if ("TURBOPACK compile-time truthy", 1) {
            window.location.href = "/auth/login";
        }
        throw new Error("Session expired");
    }
    return res;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/lib/backendProxy.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * Client-side helper to call the backend through the same-origin proxy.
 *
 * This avoids relying on NEXT_PUBLIC_API_BASE_URL inside browser code and
 * prevents CORS / "not JSON" issues when the backend URL changes.
 *
 * Usage:
 * - backendProxyPath("/api/getalldata") -> "/api/backend/api/getalldata"
 */ __turbopack_context__.s({
    "backendProxyPath": (()=>backendProxyPath)
});
function backendProxyPath(path) {
    if (!path) return "/api/backend";
    return `/api/backend${path.startsWith("/") ? path : `/${path}`}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/ui/table.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Table": (()=>Table),
    "TableBody": (()=>TableBody),
    "TableCaption": (()=>TableCaption),
    "TableCell": (()=>TableCell),
    "TableFooter": (()=>TableFooter),
    "TableHead": (()=>TableHead),
    "TableHeader": (()=>TableHeader),
    "TableRow": (()=>TableRow)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
function Table({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "table-container",
        className: "relative w-full overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            "data-slot": "table",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full caption-bottom text-sm", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/table.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = Table;
function TableHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
        "data-slot": "table-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("[&_tr]:border-b", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c1 = TableHeader;
function TableBody({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
        "data-slot": "table-body",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("[&_tr:last-child]:border-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c2 = TableBody;
function TableFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tfoot", {
        "data-slot": "table-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c3 = TableFooter;
function TableRow({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        "data-slot": "table-row",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_c4 = TableRow;
function TableHead({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
        "data-slot": "table-head",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c5 = TableHead;
function TableCell({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
        "data-slot": "table-cell",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_c6 = TableCell;
function TableCaption({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
        "data-slot": "table-caption",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground mt-4 text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/table.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
_c7 = TableCaption;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "Table");
__turbopack_context__.k.register(_c1, "TableHeader");
__turbopack_context__.k.register(_c2, "TableBody");
__turbopack_context__.k.register(_c3, "TableFooter");
__turbopack_context__.k.register(_c4, "TableRow");
__turbopack_context__.k.register(_c5, "TableHead");
__turbopack_context__.k.register(_c6, "TableCell");
__turbopack_context__.k.register(_c7, "TableCaption");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/(dashboard)/return-report/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BookingReportPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$html2canvas$2f$dist$2f$html2canvas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/html2canvas/dist/html2canvas.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiFetch.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$backendProxy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/backendProxy.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/table.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProtectedRoute$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ProtectedRoute.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/file-saver/dist/FileSaver.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.js [app-client] (ecmascript) <export default as FileSpreadsheet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
/* -------------------- OPTIONS -------------------- */ // const AIRPORTS = ['All Airports', 'LHR', 'LGW', 'STN', 'LTN', 'MAN', 'BHX'] as const;
const STATUSES = [
    'All Bookings',
    'Active',
    'Cancelled',
    'Completed',
    'No Show',
    'Refunded',
    'Pending'
];
const SOURCES = [
    'All Sources',
    'Supplier',
    'Direct',
    'Partner',
    'Website',
    'Call Centre'
];
const BOOKING = [
    'All Types',
    'Drop Off',
    'Return',
    'Both'
];
/* -------------------- CONFIG -------------------- */ const API_BASE = ("TURBOPACK compile-time value", "https://adminback.fleetcart.co.uk");
/* -------------------- UTILS -------------------- */ function fmtDT(v) {
    if (!v) return '';
    const clean = v.replace('T', ' ');
    const [datePart, timePart = '00:00:00'] = clean.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    return `${day} ${months[Number(month) - 1]} ${year} ${hour}:${minute}`;
}
const REPORT_EXPORT_HEADERS = [
    "S.L",
    "Ref No",
    "Customer",
    "Product",
    "Contact No",
    "Return Flight",
    "Return",
    "Reg No",
    "Make / Model / Color",
    "Depart Terminal",
    "Return Terminal"
];
function buildReportExportRows(rows) {
    return rows.map((b, i)=>({
            "S.L": i + 1,
            "Ref No": b.ref_no ?? "-",
            Customer: `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() || "-",
            Product: b.product_name ?? "-",
            "Contact No": b.mobile ?? "-",
            "Return Flight": b.return_flight ?? "-",
            Return: formatFullDate(b.return_date),
            "Reg No": b.vehicle_registration ?? "-",
            "Make / Model / Color": `${b.vehicle_make ?? "-"} / ${b.vehicle_model ?? "-"} / ${b.vehicle_colour ?? "-"}`,
            "Depart Terminal": b.depart_terminal ?? "-",
            "Return Terminal": b.return_terminal ?? "-"
        }));
}
function downloadExcelBooking(filename, rows) {
    const excelRows = buildReportExportRows(rows);
    const worksheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(excelRows, {
        header: [
            ...REPORT_EXPORT_HEADERS
        ],
        cellDates: false
    });
    worksheet["!cols"] = [
        {
            wch: 6
        },
        {
            wch: 18
        },
        {
            wch: 22
        },
        {
            wch: 22
        },
        {
            wch: 16
        },
        {
            wch: 16
        },
        {
            wch: 24
        },
        {
            wch: 14
        },
        {
            wch: 28
        },
        {
            wch: 16
        },
        {
            wch: 16
        }
    ];
    const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_new();
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, worksheet, "Bookings");
    const buffer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["write"])(workbook, {
        bookType: "xlsx",
        type: "array"
    });
    const blob = new Blob([
        buffer
    ], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAs"])(blob, filename);
}
const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const threeDaysAgo = new Date();
threeDaysAgo.setDate(today.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];
async function exportTableToPDF(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) return alert("Table not found");
    // Expand scroll area
    element.style.overflow = "visible";
    // Capture as canvas
    const canvas = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$html2canvas$2f$dist$2f$html2canvas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(element, {
        scale: 2,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]("l", "pt", "a4"); // landscape mode for wide table
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = canvas.height * pdfWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    while(heightLeft > 0){
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
    }
    pdf.save(filename);
}
function money(n) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2
        }).format(n);
    } catch  {
        return `£${Number(n || 0).toFixed(2)}`;
    }
}
function formatFullDate(dateString) {
    if (!dateString) return "-";
    const clean = dateString.replace("T", " ");
    const [datePart, timePart = "00:00:00"] = clean.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];
    return `${day} ${months[Number(month) - 1]} ${year} ${hour}:${minute}`;
}
function toLocalInputValue(iso) {
    if (!iso) return '';
    return iso.replace(' ', 'T').slice(0, 16);
}
function toSqlDateTime(local) {
    if (!local) return null;
    const s = local.trim();
    if (!s.includes('T')) return s.replace(' ', ' ').concat(':00');
    return s.replace('T', ' ') + (s.length === 16 ? ':00' : '');
}
function normalizeYMD(input) {
    if (!input) return '';
    const ddmmyyyy = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
    const ymd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) return input;
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n)=>String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];
function formatPrettyDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}
function getRowBgClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-50';
    if (s === 'cancelled') return 'bg-red-50';
    if (s === 'completed') return 'bg-blue-50';
    if (s === 'pending') return 'bg-yellow-50';
    if (s === 'refunded') return 'bg-pink-50';
    if (s === 'no show') return 'bg-gray-50';
    return 'bg-neutral-50';
}
const esc = (s)=>String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* CSV helper */ function downloadCSV(filename, rows) {
    const exportRows = buildReportExportRows(rows);
    const csvRows = [
        REPORT_EXPORT_HEADERS.join(","),
        ...exportRows.map((row)=>REPORT_EXPORT_HEADERS.map((header)=>`"${String(row[header]).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([
        csvRows
    ], {
        type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
/* -------------------- PRINT (multi-page invoices) -------------------- */ function buildInvoiceHTML(rows) {
    const printDate = new Date().toLocaleString();
    const pages = rows.map((b, idx)=>{
        return `
  <section class="page" style="font-family: 'Segoe UI', Arial, sans-serif; color:#222; background:#fff; margin:0; padding:20px;">

    <!-- Header -->
    <header class="hdr" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0a58ca; padding-bottom:15px; margin-bottom:20px;">
      <div class="brand" style="max-width:60%;">
        <div class="brand-name" style="font-size:24px; font-weight:700; color:#0a58ca;">Airport Parking Ltd.</div>
        <div class="brand-sub" style="font-size:14px; color:#555;">Airport Parking Services</div>
        <div class="brand-meta" style="font-size:12px; color:#777; margin-top:5px;">www.example.com · +44 0000 000000 · support@example.com</div>
      </div>
      <div class="inv-block" style="text-align:right;">
        <div class="inv-title" style="font-size:20px; font-weight:600; color:#111;">Booking Invoice</div>
        <div class="inv-meta" style="font-size:13px; color:#555;"><strong>No:</strong> ${esc(b.ref_no)}</div>
        <div class="inv-meta" style="font-size:13px; color:#555;"><strong>Printed:</strong> ${esc(printDate)}</div>
      </div>
    </header>

    <!-- Customer & Booking Info -->
    <div style="display:flex; flex-wrap:wrap; gap:20px; margin-bottom:20px;">
      <div style="flex:1; min-width:250px; background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Customer</div>
        <p><strong>First Name:</strong> ${esc(b.first_name)}</p>
        <p><strong>Last Name:</strong> ${esc(b.last_name)}</p>
        <p><strong>Contact:</strong> ${esc(b.mobile || '-')}</p>
        <p><strong>Email:</strong> ${esc(b.email || '-')}</p>
      </div>

      <div style="flex:1; min-width:250px; background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Booking</div>
        <p><strong>Source:</strong> ${esc(b.source)}</p>
        <p><strong>Status:</strong> ${esc(b.status)}</p>
        <p><strong>Booked On:</strong> ${esc(fmtDT(b.created_at))}</p>
      </div>
    </div>

    <!-- Travel & Vehicle -->
    <div style="background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; margin-bottom:20px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
      <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Travel & Vehicle</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; font-size:13px;">
        <div><strong>Airport:</strong> ${esc(b.travelling_from)}</div>
        <div><strong>Service:</strong> ${esc(b.service || '-')}</div>
        <div><strong>Drop-off:</strong> ${esc(b.drop_off_date)}</div>
        <div><strong>Return:</strong> ${esc(b.return_date)}</div>
        <div><strong>Vehicle:</strong> ${esc(b.vehicle_make || '-')}</div>
        <div><strong>Vehicle:</strong> ${esc(b.vehicle_model || '-')}</div>
        <div><strong>Vehicle:</strong> ${esc(b.vehicle_colour || '-')}</div>
        <div><strong>Reg No:</strong> ${esc(b.vehicle_registration || '-')}</div>
      </div>
    </div>

    <!-- Flight & Terminals -->
    <div style="background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; margin-bottom:20px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
      <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Flight Details</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; font-size:13px;">
        <div><strong>Depart Flight:</strong> ${esc(b.depart_flight)}</div>
        <div><strong>Depart Terminal:</strong> ${esc(b.depart_terminal)}</div>
        <div><strong>Return Flight:</strong> ${esc(b.return_flight)}</div>
        <div><strong>Return Flight:</strong> ${esc(b.return_terminal)}</div>
      </div>
    </div>

    <!-- Charges -->
    <div style="background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; margin-bottom:20px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
      <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Charges</div>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:#eef2f7; text-align:left;">
            <th style="padding:8px; border-bottom:1px solid #ccc;">Description</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Quote Amount</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Discount</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Booking Fee</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px;">Parking / Service Fee</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.quote_amount || 0)))}</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.discount || 0)))}</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.booking_fee || 0)))}</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.total_payable || 0)))}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:8px; font-weight:600; border-top:1px solid #ccc;">Total</td>
            <td style="padding:8px; text-align:right; font-weight:600; border-top:1px solid #ccc;">${esc(money(Number(b.total_payable || 0)))}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Footer -->
    <footer style="text-align:center; font-size:12px; color:#666; border-top:1px solid #ddd; padding-top:10px;">
      <div>Thank you for choosing us.</div>
    </footer>

  </section>
`;
    }).join('\n');
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Invoices</title>
  <style>
    :root {
      --fg:#0f172a; --muted:#475569; --line:#e2e8f0; --accent:#0ea5e9;
    }
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;color:var(--fg);font:14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial}
    @page { size: A4; margin: 16mm; }
    .page{page-break-after: always;}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:16px}
    .brand-name{font-size:20px;font-weight:700}
    .brand-sub{color:var(--muted)}
    .brand-meta{color:var(--muted);font-size:12px}
    .inv-block{text-align:right}
    .inv-title{font-size:18px;font-weight:700;margin-bottom:4px}
    .inv-meta{font-size:12px;color:var(--muted)}
    .inv-meta span{color:var(--fg);font-weight:600;margin-right:6px}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
    .card{border:1px solid var(--line);border-radius:8px;padding:12px;margin-bottom:12px}
    .card-title{font-weight:700;margin-bottom:10px;color:var(--accent)}
    .kv{display:flex;justify-content:space-between;border-bottom:1px dashed #eef2f7;padding:6px 0}
    .kv span{color:var(--muted)}
    .kv b{font-weight:600}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 16px}
    .charge-table{width:100%;border-collapse:collapse}
    .charge-table th,.charge-table td{border:1px solid var(--line);padding:8px}
    .charge-table .num{text-align:right}
    .charge-table tfoot .total{font-weight:700}
    .notes{white-space:pre-wrap}
    .ftr{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;margin-top:16px;border-top:1px solid var(--line);padding-top:8px}
    @media print {.page{break-after: page;}}
  </style>
</head>
<body>
  ${pages}
</body>
</html>`;
}
function buildPrintCardHTML(rows) {
    const pages = rows.map((b)=>`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Parking Booking Slip</title>
<style>
${""}
${""}
${`
* { box-sizing:border-box; font-family:Arial, Helvetica, sans-serif; }
body { margin:0; padding:20px; background:#fff; }
.page { width:1200px; margin:auto; border:1px solid #ccc; }
.grid { display:grid; grid-template-columns:1fr 1fr 1fr; position:relative; }
.grid::before,.grid::after { content:""; position:absolute; top:0; bottom:0; border-left:2px dashed #999; }
.grid::before { left:33.333%; }
.grid::after { left:66.666%; }
.section { padding:15px; }
h3 { font-size:14px; margin:0 0 8px; font-weight:bold; text-transform:uppercase; }
.box { border:1px solid #000; padding:10px; margin-bottom:15px; }
.field { display:grid; grid-template-columns:90px 1fr; margin-bottom:10px; font-size:12px; }
.line { border-bottom:1px solid #000; height:14px; }
table { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:15px; }
td,th { border:1px solid #000; padding:8px; height:35px; }
.red { color:red; font-weight:bold; }
.arrival { height:90px; text-align:center; font-weight:bold; padding-top:10px; }
.phone { font-size:26px; font-weight:bold; margin:15px 0; }
.warning { color:red; font-size:13px; font-weight:bold; margin-bottom:8px; }
.text { font-size:12px; line-height:1.4; margin-bottom:10px; }
.signature-wrap { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
.signature { border:1px solid #000; height:60px; padding:5px; font-size:12px; font-weight:bold; }
.small { font-size:10px; margin-top:5px; }
`}
</style>
</head>

<body>
<div class="page">
<div class="grid">

<!-- LEFT -->
<div class="section">
<h3>Customer Information</h3>
<div class="box">
  <div class="field"><strong>Name</strong><div>${b.first_name} ${b.last_name}</div></div>
  <div class="field"><strong>Mobile</strong><div>${b.mobile ?? "-"}</div></div>
  <div class="field"><strong>Booking Ref</strong><div>${b.ref_no}</div></div>
</div>

<h3>Flight Details</h3>
<table>
<tr><th>DEPART DATE</th><th>TIME</th><th>TERMINAL</th></tr>
<tr>
  <td class="red">${formatFullDate(b.return_date)}</td>
  <td class="red">—</td>
  <td class="red">${b.return_terminal ?? "-"}</td>
</tr>
<tr>
  <td colspan="2" class="red">FLIGHT NO:</td>
  <td class="red">${b.email}</td>
</tr>
</table>

<h3>Vehicle Information</h3>
<table>
<tr><td>${b.vehicle_registration}</td><td>${b.vehicle_colour}</td></tr>
<tr><td>${b.vehicle_make}</td><td>${b.vehicle_model}</td></tr>
<tr><td colspan="2"></td></tr>
</table>

<h3>Declaration</h3>
<p class="text">
I agree that I am willing to be bound by the terms and conditions and confirm no valuables are left in the vehicle.
</p>

<div class="signature-wrap">
<div class="signature">SIGNATURE 1:</div>
<div class="signature">SIGNATURE 2:</div>
</div>
</div>

<!-- MIDDLE -->
<div class="section">
<h3>Arrival</h3>
<div class="box arrival">${formatFullDate(b.drop_off_date)}</div>
<div class="box arrival">TIME</div>
<div class="box arrival">${b.depart_terminal ?? "-"}</div>

<h3>Details</h3>
<table>
<tr>
<td>${b.ref_no}</td>
<td>${b.vehicle_registration}</td>
</tr>
</table>
</div>

<!-- RIGHT -->
<div class="section">
<h3>Don't Forget:</h3>
<div>✔ Tickets</div>
<div>✔ Phone</div>
<div>✔ Passport</div>
<div>✔ Currency</div>

<div class="phone">📱 0778 050 4999</div>

<div class="warning">** DO NOT TEXT THIS NUMBER **</div>
<div class="warning">** NO CASH PAYMENTS **</div>

<h3>Booking Details</h3>
<table>
<tr><td>${b.ref_no}</td><td>${b.return_terminal ?? "-"}</td></tr>
<tr><td>${formatFullDate(b.return_date)}</td><td>${b.return_flight ?? "-"}</td></tr>
</table>

<p class="text"><strong>PRESENT THIS SLIP ON RETURN</strong></p>
</div>

</div>
</div>
</body>
</html>
`).join("<div style='page-break-after:always'></div>");
    return pages;
}
function BookingReportPage() {
    _s();
    /* Filters */ const [airport, setAirport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All Airports');
    const [booking_type, setBookingType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Booking Type');
    // const [from, setFrom] = useState<string>('');
    // const [to, setTo] = useState<string>('');
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All Bookings');
    const [source, setSource] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All Sources');
    const [airportList, setAirportList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [from, setFrom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(todayStr);
    const [to, setTo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(todayStr);
    const [fromDisplay, setFromDisplay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(from);
    const [toDisplay, setToDisplay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(to);
    /* Data/UI */ const [allRows, setAllRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errMsg, setErrMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [hasGenerated, setHasGenerated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [datePattern, setDatePattern] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("depart");
    /* Pagination */ const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [limit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(50);
    /* Sorting */ const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('booked_on');
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('asc');
    /* Inline edit */ const [openRowId, setOpenRowId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [serviceType, setServiceType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All Services');
    const [saveMsg, setSaveMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        customer_name: '',
        contact_no: '',
        customer_email: '',
        vehicle_reg_no: '',
        airport: '',
        status: 'Active',
        price: '',
        dropoff_datetime: '',
        return_datetime: '',
        notes: ''
    });
    function buildFullTableHTML(rows) {
        const exportRows = buildReportExportRows(rows);
        const tableRows = exportRows.map((row)=>`
      <tr>
        ${REPORT_EXPORT_HEADERS.map((header)=>`<td>${esc(row[header])}</td>`).join("")}
      </tr>
    `).join("");
        return `
<!doctype html>
<html>
<head>
  <title>Booking Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px;
      text-align: center;
    }
    th {
      background: #f2f2f2;
    }
    @page {
      size: A4 landscape;
      margin: 12mm;
    }
  </style>
</head>
<body>
  <h2>Booking Report</h2>
  <table>
    <thead>
      <tr>
        ${REPORT_EXPORT_HEADERS.map((header)=>`<th>${header}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>
`;
    }
    async function downloadFullTablePDF(rows) {
        const html = buildFullTableHTML(rows);
        const win = window.open("", "_blank");
        if (!win) return alert("Please allow popups!");
        win.document.write(html);
        win.document.close();
        setTimeout(()=>win.print(), 500);
    }
    const ariaSort = (key)=>sortBy === key ? sortOrder === 'asc' ? 'ascending' : 'descending' : 'none';
    function buildFetchUrl(df, dt) {
        if (df && dt) {
            const qs = new URLSearchParams({
                start: df,
                end: dt
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$backendProxy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["backendProxyPath"])(`/api/thomsondata/return-daterange?${qs.toString()}`);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$backendProxy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["backendProxyPath"])("/api/thomsondata/active");
    }
    const generateReport = async ()=>{
        setLoading(true);
        setErrMsg('');
        setHasGenerated(true);
        try {
            const df = normalizeYMD(from);
            const dt = normalizeYMD(to);
            const url = buildFetchUrl(df, dt);
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(url, {
                cache: "no-store"
            });
            const payload = await res.json();
            const list = Array.isArray(payload) ? payload : payload?.data || [];
            const filtered = list.filter((r)=>{
                const okAirport = airport === 'All Airports' || (r.travelling_from || '').toLowerCase() === airport.toLowerCase();
                const okService = serviceType === 'All Services' || (r.service || '').toLowerCase() === serviceType.toLowerCase();
                const okStatus = status === 'All Bookings' || (r.status || '').toLowerCase() === status.toLowerCase();
                const okSource = source === 'All Sources' || (r.source || '').toLowerCase() === source.toLowerCase();
                return okAirport && okService && okStatus && okSource;
            });
            filtered.sort((a, b)=>new Date(a.return_date || 0).getTime() - new Date(b.return_date || 0).getTime());
            setAllRows(filtered);
            setPage(1);
        } catch (e) {
            setErrMsg(e.message || "Failed to generate report");
            setAllRows([]);
        } finally{
            setLoading(false);
        }
    };
    /* Client-side sort & paginate */ const filteredSorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BookingReportPage.useMemo[filteredSorted]": ()=>{
            let res = [
                ...allRows
            ];
            res.sort({
                "BookingReportPage.useMemo[filteredSorted]": (a, b)=>{
                    const dir = sortOrder === 'asc' ? 1 : -1;
                    const av = a[sortBy];
                    const bv = b[sortBy];
                    if (sortBy === 'price') {
                        const an = Number(av || 0);
                        const bn = Number(bv || 0);
                        return (an - bn) * dir;
                    }
                    const ad = new Date(av || 0).getTime();
                    const bd = new Date(bv || 0).getTime();
                    if (!Number.isNaN(ad) && !Number.isNaN(bd)) {
                        return (ad - bd) * dir;
                    }
                    return String(av || '').localeCompare(String(bv || '')) * dir;
                }
            }["BookingReportPage.useMemo[filteredSorted]"]);
            return res;
        }
    }["BookingReportPage.useMemo[filteredSorted]"], [
        allRows,
        sortBy,
        sortOrder
    ]);
    const total = filteredSorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BookingReportPage.useMemo[pageSlice]": ()=>{
            const start = (page - 1) * limit;
            return filteredSorted.slice(start, start + limit);
        }
    }["BookingReportPage.useMemo[pageSlice]"], [
        filteredSorted,
        page,
        limit
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingReportPage.useEffect": ()=>{
            async function loadAirports() {
                try {
                    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/backend/api/airports");
                    if (res.ok) {
                        const json = await res.json();
                        setAirportList(json.data || []);
                    }
                } catch (err) {
                    console.error("Failed to load airports:", err);
                }
            }
            loadAirports();
        }
    }["BookingReportPage.useEffect"], []);
    const handleSort = (key)=>{
        if (sortBy === key) {
            setSortOrder((o)=>o === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
        setPage(1);
    };
    const handlePrint = ()=>{
        const html = buildPrintCardHTML(filteredSorted);
        const w = window.open("", "_blank");
        if (!w) return alert("Allow popups");
        w.document.write(html);
        w.document.close();
        w.print();
    };
    // const handlePdf = () => {
    //   const html = buildInvoiceHTML(filteredSorted);
    //   const w = window.open("", "_blank");
    //   if (!w) return alert("Allow popups");
    //   w.document.write(html);
    //   w.document.close();
    // };
    const handlePdf = ()=>{
        downloadFullTablePDF(filteredSorted);
    };
    const handleDownload = ()=>downloadCSV(`booking-report-${Date.now()}.csv`, filteredSorted);
    /* -------------------- REQUIRED BUTTON LOGIC -------------------- */ // const normalizedBooking = booking_type.toLowerCase();
    // const isDropOff = normalizedBooking === 'drop off';
    // const isReturn = normalizedBooking === 'return';
    // const isBoth = normalizedBooking === 'both';
    // const showPrintCards = isDropOff;
    // const showPdfButton = isDropOff || isReturn || isBoth;
    /* Buttons are now always visible after generating */ const showCsv = datePattern === "depart" || datePattern === "depart_return";
    const showPdf = datePattern === "depart" || datePattern === "depart_return";
    const showPrintCards = datePattern === "depart_card";
    /* --------------------------------------------------------------- */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProtectedRoute$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col md:flex-row md:items-end justify-between gap-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h6", {
                                className: "text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none",
                                children: "Reporting"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 922,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-4xl font-black tracking-tight text-foreground leading-none",
                                children: "Returns Report"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 925,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mt-3 max-w-lg font-medium",
                                children: "View and export comprehensive records of upcoming vehicle returns. Use the date filters below to narrow your search."
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 928,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                        lineNumber: 921,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                    lineNumber: 920,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass border-border/50 rounded-2xl p-6 shadow-sm",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col sm:flex-row flex-wrap items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row items-start sm:items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] font-black uppercase tracking-widest text-muted-foreground",
                                        children: "From"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 939,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative w-[180px] group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                readOnly: true,
                                                value: formatPrettyDate(from || fromDisplay),
                                                className: "h-11 w-full pl-10 pr-3 text-sm bg-background/50 border-border/50 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30",
                                                onClick: ()=>document.getElementById("reportFromNative")?.showPicker()
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 941,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                                className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 948,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                id: "reportFromNative",
                                                type: "date",
                                                className: "absolute inset-0 opacity-0 cursor-pointer",
                                                value: from || "",
                                                onChange: (e)=>{
                                                    setFrom(e.target.value);
                                                    setFromDisplay(e.target.value);
                                                },
                                                onClick: (e)=>e.currentTarget.showPicker?.()
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 949,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 940,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 938,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row items-start sm:items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] font-black uppercase tracking-widest text-muted-foreground",
                                        children: "To"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 965,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative w-[180px] group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                readOnly: true,
                                                value: formatPrettyDate(to || toDisplay),
                                                className: "h-11 w-full pl-10 pr-3 text-sm bg-background/50 border-border/50 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30",
                                                onClick: ()=>document.getElementById("reportToNative")?.showPicker()
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 967,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                                className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 974,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                id: "reportToNative",
                                                type: "date",
                                                className: "absolute inset-0 opacity-0 cursor-pointer",
                                                value: to || "",
                                                onChange: (e)=>{
                                                    setTo(e.target.value);
                                                    setToDisplay(e.target.value);
                                                },
                                                onClick: (e)=>e.currentTarget.showPicker?.()
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 975,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 966,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 964,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row items-start sm:items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] font-black uppercase tracking-widest text-muted-foreground",
                                        children: "Airport"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 991,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "h-11 min-w-[180px] bg-background border border-border rounded-xl px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                                        value: airport,
                                        onChange: (e)=>{
                                            setAirport(e.target.value);
                                            setPage(1);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "All Airports",
                                                children: "All Airports"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 997,
                                                columnNumber: 17
                                            }, this),
                                            airportList.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: a.airport_name,
                                                    children: a.airport_name
                                                }, a.airport_id, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 999,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 992,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 990,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                className: "h-11 rounded-xl px-6 font-bold bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 ml-auto sm:ml-0",
                                onClick: generateReport,
                                disabled: loading,
                                children: "Generate Report"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 1007,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 ml-auto",
                                children: [
                                    hasGenerated && showCsv && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                className: "h-11 rounded-xl font-bold flex items-center gap-2",
                                                onClick: ()=>downloadCSV(`booking-${Date.now()}.csv`, filteredSorted),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                        lineNumber: 1024,
                                                        columnNumber: 21
                                                    }, this),
                                                    " CSV"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1019,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                className: "h-11 rounded-xl font-bold flex items-center gap-2",
                                                onClick: ()=>downloadExcelBooking(`booking-${Date.now()}.xlsx`, filteredSorted),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__["FileSpreadsheet"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                        lineNumber: 1031,
                                                        columnNumber: 21
                                                    }, this),
                                                    " Excel"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1026,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    hasGenerated && showPdf && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        className: "h-11 rounded-xl font-bold flex items-center gap-2",
                                        onClick: ()=>downloadFullTablePDF(filteredSorted),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1041,
                                                columnNumber: 19
                                            }, this),
                                            " PDF"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 1036,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 1016,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                        lineNumber: 936,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                    lineNumber: 935,
                    columnNumber: 9
                }, this),
                !hasGenerated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass border-border/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 1052,
                                columnNumber: 18
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                            lineNumber: 1051,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-black text-foreground",
                            children: "No Report Generated"
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                            lineNumber: 1054,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground max-w-sm mt-2",
                            children: [
                                "Choose a date range above and click ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-semibold text-foreground",
                                    children: "Generate Report"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                    lineNumber: 1056,
                                    columnNumber: 54
                                }, this),
                                " to view return records."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                            lineNumber: 1055,
                            columnNumber: 14
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                    lineNumber: 1050,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass border-border/50 rounded-2xl overflow-hidden shadow-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-x-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Table"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHeader"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                            className: "hover:bg-transparent border-b border-border/50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30",
                                                    children: "#"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1065,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Ref No"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1066,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Customer"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1067,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Product"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1068,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Contact"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1069,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Return Flight"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1070,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Return"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1071,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Reg No"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1072,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Vehicle"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1073,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Dep Term"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1074,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                    className: "text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap",
                                                    children: "Ret Term"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1075,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1064,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 1063,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableBody"], {
                                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                colSpan: 11,
                                                className: "h-64 text-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-center justify-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1084,
                                                            columnNumber: 30
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-bold text-muted-foreground animate-pulse",
                                                            children: "Generating report..."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1085,
                                                            columnNumber: 30
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1083,
                                                    columnNumber: 26
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1082,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1081,
                                            columnNumber: 21
                                        }, this) : errMsg ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                colSpan: 11,
                                                className: "h-32 text-center text-red-600 font-bold bg-red-500/5",
                                                children: errMsg
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1091,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1090,
                                            columnNumber: 21
                                        }, this) : pageSlice.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                colSpan: 11,
                                                className: "h-64 text-center text-muted-foreground font-medium",
                                                children: "No records found for the selected date range."
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1097,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1096,
                                            columnNumber: 21
                                        }, this) : pageSlice.map((b, i)=>{
                                            const sl = (page - 1) * limit + (i + 1);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                                    className: "hover:bg-muted/50 transition-all border-b border-border/50 group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-bold text-muted-foreground/50",
                                                            children: String(sl).padStart(2, '0')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1108,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-black text-primary tracking-tight whitespace-nowrap",
                                                            children: b.ref_no
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1111,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-bold text-foreground text-xs whitespace-nowrap",
                                                            children: `${b.first_name} ${b.last_name}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1112,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-bold text-muted-foreground text-xs whitespace-nowrap",
                                                            children: b.product_name
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1113,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-medium text-xs whitespace-nowrap",
                                                            children: b.mobile || '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1114,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-medium text-xs whitespace-nowrap",
                                                            children: b.return_flight || '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1115,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-bold text-xs whitespace-nowrap bg-primary/5",
                                                            children: formatFullDate(b.return_date)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1116,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-black uppercase tracking-widest text-xs whitespace-nowrap opacity-80",
                                                            children: b.vehicle_registration || '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1119,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-medium text-[11px] whitespace-nowrap text-muted-foreground",
                                                            children: `${b.vehicle_make} / ${b.vehicle_model} / ${b.vehicle_colour}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1120,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-bold text-xs whitespace-nowrap",
                                                            children: b.depart_terminal
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1123,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-center py-4 font-bold text-xs whitespace-nowrap",
                                                            children: b.return_terminal
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                            lineNumber: 1124,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                    lineNumber: 1107,
                                                    columnNumber: 27
                                                }, this)
                                            }, b.id, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1106,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                        lineNumber: 1079,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                lineNumber: 1062,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                            lineNumber: 1061,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col sm:flex-row items-center justify-between p-6 border-t border-border/50 bg-muted/10 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-bold text-muted-foreground",
                                    children: [
                                        "Showing ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-foreground",
                                            children: pageSlice.length
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1137,
                                            columnNumber: 25
                                        }, this),
                                        " of ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-foreground",
                                            children: total
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1137,
                                            columnNumber: 88
                                        }, this),
                                        " total records"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                    lineNumber: 1136,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            className: "h-10 px-4 rounded-xl font-bold transition-all disabled:opacity-30",
                                            disabled: page <= 1 || loading,
                                            onClick: ()=>setPage((p)=>Math.max(1, p - 1)),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1146,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1140,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center px-4 h-10 rounded-xl bg-muted/50 border border-border/50",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-black",
                                                children: [
                                                    "Page ",
                                                    page,
                                                    " of ",
                                                    totalPages
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1149,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1148,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            className: "h-10 px-4 rounded-xl font-bold transition-all disabled:opacity-30",
                                            disabled: page >= totalPages || loading,
                                            onClick: ()=>setPage((p)=>Math.min(totalPages, p + 1)),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                                lineNumber: 1157,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                            lineNumber: 1151,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                                    lineNumber: 1139,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                            lineNumber: 1135,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/return-report/page.tsx",
                    lineNumber: 1060,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(dashboard)/return-report/page.tsx",
            lineNumber: 918,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(dashboard)/return-report/page.tsx",
        lineNumber: 917,
        columnNumber: 5
    }, this);
}
_s(BookingReportPage, "XV+P9QiTXEWg6+Fd9lukmESdBAg=");
_c = BookingReportPage;
var _c;
__turbopack_context__.k.register(_c, "BookingReportPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_dbe1da03._.js.map