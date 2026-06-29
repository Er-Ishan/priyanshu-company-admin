'use client';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiFetch } from "@/app/lib/apiFetch";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { Fragment, useMemo, useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProtectedRoute from "@/components/ProtectedRoute";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, CalendarDays } from "lucide-react";

/* -------------------- OPTIONS -------------------- */
// const AIRPORTS = ['All Airports', 'LHR', 'LGW', 'STN', 'LTN', 'MAN', 'BHX'] as const;
const STATUSES = ['All Bookings', 'Active', 'Cancelled', 'Completed', 'No Show', 'Refunded', 'Pending'] as const;
const SOURCES = ['All Sources', 'Supplier', 'Direct', 'Partner', 'Website', 'Call Centre'] as const;
const BOOKING = ['All Types', 'Drop Off', 'Return', 'Both'] as const;

/* -------------------- TYPES -------------------- */
type Booking = {
  id: number;
  ref_no: string | null;
  product_name: string | null;
  title: string | null;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  travelling_from: string | null;
  service_provider: string | null;
  service: string | null;

  record_type?: 'DROP_OFF' | 'RETURN';
  event_date?: string;


  drop_off_date: string | null;
  return_date: string | null;
  no_of_days: number | null;

  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_colour: string | null;
  vehicle_registration: string | null;
  passengers: number | null;

  quote_amount: number | null;
  discount: number | null;
  booking_fee: number | null;
  total_payable: number | null;

  status: string;
  source: string | null;
  website_name: string | null;
  transaction_source: string | null;
  transaction_id: string | null;

  depart_terminal: string | null;
  depart_flight: string | null;
  return_terminal: string | null;
  return_flight: string | null;

  created_at: string;
};


type MaybeWrapped<T> = { data: T } | T;

/* -------------------- CONFIG -------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrettyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}


/* -------------------- UTILS -------------------- */
function formatDbDateTime(
  dateString: string | null | undefined,
  emptyLabel = "TBC",
  part: "full" | "date" | "time" = "full"
): string {
  if (!dateString) return emptyLabel;

  const clean = String(dateString).trim().replace("T", " ");
  const [datePart, rawTime = "00:00:00"] = clean.split(" ");
  const timePart = rawTime.replace(/\.\d+/, "").replace(/Z$/i, "");
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  if (!year || !month || !day || hour === undefined || minute === undefined) return emptyLabel;

  const date = `${day}-${MONTHS[Number(month) - 1]}-${year}`;
  const time = `${hour}:${minute}`;

  if (part === "date") return date;
  if (part === "time") return time;
  return `${date} ${time}`;
}

function recordTypeLabel(recordType?: Booking["record_type"]) {
  if (recordType === "RETURN") return "Return";
  if (recordType === "DROP_OFF") return "Depart";
  return "-";
}

function terminalForRecord(b: Booking) {
  if (b.record_type === "RETURN") return b.return_terminal ?? "-";
  return b.depart_terminal ?? "-";
}

function eventDateForRecord(b: Booking) {
  if (b.record_type === "RETURN") return b.return_date;
  return b.drop_off_date;
}

function flightForRecord(b: Booking) {
  if (b.record_type === "RETURN") return b.return_flight ?? "-";
  return b.depart_flight ?? "-";
}

function dateOnlyFromBooking(raw: string | null | undefined): string {
  if (!raw) return "";
  const clean = String(raw).replace("T", " ");
  return clean.split(" ")[0]?.slice(0, 10) || "";
}

function dateInRange(dateStr: string | null | undefined, start: string, end: string): boolean {
  const d = dateOnlyFromBooking(dateStr);
  if (!d || !start || !end) return false;
  return d >= start && d <= end;
}

function expandDepartReturnRows(rows: Booking[], start: string, end: string): Booking[] {
  const expanded: Booking[] = [];

  for (const row of rows) {
    const departInRange = dateInRange(row.drop_off_date, start, end);
    const returnInRange = dateInRange(row.return_date, start, end);

    if (departInRange) {
      expanded.push({
        ...row,
        record_type: "DROP_OFF",
        event_date: row.drop_off_date ?? undefined,
      });
    }

    if (returnInRange) {
      expanded.push({
        ...row,
        record_type: "RETURN",
        event_date: row.return_date ?? undefined,
      });
    }
  }

  return expanded;
}

const REPORT_TABLE_HEADERS = [
  "#",
  "Ref No",
  "Customer",
  "Product",
  "Contact",
  "Type",
  "Flight No",
  "Date & Time",
  "Vehicle",
  "Reg No",
  "Terminal",
] as const;

type ReportTableRow = Record<(typeof REPORT_TABLE_HEADERS)[number], string>;

function buildReportExportRows(rows: Booking[]): ReportTableRow[] {
  return rows.map((b, i) => ({
    "#": String(i + 1).padStart(2, "0"),
    "Ref No": b.ref_no ?? "-",
    Customer: `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() || "-",
    Product: b.product_name ?? "-",
    Contact: b.mobile ?? "-",
    Type: recordTypeLabel(b.record_type),
    "Flight No": flightForRecord(b),
    "Date & Time": formatDbDateTime(eventDateForRecord(b)),
    Vehicle: `${b.vehicle_make ?? "-"} / ${b.vehicle_model ?? "-"} / ${b.vehicle_colour ?? "-"}`,
    "Reg No": b.vehicle_registration ?? "-",
    Terminal: terminalForRecord(b),
  }));
}

function downloadExcelBooking(filename: string, rows: Booking[]) {
  const excelRows = buildReportExportRows(rows);

  const worksheet = XLSX.utils.json_to_sheet(excelRows, {
    header: [...REPORT_TABLE_HEADERS],
    cellDates: false,
  });

  worksheet["!cols"] = [
    { wch: 5 },  // #
    { wch: 18 }, // Ref No
    { wch: 22 }, // Customer
    { wch: 22 }, // Product
    { wch: 16 }, // Contact
    { wch: 10 }, // Type
    { wch: 14 }, // Flight No
    { wch: 20 }, // Date & Time
    { wch: 28 }, // Vehicle
    { wch: 14 }, // Reg No
    { wch: 14 }, // Terminal
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
}


const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const threeDaysAgo = new Date();
threeDaysAgo.setDate(today.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

function buildReportTableHTML(rows: Booking[]) {
  const printedAt = new Date().toLocaleString("en-GB");
  const exportRows = buildReportExportRows(rows);

  const tableRows = rows
    .map((b, i) => {
      const row = exportRows[i];
      const isReturnRow = b.record_type === "RETURN";
      const eventDate = eventDateForRecord(b);
      const dateTimeHtml = !eventDate
        ? "TBC"
        : `${formatDbDateTime(eventDate, "TBC", "date")}<br><span style="font-size:11px;color:#64748b">${formatDbDateTime(eventDate, "TBC", "time")}</span>`;

      return `
    <tr class="${isReturnRow ? "return-row" : ""}">
      ${REPORT_TABLE_HEADERS.map((header) => {
        if (header === "Date & Time") {
          return `<td>${dateTimeHtml}</td>`;
        }
        return `<td>${esc(row[header])}</td>`;
      }).join("")}
    </tr>`;
    })
    .join("");

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Depart & Return Report</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      color: #1f2937;
      margin: 0;
      padding: 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0ea5e9;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .brand { font-size: 20px; font-weight: 700; color: #0ea5e9; }
    .meta { text-align: right; font-size: 12px; color: #64748b; }
    .title { margin: 0 0 12px; font-size: 18px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead th {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 8px 6px;
      text-align: center;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    tbody td {
      border: 1px solid #e2e8f0;
      padding: 7px 6px;
      text-align: center;
      vertical-align: middle;
    }
    .return-row { background-color: #f1f5f9; color: #64748b; }
    tbody tr { page-break-inside: avoid; }
    .footer {
      margin-top: 16px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Depart & Return Report</div>
    <div class="meta">
      <div><strong>Generated:</strong> ${printedAt}</div>
      <div><strong>Total Records:</strong> ${rows.length}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        ${REPORT_TABLE_HEADERS.map((h) => `<th>${h}</th>`).join("")}
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="footer">
    <div>Internal Use Only</div>
    <div>Records: ${rows.length}</div>
  </div>
</body>
</html>`;
}



async function exportTableToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return alert("Table not found");

  // Expand scroll area
  element.style.overflow = "visible";

  // Capture as canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    scrollX: 0,
    scrollY: 0,
    useCORS: true,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("l", "pt", "a4"); // landscape mode for wide table

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

function money(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `£${Number(n || 0).toFixed(2)}`;
  }
}

function toLocalInputValue(iso?: string) {
  if (!iso) return '';

  return iso.replace(' ', 'T').slice(0, 16);
}

function toSqlDateTime(local: string) {
  if (!local) return null;
  const s = local.trim();
  if (!s.includes('T')) return s.replace(' ', ' ').concat(':00');
  return s.replace('T', ' ') + (s.length === 16 ? ':00' : '');
}

function normalizeYMD(input: string) {
  if (!input) return '';

  const ddmmyyyy = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  }

  const ymd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (ymd) {
    return input;
  }

  return input.slice(0, 10);
}

function getRowBgClass(status?: string) {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-50';
  if (s === 'cancelled') return 'bg-red-50';
  if (s === 'completed') return 'bg-blue-50';
  if (s === 'pending') return 'bg-yellow-50';
  if (s === 'refunded') return 'bg-pink-50';
  if (s === 'no show') return 'bg-gray-50';
  return 'bg-neutral-50';
}

const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* CSV helper */
function downloadCSV(filename: string, rows: Booking[]) {
  const exportRows = buildReportExportRows(rows);

  const csvRows = [
    REPORT_TABLE_HEADERS.join(","),
    ...exportRows.map((row) =>
      REPORT_TABLE_HEADERS.map((header) =>
        `"${String(row[header]).replace(/"/g, '""')}"`
      ).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}


/* -------------------- PRINT (multi-page invoices) -------------------- */
function buildInvoiceHTML(rows: Booking[]) {
  const printDate = new Date().toLocaleString();

  const pages = rows.map((b, idx) => {
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
        <p><strong>Booked On:</strong> ${esc(formatDbDateTime(b.created_at, ""))}</p>
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


function buildPrintCardHTML(rows: Booking[]) {
  const pages = rows.map((b) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Parking Booking Slip</title>
<style>
${/* === COPY CSS EXACTLY FROM YOUR HTML FILE === */""}
${/* (No changes made to styling) */""}
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
  <td class="red">${formatDbDateTime(b.return_date, "-", "date")}</td>
  <td class="red">${formatDbDateTime(b.return_date, "-", "time")}</td>
  <td class="red">${b.return_terminal ?? "-"}</td>
</tr>
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
<div class="box arrival">${formatDbDateTime(b.drop_off_date, "-")}</div>
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
<tr><td>${formatDbDateTime(b.return_date, "-")}</td><td>${b.return_flight ?? "-"}</td></tr>
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

/* -------------------- PAGE -------------------- */
export default function BookingReportPage() {

  /* Filters */
  const [airport, setAirport] = useState<string>('All Airports');
  const [booking_type, setBookingType] = useState<string>('Booking Type');
  // const [from, setFrom] = useState<string>('');
  // const [to, setTo] = useState<string>('');
  const [status, setStatus] = useState<string>('All Bookings');
  const [source, setSource] = useState<string>('All Sources');

  const [airportList, setAirportList] = useState<{ airport_id: number; airport_name: string }[]>([]);

  const [from, setFrom] = useState<string>(todayStr);
  const [to, setTo] = useState<string>(todayStr);

  const [fromDisplay, setFromDisplay] = useState<string>(from);
  const [toDisplay, setToDisplay] = useState<string>(to);


  /* Data/UI */
  const [allRows, setAllRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const [serviceType, setServiceType] = useState<string>('All Services');


  type DatePattern = "depart" | "depart_return" | "depart_card";

  const [datePattern, setDatePattern] = useState<DatePattern>("depart");

  /* Pagination */
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  /* Sorting */
  const [sortBy, setSortBy] =
    useState<'booked_on' | 'dropoff_datetime' | 'return_datetime' | 'price' | 'customer_name' | 'ref_no'>('booked_on');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  /* Inline edit */
  const [openRowId, setOpenRowId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  type EditForm = {
    customer_name: string;
    contact_no: string;
    customer_email: string;
    vehicle_reg_no: string;
    airport: string;
    status: string;
    price: string;
    dropoff_datetime: string;
    return_datetime: string;
    notes: string;
  };
  const [form, setForm] = useState<EditForm>({
    customer_name: '',
    contact_no: '',
    customer_email: '',
    vehicle_reg_no: '',
    airport: '',
    status: 'Active',
    price: '',
    dropoff_datetime: '',
    return_datetime: '',
    notes: '',
  });

  function buildFullTableHTML(rows: Booking[]) {
    return buildReportTableHTML(rows);
  }






  async function downloadFullTablePDF(rows: Booking[]) {
    const html = buildFullTableHTML(rows);
    const win = window.open("", "_blank");

    if (!win) return alert("Please allow popups!");

    win.document.write(html);
    win.document.close();

    setTimeout(() => win.print(), 500);
  }


  const ariaSort = (key: typeof sortBy): 'ascending' | 'descending' | 'none' =>
    sortBy === key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';

  function buildFetchUrl(df: string, dt: string) {
    if (df && dt) {
      const qs = new URLSearchParams({ start: df, end: dt });
      return backendProxyPath(`/api/thomsondata/depart-return-range?${qs.toString()}`);
    }
    return backendProxyPath("/api/thomsondata/active");
  }

  const generateReport = async () => {
    setLoading(true);
    setErrMsg('');
    setHasGenerated(true);

    try {
      const df = normalizeYMD(from);
      const dt = normalizeYMD(to);

      const url = buildFetchUrl(df, dt);

      const res = await apiFetch(url, {
        cache: "no-store",
      });

      const payload = await res.json();
      const list = Array.isArray(payload) ? payload : (payload?.data || []);
      const expanded =
        df && dt
          ? (list.some((row: Booking) => row.record_type)
            ? list.map((row: Booking) => ({
              ...row,
              event_date: row.event_date ?? row.drop_off_date ?? row.return_date ?? undefined,
            }))
            : expandDepartReturnRows(list, df, dt))
          : list.map((row: Booking) => ({
            ...row,
            record_type: "DROP_OFF" as const,
            event_date: row.drop_off_date ?? undefined,
          }));

      const filtered = expanded.filter((r: Booking) => {
        const okAirport =
          airport === 'All Airports' ||
          (r.travelling_from || '').toLowerCase() === airport.toLowerCase();

        const okService =
          serviceType === 'All Services' ||
          (r.service || '').toLowerCase() === serviceType.toLowerCase();

        const okStatus =
          status === 'All Bookings' ||
          (r.status || '').toLowerCase() === status.toLowerCase();

        const okSource =
          source === 'All Sources' ||
          (r.source || '').toLowerCase() === source.toLowerCase();

        return okAirport && okService && okStatus && okSource;
      });


      filtered.sort(
        (a: Booking, b: Booking) =>
          new Date(a.event_date || 0).getTime() -
          new Date(b.event_date || 0).getTime()
      );



      const finalFiltered =
        datePattern === "depart_card"
          ? filtered.filter((b: Booking) => b.drop_off_date)
          : filtered;

      setAllRows(finalFiltered);

      setPage(1);

    } catch (e: any) {
      setErrMsg(e.message || "Failed to generate report");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(backendProxyPath("/api/airports"))
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        setAirportList(list);
      })
      .catch((err) => console.error("Error fetching airports:", err));
  }, []);

  /* Client-side sort & paginate */
  const filteredSorted = useMemo(() => {
    let res = [...allRows];
    res.sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      const av = (a as any)[sortBy];
      const bv = (b as any)[sortBy];
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
    });
    return res;
  }, [allRows, sortBy, sortOrder]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSorted.slice(start, start + limit);
  }, [filteredSorted, page, limit]);

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };



  const handlePrint = () => {
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


  const handlePdf = () => {
    const html = buildFullTableHTML(filteredSorted);
    const win = window.open("", "_blank");

    if (!win) {
      alert("Please allow popups to generate PDF");
      return;
    }

    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
    }, 500);
  };



  const handleDownload = () => downloadCSV(`booking-report-${Date.now()}.csv`, filteredSorted);

  /* -------------------- REQUIRED BUTTON LOGIC -------------------- */
  // const normalizedBooking = booking_type.toLowerCase();
  // const isDropOff = normalizedBooking === 'drop off';
  // const isReturn = normalizedBooking === 'return';
  // const isBoth = normalizedBooking === 'both';

  // const showPrintCards = isDropOff;
  // const showPdfButton = isDropOff || isReturn || isBoth;
  /* Buttons are now always visible after generating */
  const showCsv =
    datePattern === "depart" || datePattern === "depart_return";

  const showPdf =
    datePattern === "depart" || datePattern === "depart_return";

  const showPrintCards =
    datePattern === "depart_card";



  /* --------------------------------------------------------------- */

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen px-3 py-3 space-y-3">
        {/* TITLE + FILTERS */}
        <div className="glass border-border/50 rounded-xl p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center flex-wrap gap-x-3 gap-y-2">
            <h1 className="text-lg font-bold text-foreground shrink-0 lg:mr-1">
              Depart & Return Report
            </h1>

            {/* From Date */}
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">From</label>
              <div className="relative w-[140px] group">
                <input
                  type="text"
                  readOnly
                  value={formatPrettyDate(from || fromDisplay)}
                  className="h-8 w-full pl-8 pr-2 text-xs bg-background/50 border-border/50 rounded-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30"
                  onClick={() => (document.getElementById("reportFromNative") as HTMLInputElement | null)?.showPicker()}
                />
                <CalendarDays className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="reportFromNative"
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={from || ""}
                  onChange={(e) => {
                    const selectedDate = e.target.value;

                    setFrom(selectedDate);
                    setFromDisplay(selectedDate);

                    // When drop off/from date changes, auto set return/to date same
                    setTo(selectedDate);
                    setToDisplay(selectedDate);

                    setPage(1);
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                />
              </div>
            </div>

            {/* To Date */}
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">To</label>
              <div className="relative w-[140px] group">
                <input
                  type="text"
                  readOnly
                  value={formatPrettyDate(to || toDisplay)}
                  className="h-8 w-full pl-8 pr-2 text-xs bg-background/50 border-border/50 rounded-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30"
                  onClick={() => (document.getElementById("reportToNative") as HTMLInputElement | null)?.showPicker()}
                />
                <CalendarDays className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="reportToNative"
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={to || ""}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setToDisplay(e.target.value);
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                />
              </div>
            </div>

            {/* Airport Filter */}
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Airport</label>
              <select
                className="h-8 min-w-[130px] bg-background border border-border rounded-lg px-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={airport}
                onChange={(e) => { setAirport(e.target.value); setPage(1); }}
              >
                <option value="All Airports">All Airports</option>
                {airportList.map((a) => (
                  <option key={a.airport_id} value={a.airport_name}>
                    {a.airport_name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              className="h-8 rounded-lg px-4 text-xs font-bold"
              onClick={generateReport}
              disabled={loading}
            >
              Generate Report
            </Button>

            {hasGenerated && showCsv && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 px-3"
                  onClick={() => downloadCSV(`booking-${Date.now()}.csv`, filteredSorted)}
                >
                  <FileText size={14} /> CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 px-3"
                  onClick={() => downloadExcelBooking(`booking-${Date.now()}.xlsx`, filteredSorted)}
                >
                  <FileSpreadsheet size={14} /> Excel
                </Button>
              </>
            )}
            {hasGenerated && showPdf && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 px-3"
                onClick={() => downloadFullTablePDF(filteredSorted)}
              >
                <Download size={14} /> PDF
              </Button>
            )}
          </div>
        </div>

        {/* TABLE SECTION */}
        {!hasGenerated ? (
          <div className="glass border-border/50 rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
              <CalendarDays size={18} />
            </div>
            <h3 className="text-sm font-bold text-foreground">No Report Generated</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select dates and click <span className="font-semibold text-foreground">Generate Report</span>.
            </p>
          </div>
        ) : (
          <div className="glass border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="w-[44px] text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30">#</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Ref No</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Customer</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Contact</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Type</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Flight No</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Date & Time</TableHead>
					  <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Reg No</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Vehicle</TableHead>
                    
                    <TableHead className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wide py-2 px-2 bg-muted/30 whitespace-nowrap">Terminal</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                          <p className="text-sm font-bold text-muted-foreground animate-pulse">Generating report...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : errMsg ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-32 text-center text-red-600 font-bold bg-red-500/5">
                        {errMsg}
                      </TableCell>
                    </TableRow>
                  ) : pageSlice.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-32 text-center text-muted-foreground text-sm">
                        No records found for the selected date range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageSlice.map((b, i) => {
                      const sl = (page - 1) * limit + (i + 1);

                      return (
                        <Fragment key={`${b.id}-${b.record_type}`}>
                          <TableRow className={cn("hover:bg-muted/50 transition-all border-b border-border/50 group", b.record_type === 'RETURN' ? 'bg-muted/30 text-muted-foreground' : '')}>
                            <TableCell className="text-left py-2 px-2 font-bold text-muted-foreground/50 text-xs">
                              {String(sl).padStart(2, '0')}
                            </TableCell>
                            <TableCell className="text-left py-2 px-2 font-bold text-primary text-xs whitespace-nowrap">{b.ref_no}</TableCell>
                            <TableCell className="text-left py-2 px-2 font-semibold text-foreground text-xs whitespace-nowrap">{`${b.first_name} ${b.last_name}`}</TableCell>
                            <TableCell className="text-left py-2 px-2 font-medium text-xs whitespace-nowrap">{b.mobile || '-'}</TableCell>
                            <TableCell className="text-left py-2 px-2 whitespace-nowrap">
                              <span
                                className={cn(
                                  "inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                  b.record_type === "RETURN"
                                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {recordTypeLabel(b.record_type)}
                              </span>
                            </TableCell>
                            <TableCell className="text-left py-2 px-2 font-medium text-xs whitespace-nowrap">{flightForRecord(b)}</TableCell>
                            <TableCell className="text-left py-2 px-2">
                              {(() => {
                                const eventDate = eventDateForRecord(b);
                                if (!eventDate) return "TBC";
                                return (
                                  <div className="flex flex-col leading-tight text-xs">
                                    <span className="font-medium text-foreground">
                                      {formatDbDateTime(eventDate, "TBC", "date")}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDbDateTime(eventDate, "TBC", "time")}
                                    </span>
                                  </div>
                                );
                              })()}
                            </TableCell>
							  <TableCell className="text-left py-2 px-2 font-bold uppercase text-[10px] whitespace-nowrap">{b.vehicle_registration || '-'}</TableCell>
                            <TableCell className="text-left py-2 px-2 font-medium text-[10px] whitespace-nowrap text-muted-foreground">
                              {`${b.vehicle_make} / ${b.vehicle_model} / ${b.vehicle_colour}`}
                            </TableCell>
                            
                            <TableCell className="text-left py-2 px-2 font-semibold text-xs whitespace-nowrap">{terminalForRecord(b)}</TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* PAGINATION SECTION */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-2 border-t border-border/50 bg-muted/10 gap-2">
              <p className="text-[11px] font-medium text-muted-foreground">
                Showing <span className="text-foreground">{pageSlice.length}</span> of <span className="text-foreground">{total}</span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg disabled:opacity-30"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} />
                </Button>
                <div className="flex items-center px-2 h-7 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-[11px] font-semibold">Page {page} of {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg disabled:opacity-30"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}