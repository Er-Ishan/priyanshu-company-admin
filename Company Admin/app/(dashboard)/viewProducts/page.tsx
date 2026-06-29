"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SquareParking, Handshake, Pencil, Search, Plus, ArrowLeft, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, CalendarDays, DollarSign, Check, X, Eye, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/app/lib/apiFetch";
import { backendProxyPath } from "@/app/lib/backendProxy";
import RichTextEditor from "@/components/RichTextEditor";

const STATUSES = ['Active', 'Inactive'] as const;
const FLEXIBILITY = ['Refundable', 'Non-Refundable'] as const;
const SERVICES = ['Meet & Greet', 'Park & Ride'] as const;

// Use same-origin backend proxy to avoid NEXT_PUBLIC_API_BASE_URL in browser code.
const API_BASE_URL = "";

type Product = {
    id: number;
    airport_name: string;
    service_provider: string;
    product_name: string;
    website_display?: string;
    // airport_number: string;
    booking_email: string;
    airport_charges: string;
    operational_from: string;
    operational_to: string;
    book_short_hours: string;
    commission: string;
    product_extra: string;
    nonflex: string;
    service_type: string;
    recommended: string;

    airport_duty_number: string;
    edit_short_hours: number;
    cancel_short_hours: number;
    promocodes_applicable: string;


    // WEBSITE
    product_description: string;
    product_overview: string;
    dropoff_procedure: string;
    return_procedure?: string;
    directions: string;
    important_information?: string;

    // EMAIL (NEW)
    email_dropoff_procedure?: string;
    email_return_procedure?: string;
    email_notes?: string;

    // POINTS
    point_1?: string;
    point_2?: string;
    point_3?: string;
    point_4?: string;
    point_5?: string;
    point_6?: string;

    is_active: number;
    status: string;
    image_url?: string;
    terminals?: string[] | string;
};

// Convert "13:30" → "01:30 PM"
const formatTime12 = (time?: string) => {
    if (!time) return "-";
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
};

// const isProductOperationalNow = (
//     from?: string,
//     to?: string
// ): boolean => {
//     if (!from || !to) return false;

//     const now = new Date();

//     const [fromH, fromM] = from.split(":").map(Number);
//     const [toH, toM] = to.split(":").map(Number);

//     const fromTime = new Date();
//     fromTime.setHours(fromH, fromM, 0, 0);

//     const toTime = new Date();
//     toTime.setHours(toH, toM, 0, 0);

//     // ✅ Handles overnight ranges (e.g. 22:00 → 06:00)
//     if (fromTime <= toTime) {
//         return now >= fromTime && now <= toTime;
//     } else {
//         return now >= fromTime || now <= toTime;
//     }
// };

const getUKNow = () => {
    // Create "now" in UK time regardless of server/browser timezone
    const now = new Date();

    const ukNow = new Date(
        now.toLocaleString("en-GB", {
            timeZone: "Europe/London",
        })
    );

    return ukNow;
};

const isProductOperationalNow = (from?: string, to?: string): boolean => {
    if (!from || !to) return false;

    // Get current UK time (hours + minutes only)
    const now = new Date();
    const ukTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/London" })
    );

    const nowMinutes = ukTime.getHours() * 60 + ukTime.getMinutes();

    const [fromH, fromM] = from.slice(0, 5).split(":").map(Number);
    const [toH, toM] = to.slice(0, 5).split(":").map(Number);

    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;

    // Normal range (e.g. 04:00 → 23:45)
    if (fromMinutes <= toMinutes) {
        return nowMinutes >= fromMinutes && nowMinutes <= toMinutes;
    }

    // Overnight range (e.g. 22:00 → 06:00)
    return nowMinutes >= fromMinutes || nowMinutes <= toMinutes;
};



// Generate time options
const generateTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
        for (const m of ["00", "15", "30", "45"]) {
            const value = `${String(h).padStart(2, "0")}:${m}`;
            options.push({ value, label: formatTime12(value) });
        }
    }
    return options;
};

// Normalize DB time to "HH:mm" (handles "HH:mm:ss", spaces, etc.)
const normalizeTimeForSelect = (time?: string) => {
    if (!time) return "";
    return time.trim().slice(0, 5); // "00:00:00" -> "00:00"
};



const TIME_OPTIONS = generateTimeOptions();


export default function ProductsListPage() {

    const [rows, setRows] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({});

    const [contentTab, setContentTab] = useState<"website" | "email">("website");


    const [statusFilter, setStatusFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [recommendedFilter, setRecommendedFilter] = useState("");
    const [flexFilter, setFlexFilter] = useState("");

    const [status, setStatus] = useState('');
    const [flex, setFlex] = useState('');
    const [service, setService] = useState('');

    const [airport, setAirport] = useState('');


    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [airportTerminals, setAirportTerminals] = useState<any[]>([]);



    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 30;

    const toggleActive = async (id: number, value: number) => {
        try {
            const res = await fetch(
                backendProxyPath(`/api/parking/products/toggle/${id}`),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ is_active: value }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error(data);
                alert(data.message || "Update failed");
                return;
            }

            // Update UI immediately
            setRows(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, is_active: value } : p
                )
            );
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };



    const fetchProducts = async () => {
        setLoading(true);
        setErrMsg("");

        try {
            const res = await apiFetch(
                backendProxyPath("/api/parking/products"),
                { cache: "no-store" }
            );

            const json = await res.json();

            // ✅ NORMALIZE RESPONSE
            const list = Array.isArray(json)
                ? json
                : Array.isArray(json?.data)
                    ? json.data
                    : [];

            setRows(
                list.map((item: any) => ({
                    ...item,
                    terminals: item.terminals || "",
                }))
            );

        } catch (err: any) {
            console.error(err);
            setErrMsg("Failed to load products.");
            setRows([]); // IMPORTANT
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const startEdit = (p: Product) => {
        setEditingId(p.id);

        setForm({
            ...p,

            // ✅ ENSURE TIME VALUES EXIST
            terminals: p.terminals || "",
            operational_from: normalizeTimeForSelect(p.operational_from),
            operational_to: normalizeTimeForSelect(p.operational_to),

            airport_duty_number: p.airport_duty_number || "",
            product_extra: p.product_extra || "",
            edit_short_hours: p.edit_short_hours ?? 0,
            cancel_short_hours: p.cancel_short_hours ?? 0,
            promocodes_applicable: p.promocodes_applicable || "Yes",
            website_display: p.website_display || "N",
            point_1: p.point_1 || "",
            point_2: p.point_2 || "",
            point_3: p.point_3 || "",
            point_4: p.point_4 || "",
            point_5: p.point_5 || "",
            point_6: p.point_6 || "",
        });

    };


    const saveEdit = async (id: number) => {
        const res = await fetch(backendProxyPath(`/api/parking/products/${id}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                ...form,
                terminals: form.terminals || "",
            }),
        });

        if (!res.ok) {
            alert("Failed to update product");
            return;
        }

        // ⬇ upload image separately
        await uploadImage(id);

        alert("Updated successfully");
        setEditingId(null);
        fetchProducts();
    };




    const uploadImage = async (id: number) => {
        if (!selectedImage) return;

        const formData = new FormData();
        formData.append("image", selectedImage);

        const res = await fetch(
            backendProxyPath(`/api/parking/product/update-image/${id}`),
            {
                method: "PUT",
                credentials: "include",
                body: formData, // ❌ DO NOT set Content-Type
            }
        );

        if (!res.ok) {
            alert("Image upload failed");
        }
    };



    const deleteProduct = async (id: number) => {
        if (!confirm("Are you sure you want to delete?")) return;

        try {
            const res = await fetch(
                backendProxyPath(`/api/parking/products/${id}`),
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Delete failed");
            }

            alert("Deleted successfully");
            await fetchProducts();

        } catch (err: any) {
            console.error("DELETE ERROR:", err);
            alert(err.message || "Delete failed");
        }
    };



    // SEARCH
    const filteredRows: Product[] = Array.isArray(rows)
        ? rows.filter((p: Product) => {

            // 🔍 SEARCH FILTER
            if (
                !`${p.product_name} ${p.airport_name} ${p.service_provider}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            ) {
                return false;
            }

            // ✈️ AIRPORT FILTER
            if (airport && p.airport_name !== airport) {
                return false;
            }

            // 📌 STATUS FILTER
            if (status && p.status !== status) {
                return false;
            }

            // 🔁 FLEXIBILITY FILTER
            if (flex && p.nonflex !== flex) {
                return false;
            }

            // 🅿️ SERVICE TYPE FILTER
            if (service && p.service_type !== service) {
                return false;
            }

            return true;
        })
        : [];




    // PAGINATION LOGIC
    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRows = filteredRows.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredRows.length / recordsPerPage);


    // ICON LOGIC
    const renderServiceIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes("yes")) return <Check className="h-4 w-4 text-green-600" />;
        if (t.includes("no")) return <X className="h-4 w-4 text-red-600" />;
        if (t.includes("meet")) return <Handshake className="h-4 w-4 text-blue-500" />;
        if (t.includes("park")) return <SquareParking className="h-4 w-4 text-blue-500" />;
        return <SquareParking className="h-4 w-4 text-gray-500" />;
    };

    const renderWebsiteDisplayIcon = (value?: string) => {
        const show = String(value || "N").toUpperCase() === "Y";
        return show
            ? <Check className="h-4 w-4 text-green-600 shrink-0" />
            : <X className="h-4 w-4 text-red-600 shrink-0" />;
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
                            Parking Products
                        </h1>
                        <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
                            Manage your parking inventory, update procedures, and monitor product operational status.
                        </p>
                    </div>
                    <Button
                        className="h-12 rounded-xl px-6 font-bold bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                        onClick={() => (window.location.href = "/addNewProduct")}
                    >
                        <Plus size={20} /> Add New Product
                    </Button>
                </div>

                {/* FILTER PANEL */}
                <div className="glass border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[300px] group">
                            <Input
                                placeholder="Search products, airports, or providers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 w-full pl-11 pr-4 bg-background/50 border-border/50 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 transition-all group-hover:border-primary/30"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>

                        {/* AIRPORT FILTER - Optional for later if needed */}
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50">
                                    <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Action</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Image</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Product</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Airport</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Type</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Provider</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Op Hours</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Flex</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Manage Price</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                                <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading products...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : errMsg ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-32 text-center text-red-600 font-bold bg-red-500/5">
                                            {errMsg}
                                        </TableCell>
                                    </TableRow>
                                ) : currentRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-64 text-center text-muted-foreground font-medium">
                                            No products found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentRows.map((p, index) => {
                                        const sl = indexOfFirst + index + 1;
                                        const isOperational = isProductOperationalNow(p.operational_from, p.operational_to);

                                        return (
                                            <React.Fragment key={p.id}>
                                                <TableRow className={cn("hover:bg-muted/50 transition-all border-b border-border/50 group", editingId === p.id && "bg-primary/5")}>
                                                    <TableCell className="text-center py-4 font-bold text-muted-foreground/50">
                                                        {String(sl).padStart(2, '0')}
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className={cn("p-2 rounded-lg transition-colors", isOperational ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                                                                <Clock className="w-4 h-4" />
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all"
                                                                onClick={() => startEdit(p)}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                                                                onClick={() => deleteProduct(p.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        {p.image_url ? (
                                                            <div className="w-24 h-14 mx-auto rounded-lg overflow-hidden border border-border/50 bg-white shadow-sm flex items-center justify-center">
                                                                <img src={backendProxyPath(p.image_url)} alt="Product" className="max-w-full max-h-full object-contain p-1" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-24 h-14 mx-auto rounded-lg border border-dashed border-border/50 flex items-center justify-center bg-muted/20">
                                                                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">No Image</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-foreground tracking-tight">{p.product_name}</span>
                                                            {renderWebsiteDisplayIcon(p.website_display)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4 font-bold text-muted-foreground text-xs">{p.airport_name}</TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <div className="flex flex-col items-center gap-1">
                                                            {renderServiceIcon(p.service_type)}
                                                            <span className="text-[10px] font-black uppercase text-muted-foreground/70">{p.service_type}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4 font-medium text-xs text-muted-foreground">{p.service_provider}</TableCell>
                                                    <TableCell className="text-center py-4 font-bold text-xs whitespace-nowrap">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-emerald-600">{formatTime12(p.operational_from)}</span>
                                                            <span className="text-muted-foreground/50 text-[9px]">TO</span>
                                                            <span className="text-red-600">{formatTime12(p.operational_to)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest", p.nonflex === "Refundable" ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600")}>
                                                            {p.nonflex}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-10 w-10 rounded-xl border-border/50 bg-background/50 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                                            onClick={() => {
                                                                const name = encodeURIComponent(p.product_name);
                                                                const provider = encodeURIComponent(p.service_provider);
                                                                window.location.href = `/manage-price?id=${p.id}&name=${name}&provider=${provider}`;
                                                            }}
                                                        >
                                                            <DollarSign className="w-5 h-5" />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <button
                                                            onClick={() => toggleActive(p.id, p.is_active === 1 ? 0 : 1)}
                                                            className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-inner", p.is_active === 1 ? "bg-emerald-500" : "bg-muted-foreground/30")}
                                                        >
                                                            <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow-md", p.is_active === 1 ? "translate-x-6" : "translate-x-1")} />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>

                                                {/* ==== INLINE EDIT PANEL ==== */}
                                                {editingId === p.id && (
                                                    <TableRow>
                                                        <TableCell colSpan={11} className="p-0 bg-muted/5 border-b border-border/50">
                                                            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h3 className="text-2xl font-black tracking-tight">Edit Product Details</h3>
                                                                        <p className="text-sm text-muted-foreground font-medium mt-1">Update specifications and procedures for <span className="text-primary font-bold">{p.product_name}</span></p>
                                                                    </div>
                                                                    <div className="flex gap-3">
                                                                        <Button variant="outline" className="h-11 rounded-xl font-bold px-6" onClick={() => setEditingId(null)}>Cancel</Button>
                                                                        <Button className="h-11 rounded-xl font-bold px-8 bg-primary text-white shadow-lg shadow-primary/20" onClick={() => saveEdit(p.id)}>Save Changes</Button>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                                                    {/* Basic Card */}
                                                                    <div className="glass border-border/50 rounded-2xl p-6 space-y-4">
                                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">General Info</h4>
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-1.5 min-w-0">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</label>
                                                                                <Input className="h-11 rounded-xl bg-background/50 border-border/50 font-medium" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                                                    Website Display
                                                                                </label>

                                                                                <select
                                                                                    value={form.website_display ?? "N"}
                                                                                    onChange={(e) =>
                                                                                        setForm({
                                                                                            ...form,
                                                                                            website_display: e.target.value,
                                                                                        })
                                                                                    }
                                                                                    className="w-full h-11 rounded-xl border border-border/50 bg-background/50 px-4 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                                                                >
                                                                                    <option value="Y">Yes (Y)</option>
                                                                                    <option value="N">No (N)</option>
                                                                                </select>
                                                                            </div>
                                                                            <div className="space-y-1.5 min-w-0">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Duty Contact</label>
                                                                                <Input className="h-11 rounded-xl bg-background/50 border-border/50 font-medium" value={form.airport_duty_number} onChange={e => setForm({ ...form, airport_duty_number: e.target.value })} />
                                                                            </div>
                                                                            <div className="space-y-1.5 min-w-0">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Booking Email</label>
                                                                                <Input className="h-11 rounded-xl bg-background/50 border-border/50 font-medium" value={form.booking_email} onChange={e => setForm({ ...form, booking_email: e.target.value })} />
                                                                            </div>


                                                                        </div>
                                                                    </div>

                                                                    {/* Operational Card */}
                                                                    <div className="glass border-border/50 rounded-2xl p-6 space-y-4">
                                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Operations</h4>
                                                                        <div className="space-y-5">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="space-y-1.5 min-w-0">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Op Start</label>
                                                                                    <div className="relative">
                                                                                        <select value={form.operational_from ?? ""} onChange={e => setForm({ ...form, operational_from: e.target.value })} className="w-full h-11 bg-background/50 border-border/50 rounded-xl px-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all hover:bg-background/80 cursor-pointer">
                                                                                            <option value="">Select</option>
                                                                                            {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                                                        </select>
                                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                                                                                            <ChevronLeft size={14} className="-rotate-90" />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-1.5 min-w-0">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Op End</label>
                                                                                    <div className="relative">
                                                                                        <select value={form.operational_to ?? ""} onChange={e => setForm({ ...form, operational_to: e.target.value })} className="w-full h-11 bg-background/50 border-border/50 rounded-xl px-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all hover:bg-background/80 cursor-pointer">
                                                                                            <option value="">Select</option>
                                                                                            {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                                                        </select>
                                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                                                                                            <ChevronLeft size={14} className="-rotate-90" />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Extra</label>
                                                                                <Input className="h-11 rounded-xl bg-background/50 border-border/50 font-medium" value={form.product_extra ?? ""} onChange={e => setForm({ ...form, product_extra: e.target.value })} />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Type</label>
                                                                                <div className="relative">
                                                                                    <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} className="w-full h-11 bg-background/50 border-border/50 rounded-xl px-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all hover:bg-background/80 cursor-pointer">
                                                                                        <option value="">Select</option>
                                                                                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                                                                                    </select>
                                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                                                                                        <ChevronLeft size={14} className="-rotate-90" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Policy Card */}
                                                                    <div className="glass border-border/50 rounded-2xl p-6 space-y-4">
                                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Policies</h4>
                                                                        <div className="space-y-5">
                                                                            <div className="space-y-2">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Flexibility</label>
                                                                                <div className="relative">
                                                                                    <select value={form.nonflex} onChange={e => setForm({ ...form, nonflex: e.target.value })} className="w-full h-11 bg-background/50 border-border/50 rounded-xl px-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all hover:bg-background/80 cursor-pointer">
                                                                                        <option value="">Select</option>
                                                                                        {FLEXIBILITY.map(f => <option key={f} value={f}>{f}</option>)}
                                                                                    </select>
                                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                                                                                        <ChevronLeft size={14} className="-rotate-90" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="space-y-1.5 min-w-0">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Edit Hours</label>
                                                                                    <Input type="number" className="h-11 rounded-xl bg-background/50 border-border/50 font-medium" value={form.edit_short_hours} onChange={e => setForm({ ...form, edit_short_hours: Number(e.target.value) })} />
                                                                                </div>
                                                                                <div className="space-y-1.5 min-w-0">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cancel Hours</label>
                                                                                    <Input type="number" className="h-11 rounded-xl bg-background/50 border-border/50 font-medium" value={form.cancel_short_hours} onChange={e => setForm({ ...form, cancel_short_hours: Number(e.target.value) })} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Promo Codes</label>
                                                                                <div className="relative">
                                                                                    <select value={form.promocodes_applicable} onChange={e => setForm({ ...form, promocodes_applicable: e.target.value })} className="w-full h-11 bg-background/50 border-border/50 rounded-xl px-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all hover:bg-background/80 cursor-pointer">
                                                                                        <option value="Yes">Yes</option>
                                                                                        <option value="No">No</option>
                                                                                    </select>
                                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                                                                                        <ChevronLeft size={14} className="-rotate-90" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Image Card */}
                                                                    <div className="glass border-border/50 rounded-2xl p-6 space-y-4">
                                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Media</h4>
                                                                        <div className="space-y-4">
                                                                            <div className="aspect-video w-full rounded-xl border border-dashed border-border/50 bg-background/50 flex flex-col items-center justify-center overflow-hidden group/img relative">
                                                                                {previewImage || form.image_url ? (
                                                                                    <>
                                                                                        <img src={previewImage || backendProxyPath(form.image_url)} className="w-full h-full object-contain p-2" />
                                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                                            <Button variant="secondary" size="sm" onClick={() => document.getElementById('edit-img-input')?.click()}>Replace</Button>
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <Button variant="ghost" className="h-full w-full flex flex-col gap-2" onClick={() => document.getElementById('edit-img-input')?.click()}>
                                                                                        <Plus className="h-6 w-6 text-muted-foreground" />
                                                                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Upload Image</span>
                                                                                    </Button>
                                                                                )}
                                                                                <input
                                                                                    id="edit-img-input"
                                                                                    type="file"
                                                                                    className="hidden"
                                                                                    accept="image/*"
                                                                                    onChange={e => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (file) {
                                                                                            setSelectedImage(file);
                                                                                            setPreviewImage(URL.createObjectURL(file));
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Terminal Edit Section */}
                                                                <div className="glass border-border/50 rounded-2xl p-8 shadow-sm bg-background/50">

                                                                    <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">

                                                                        <div>
                                                                            <h3 className="text-lg font-black tracking-tight">
                                                                                Airport Terminals
                                                                            </h3>

                                                                            <p className="text-sm text-muted-foreground">
                                                                                Supported terminals for this parking product
                                                                            </p>
                                                                        </div>

                                                                    </div>

                                                                    <div className="space-y-5">

                                                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                                            Terminal List
                                                                        </label>

                                                                        <Input
                                                                            className="h-12 rounded-xl text-base"
                                                                            placeholder="Example: Terminal 1, Terminal 2, Terminal 3"
                                                                            value={form.terminals || ""}
                                                                            onChange={(e) =>
                                                                                setForm({
                                                                                    ...form,
                                                                                    terminals: e.target.value,
                                                                                })
                                                                            }
                                                                        />

                                                                        {form.terminals && (
                                                                            <div className="flex flex-wrap gap-3 pt-2">

                                                                                {form.terminals
                                                                                    .split(",")
                                                                                    .map((terminal: string, index: number) => (
                                                                                        <span
                                                                                            key={index}
                                                                                            className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20"
                                                                                        >
                                                                                            {terminal.trim()}
                                                                                        </span>
                                                                                    ))}

                                                                            </div>
                                                                        )}

                                                                    </div>

                                                                </div>

                                                                {/* Product Features Edit Section */}
                                                                <div className="glass border-border/50 rounded-2xl p-8 shadow-sm space-y-6 bg-background/50">
                                                                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                            <Check size={18} />
                                                                        </div>
                                                                        <h3 className="text-lg font-black tracking-tight">Product Features</h3>
                                                                        <p className="text-xs text-muted-foreground font-medium ml-2">(6 Bullet points for website highlights)</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                        {[1, 2, 3, 4, 5, 6].map((num) => (
                                                                            <div key={num} className="space-y-2">
                                                                                <div className="flex justify-between items-center px-1">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Point {num}</label>
                                                                                    <span className="text-[9px] font-bold text-muted-foreground/40">{form[`point_${num}`]?.length || 0}/50</span>
                                                                                </div>
                                                                                <Input
                                                                                    value={form[`point_${num}`] || ""}
                                                                                    onChange={e => setForm({ ...form, [`point_${num}`]: e.target.value })}
                                                                                    placeholder="Feature detail..."
                                                                                    maxLength={50}
                                                                                    className="h-11 rounded-xl bg-background/50 border-border/50 font-medium focus:ring-primary/20 transition-all"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Rich Text Sections */}
                                                                <div className="glass border-border/50 rounded-3xl p-8 space-y-8 bg-background/30 shadow-inner">
                                                                    <div className="flex gap-2 p-1 bg-muted/20 w-fit rounded-2xl border border-border/50">
                                                                        <Button variant={contentTab === "website" ? "default" : "ghost"} className={cn("h-10 rounded-xl px-6 font-bold transition-all", contentTab === "website" ? "shadow-md" : "hover:bg-primary/10")} onClick={() => setContentTab("website")}>Website Content</Button>
                                                                        <Button variant={contentTab === "email" ? "default" : "ghost"} className={cn("h-10 rounded-xl px-6 font-bold transition-all", contentTab === "email" ? "shadow-md" : "hover:bg-primary/10")} onClick={() => setContentTab("email")}>Email Content</Button>
                                                                    </div>

                                                                    {contentTab === "website" ? (
                                                                        <div className="flex flex-col gap-8 w-full">

                                                                            <div className="space-y-3">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Dropoff Procedure</label>
                                                                                <div className="rounded-2xl border border-border/50 bg-background dark:bg-gray-900 h-[300px] w-full overflow-y-auto"><RichTextEditor key="dropoff_procedure" value={form.dropoff_procedure || ""} onChange={val => setForm({ ...form, dropoff_procedure: val })} /></div>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Return Procedure</label>
                                                                                <div className="rounded-2xl border border-border/50 bg-background dark:bg-gray-900 h-[300px] w-full overflow-y-auto"><RichTextEditor key="return_procedure" value={form.return_procedure || ""} onChange={val => setForm({ ...form, return_procedure: val })} /></div>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Directions</label>
                                                                                <div className="rounded-2xl border border-border/50 bg-background dark:bg-gray-900 h-[300px] w-full overflow-y-auto"><RichTextEditor key="directions" value={form.directions || ""} onChange={val => setForm({ ...form, directions: val })} /></div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col gap-8 w-full">
                                                                            <div className="space-y-3">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Email Dropoff Procedure</label>
                                                                                <div className="rounded-2xl border border-border/50 bg-background dark:bg-gray-900 h-[300px] w-full overflow-y-auto"><RichTextEditor key="email_dropoff_procedure"
                                                                                    value={form.email_dropoff_procedure || ""} onChange={val => setForm({ ...form, email_dropoff_procedure: val })} /></div>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Email Return Procedure</label>
                                                                                <div className="rounded-2xl border border-border/50 bg-background dark:bg-gray-900 h-[300px] w-full overflow-y-auto"><RichTextEditor key="email_return_procedure" value={form.email_return_procedure || ""} onChange={val => setForm({ ...form, email_return_procedure: val })} /></div>
                                                                            </div>
                                                                            <div className="space-y-3 w-full">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Email Notes</label>
                                                                                <div className="rounded-2xl border border-border/50 bg-background dark:bg-gray-900 h-[300px] w-full overflow-y-auto"><RichTextEditor key="email_notes" value={form.email_notes || ""} onChange={val => setForm({ ...form, email_notes: val })} /></div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Bottom Action Buttons */}
                                                                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-11 rounded-xl font-bold px-6"
                                                                        onClick={() => setEditingId(null)}
                                                                    >
                                                                        Cancel
                                                                    </Button>

                                                                    <Button
                                                                        className="h-11 rounded-xl font-bold px-8 bg-primary text-white shadow-lg shadow-primary/20"
                                                                        onClick={() => saveEdit(p.id)}
                                                                    >
                                                                        Save Changes
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION SECTION */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-border/50 bg-muted/10 gap-4">
                        <p className="text-xs font-bold text-muted-foreground">
                            Showing <span className="text-foreground">{currentRows.length}</span> of <span className="text-foreground">{filteredRows.length}</span> total products
                        </p>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}