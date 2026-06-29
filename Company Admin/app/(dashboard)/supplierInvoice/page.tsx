"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText, Download, Telescope, Clock, ChevronLeft, ChevronRight,
  User, Mail, ArrowRight, Table as TableIcon, NotebookPen
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { backendProxyPath } from "@/app/lib/backendProxy";
import ProtectedRoute from '@/components/ProtectedRoute';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS = ["Active", "Cancelled"];

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const threeDaysAgo = new Date();
threeDaysAgo.setDate(today.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];


function formatTableDate(value?: string | null) {
  if (!value) return "-";

  const s = String(value).trim();
  if (!s || s.startsWith("0000-00-00")) return "-";

  // ✅ If value is MySQL datetime "YYYY-MM-DD HH:mm:ss", convert to ISO-like
  const isoLike = s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s;

  const d = new Date(isoLike);
  if (isNaN(d.getTime())) return "-";

  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}


// Background colors for each status (matching your screenshot)
const statusColors: any = {
  Active: "bg-green-50",
  Completed: "bg-blue-50",
  Cancelled: "bg-red-50",
  Refunded: "bg-red-50",
  "No Show": "bg-red-50",
  pending: "bg-yellow-50",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}


export default function SupplierInvoicePage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState("");

  const [from, setFrom] = useState(threeDaysAgoStr);
  const [to, setTo] = useState(todayStr);

  const [status, setStatus] = useState("");

  const [dateType, setDateType] = useState("booked");

  const DATE_TYPES = [
    { value: "booked", label: "Booked Date" },
    { value: "depart", label: "Depart Date" },
    { value: "return", label: "Return Date" },
    { value: "cancelled", label: "Cancelled Date" },
  ];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function money(n: number) {
    return `£${Number(n || 0).toFixed(2)}`;
  }

  useEffect(() => {
    fetch(backendProxyPath("/api/suppliers/list"), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("SUPPLIERS API RESPONSE:", json);
        setSuppliers(Array.isArray(json) ? json : json.data ?? []);
      });
  }, []);

  function formatDDMMYYYY(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }



  const fetchInvoice = async () => {
    if (!supplierId) return alert("Please choose supplier");

    setLoading(true);
    const qs = new URLSearchParams();

    if (from) qs.set("from", from);
    if (to) qs.set("to", to);

    if (status) qs.set("status", status);

    qs.set("dateType", dateType);

    const url =
      supplierId === "all"
        ? backendProxyPath(`/api/bookings/invoice/supplier-all?${qs}`)
        : backendProxyPath(`/api/bookings/invoice/supplier/${supplierId}?${qs}`);

    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  /* ========================
       MULTI-PAGE PDF
     ======================== */
  // const generateSupplierPDF = (data: any) => {
  //   const doc = new jsPDF("p", "mm", "a4");

  //   const supplierName = data?.supplierName || "Supplier";
  //   const totalBookings = Number(data?.totalBookings) || 0;
  //   const totalAmount = Number(data?.totalAmount) || 0;
  //   const commission = Number(data?.commission) || 0;
  //   const invoiceAmount = Number(data?.invoiceAmount) || 0;
  //   const unitPrice =
  //     totalBookings > 0 ? (totalAmount / totalBookings).toFixed(2) : "0.00";

  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(20);
  //   doc.text("INVOICE", 15, 20);

  //   doc.setFontSize(12);
  //   doc.text("Issued Date:", 15, 35);
  //   doc.text(new Date().toLocaleDateString("en-GB"), 45, 35);

  //   doc.text("Supplier:", 15, 45);
  //   doc.text(supplierName, 45, 45);

  //   autoTable(doc, {
  //     startY: 60,
  //     head: [["Item", "Quantity", "Price", "Amount"]],
  //     body: [
  //       ["Supplier Bookings", totalBookings, `£${unitPrice}`, `£${totalAmount.toFixed(2)}`],
  //       ["Commission", "", "", `£${commission.toFixed(2)}`],
  //       ["Invoice Amount", "", "", `£${invoiceAmount.toFixed(2)}`],
  //     ],
  //     theme: "grid",
  //   });

  //   const finalY = (doc as any).lastAutoTable.finalY || 90;

  //   doc.setFontSize(16);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Customer Booking Details", 15, finalY + 18);

  //   const rows =
  //     data?.rows?.map((r: any, index: number) => [
  //       index + 1,
  //       r.ref_no || "-",
  //       r.contact_no || "-",
  //       formatTableDate(r.booked_on),
  //       formatTableDate(r.dropoff_datetime),
  //       formatTableDate(r.return_datetime),
  //       money(r.price),
  //     ]) || [];

  //   autoTable(doc, {
  //     startY: finalY + 25,
  //     head: [["S.L", "Ref No", "Contact", "Booked On", "Drop-off", "Return", "Price"]],
  //     body: rows,
  //     theme: "grid",
  //     headStyles: {
  //       fillColor: [0, 111, 49],
  //       textColor: [255, 255, 255],
  //       halign: "center",
  //     },
  //     bodyStyles: {
  //       halign: "center",
  //       fontSize: 9,
  //     },
  //     styles: {
  //       cellPadding: 3,
  //     },
  //   });

  //   doc.save(`${supplierName}_supplier_invoice.pdf`);
  // };

  const generateSupplierPDF = (data: any) => {
    const doc = new jsPDF("p", "mm", "a4");

    // ==========================
    // ALL SUPPLIERS PDF
    // ==========================
    if (Array.isArray(data?.data)) {

      data.data.forEach((supplier: any, supplierIndex: number) => {

        if (supplierIndex > 0) {
          doc.addPage();
        }

        const supplierName = supplier.supplierName || "Supplier";
        const totalBookings = Number(supplier.totalBookings || 0);
        const totalAmount = Number(supplier.totalAmount || 0);
        const commission = Number(supplier.commission || 0);
        const invoiceAmount = Number(supplier.invoiceAmount || 0);

        const unitPrice =
          totalBookings > 0
            ? (totalAmount / totalBookings).toFixed(2)
            : "0.00";

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("SUPPLIER INVOICE", 15, 20);

        doc.setFontSize(12);

        doc.text("Issued Date:", 15, 35);
        doc.text(
          new Date().toLocaleDateString("en-GB"),
          45,
          35
        );

        doc.text("Supplier:", 15, 45);
        doc.text(supplierName, 45, 45);

        autoTable(doc, {
          startY: 60,
          head: [["Item", "Quantity", "Price", "Amount"]],
          body: [
            [
              "Supplier Bookings",
              totalBookings,
              `£${unitPrice}`,
              `£${totalAmount.toFixed(2)}`
            ],
            [
              "Commission",
              "",
              "",
              `£${commission.toFixed(2)}`
            ],
            [
              "Invoice Amount",
              "",
              "",
              `£${invoiceAmount.toFixed(2)}`
            ]
          ],
          theme: "grid",
        });

        const finalY =
          (doc as any).lastAutoTable.finalY || 90;

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(
          "Customer Booking Details",
          15,
          finalY + 18
        );

        const rows =
          supplier.rows?.map(
            (r: any, index: number) => [
              index + 1,
              r.ref_no || "-",
              r.contact_no || "-",
              formatTableDate(r.booked_on),
              formatTableDate(r.dropoff_datetime),
              formatTableDate(r.return_datetime),
              money(r.price),
            ]
          ) || [];

        autoTable(doc, {
          startY: finalY + 25,
          head: [[
            "S.L",
            "Ref No",
            "Contact",
            "Booked On",
            "Drop-off",
            "Return",
            "Price"
          ]],
          body: rows,
          theme: "grid",
          headStyles: {
            fillColor: [0, 111, 49],
            textColor: [255, 255, 255],
          },
        });
      });

      doc.save(
        `All_Suppliers_Invoice_${new Date().getTime()}.pdf`
      );

      return;
    }

    // ==========================
    // SINGLE SUPPLIER PDF
    // ==========================

    const supplierName = data?.supplierName || "Supplier";
    const totalBookings = Number(data?.totalBookings) || 0;
    const totalAmount = Number(data?.totalAmount) || 0;
    const commission = Number(data?.commission) || 0;
    const invoiceAmount = Number(data?.invoiceAmount) || 0;

    const unitPrice =
      totalBookings > 0
        ? (totalAmount / totalBookings).toFixed(2)
        : "0.00";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", 15, 20);

    doc.setFontSize(12);
    doc.text("Issued Date:", 15, 35);
    doc.text(
      new Date().toLocaleDateString("en-GB"),
      45,
      35
    );

    doc.text("Supplier:", 15, 45);
    doc.text(supplierName, 45, 45);

    autoTable(doc, {
      startY: 60,
      head: [["Item", "Quantity", "Price", "Amount"]],
      body: [
        [
          "Supplier Bookings",
          totalBookings,
          `£${unitPrice}`,
          `£${totalAmount.toFixed(2)}`
        ],
        [
          "Commission",
          "",
          "",
          `£${commission.toFixed(2)}`
        ],
        [
          "Invoice Amount",
          "",
          "",
          `£${invoiceAmount.toFixed(2)}`
        ]
      ],
      theme: "grid",
    });

    const finalY =
      (doc as any).lastAutoTable.finalY || 90;

    const rows =
      data?.rows?.map(
        (r: any, index: number) => [
          index + 1,
          r.ref_no || "-",
          r.contact_no || "-",
          formatTableDate(r.booked_on),
          formatTableDate(r.dropoff_datetime),
          formatTableDate(r.return_datetime),
          money(r.price),
        ]
      ) || [];

    autoTable(doc, {
      startY: finalY + 25,
      head: [[
        "S.L",
        "Ref No",
        "Contact",
        "Booked On",
        "Drop-off",
        "Return",
        "Price"
      ]],
      body: rows,
      theme: "grid",
    });

    doc.save(`${supplierName}_supplier_invoice.pdf`);
  };

  function formatPrettyDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";

    const [y, m, d] = dateStr.split("-");
    return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
  }

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
              Partner Logistics
            </h6>
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
              Financial Invoicing
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
              Reconcile supplier accounts and generate settlement reports. Select a partner and date range to audit fleet performance and commission totals.
            </p>
          </div>

          {/* <div className="flex items-center gap-3">
            {data &&
              (Array.isArray(data?.data)
                ? data.data.length > 0
                : true) && (
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => generateSupplierPDF(data)}
                >
                  <Download size={18} strokeWidth={2.5} />
                  <span>Download Invoice</span>
                </Button>
              )}
          </div> */}
        </div>

        {/* FILTER PANEL */}
        <div className="glass border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            {/* SELECT SUPPLIER */}
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fleet Partner</label>
              <select
                className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30 shadow-sm"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Select Supplier</option>
                <option value="all">All Suppliers</option>

                {Array.isArray(suppliers) &&
                  suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.supplier_name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Filter Date Type
              </label>

              <select
                className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30 shadow-sm"
                value={dateType}
                onChange={(e) => setDateType(e.target.value)}
              >
                {DATE_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE RANGE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Accounting Period</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="date"
                    className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[160px] hover:border-primary/30 shadow-sm"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                  />
                </div>
                <span className="text-muted-foreground font-black text-[10px] uppercase opacity-30 px-1">to</span>
                <div className="relative">
                  <Input
                    type="date"
                    className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[160px] hover:border-primary/30 shadow-sm"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                  />
                </div>
              </div>
            </div>



            {/* STATUS */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</label>
              <select
                className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30 shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* ACTION */}
            <div className="flex items-end h-full pt-6">
              <Button
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-8 font-black shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                onClick={fetchInvoice}
                disabled={loading}
              >
                {loading ? <div className="h-4 w-4 animate-spin border-2 border-white rounded-full border-t-transparent" /> : <FileText size={16} />}
                <span>{loading ? 'Analyzing...' : 'Generate Invoice'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* SUMMARY TABLE SECTION */}
        {data && (
          <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-border/50 bg-muted/20">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <TableIcon size={16} /> Reconciliation Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Target Partner</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Volume</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Gross Total</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Commission Debt</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Settlement Amount</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.data || [data]).map((supplier: any, index: number) => (
                    <TableRow
                      key={supplier.supplierId || index}
                      className="hover:bg-muted/50 transition-all border-b border-border/50"
                    >
                      <TableCell className="text-center py-6 font-black text-primary text-base">
                        {supplier.supplierName}
                      </TableCell>

                      <TableCell className="text-center py-6">
                        <span className="font-bold text-lg">
                          {supplier.totalBookings}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground ml-1 uppercase">
                          Bookings
                        </span>
                      </TableCell>

                      <TableCell className="text-center py-6 font-black text-foreground">
                        {money(supplier.totalAmount)}
                      </TableCell>

                      <TableCell className="text-center py-6 font-black text-red-500 bg-red-500/5">
                        {money(supplier.commission)}
                      </TableCell>

                      <TableCell className="text-center py-6">
                        <div className="inline-flex flex-col px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-lg font-black text-emerald-600">
                            {money(supplier.invoiceAmount)}
                          </span>
                          <span className="text-[8px] font-black uppercase text-emerald-700 tracking-widest">
                            Payable
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center py-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                          onClick={() => generateSupplierPDF(supplier)}
                        >
                          <Download size={14} className="mr-2" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {data && Array.isArray(data.rows) && data.rows.length > 0 && (
          <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-border/50 bg-muted/20">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <TableIcon size={16} /> Customer Booking Details
              </h3>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="text-center font-black bg-emerald-700 text-white">S.L</TableHead>
                    <TableHead className="text-center font-black bg-emerald-700 text-white">Ref No</TableHead>
                    <TableHead className="text-center font-black bg-emerald-700 text-white">Contact</TableHead>
                    <TableHead className="text-center font-black bg-emerald-700 text-white">Booked On</TableHead>
                    <TableHead className="text-center font-black bg-emerald-700 text-white">Drop-off</TableHead>
                    <TableHead className="text-center font-black bg-emerald-700 text-white">Return</TableHead>
                    <TableHead className="text-center font-black bg-emerald-700 text-white">Price</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.rows.map((r: any, index: number) => (
                    <TableRow key={r.id || r.booking_id || r.ref_no || index}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="text-center font-medium">{r.ref_no || "-"}</TableCell>
                      <TableCell className="text-center">{r.contact_no || "-"}</TableCell>
                      <TableCell className="text-center">{formatTableDate(r.booked_on)}</TableCell>
                      <TableCell className="text-center">{formatTableDate(r.dropoff_datetime)}</TableCell>
                      <TableCell className="text-center">{formatTableDate(r.return_datetime)}</TableCell>
                      <TableCell className="text-center font-bold">{money(r.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {!data && !loading && (
          <div className="h-96 flex flex-col items-center justify-center text-center opacity-30 select-none">
            <NotebookPen size={64} className="mb-4 text-muted-foreground" />
            <h3 className="text-xl font-black uppercase tracking-widest text-foreground">Awaiting Input</h3>
            <p className="text-xs font-bold text-muted-foreground mt-2 max-w-xs uppercase">Select a fleet partner and accounting period to begin financial reconstruction</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
