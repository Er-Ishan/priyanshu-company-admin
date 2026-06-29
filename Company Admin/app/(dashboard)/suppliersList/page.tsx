"use client";
import { useEffect, useState, useMemo, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil, Trash2, X, Telescope, Plus, ChevronLeft, ChevronRight,
  FileEdit, Clock, BookOpen, FileDown, ExternalLink
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { backendProxyPath } from "@/app/lib/backendProxy";
import ProtectedRoute from '@/components/ProtectedRoute';
import SupplierTokenIndicator from "@/components/SupplierTokenIndicator";
import SupplierTokenModal from "@/components/SupplierTokenModal";


const API = backendProxyPath("/api/getdata/suppliers");
const ACTIVE_PRODUCTS_API = backendProxyPath("/api/getdata/suppliers/active-products");

type ParkingProduct = {
  id: number;
  product_name: string;
  airport_name?: string;
};

type Supplier = {
  supplier_id: number;
  assignment_id: number;
  supplier_name: string;
  reg_no: string;
  supplier_contact: string;
  director_name: string;
  director_email: string;
  director_phone: string;
  supplier_email: string;
  supplier_address: string;
  from_email_address: string;
  airport: string;
  commission: number;
  email_parsing_active: number;
  supplier_active: number;
  bookings_count: number;
  supplier_token?: string | null;
  allowed_products?: number[] | string | null;
  allowed_product_names?: string[];
};

const parseAllowedProductIds = (value: unknown): number[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
        : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatAllowedProductNames = (
  ids: number[],
  products: ParkingProduct[]
): string => {
  if (!ids.length) return "-";
  const names = ids
    .map((id) => products.find((p) => p.id === id)?.product_name)
    .filter(Boolean);
  return names.length ? names.join(", ") : "-";
};

export default function SuppliersPage() {
  const [rows, setRows] = useState<Supplier[]>([]);
  const [form, setForm] = useState<any>({});
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  const [activeTab, setActiveTab] = useState("company");

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [tokenModalSupplier, setTokenModalSupplier] = useState<Supplier | null>(null);
  const [activeProducts, setActiveProducts] = useState<ParkingProduct[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?page=${page}&limit=${limit}&search=${search}`, { credentials: "include" });
      const json = await res.json();

      setRows(Array.isArray(json?.data) ? json.data : []);
      setTotal(typeof json?.total === "number" ? json.total : 0);
    } catch (err) {
      console.error(err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [page, search]);

  useEffect(() => {
    fetch(ACTIVE_PRODUCTS_API, { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        setActiveProducts(Array.isArray(json?.data) ? json.data : []);
      })
      .catch((err) => {
        console.error("Failed to load active products:", err);
        setActiveProducts([]);
      });
  }, []);

  const toggleAllowedProduct = (productId: number) => {
    setForm((prev: any) => {
      const current: number[] = Array.isArray(prev.allowed_products) ? prev.allowed_products : [];
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      return { ...prev, allowed_products: next };
    });
  };

  const openEdit = (s: Supplier) => {
    setForm({
      supplier_name: s.supplier_name || "",
      reg_no: s.reg_no || "",
      supplier_address: s.supplier_address || "",
      supplier_contact: s.supplier_contact || "",
      supplier_email: s.supplier_email || "",
      from_email_address: s.from_email_address || "",
      commission: s.commission ?? 0,
      director_name: s.director_name || "",
      director_email: s.director_email || "",
      director_phone: s.director_phone || "",
      email_parsing_active: s.email_parsing_active ?? 0,
      supplier_active: s.supplier_active ?? 1,
      allowed_products: parseAllowedProductIds(s.allowed_products),
    });

    setOpenRow(s.supplier_id);
  };


  const saveEdit = async (id: number) => {
    setSaveMsg("Saving...");
    const res = await fetch(`${API}/update/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaveMsg("Saved ✓");
      fetchData();
      setTimeout(() => setSaveMsg(""), 1000);
      setOpenRow(null);
    } else {
      setSaveMsg("Error saving");
    }
  };

  const deleteSupplier = async (id: number) => {
    if (!confirm("Delete supplier?")) return;
    const res = await fetch(`${API}/delete/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) fetchData();
  };

  const TABLE_COLS = 9;

  const API_DOCS_HTML = "/docs/FleetCart-API-Integration-Guide.html";
  const API_DOCS_PDF = "/docs/FleetCart-API-Integration-Guide.pdf";

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen px-4 py-4 space-y-3">
        {/* HEADER */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 leading-none">
              Partner Ecosystem
            </h6>
            <h3 className="text-2xl font-black tracking-tight text-foreground leading-none">
              Suppliers Registry
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1 hidden sm:inline">
              API Documentation
            </span>
            <a
              href={API_DOCS_HTML}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 hover:border-primary/30 transition-all group"
            >
              <BookOpen size={14} className="shrink-0" />
              <span>Integration Guide</span>
              <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={API_DOCS_PDF}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border/60 bg-background text-foreground text-xs font-bold hover:bg-muted/50 hover:border-primary/20 transition-all group"
            >
              <FileDown size={14} className="shrink-0 text-primary" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* SEARCH + ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative group flex-1 min-w-0">
            <Input
              type="text"
              placeholder="Search by supplier name, website, or email..."
              className="h-9 bg-background/50 border-border/50 pl-10 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50 hover:border-primary/30"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <Telescope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white rounded-lg h-9 px-4 font-bold shadow-sm shadow-primary/15 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            onClick={() => (window.location.href = "/supplierAdd")}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Register Partner</span>
          </Button>
        </div>

        {/* TABLE SECTION */}
        <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 text-[10px]">#</TableHead>
                  <TableHead className="w-[100px] text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 text-[10px]">Actions</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 text-[10px]">Partner Agency</TableHead>
                  <TableHead className="w-[80px] text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 text-[10px]">Token</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 font-serif text-[10px]">Booking Node</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 min-w-[180px] text-[10px]">Allowed Products</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 text-[10px]">Rate</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 text-[10px]">Parsing</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-3 px-3 bg-muted/30 text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_COLS} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing registry...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_COLS} className="h-64 text-center text-muted-foreground font-medium">
                      No partners found in local registry.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((s, i) => {
                    const isOpen = openRow === s.supplier_id;
                    const sl = (page - 1) * limit + (i + 1);

                    return (
                      <Fragment key={s.supplier_id}>
                        <TableRow className="hover:bg-muted/50 transition-all border-b border-border/50 group">
                          <TableCell className="text-center py-2.5 font-bold text-muted-foreground/50 text-xs">{sl}</TableCell>
                          <TableCell className="text-center py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <Button size="icon" variant="ghost" className={cn("h-8 w-8 rounded-lg transition-all", isOpen ? "bg-primary text-white" : "hover:bg-primary/10 hover:text-primary")} onClick={() => openEdit(s)}>
                                <Pencil size={14} strokeWidth={2.5} />
                              </Button>

                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-600 transition-all" onClick={() => deleteSupplier(s.supplier_id)}>
                                <Trash2 size={14} strokeWidth={2.5} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-2.5 font-black text-primary tracking-tight text-sm">{s.supplier_name}</TableCell>
                          <TableCell className="text-center py-2.5">
                            <div className="flex justify-center">
                              <SupplierTokenIndicator
                                hasToken={!!s.supplier_token}
                                onClick={() => setTokenModalSupplier(s)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-2.5 font-bold text-muted-foreground text-xs">
                            {(() => {
                              try {
                                const emails = typeof s.from_email_address === "string"
                                  ? JSON.parse(s.from_email_address)
                                  : s.from_email_address;

                                return Array.isArray(emails)
                                  ? emails.join(", ")
                                  : emails || "-";
                              } catch {
                                return s.from_email_address || "-";
                              }
                            })()}
                          </TableCell>
                          <TableCell className="text-center py-2.5 font-medium text-xs text-muted-foreground max-w-[240px]">
                            <span
                              className="line-clamp-2"
                              title={
                                s.allowed_product_names?.length
                                  ? s.allowed_product_names.join(", ")
                                  : formatAllowedProductNames(parseAllowedProductIds(s.allowed_products), activeProducts)
                              }
                            >
                              {s.allowed_product_names?.length
                                ? s.allowed_product_names.join(", ")
                                : formatAllowedProductNames(parseAllowedProductIds(s.allowed_products), activeProducts)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5 font-black text-xs text-foreground bg-primary/5">{s.commission}%</TableCell>
                          <TableCell className="text-center py-2.5">
                            <div className="flex justify-center">
                              {s.email_parsing_active === 1 ? (
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] opacity-50" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className={cn(
                              "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              s.supplier_active === 1 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20 opacity-60'
                            )}>
                              {s.supplier_active === 1 ? 'Active' : 'Offline'}
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* MODERNIZED INLINE EDITOR */}
                        {isOpen && (
                          <TableRow className="bg-muted/30 border-b border-border/50">
                            <TableCell colSpan={TABLE_COLS} className="p-8">
                              <div className="glass border-border/50 rounded-2xl p-8 shadow-inner animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <FileEdit size={16} /> Partner Configuration
                                  </h4>
                                  <Button variant="ghost" size="icon" onClick={() => setOpenRow(null)} className="rounded-full hover:bg-red-500/10 hover:text-red-500">
                                    <X size={18} />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Company Name</label>
                                      <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Office Contact</label>
                                      <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold" value={form.supplier_contact} onChange={e => setForm({ ...form, supplier_contact: e.target.value })} />
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-primary">Revenue Share (%)</label>
                                      <Input type="number" className="h-10 bg-primary/5 border-primary/20 rounded-xl font-black text-primary" value={form.commission} onChange={e => setForm({ ...form, commission: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Office Email</label>
                                      <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold" value={form.supplier_email} onChange={e => setForm({ ...form, supplier_email: e.target.value })} />
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Booking Inbound Email</label>
                                      <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold" value={
                                        Array.isArray(form.from_email_address)
                                          ? form.from_email_address.join(", ")
                                          : (() => {
                                            try {
                                              return JSON.parse(form.from_email_address || "[]").join(", ");
                                            } catch {
                                              return form.from_email_address || "";
                                            }
                                          })()
                                      } onChange={e => setForm({ ...form, from_email_address: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-muted-foreground/60">Business Reg No</label>
                                      <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold uppercase opacity-60" value={form.reg_no} onChange={e => setForm({ ...form, reg_no: e.target.value })} />
                                    </div>
                                  </div>

                                  <div className="space-y-4 flex flex-col justify-center">
                                    <label className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer hover:bg-muted/30 transition-colors">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Automated Parsing</span>
                                      <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded-lg border-border/50 text-emerald-500 focus:ring-emerald-500/20"
                                        checked={form.email_parsing_active === 1}
                                        onChange={e => setForm({ ...form, email_parsing_active: e.target.checked ? 1 : 0 })}
                                      />
                                    </label>

                                    <label className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer hover:bg-muted/30 transition-colors">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Partner Status</span>
                                      <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded-lg border-border/50 text-emerald-500 focus:ring-emerald-500/20"
                                        checked={form.supplier_active === 1}
                                        onChange={e => setForm({ ...form, supplier_active: e.target.checked ? 1 : 0 })}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-primary">
                                        Allowed Products
                                      </label>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Select one or more active parking products for this supplier.
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                      {(form.allowed_products?.length || 0)} selected
                                    </span>
                                  </div>

                                  {(() => {
                                    const selectedIds: number[] = form.allowed_products || [];
                                    const savedIds = parseAllowedProductIds(s.allowed_products);
                                    const inactiveSelected = selectedIds
                                      .filter((id) => !activeProducts.some((p) => p.id === id))
                                      .map((id) => {
                                        const nameIndex = savedIds.indexOf(id);
                                        return {
                                          id,
                                          product_name:
                                            s.allowed_product_names?.[nameIndex] || `Product #${id}`,
                                          airport_name: "No longer active",
                                          inactive: true,
                                        };
                                      });
                                    const productOptions = [
                                      ...activeProducts.map((p) => ({ ...p, inactive: false })),
                                      ...inactiveSelected,
                                    ];

                                    if (productOptions.length === 0) {
                                      return (
                                        <p className="text-xs text-muted-foreground italic">
                                          No active products found for your company.
                                        </p>
                                      );
                                    }

                                    return (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto rounded-xl border border-border/50 bg-background/50 p-4">
                                        {productOptions.map((product) => {
                                          const selected = selectedIds.includes(product.id);
                                          return (
                                            <label
                                              key={product.id}
                                              className={cn(
                                                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                selected
                                                  ? "border-primary/40 bg-primary/5"
                                                  : "border-border/50 hover:bg-muted/30",
                                                product.inactive && "opacity-80"
                                              )}
                                            >
                                              <input
                                                type="checkbox"
                                                className="mt-0.5 h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20"
                                                checked={selected}
                                                onChange={() => toggleAllowedProduct(product.id)}
                                              />
                                              <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">
                                                  {product.product_name}
                                                </p>
                                                {product.airport_name && (
                                                  <p className="text-[10px] text-muted-foreground truncate">
                                                    {product.airport_name}
                                                  </p>
                                                )}
                                              </div>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()}
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                    {saveMsg && <span className="animate-pulse flex items-center gap-1.5"><Clock size={12} /> {saveMsg}</span>}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Button variant="outline" className="rounded-xl font-bold px-6" onClick={() => setOpenRow(null)}>Dismiss</Button>
                                    <Button className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20" onClick={() => saveEdit(s.supplier_id)}>
                                      Commit Changes
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* PAGINATION SECTION */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <p className="text-xs font-bold text-muted-foreground">
            Showing <span className="text-foreground">{rows.length}</span> of <span className="text-foreground">{total}</span> total entities
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" className="h-10 px-4 rounded-xl font-bold transition-all disabled:opacity-30" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft size={18} />
            </Button>
            <div className="flex items-center px-4 h-10 rounded-xl bg-muted/50 border border-border/50">
              <span className="text-xs font-black">Page {page} of {totalPages}</span>
            </div>
            <Button variant="outline" className="h-10 px-4 rounded-xl font-bold transition-all disabled:opacity-30" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      {tokenModalSupplier && (
        <SupplierTokenModal
          open={!!tokenModalSupplier}
          onClose={() => setTokenModalSupplier(null)}
          assignmentId={tokenModalSupplier.assignment_id}
          supplierName={tokenModalSupplier.supplier_name}
          currentToken={tokenModalSupplier.supplier_token || null}
          onSaved={(token) => {
            setRows((prev) =>
              prev.map((row) =>
                row.assignment_id === tokenModalSupplier.assignment_id
                  ? { ...row, supplier_token: token }
                  : row
              )
            );
            setTokenModalSupplier((prev) =>
              prev ? { ...prev, supplier_token: token } : null
            );
          }}
        />
      )}
    </ProtectedRoute>
  );
}
