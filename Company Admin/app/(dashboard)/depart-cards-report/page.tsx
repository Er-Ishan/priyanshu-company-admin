'use client';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiFetch } from "@/app/lib/apiFetch";
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProtectedRoute from "@/components/ProtectedRoute";
import car1 from "@/public/assets/images/car-front.png";
import car2 from "@/public/assets/images/car-back.png";
import car3 from "@/public/assets/images/car-right.png";
import car4 from "@/public/assets/images/car-left.png";
import { Printer, CalendarDays, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";

import logo from "@/public/assets/images/logo.png"
// import scanner from "@/public/assets/images/scanner.jpg"
const scanner: any = null;
import cars from "@/public/assets/images/cars-latest.png"

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

/* -------------------- CONFIG -------------------- */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

/* -------------------- UTILS -------------------- */
function fmtDT(v?: string) {
  if (!v) return '';

  const clean = v.replace('T', ' ');
  const [datePart, timePart = '00:00:00'] = clean.split(' ');

  const [y, m, d] = datePart.split('-');
  const [hh, mm] = timePart.split(':');

  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y} ${hh}:${mm}`;
}

function formatPrettyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

async function exportTableToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return alert("Table not found");
  element.style.overflow = "visible";
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#fff",
    windowWidth: 1123,
    windowHeight: 794,
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("l", "pt", "a4");
  pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
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

  const [y, m, d] = datePart.split("-");
  const [hh, mm] = timePart.split(":");

  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y} ${hh}:${mm}`;
}

function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();
  return Promise.all(
    images.map((img) =>
      img.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      })
    )
  ).then(() => undefined);
}

function formatDateOnly(dateString: string | null) {
  if (!dateString) return "-";
  const [datePart] = dateString.split("T");
  const [y, m, d] = datePart.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

function normalizeYMD(input: string) {
  if (!input) return '';
  const ddmmyyyy = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  const ymd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return input;
  const parts = input.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) return input;
    if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return '';
}

function formatTimeOnly(dateString: string | null) {
  if (!dateString) return "-";
  const [, timePart] = dateString.split("T");
  if (!timePart) return "-";
  const [hh, mm] = timePart.split(":");
  return `${hh}:${mm}`;
}

const esc = (s: any) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function downloadCSV(filename: string, rows: Booking[]) {
  const headers = ["Ref No", "First Name", "Last Name", "Product", "Contact No", "Email", "Airport", "Service", "Depart Flight", "Return Flight", "Drop-off", "Return", "Days", "Reg No", "Make/Model", "Status"];
  const csvRows = [
    headers.join(","),
    ...rows.map((b) => [
      b.ref_no ?? "-", b.first_name ?? "-", b.last_name ?? "-", b.product_name ?? "-", b.mobile ?? "-", b.email ?? "-", b.travelling_from ?? "-", b.service ?? "-", b.depart_flight ?? "-", b.return_flight ?? "-", formatFullDate(b.drop_off_date), formatFullDate(b.return_date), b.no_of_days ?? "-", b.vehicle_registration ?? "-", `${b.vehicle_make} ${b.vehicle_model}`, b.status ?? "-"
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildPrintCardHTML(rows: Booking[], companyLogo: string, supportEmail: string, supportPhone: string, termsAndConditions: string) {
  const cards = rows.map((b, idx) => {
    const bookingBreak = idx === rows.length - 1 ? "" : `<div class="booking-break"></div>`;

    // Page 1: 3-Column Layout
    const page1 = `
<div class="page">
  <div class="grid">
    <!-- COLUMN 1 -->
    <div class="section col-border">
      <div class="logo"><img src="${companyLogo}" alt="Logo"></div>
      <h2 class="heading">Customer Information</h2>
      <table class="info-table">
        <tr><td class="label">NAME</td><td class="value">${esc(b.first_name)} ${esc(b.last_name)}</td></tr>
        <tr><td class="label">MOBILE</td><td class="value">${esc(b.mobile || "-")}</td></tr>
        <tr><td class="label">BOOKING REF</td><td class="value">${esc(b.ref_no || "-")}</td></tr>
        <tr><td class="label">SERVICE TYPE</td><td class="value">${esc(b.service || "-")}</td></tr>
      </table>

      <h2 class="heading">Flight Details</h2>
      <table class="flight-table">
        <thead><tr><th>DEPART DATE & TIME</th><th>TERMINAL</th><th>FLIGHT</th></tr></thead>
        <tbody><tr><td>${esc(formatFullDate(b.drop_off_date))}</td><td>${esc(b.depart_terminal || "-")}</td><td>${esc(b.depart_flight || "-")}</td></tr></tbody>
      </table>
      <table class="flight-table">
        <thead><tr><th>RETURN DATE & TIME</th><th>TERMINAL</th><th>FLIGHT</th></tr></thead>
        <tbody><tr><td>${esc(formatFullDate(b.return_date))}</td><td>${esc(b.return_terminal || "-")}</td><td>${esc(b.return_flight || "-")}</td></tr></tbody>
      </table>

      <h2 class="heading">Vehicle Details</h2>
      <table class="vehicle-mini-table">
        <tr><td>${esc(b.vehicle_make || "-")}</td><td>${esc(b.vehicle_registration || "-")}</td></tr>
      </table>

      <h2 class="heading">Declaration</h2>
      <div class="declaration-wrap">
        <div class="decl-box">
          <p class="decl-text">I accept the company's terms, acknowledge the noted damage and confirm all valuables have been removed</p>
          <div class="sig-box">SIGNATURE 1:</div>
        </div>
        <div class="decl-box">
          <p class="decl-text">I confirm the vehicle is returned in the same condition and that no claims can be made after signing and leaving the airport.</p>
          <div class="sig-box">SIGNATURE 2:</div>
        </div>
      </div>
    </div>

    <!-- COLUMN 2 -->
    <div class="section col-border">
      <div class="logo"><img src="${companyLogo}" alt="Logo"></div>
      <h2 class="heading">Reference</h2>
      <div class="ref-box">${esc(b.ref_no)}</div>

      <h2 class="heading">Return</h2>
      <div class="return-info-box">
        <div class="info-label">Date</div>
        <div class="info-value">${esc(formatDateOnly(b.return_date))}</div>
      </div>
      <div class="return-info-box">
        <div class="info-label">Time</div>
        <div class="info-value">${esc(formatTimeOnly(b.return_date))}</div>
      </div>
      <div class="return-info-box">
        <div class="info-label">Terminal</div>
        <div class="info-value">${esc(b.return_terminal || "-")}</div>
      </div>

      <div class="return-info-box">
        <div class="info-label">Make / Model</div>
        <div class="info-value">${esc(b.vehicle_make)} / ${esc(b.vehicle_model)}</div>
      </div>
      <div class="return-info-box">
        <div class="info-label">Color</div>
        <div class="info-value">${esc(b.vehicle_colour)}</div>
      </div>
      <div class="return-info-box">
        <div class="info-label">Reg No</div>
        <div class="info-value">${esc(b.vehicle_registration || "-")}</div>
      </div>
    </div>

    <!-- COLUMN 3 -->
    <div class="section">
      <div class="logo"><img src="${companyLogo}" alt="Logo"></div>
      <div class="contact-info">
        <div class="phone-large">☎ ${esc(supportPhone)}</div>
        <p class="contact-text">For customer service inquiries or feedback, email us at: ${esc(supportEmail)}</p>
        <p class="contact-highlight">For any changes or cancellations, please get in touch by phone.</p>
        <div class="contact-links">
           <div>✉ ${esc(supportEmail)}</div>
           <div>☎ ${esc(supportPhone)}</div>
        </div>
      </div>

      <div class="checklist-box">
        <div class="checklist-content">
          <p class="check-title">Before you leave, make sure you have:</p>
          <div class="check-items">
            <span>☐ Tickets</span>
            <span>☐ Passport</span>
            <span>☐ Phone</span>
            <span>☐ Currency</span>
          </div>
        </div>
        <!-- QR Section Removed as requested -->
      </div>

      <h2 class="heading mt-4">Booking Details</h2>
      <table class="details-table">
        <tr>
          <th>BOOKING REF NO</th>
          <th>RETURN DATE & TIME</th>
        </tr>
        <tr>
          <td>${esc(b.ref_no)}</td>
          <td>${esc(formatFullDate(b.return_date))}</td>
        </tr>
        <tr>
          <th>RETURN TERMINAL</th>
          <th>RTN FLIGHT NUMBER</th>
        </tr>
        <tr>
          <td>${esc(b.return_terminal || "-")}</td>
          <td>${esc(b.return_flight || "-")}</td>
        </tr>
        <tr>
          <th colspan="2">MAKE / MODEL / COLOUR / REG</th>
        </tr>
        <tr>
          <td colspan="2">${esc(b.vehicle_make)} / ${esc(b.vehicle_model)} / ${esc(b.vehicle_colour)} / ${esc(b.vehicle_registration)}</td>
        </tr>
      </table>
    </div>
  </div>
</div>`;

    // Page 2: 3-Column Layout (Diagram, Blank, T&C)
    const page2 = `
<div class="page">
  <div class="grid">
    <!-- COLUMN 1: Car Diagram -->
    <div class="section col-border">
      <div class="car-diagram">
        <img src="${cars.src}" alt="Vehicle Diagram">
      </div>
    </div>
    
    <!-- COLUMN 2: Blank -->
    <div class="section col-border">
      <div class="blank-space"></div>
    </div>
    
    <!-- COLUMN 3: T&C -->
    <div class="section">
       <div class="tc-box">
         <h3>TERMS & CONDITIONS</h3>
         <div class="tc-text">
           ${termsAndConditions || `
             <p><strong>1. BOOKINGS AND SERVICE</strong><br>1.1 Bookings confirmed via e-mail.<br>1.2 Efforts made for requested times.</p>
             <p><strong>2. PAYMENT</strong><br>2.1 Extra stay debited prior to return.<br>2.2 Payment due prior to service.</p>
             <p><strong>3. CANCELLATIONS</strong><br>3.1 No refund within 48h.<br>3.2 Changes within 24h incur £10 fee.</p>
             <p><strong>4. LIABILITIES</strong><br>4.1 We act as booking agent.<br>4.2 Moveables at owner's risk.</p>
             <p><strong>5. EXCLUSIONS</strong><br>5.1 Self-park at own risk.<br>5.2 Max payout £20,000.<br>5.3 Minor claims <£750 not accepted.</p>
             <p><strong>6. RELATIONS</strong><br>Written correspondence required for issues.</p>
             <p><strong>7. CONDITIONS</strong><br>Conditions remain unless changed in writing. – Airport Parking.</p>
           `}
         </div>
       </div>
    </div>
  </div>
</div>`;

    return page1 + page2 + bookingBreak;
  }).join("\n");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Booking Cards</title><style>
    * { box-sizing: border-box; font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
    @page { size: A4 landscape; margin: 0; }
    .page { width: 297mm; height: 210mm; background: #fff; overflow: hidden; break-after: page; padding: 10mm; position: relative; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; height: 100%; width: 100%; border: 1px solid #eee; }
    .section { padding: 10px; display: flex; flex-direction: column; }
    .col-border { border-right: 1px dashed #bbb; }
    
    .logo { text-align: center; margin-bottom: 25px; }
    .logo img { max-height: 97px; max-width: 140px; object-fit: contain; }
    
    .heading { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #000; }
    
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 26px; }
    th, td { border: 1px solid #000; padding: 4px; text-align: left; }
    th { background: #f9f9f9; font-weight: bold; }
    
    .info-table td.label { width: 35%; font-weight: bold; }
    .info-table td.value { width: 65%; }
    
    .vehicle-mini-table td { width: 50%; text-align: center; font-size: 12px; font-weight: bold; padding: 8px; }
    
    .declaration-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
    .decl-text { font-size: 12px; line-height: 1.2; margin-bottom: 5px; color: #333; }
    .sig-box { border: 1px solid #000; height: 60px; font-size: 10px; padding: 4px; color: #999; }
    
    /* Column 2 Styles */
    .ref-box { border: 1px solid #000; padding: 12px; text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
    .return-info-box { border: 1px solid #000; margin-bottom: 23px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 55px; }
    .info-label { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
    .info-value { font-size: 18px; font-weight: bold; }
    
    /* Column 3 Styles */
    .contact-info { text-align: left; margin-bottom: 45px; }
    .phone-large { font-size: 20px; font-weight: bold; margin-bottom: 26px; }
    .contact-text { font-size: 16px; margin-bottom: 26px; line-height: 1.4; }
    .contact-highlight { font-size: 16px; font-weight: bold; margin-bottom: 26px; line-height: 1.4; }
    .contact-links { font-size: 16px; font-weight: bold; display: flex; flex-direction: column; gap: 5px; }
    
    .checklist-box { border: 1px solid #000; padding: 15px; display: flex; align-items: center; justify-content: space-between; min-height: 120px; margin-bottom: -7px; }
    .check-title { font-size: 12px; font-weight: bold; margin-bottom: 26px; }
    .check-items { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
    
    .details-table th { font-size: 9px; text-align: center; padding: 2px; }
    .details-table td { font-size: 11px; text-align: center; padding: 6px; font-weight: bold; }
    
    /* Page 2 Styles */
    .car-diagram { display: flex; align-items: center; justify-content: center; height: 100%; }
    .car-diagram img { max-width: 100%; max-height: 190mm; object-fit: contain; }
    .blank-space { flex: 1; }
    .tc-box { border: 1px solid #000; padding: 10px; height: 100%; overflow: hidden; }
    .tc-box h3 { text-align: center; font-size: 11px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 4px; }
    .tc-text { font-size: 8px; line-height: 1.2; }
    .tc-text p { margin-bottom: 6px; }
    
    .booking-break { page-break-after: always; }
    .mt-4 { margin-top: 16px; }
  </style></head><body>${cards}</body></html>`;
}

const handleSinglePrint = (booking: Booking, terms: string) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const companyLogo = user.company_logo || logo.src;
  const supportEmail = user.support_email_address || "info@bristoleliteparking.co.uk";
  const supportPhone = user.support_contact_no || "02080885495";

  const html = buildPrintCardHTML([booking], companyLogo, supportEmail, supportPhone, terms);
  const w = window.open("", "_blank");
  if (!w) return alert("Allow popups");
  w.document.write(html);
  w.document.close();
  w.onload = async () => {
    await waitForImages(w.document.body);
    setTimeout(() => w.print(), 300);
  };
};

export default function BookingReportPage() {
  const [airport, setAirport] = useState<string>('All Airports');
  const [airportList, setAirportList] = useState<{ airport_id: number; airport_name: string; iata_code: string }[]>([]);
  const [from, setFrom] = useState<string>(todayStr);
  const [to, setTo] = useState<string>(todayStr);
  const [allRows, setAllRows] = useState<Booking[]>([]);
  const [terms, setTerms] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    async function loadData() {
      try {
        // Load Airports
        const resA = await apiFetch("/api/backend/api/airports");
        if (resA.ok) {
          const json = await resA.json();
          setAirportList(json.data || []);
        }

        // Load Terms
        const resT = await apiFetch("/api/backend/api/company/settings/terms");
        if (resT.ok) {
          const json = await resT.json();
          setTerms(json.terms || "");
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    }
    loadData();
  }, []);

  const generateReport = async () => {
    setLoading(true); setErrMsg(''); setHasGenerated(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const url = `${API_BASE}/api/thomsondata/daterange?start=${normalizeYMD(from)}&end=${normalizeYMD(to)}`;
      const res = await apiFetch(url, { headers: { "x-company-id": (user.company_id || 1).toString() } });
      const list = await res.json();
      const filtered = (Array.isArray(list) ? list : list.data || []).filter((r: Booking) =>
        (airport === 'All Airports' || (r.travelling_from || '').toLowerCase() === airport.toLowerCase())
      );
      setAllRows(filtered);
    } catch (e: any) { setErrMsg(e.message); } finally { setLoading(false); }
  };

  const filteredSorted = useMemo(() => [...allRows].sort((a, b) => (b.drop_off_date || "").localeCompare(a.drop_off_date || "")), [allRows]);
  const total = filteredSorted.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const pageSlice = useMemo(() => filteredSorted.slice((page - 1) * limit, page * limit), [filteredSorted, page]);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const companyLogo = user.company_logo || logo.src;
    const supportEmail = user.support_email_address || "info@parkingbox.co.uk";
    const supportPhone = user.support_contact_no || "02080885495";

    w.document.write(buildPrintCardHTML(filteredSorted, companyLogo, supportEmail, supportPhone, terms));
    w.document.close();
    w.onload = async () => { await waitForImages(w.document.body); setTimeout(() => w.print(), 300); };
  };

  const handlePdf = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><body><h2>Report</h2><table>${pageSlice.map(b => `<tr><td>${b.ref_no}</td><td>${b.first_name} ${b.last_name}</td></tr>`).join('')}</table></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto w-full p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <Printer className="w-8 h-8 text-primary" /> Print Depart Card
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 italic">Manage vehicle cards and export departure logs.</p>
          </div>
          <div className="flex items-center gap-2">
            {hasGenerated && (
              <Button variant="outline" className="glass border-primary/20 text-primary rounded-xl h-11 px-6" onClick={handlePrint} disabled={!total}>
                <Printer className="w-4 h-4 mr-2" /> Print All
              </Button>
            )}
            {hasGenerated && (
              <Button variant="outline" className="glass border-slate-200 rounded-xl h-11 px-6" onClick={handlePdf} disabled={!total}>
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/20 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4" /> From</label>
              <Input
                type="date"
                className="h-11 rounded-xl cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-white color-scheme-dark"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4" /> To</label>
              <Input
                type="date"
                className="h-11 rounded-xl cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-white color-scheme-dark"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><Filter className="w-4 h-4" /> Airport</label>
              <select
                className="w-full h-11 bg-white/50 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer hover:border-primary"
                value={airport}
                onChange={(e) => {
                  setAirport(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All Airports">All Airports</option>
                {airportList.map((a) => (
                  <option key={a.airport_id} value={a.airport_name}>
                    {a.airport_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full h-11 rounded-xl bg-primary text-white shadow-lg hover:bg-primary/90 dark:hover:bg-primary/80 transition-all" onClick={generateReport} disabled={loading}>
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>

        {!hasGenerated ? (
          <div className="glass rounded-2xl border border-dashed dark:border-slate-700 dark:bg-slate-900/40 p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full  flex items-center justify-center"><CalendarDays className="w-8 h-8 text-slate-400" /></div>
            <h3 className="text-lg font-semibold">Ready to start?</h3>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="w-[60px] text-center">S.L</TableHead>
                    <TableHead className="w-[80px] text-center">Action</TableHead>
                    <TableHead>Ref No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Make / Model / Color</TableHead>
                    <TableHead>Reg No</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-64 text-center">Loading...</TableCell></TableRow>
                  ) : pageSlice.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-64 text-center text-slate-500">No records found.</TableCell></TableRow>
                  ) : (
                    pageSlice.map((b, i) => (
                      <TableRow key={b.id} className="">
                        <TableCell className="text-center">{(page - 1) * limit + (i + 1)}</TableCell>
                        <TableCell className="text-center">
                          <button onClick={() => handleSinglePrint(b, terms)} className="p-2 rounded-lg  transition-all"><Printer size={16} /></button>
                        </TableCell>
                        <TableCell className="font-bold text-primary">{b.ref_no}</TableCell>
                        <TableCell>{b.first_name} {b.last_name}</TableCell>
                        <TableCell>{formatFullDate(b.drop_off_date)}</TableCell>
                        <TableCell>

                          {`${b.vehicle_make} / ${b.vehicle_model} / ${b.vehicle_colour}`}
                        </TableCell>
                        <TableCell>{b.vehicle_registration || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4  border-t flex items-center justify-between">
              <div className="text-sm text-slate-500">Total: {total} results</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
                <span className="text-sm px-3">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
