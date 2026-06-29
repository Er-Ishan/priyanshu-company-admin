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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

/* -------------------- UTILS -------------------- */
function fmtDT(v?: string) {
  if (!v) return '';

  const clean = v.replace("T", " ");

  const [datePart, timePart = "00:00:00"] = clean.split(" ");

  const [year, month, day] = datePart.split("-");

  const [hour, minute] = timePart.split(":");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return `${day} ${months[Number(month) - 1]} ${year} ${hour}:${minute}`;
}

function formatPrettyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}


const REPORT_EXPORT_HEADERS = [
  "S.N",
  "Ref No",
  "Customer",
  "Product",
  "Contact No",
  "Return Flight",
  "Drop-off",
  "Reg No",
  "Make / Model / Color",
  "Depart Terminal",
  "Return Terminal",
] as const;

function buildReportExportRows(rows: Booking[]) {
  return rows.map((b, i) => ({
    "S.N": i + 1,
    "Ref No": b.ref_no ?? "-",
    Customer: `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() || "-",
    Product: b.product_name ?? "-",
    "Contact No": b.mobile ?? "-",
    "Return Flight": b.return_flight ?? "-",
    "Drop-off": formatFullDate(b.drop_off_date),
    "Reg No": b.vehicle_registration ?? "-",
    "Make / Model / Color": `${b.vehicle_make ?? "-"} / ${b.vehicle_model ?? "-"} / ${b.vehicle_colour ?? "-"}`,
    "Depart Terminal": b.depart_terminal ?? "-",
    "Return Terminal": b.return_terminal ?? "-",
  }));
}

function downloadExcelBooking(filename: string, rows: Booking[]) {
  const excelRows = buildReportExportRows(rows);

  const worksheet = XLSX.utils.json_to_sheet(excelRows, {
    header: [...REPORT_EXPORT_HEADERS],
    cellDates: false,
  });

  worksheet["!cols"] = [
    { wch: 6 },  // S.N
    { wch: 18 }, // Ref No
    { wch: 22 }, // Customer
    { wch: 22 }, // Product
    { wch: 16 }, // Contact No
    { wch: 16 }, // Return Flight
    { wch: 24 }, // Drop-off
    { wch: 14 }, // Reg No
    { wch: 28 }, // Make / Model / Color
    { wch: 16 }, // Depart Terminal
    { wch: 16 }, // Return Terminal
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

function formatFullDate(dateString: string | null | undefined) {
  if (!dateString) return "-";

  const clean = dateString.replace("T", " ");

  const [datePart, timePart = "00:00:00"] = clean.split(" ");

  const [year, month, day] = datePart.split("-");

  const [hour, minute] = timePart.split(":");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return `${day} ${months[Number(month) - 1]} ${year} ${hour}:${minute}`;
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
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  const ymd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return input;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
    REPORT_EXPORT_HEADERS.join(","),
    ...exportRows.map((row) =>
      REPORT_EXPORT_HEADERS.map((header) =>
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

  const pages = rows.map((b) => `
<section class="page" style="font-family: Arial, sans-serif; padding:20px;">
  
  <h2 style="margin-bottom:10px;">Booking Invoice</h2>
  <div style="font-size:12px; margin-bottom:20px;">
    <strong>Ref No:</strong> ${esc(b.ref_no)}<br/>
    <strong>Printed:</strong> ${esc(printDate)}
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tbody>
      <tr><td><strong>Customer</strong></td><td>${esc(`${b.first_name} ${b.last_name}`)}</td></tr>
      <tr><td><strong>Product</strong></td><td>${esc(b.product_name)}</td></tr>
      <tr><td><strong>Contact No</strong></td><td>${esc(b.mobile)}</td></tr>
      <tr><td><strong>Return Flight</strong></td><td>${esc(b.return_flight)}</td></tr>
      <tr><td><strong>Drop-off Date</strong></td><td>${esc(formatFullDate(b.drop_off_date))}</td></tr>
      <tr><td><strong>Return Date</strong></td><td>${esc(formatFullDate(b.return_date))}</td></tr>
      <tr><td><strong>Vehicle Reg</strong></td><td>${esc(b.vehicle_registration)}</td></tr>
      <tr>
        <td><strong>Vehicle</strong></td>
        <td>${esc(`${b.vehicle_make} / ${b.vehicle_model} / ${b.vehicle_colour}`)}</td>
      </tr>
      <tr><td><strong>Depart Terminal</strong></td><td>${esc(b.depart_terminal)}</td></tr>
      <tr><td><strong>Return Terminal</strong></td><td>${esc(b.return_terminal)}</td></tr>
    </tbody>
  </table>

</section>
`).join("");

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Invoice</title>
  <style>
    @page { size: A4; margin: 16mm; }
    .page { page-break-after: always; }
    table td { border:1px solid #ccc; padding:8px; }
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

/* -------------------- PAGE -------------------- */
export default function BookingReportPage() {

  /* Filters */
  const [airport, setAirport] = useState<string>('All Airports');
  const [airportList, setAirportList] = useState<{ airport_id: number; airport_name: string; iata_code: string }[]>([]);
  const [booking_type, setBookingType] = useState<string>('Booking Type');
  // const [from, setFrom] = useState<string>('');
  // const [to, setTo] = useState<string>('');
  const [status, setStatus] = useState<string>('All Bookings');
  const [source, setSource] = useState<string>('All Sources');

  const [from, setFrom] = useState<string>(todayStr);
  const [to, setTo] = useState<string>(todayStr);

  const [fromDisplay, setFromDisplay] = useState<string>(from);
  const [toDisplay, setToDisplay] = useState<string>(to);



  /* Data/UI */
  const [allRows, setAllRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

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
  const [serviceType, setServiceType] = useState<string>('All Services');

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
    const exportRows = buildReportExportRows(rows);

    const tableRows = exportRows
      .map(
        (row) => `
      <tr>
        ${REPORT_EXPORT_HEADERS.map((header) => `<td>${esc(row[header])}</td>`).join("")}
      </tr>
    `
      )
      .join("");

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
        ${REPORT_EXPORT_HEADERS.map((header) => `<th>${header}</th>`).join("")}
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
      return backendProxyPath(`/api/thomsondata/daterange?${qs.toString()}`);
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

      const filtered = list.filter((r: Booking) => {
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
          new Date(a.drop_off_date || 0).getTime() -
          new Date(b.drop_off_date || 0).getTime()
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

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    async function loadAirports() {
      try {
        const res = await apiFetch("/api/backend/api/airports");
        if (res.ok) {
          const json = await res.json();
          setAirportList(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load airports:", err);
      }
    }
    loadAirports();
  }, []);

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
    downloadFullTablePDF(filteredSorted);
  };


  const handleDownload = () => downloadCSV(`depart-report-${Date.now()}.csv`, filteredSorted);

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
      <div className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
              Reporting
            </h6>
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
              Departures Report
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
              View and export comprehensive records of upcoming vehicle drop-offs. Use the date filters below to narrow your search.
            </p>
          </div>
        </div>

        {/* FILTER PANEL */}
        <div className="glass border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
            {/* From Date */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From</label>
              <div className="relative w-[180px] group">
                <input
                  type="text"
                  readOnly
                  value={formatPrettyDate(from || fromDisplay)}
                  className="h-11 w-full pl-10 pr-3 text-sm bg-background/50 border-border/50 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30"
                  onClick={() => (document.getElementById("reportFromNative") as HTMLInputElement | null)?.showPicker()}
                />
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="reportFromNative"
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={from || ""}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setFromDisplay(e.target.value);
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                />
              </div>
            </div>

            {/* To Date */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">To</label>
              <div className="relative w-[180px] group">
                <input
                  type="text"
                  readOnly
                  value={formatPrettyDate(to || toDisplay)}
                  className="h-11 w-full pl-10 pr-3 text-sm bg-background/50 border-border/50 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30"
                  onClick={() => (document.getElementById("reportToNative") as HTMLInputElement | null)?.showPicker()}
                />
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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

            <select
              className="
    w-[220px]
    h-10
    px-3
    bg-background
    border
    border-border
    rounded-lg
    text-sm
    text-foreground
    appearance-none
    transition-all
    cursor-pointer
    hover:border-primary/50
    focus:outline-none
    focus:ring-2
    focus:ring-primary/20
    dark:bg-background
    dark:border-border
    dark:text-foreground
  "
              value={airport}
              onChange={(e) => setAirport(e.target.value)}
            >
              <option value="All Airports">All Airports</option>
              {airportList.map((a) => (
                <option key={a.airport_id} value={a.airport_name}>
                  {a.airport_name}
                </option>
              ))}
            </select>

            {/* Generate Button */}
            <Button
              className="h-11 rounded-xl px-6 font-bold bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 ml-auto sm:ml-0"
              onClick={generateReport}
              disabled={loading}
            >
              Generate Report
            </Button>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {hasGenerated && showCsv && (
                <>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl font-bold flex items-center gap-2"
                    onClick={() => downloadCSV(`booking-${Date.now()}.csv`, filteredSorted)}
                  >
                    <FileText size={16} /> CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl font-bold flex items-center gap-2"
                    onClick={() => downloadExcelBooking(`booking-${Date.now()}.xlsx`, filteredSorted)}
                  >
                    <FileSpreadsheet size={16} /> Excel
                  </Button>
                </>
              )}
              {hasGenerated && showPdf && (
                <Button
                  variant="outline"
                  className="h-11 rounded-xl font-bold flex items-center gap-2"
                  onClick={() => downloadFullTablePDF(filteredSorted)}
                >
                  <Download size={16} /> PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        {!hasGenerated ? (
          <div className="glass border-border/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-lg font-black text-foreground">No Report Generated</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Choose a date range above and click <span className="font-semibold text-foreground">Generate Report</span> to view departure records.
            </p>
          </div>
        ) : (
          <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Ref No</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Customer</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Product</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Contact</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Return Flight</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Drop-off</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Reg No</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Vehicle</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Dep Term</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Ret Term</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-64 text-center">
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
                      <TableCell colSpan={11} className="h-64 text-center text-muted-foreground font-medium">
                        No records found for the selected date range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageSlice.map((b, i) => {
                      const sl = (page - 1) * limit + (i + 1);

                      return (
                        <Fragment key={b.id}>
                          <TableRow className="hover:bg-muted/50 transition-all border-b border-border/50 group">
                            <TableCell className="text-center py-4 font-bold text-muted-foreground/50">
                              {String(sl).padStart(2, '0')}
                            </TableCell>
                            <TableCell className="text-center py-4 font-black text-primary tracking-tight whitespace-nowrap">{b.ref_no}</TableCell>
                            <TableCell className="text-center py-4 font-bold text-foreground text-xs whitespace-nowrap">{`${b.first_name} ${b.last_name}`}</TableCell>
                            <TableCell className="text-center py-4 font-bold text-muted-foreground text-xs whitespace-nowrap">{b.product_name}</TableCell>
                            <TableCell className="text-center py-4 font-medium text-xs whitespace-nowrap">{b.mobile || '-'}</TableCell>
                            <TableCell className="text-center py-4 font-medium text-xs whitespace-nowrap">{b.return_flight || '-'}</TableCell>
                            <TableCell className="text-center py-4 font-bold text-xs whitespace-nowrap bg-primary/5">
                              {formatFullDate(b.drop_off_date)}
                            </TableCell>
                            <TableCell className="text-center py-4 font-black uppercase tracking-widest text-xs whitespace-nowrap opacity-80">{b.vehicle_registration || '-'}</TableCell>
                            <TableCell className="text-center py-4 font-medium text-[11px] whitespace-nowrap text-muted-foreground">
                              {`${b.vehicle_make} / ${b.vehicle_model} / ${b.vehicle_colour}`}
                            </TableCell>
                            <TableCell className="text-center py-4 font-bold text-xs whitespace-nowrap">{b.depart_terminal}</TableCell>
                            <TableCell className="text-center py-4 font-bold text-xs whitespace-nowrap">{b.return_terminal}</TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* PAGINATION SECTION */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-border/50 bg-muted/10 gap-4">
              <p className="text-xs font-bold text-muted-foreground">
                Showing <span className="text-foreground">{pageSlice.length}</span> of <span className="text-foreground">{total}</span> total records
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl font-bold transition-all disabled:opacity-30"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center px-4 h-10 rounded-xl bg-muted/50 border border-border/50">
                  <span className="text-xs font-black">Page {page} of {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl font-bold transition-all disabled:opacity-30"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}