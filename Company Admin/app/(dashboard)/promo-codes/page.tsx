'use client';

import { StickyNote, Pencil, Trash2, X, Handshake, SquareParking, Plus, CalendarDays, Percent, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Fragment, useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import ProtectedRoute from '@/components/ProtectedRoute';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ===========================
   SQL TYPE MAPPING
=========================== */
type PromoCode = {
  id: number;
  promo_code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  expiry_date: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

function getPromoStatus(
  startDate?: string | null,
  expiryDate?: string | null
): "Active" | "Coming" | "Expired" {
  const now = new Date();

  const start = startDate ? new Date(startDate) : null;
  const expiry = expiryDate ? new Date(expiryDate) : null;

  if (expiry && now > expiry) return "Expired";
  if (start && now < start) return "Coming";
  return "Active";
}



/* ===========================
   DATE FORMAT
=========================== */
function formatFullDate(dateString?: string | null) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Convert DB datetime -> input datetime-local (YYYY-MM-DDTHH:mm)
function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

// Convert input datetime-local -> DB datetime string (YYYY-MM-DD HH:mm:ss)
function fromDateTimeLocal(value?: string | null) {
  if (!value) return null;
  // If it's already in YYYY-MM-DD format (no time), add midnight
  if (!value.includes("T") && !value.includes(" ")) {
    return value + " 00:00:00";
  }
  return value.replace("T", " ") + (value.length === 16 ? ":00" : "");
}


/* ===========================
   MAIN COMPONENT
=========================== */
export default function PromoCodesPage() {
  const [rows, setRows] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const fiveDaysLater = new Date(today);
  fiveDaysLater.setDate(today.getDate() + 5);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<PromoCode>>({});

  /* FORM STATE */
  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState("");
  const [startDate, setStartDate] = useState(formatDate(tomorrow));
  const [expiryDate, setExpiryDate] = useState(formatDate(fiveDaysLater));

  /* ===========================
     FETCH PROMO CODES
  =========================== */
  const fetchPromoCodes = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const companyId = user?.company_id || 1;

      const res = await fetch(`${API_BASE_URL}/api/promocodes`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          "x-company-id": companyId.toString()
        }
      });

      if (!res.ok) throw new Error(await res.text());
      setRows(await res.json());
    } catch (e) {
      setErrMsg("Failed to load promo codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  /* ===========================
     OPEN EDIT (FETCH SINGLE PROMO)
  =========================== */
  const openEdit = async (promo: PromoCode) => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const companyId = user?.company_id || 1;

      const res = await fetch(`${API_BASE_URL}/api/promocodes/${promo.id}`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          "x-company-id": companyId.toString()
        }
      });

      if (!res.ok) throw new Error(await res.text());

      const data: PromoCode = await res.json();

      setEditingId(data.id);
      setEditData({
        promo_code: data.promo_code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        usage_limit: data.usage_limit,
        start_date: toDateTimeLocal(data.start_date),
        expiry_date: toDateTimeLocal(data.expiry_date),
      });
    } catch (err: any) {
      alert(err.message || "Failed to load promo details");
    }
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  /* ===========================
     UPDATE PROMO
  =========================== */
  const updatePromo = async (id: number) => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const companyId = user?.company_id || 1;

      const res = await fetch(`${API_BASE_URL}/api/promocodes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId.toString()
        },
        body: JSON.stringify({
          promo_code: editData.promo_code,
          discount_type: editData.discount_type,
          discount_value: editData.discount_value,
          usage_limit: editData.usage_limit,
          start_date: fromDateTimeLocal(editData.start_date),
          expiry_date: fromDateTimeLocal(editData.expiry_date),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Promo code updated");
      closeEdit();
      fetchPromoCodes();
    } catch (err: any) {
      alert(err.message || "Failed to update promo");
    }
  };

  /* ===========================
     CREATE PROMO CODE
  =========================== */
  const createPromo = async () => {
    if (!promoCode || !discountValue) {
      alert("Promo code and value are required");
      return;
    }

    try {
      // Get company ID from session/local storage
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const companyId = user?.company_id || 1;

      const res = await fetch(`${API_BASE_URL}/api/insert/promocodes`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId.toString()
        },
        body: JSON.stringify({
          promo_code: promoCode,
          discount_type: discountType,
          discount_value: discountValue,
          usage_limit: usageLimit ? Number(usageLimit) : null,
          start_date: fromDateTimeLocal(startDate),
          expiry_date: fromDateTimeLocal(expiryDate),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to create promo code");
      }

      alert("Promo code created successfully");

      setPromoCode("");
      setDiscountValue(0);
      setUsageLimit("");
      setStartDate("");
      setExpiryDate("");
      setShowForm(false);

      fetchPromoCodes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ===========================
     DELETE PROMO
  =========================== */
  const deletePromo = async (id: number) => {
    if (!window.confirm("Delete this promo code?")) return;

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const companyId = user?.company_id || 1;

      const res = await fetch(`${API_BASE_URL}/api/promocodes/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-company-id": companyId.toString()
        }
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Promo code deleted successfully");
      fetchPromoCodes();
    } catch (err: any) {
      alert(err.message || "Failed to delete promo code");
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen px-4 py-8 space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
              Management
            </h6>
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
              Promo Codes
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
              Create and manage promotional discounts. Monitor usage limits and expiration dates across your campaigns.
            </p>
          </div>
          <Button
            className={cn("h-12 rounded-xl px-6 font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg", showForm ? "bg-muted text-foreground" : "bg-primary text-white shadow-primary/20")}
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? "Cancel Creation" : "Add Promo Code"}
          </Button>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <div className="glass border-border/50 rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Tag size={18} />
              </div>
              <h3 className="text-lg font-black tracking-tight">Create New Campaign</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="h-11 rounded-xl bg-background/50 border-border/50 font-medium pl-10 cursor-pointer"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expiry Date</label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="h-11 rounded-xl bg-background/50 border-border/50 font-medium pl-10 cursor-pointer"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Promo Code</label>
                <Input
                  placeholder="e.g. SUMMER25"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  className="h-11 rounded-xl bg-background/50 border-border/50 font-black uppercase tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as any)}
                  className="h-11 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="fixed">Fixed Amount (£)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Value</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="h-11 rounded-xl bg-background/50 border-border/50 font-medium pl-10"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black">
                    {discountType === "percentage" ? <Percent size={14} /> : "£"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Usage Limit</label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={usageLimit}
                  onChange={e => setUsageLimit(e.target.value)}
                  className="h-11 rounded-xl bg-background/50 border-border/50 font-medium"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-border/50 pt-6">
              <Button variant="outline" className="h-11 rounded-xl px-6 font-bold" onClick={() => setShowForm(false)}>Discard</Button>
              <Button className="h-11 rounded-xl px-10 font-bold bg-primary text-white shadow-lg shadow-primary/20" onClick={createPromo}>Create Campaign</Button>
            </div>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Actions</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Promo Code</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Type</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Value</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Limit / Used</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Start Date</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Expiry</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading campaigns...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center text-muted-foreground font-medium">
                      No promo codes found. Click "Add Promo Code" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((pc, i) => {
                    const status = getPromoStatus(pc.start_date, pc.expiry_date);
                    const isEditing = editingId === pc.id;

                    return (
                      <Fragment key={pc.id}>
                        <TableRow className={cn("hover:bg-muted/50 transition-all border-b border-border/50 group", isEditing && "bg-primary/5")}>
                          <TableCell className="text-center py-4 font-bold text-muted-foreground/50">
                            {String(i + 1).padStart(2, '0')}
                          </TableCell>

                          <TableCell className="text-center py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all"
                                onClick={() => (isEditing ? closeEdit() : openEdit(pc))}
                              >
                                {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                                onClick={() => deletePromo(pc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>

                          <TableCell className="text-center py-4">
                            <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary font-black uppercase tracking-widest text-sm border border-primary/10">
                              {pc.promo_code}
                            </span>
                          </TableCell>

                          <TableCell className="text-center py-4 font-black uppercase tracking-[0.1em] text-[10px] text-muted-foreground/70">
                            {pc.discount_type}
                          </TableCell>

                          <TableCell className="text-center py-4 font-black text-foreground">
                            {pc.discount_type === "percentage" ? `${pc.discount_value}%` : `£${pc.discount_value}`}
                          </TableCell>

                          <TableCell className="text-center py-4 font-bold text-xs">
                            <span className="text-foreground">{pc.used_count}</span>
                            <span className="text-muted-foreground/30 mx-1">/</span>
                            <span className="text-muted-foreground">{pc.usage_limit ?? "∞"}</span>
                          </TableCell>

                          <TableCell className="text-center py-4 font-medium text-xs text-muted-foreground">
                            {formatFullDate(pc.start_date)}
                          </TableCell>

                          <TableCell className="text-center py-4 font-medium text-xs text-muted-foreground">
                            {formatFullDate(pc.expiry_date)}
                          </TableCell>

                          <TableCell className="text-center py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm",
                              status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                status === "Coming" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                  "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            )}>
                              {status}
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* INLINE EDIT ROW */}
                        {isEditing && (
                          <TableRow>
                            <TableCell colSpan={9} className="p-0 bg-primary/5">
                              <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in slide-in-from-left-2 duration-200">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Code</label>
                                  <Input className="h-10 rounded-xl bg-background border-border/50 font-black uppercase tracking-widest" value={editData.promo_code || ""} onChange={e => setEditData({ ...editData, promo_code: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Type</label>
                                  <select value={editData.discount_type} onChange={e => setEditData({ ...editData, discount_type: e.target.value as any })} className="w-full h-10 bg-background border-border/50 rounded-xl px-3 text-sm font-medium outline-none">
                                    <option value="fixed">Fixed</option>
                                    <option value="percentage">Percentage</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Value</label>
                                  <Input type="number" className="h-10 rounded-xl bg-background border-border/50 font-bold" value={editData.discount_value} onChange={e => setEditData({ ...editData, discount_value: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Limit</label>
                                  <Input type="number" className="h-10 rounded-xl bg-background border-border/50 font-bold" value={(editData.usage_limit ?? "") as any} onChange={e => setEditData({ ...editData, usage_limit: e.target.value === "" ? null : Number(e.target.value) })} />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Start</label>
                                  <Input type="datetime-local" className="h-10 rounded-xl bg-background border-border/50 font-medium text-xs" value={(editData.start_date as string) || ""} onChange={e => setEditData({ ...editData, start_date: e.target.value })} onClick={(e) => e.currentTarget.showPicker?.()} />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Expiry</label>
                                  <Input type="datetime-local" className="h-10 rounded-xl bg-background border-border/50 font-medium text-xs" value={(editData.expiry_date as string) || ""} onChange={e => setEditData({ ...editData, expiry_date: e.target.value })} onClick={(e) => e.currentTarget.showPicker?.()} />
                                </div>
                                <div className="md:col-span-3 lg:col-span-6 flex justify-end gap-2 mt-2">
                                  <Button size="sm" variant="outline" className="h-9 rounded-lg font-bold px-4" onClick={closeEdit}>Cancel</Button>
                                  <Button size="sm" className="h-9 rounded-lg font-bold px-6 bg-primary text-white" onClick={() => updatePromo(pc.id)}>Save Updates</Button>
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

          {errMsg && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold flex items-center gap-2">
              <X size={16} /> {errMsg}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
