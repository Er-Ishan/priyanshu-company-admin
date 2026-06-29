'use client';

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Download, Sheet, FileText, Mail, Users, ShoppingBag, PoundSterling, Wallet, Percent, Calendar as CalendarIcon, Search, X } from "lucide-react";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrettyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Select Date";
  try {
    const [y, m, d] = dateStr.split("-");
    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
  } catch (e) {
    return dateStr;
  }
}

function normalizeYMD(input: string) {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function generateSupplierPDF(data: any) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${data.supplierName} - Invoice</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; font-size: 14px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
    .company-details h1 { margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; }
    .company-details p { margin: 4px 0; font-size: 13px; color: #64748b; }
    .invoice-title { font-size: 28px; font-weight: 900; text-align: right; color: #2563eb; }
    .invoice-meta { margin-top: 24px; display: flex; justify-content: space-between; gap: 20px; }
    .box { flex: 1; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; background: #f8fafc; }
    .box h4 { margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 32px; }
    table th { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: 700; color: #475569; font-size: 12px; text-transform: uppercase; }
    table td { border: 1px solid #e2e8f0; padding: 12px; color: #334155; }
    .totals { margin-top: 24px; width: 280px; float: right; }
    .totals table td { border: none; padding: 6px 0; }
    .totals tr:last-child td { font-weight: 800; font-size: 16px; border-top: 2px solid #0f172a; padding-top: 12px; color: #0f172a; }
    .balance-due { margin-top: 40px; padding: 20px; background: #2563eb; color: white; font-size: 20px; font-weight: 800; text-align: right; border-radius: 8px; }
    .footer { margin-top: 80px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-details">
      <h1>${data.supplierName}</h1>
      <p>${data.supplierAddress || 'Address not provided'}</p>
      <p>Contact: ${data.supplierContact || 'N/A'}</p>
      <p>Email: ${data.supplierEmail || 'N/A'}</p>
    </div>
    <div class="invoice-title">INVOICE</div>
  </div>
  <div class="invoice-meta">
    <div class="box">
      <h4>Bill From</h4>
      <p><strong>${data.supplierName}</strong></p>
      <p>${data.supplierAddress || ''}</p>
      <p>${data.supplierEmail || ''}</p>
    </div>
    <div class="box">
      <h4>Invoice Details</h4>
      <p><strong>Invoice No:</strong> ${data.invoiceNumber || "INV-" + Date.now().toString().slice(-6)}</p>
      <p><strong>Date:</strong> ${data.invoiceDate || new Date().toLocaleDateString()}</p>
      <p><strong>Commission Rate:</strong> ${data.supplierCommission}%</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total Bookings (Summary)</td>
        <td style="text-align:center">${data.totalBookings}</td>
        <td style="text-align:right">£${Number(data.totalAmount).toFixed(2)}</td>
        <td style="text-align:right">£${Number(data.totalAmount).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Platform Commission (${data.supplierCommission}%)</td>
        <td style="text-align:center">1</td>
        <td style="text-align:right">-£${Number(data.commission).toFixed(2)}</td>
        <td style="text-align:right">-£${Number(data.commission).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td style="text-align:right;">£${Number(data.totalAmount).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Commission:</td>
        <td style="text-align:right;">-£${Number(data.commission).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Total Payable:</td>
        <td style="text-align:right;">£${Number(data.invoiceAmount).toFixed(2)}</td>
      </tr>
    </table>
  </div>
  <div style="clear: both;"></div>
  <div class="balance-due">Balance Due: £${Number(data.invoiceAmount).toFixed(2)}</div>
  <div class="footer">
    <p>Payment is due upon receipt. Please include the invoice number with your payment.</p>
    <p>Thank you for your partnership.</p>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

function downloadCSV(data: any[]) {
  const headers = ["Supplier Name", "Contact", "Email", "Total Bookings", "Total Amount (GBP)", "Commission (GBP)", "Invoice Amount (GBP)"];
  const csv = [
    headers.join(","),
    ...data.map((r) =>
      [r.supplierName, r.supplierContact, r.supplierEmail, r.totalBookings, Number(r.totalAmount).toFixed(2), Number(r.commission).toFixed(2), Number(r.invoiceAmount).toFixed(2)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `supplier-summary-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

function generateFullReportPDF(data: any[]) {
  const rows = data.map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="text-align:left">${d.supplierName}</td>
      <td>${d.totalBookings}</td>
      <td style="text-align:right">£${Number(d.totalAmount).toFixed(2)}</td>
      <td style="text-align:right">£${Number(d.commission).toFixed(2)}</td>
      <td style="text-align:right">£${Number(d.invoiceAmount).toFixed(2)}</td>
    </tr>
  `).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Supplier Summary Report</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1e293b; }
    h2 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    p { color: #64748b; font-size: 14px; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e2e8f0; padding: 12px 8px; text-align: center; font-size: 12px; }
    th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
    tr:nth-child(even) { background-color: #f8fafc; }
  </style>
</head>
<body>
  <h2>Supplier Summary Report</h2>
  <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  <table>
    <thead>
      <tr>
        <th style="width:40px">S.L.</th>
        <th style="text-align:left">Supplier / Website</th>
        <th>Bookings</th>
        <th style="text-align:right">Total Amount</th>
        <th style="text-align:right">Commission</th>
        <th style="text-align:right">Invoice Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

export default function SupplierSummaryPage() {
  const { data: session } = useSession();
  const companyId = session?.user?.company_id;

  const [supplierSummary, setSupplierSummary] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const [displayFromDate, setDisplayFromDate] = useState<string>(today);
  const [displayToDate, setDisplayToDate] = useState<string>(today);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;
    if (!input) return;

    input.focus();

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

  const sendInvoiceEmail = async (supplier: any) => {
    try {
      const res = await fetch(backendProxyPath("/api/send-supplier-invoice"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice");
    }
  };

  const fetchSummary = async () => {
    try {
      const qs = new URLSearchParams();
      if (fromDate) qs.set("from", fromDate);
      if (toDate) qs.set("to", toDate);
      const response = await fetch(backendProxyPath(`/api/supplier-summary?${qs.toString()}`));
      const data = await response.json();
      if (Array.isArray(data)) {
        setSupplierSummary(data);
      } else {
        setSupplierSummary([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setSupplierSummary([]);
    }
  };

  useEffect(() => {
    if (companyId) fetchSummary();
  }, [fromDate, toDate, companyId]);

  const filteredSuppliers = (Array.isArray(supplierSummary) ? supplierSummary : [])
    .filter((s: any) => {
      if (!fromDate && !toDate) return true;
      const rowDate = normalizeYMD(s.invoiceDate);
      if (!rowDate) return false;
      if (fromDate && toDate) return rowDate >= fromDate && rowDate <= toDate;
      if (fromDate) return rowDate >= fromDate;
      if (toDate) return rowDate <= toDate;
      return true;
    })
    .filter((s: any) => s.supplierName.toLowerCase().includes(search.toLowerCase()));

  const sendSupplierSummaryEmail = async () => {
    try {
      const res = await fetch(backendProxyPath("/api/suppliers/email-summary-csv"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromDate || null, to: toDate || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send email");
    }
  };

  const totals = filteredSuppliers.reduce(
    (acc, s) => {
      acc.suppliers += 1;
      acc.bookings += Number(s.totalBookings || 0);
      acc.totalAmount += Number(s.totalAmount || 0);
      acc.commission += Number(s.commission || 0);
      acc.invoiceAmount += Number(s.invoiceAmount || 0);
      return acc;
    },
    { suppliers: 0, bookings: 0, totalAmount: 0, commission: 0, invoiceAmount: 0 }
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Supplier Report</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Financial performance summary and invoice management.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="glass rounded-xl h-11 w-11 shadow-sm hover:shadow-md transition-all border-blue-500/20 text-blue-600 hover:bg-blue-500/10" onClick={() => downloadCSV(filteredSuppliers)}>
                <Sheet className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export CSV</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="glass rounded-xl h-11 w-11 shadow-sm hover:shadow-md transition-all border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10" onClick={() => generateFullReportPDF(filteredSuppliers)}>
                <FileText className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download PDF Report</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="glass-primary rounded-xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={sendSupplierSummaryEmail}>
                <Send className="h-4 w-4" />
                <span>Email Summary</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Email Summary CSV to Admin</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Suppliers", value: totals.suppliers, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Total Bookings", value: totals.bookings, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Gross Amount", value: `£${totals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: PoundSterling, color: "text-indigo-600", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
          { label: "Total Commission", value: `£${totals.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Percent, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Invoice Total", value: `£${totals.invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" }
        ].map((stat, i) => (
          <div key={i} className={`glass p-5 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground opacity-60">Insight</div>
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">{stat.value}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="glass p-3 rounded-2xl border border-border/50 shadow-sm flex flex-col md:flex-row items-center gap-3">

        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            type="text"
            placeholder="Search by supplier or website..."
            className="h-11 w-full pl-10 pr-4 glass-input rounded-xl text-sm font-bold border-transparent focus:border-primary/30 transition-all"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* FROM DATE */}
          <div className="relative group flex-1 md:flex-none md:w-48">
            <button
              type="button"
              className="glass-input h-11 w-full px-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all border border-transparent text-left"
              onClick={() => openDatePicker(fromDateRef)}
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter leading-none mb-1">
                  From
                </span>
                <span className="text-xs font-bold text-foreground leading-none">
                  {formatPrettyDate(fromDate)}
                </span>
              </div>
              <CalendarIcon className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </button>

            <input
              ref={fromDateRef}
              type="date"
              className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
              value={fromDate || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFromDate(e.target.value);
                setDisplayFromDate(e.target.value);
              }}
            />
          </div>

          <div className="text-muted-foreground/30 hidden md:block">
            <div className="w-4 h-[1px] bg-current" />
          </div>

          {/* TO DATE */}
          <div className="relative group flex-1 md:flex-none md:w-48">
            <button
              type="button"
              className="glass-input h-11 w-full px-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all border border-transparent text-left"
              onClick={() => openDatePicker(toDateRef)}
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter leading-none mb-1">
                  To
                </span>
                <span className="text-xs font-bold text-foreground leading-none">
                  {formatPrettyDate(toDate)}
                </span>
              </div>
              <CalendarIcon className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </button>

            <input
              ref={toDateRef}
              type="date"
              className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
              value={toDate || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setToDate(e.target.value);
                setDisplayToDate(e.target.value);
              }}
            />
          </div>

          {(fromDate || toDate) && (
            <Button
              variant="ghost"
              className="h-11 w-11 rounded-xl p-0 hover:bg-red-500/10 hover:text-red-600 transition-all"
              onClick={() => { setFromDate(""); setToDate(""); }}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* SUPPLIER TABLE */}
      <div className="glass rounded-3xl border border-border/50 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-16 h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">S.L</TableHead>
                <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Supplier / Website</TableHead>
                <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Commission</TableHead>
                <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Bookings</TableHead>
                <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Total Amount</TableHead>
                <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Our Commission</TableHead>
                <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Net Invoice</TableHead>
                <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground/50">No summary data found for selected period.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((data: any, i: number) => (
                  <TableRow key={i} className="group hover:bg-muted/30 transition-all border-border/40">
                    <TableCell className="py-5 text-center font-bold text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{data.supplierName}</span>
                        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">Active Partner</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 font-black text-[11px] border border-indigo-500/20">
                        {data.supplierCommission}%
                      </span>
                    </TableCell>
                    <TableCell className="py-5 text-center font-black text-sm">{data.totalBookings}</TableCell>
                    <TableCell className="py-5 text-center font-black text-sm text-foreground/80">£{Number(data.totalAmount).toFixed(2)}</TableCell>
                    <TableCell className="py-5 text-center font-bold text-sm text-rose-500">£{Number(data.commission).toFixed(2)}</TableCell>
                    <TableCell className="py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-black text-sm">
                        £{Number(data.invoiceAmount).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 transition-all"
                              onClick={() => sendInvoiceEmail(data)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Email Invoice to Supplier</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                              onClick={() => generateSupplierPDF(data)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download PDF Invoice</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}
