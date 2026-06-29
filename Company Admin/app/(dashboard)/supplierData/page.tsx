'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    NotebookPen, StickyNote, Pencil, Trash2, X, Handshake, SquareParking, 
    Telescope, Download, Send, FileEdit, Clock, Lightbulb, Eye, ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { cn } from "@/lib/utils";
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { backendProxyPath } from "@/app/lib/backendProxy";


/* ---------- ENUM options from SQL ---------- */
const SOURCES = ['Supplier', 'Website'] as const;
// const AIRPORTS = ['LHR', 'LGW', 'STN', 'LTN', 'MAN', 'BHX', 'Other'] as const;
const SERVICES = ['meet greet', 'park ride'] as const;
const STATUSES = ['Amended', 'Active', 'Cancelled'] as const;

/* ---------- Types ---------- */
type Booking = {
    id: number;
    ref_no: string;
    source: string;
    supplier_name: string;
    airport: string;
    service_type: string;
    customer_name: string;
    contact_no: string | null;
    customer_email: string | null;
    booked_on: string;
    booked_at?: string;
    dropoff_datetime: string;
    return_datetime: string;
    vehicle_reg_no: string | null;
    price: number;
    status: string;
    notes: string | null;
    airport_alias: string | null;
    make_model: string;
    model: string;
    color: string;
    no_of_days: string | null;
    quote_price: number | null;
    paid_price: number | null;   // ✅ ADD THIS: number | null;
};

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// const API_BASE_CRUD = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------- Helpers ---------- */
function getCookie(name: string) {
    const m = typeof document !== 'undefined'
        ? document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        : null;
    return m ? m.pop() : '';
}

function safeGetCookie(name: string) {
    if (typeof document === 'undefined') return '';
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
}

function fmtDT(v?: string) {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;

    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function toLocalInputValue(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toSqlDateTime(local: string) {
    if (!local) return null;
    return local.replace('T', ':') + ':00';
}

function money(n: number) {
    return `£${Number(n || 0).toFixed(2)}`;
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

const renderService = (s?: string) => {
    const lower = (s || '').toLowerCase();
    if (lower.startsWith('meet')) {
        return (
            <span className="inline-flex items-center gap-1.5">
                <Handshake className="h-3.5 w-3.5 text-orange-500" />
            </span>
        );
    }
    if (lower.startsWith('park')) {
        return (
            <span className="inline-flex items-center gap-1.5">
                <SquareParking className="h-3.5 w-3.5 text-blue-500" />
            </span>
        );
    }
    return s || '-';
};

/* ===========================================================
   MAIN COMPONENT
=========================================================== */
export default function BookingsPage() {

    /* ---------- Table State ---------- */
    const [rows, setRows] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const [search, setSearch] = useState('');



    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [total, setTotal] = useState(0);

    /* ---------- Filters ---------- */
    const [status, setStatus] = useState('');
    const [airport, setAirport] = useState('');
    const [source, setSource] = useState('');
    const [service_type, setService] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const [airportList, setAirportList] = useState<{ airport_id: number; airport_name: string }[]>([]);

    const [selectedDate, setSelectedDate] = useState("");
    const [departDate, setDepartDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");

    const [editTab, setEditTab] = useState("booking");

    const [pattern, setPattern] = useState("booked");

    const [dropoffFrom, setDropoffFrom] = useState("");
    const [dropoffTo, setDropoffTo] = useState("");
    const [returnFrom, setReturnFrom] = useState("");
    const [returnTo, setReturnTo] = useState("");



    /* ---------- Inline Editing ---------- */
    const [openRowId, setOpenRowId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    type EditForm = {
        first_name: string,
        last_name: string,
        contact_no: string;
        customer_email: string;
        vehicle_reg_no: string;
        airport: string;
        status: string;
        dropoff_datetime: string;
        return_datetime: string;
        notes: string;
        make_model: string,
        model: string;
        color: string;
        no_of_days: number;      // number
        quote_price: number;     // number
        paid_price: number;      // number
        price: number;           // ALSO convert price to number
    };
    const [form, setForm] = useState<EditForm>({
        first_name: "",
        last_name: "",
        contact_no: '',
        customer_email: '',
        vehicle_reg_no: '',
        airport: '',
        status: 'Active',
        dropoff_datetime: '',
        return_datetime: '',
        notes: '',
        make_model: '',
        model: '',
        color: '',
        no_of_days: 0,
        quote_price: 0,
        paid_price: 0,
        price: 0,

    });

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);


    const filteredRows = useMemo(() => {
        return rows.filter(b => {

            const s = search.toLowerCase();

            return (
                (!search ||
                    b.ref_no.toLowerCase().includes(s) ||
                    b.customer_name.toLowerCase().includes(s) ||
                    b.contact_no?.toLowerCase().includes(s) ||
                    b.make_model.toLowerCase().includes(s) ||
                    b.model.toLowerCase().includes(s)
                ) &&

                (!status || b.status === status) &&
                (!airport || b.airport === airport) &&
                (!source || b.source === source) &&
                (!service_type || b.service_type === service_type) &&

                (!selectedDate || b.booked_on.startsWith(selectedDate)) &&
                (!departDate || b.dropoff_datetime.startsWith(departDate)) &&
                (!returnDate || b.return_datetime.startsWith(returnDate)) &&

                // BOOKING RANGE
                (!rangeFrom || new Date(b.booked_on) >= new Date(rangeFrom)) &&
                (!rangeTo || new Date(b.booked_on) <= new Date(rangeTo)) &&

                // DROPOFF RANGE
                (!dropoffFrom || new Date(b.dropoff_datetime) >= new Date(dropoffFrom)) &&
                (!dropoffTo || new Date(b.dropoff_datetime) <= new Date(dropoffTo)) &&

                // RETURN RANGE
                (!returnFrom || new Date(b.return_datetime) >= new Date(returnFrom)) &&
                (!returnTo || new Date(b.return_datetime) <= new Date(returnTo))
            );
        });
    }, [
        rows,
        search,
        status,
        airport,
        source,
        service_type,
        selectedDate,
        departDate,
        returnDate,
        rangeFrom,
        rangeTo,
        dropoffFrom,
        dropoffTo,
        returnFrom,
        returnTo
    ]);

    useEffect(() => {
        fetch(backendProxyPath("/api/airports"))
            .then((res) => res.json())
            .then((json) => {
                const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
                setAirportList(list);
            })
            .catch((err) => console.error("Error fetching airports:", err));
    }, []);

    useEffect(() => {
        fetchData();
    }, [
        page,
        status,
        airport,
        source,
        service_type,
        selectedDate,
        departDate,
        returnDate,
        rangeFrom,
        rangeTo,
        search
    ]);

    const fetchData = async () => {
        setLoading(true);
        setErrMsg('');

        try {
            const authToken =
                (typeof window !== 'undefined' &&
                    (localStorage.getItem('authToken') || getCookie('token'))) ||
                '';

            const qs = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortBy: 'booked_on',
                sortOrder: 'desc',
            });

            const res = await fetch(
                backendProxyPath(`/api/bookings/supplierData?${qs.toString()}`),
                {
                    cache: 'no-store',
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                }
            );

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            const data: Booking[] = json.data || [];

            setRows(data);
            setTotal(json.total);
        } catch (e) {
            console.error(e);
            setErrMsg('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    function downloadCSV() {
        const headers = Object.keys(rows[0] || {}).join(",");

        const csv = filteredRows.map(b =>
            Object.values(b)
                .map(v => `"${String(v).replace(/"/g, '""')}"`)
                .join(",")
        );

        const blob = new Blob([headers + "\n" + csv.join("\n")], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.setAttribute("download", "bookings.csv");
        a.click();
    }


    /* ===========================================================
       EDIT HANDLERS
    =========================================================== */
    const openEdit = (b: Booking) => {
        if (openRowId === b.id) {
            setOpenRowId(null);
            setSaveMsg('');
            return;
        }
        setOpenRowId(b.id);
        setSaveMsg('');
        setForm({
            first_name: b.customer_name?.split(" ")[0] || "",
            last_name: b.customer_name?.split(" ").slice(1).join(" ") || "",
            contact_no: b.contact_no || '',
            customer_email: b.customer_email || '',
            vehicle_reg_no: b.vehicle_reg_no || '',
            airport: b.airport || '',
            status: b.status || 'Active',
            dropoff_datetime: toLocalInputValue(b.dropoff_datetime),
            return_datetime: toLocalInputValue(b.return_datetime),
            notes: b.notes || '',
            make_model: b.make_model || '',
            model: b.model || '',
            color: b.color || '',
            no_of_days: Number(b.no_of_days || 0),
            quote_price: Number(b.quote_price || 0),
            paid_price: Number(b.paid_price || 0),
            price: Number(b.price || 0)
        });
    };

    const cancelEdit = () => {
        setOpenRowId(null);
        setSaveMsg('');
    };

    const saveEdit = async (id: number): Promise<void> => {
        setSaving(true);
        setSaveMsg("Saving...");

        try {
            const token =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || safeGetCookie("token"))) || "";

            const payload = {
                customer_name: `${form.first_name} ${form.last_name}`.trim(),
                contact_no: form.contact_no,
                customer_email: form.customer_email,
                vehicle_reg_no: form.vehicle_reg_no,
                airport: form.airport,
                status: form.status,
                dropoff_datetime: toSqlDateTime(form.dropoff_datetime),
                return_datetime: toSqlDateTime(form.return_datetime),
                notes: form.notes,
                make_model: form.make_model,
                color: form.color,
                model: form.model,
                no_of_days: Number(form.no_of_days),
                quote_price: Number(form.quote_price),
                paid_price: Number(form.paid_price),
                price: Number(form.price)
            };

            const res = await fetch(
                backendProxyPath(`/api/supplier/update/${id}`),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "Update failed");
            }

            await res.json();
            setSaveMsg("Saved ✓");

            await fetchData();

            setTimeout(() => {
                setSaveMsg("");
                setOpenRowId(null);
            }, 1000);

        } catch (err) {
            setSaveMsg("Save error");
        }

        setSaving(false);
    };

    const deleteRow = async (b: Booking) => {
        if (!confirm(`Delete supplier booking ${b.ref_no}? This cannot be undone.`)) return;

        try {
            // Auth token (localStorage or cookie)
            const token =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || safeGetCookie("token"))) ||
                "";

            // Send DELETE request
            const res = await fetch(backendProxyPath(`/api/delete/supplier/${b.id}`), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            // API error handling
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || `Delete failed (status ${res.status})`);
            }

            // Close open edit row if same row
            if (openRowId === b.id) cancelEdit();

            // Refresh data table
            await fetchData();

            alert("Supplier booking deleted successfully.");
        } catch (err: any) {
            alert(err?.message || "Delete failed");
        }
    };

    function calculateDays(drop: string, ret: string): number {
        if (!drop || !ret) return 0;

        const d1 = new Date(drop);
        const d2 = new Date(ret);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;

        // difference in ms
        const diff = d2.getTime() - d1.getTime();

        if (diff < 0) return 0;

        // convert → days + include both dates
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    /* ===========================================================
       RENDER
    =========================================================== */
    return (
        <ProtectedRoute>
            <div className="w-full min-h-screen px-4 py-8 space-y-6">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
                            Supplier Operations
                        </h6>
                        <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
                            Booking Data
                        </h1>
                        <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
                            Comprehensive log of all supplier-originated bookings. Manage status updates, pricing adjustments, and customer details.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={downloadCSV}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Download size={18} strokeWidth={2.5} />
                            <span>Export CSV</span>
                        </Button>
                    </div>
                </div>

                {/* FILTER PANEL */}
                <div className="glass border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* SEARCH */}
                        <div className="flex-1 min-w-[280px] relative group">
                            <Input
                                type="text"
                                placeholder="Search Reference, Customer, or Phone..."
                                className="h-11 bg-background/50 border-border/50 pl-11 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50 hover:border-primary/30 shadow-inner"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <Telescope className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex flex-col gap-1.5">
                                <select
                                    className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] hover:border-primary/30 shadow-sm"
                                    value={airport}
                                    onChange={(e) => {
                                        setAirport(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="">All Airports</option>
                                    {airportList.map((a) => (
                                        <option key={a.airport_id} value={a.airport_name}>
                                            {a.airport_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <select
                                    className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] hover:border-primary/30 shadow-sm"
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                >
                                    <option value="">All Bookings</option>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <select
                                    className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] hover:border-primary/30 shadow-sm"
                                    value={pattern}
                                    onChange={(e) => {
                                        setPattern(e.target.value);
                                        setRangeFrom(""); setRangeTo(""); setDropoffFrom(""); setDropoffTo(""); setReturnFrom(""); setReturnTo("");
                                        setPage(1);
                                    }}
                                >
                                    <option value="booked">Booked On</option>
                                    <option value="depart">Departure</option>
                                    <option value="return">Return</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[160px] hover:border-primary/30 shadow-sm"
                                        value={pattern === "booked" ? rangeFrom : pattern === "depart" ? dropoffFrom : returnFrom}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (pattern === "booked") setRangeFrom(v);
                                            else if (pattern === "depart") setDropoffFrom(v);
                                            else setReturnFrom(v);
                                            setPage(1);
                                        }}
                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                    />
                                </div>
                                <span className="text-muted-foreground font-black text-[10px] uppercase opacity-30 px-1">to</span>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[160px] hover:border-primary/30 shadow-sm"
                                        value={pattern === "booked" ? rangeTo : pattern === "depart" ? dropoffTo : returnTo}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (pattern === "booked") setRangeTo(v);
                                            else if (pattern === "depart") setDropoffTo(v);
                                            else setReturnTo(v);
                                            setPage(1);
                                        }}
                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50">
                                    <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                                    <TableHead className="w-[100px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Actions</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Customer</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Supplier</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Reg No</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 underline decoration-primary/30 underline-offset-4">Drop-off</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 underline decoration-primary/30 underline-offset-4">Return</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Amount</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                                <p className="text-sm font-bold text-muted-foreground animate-pulse">Fetching supplier data...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                                                <Telescope size={48} className="text-muted-foreground mb-2" />
                                                <p className="text-lg font-black tracking-tight text-foreground">No records discovered</p>
                                                <p className="text-xs font-medium text-muted-foreground">Adjust your filters to broaden the search</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && filteredRows.map((b, i) => {
                                    const sl = (page - 1) * limit + (i + 1);
                                    const editorOpen = openRowId === b.id;

                                    return (
                                        <Fragment key={b.id}>
                                            <TableRow className="hover:bg-muted/50 transition-colors border-b border-border/50">
                                                <TableCell className="text-center py-4 font-bold text-muted-foreground/50">{sl}</TableCell>
                                                <TableCell className="text-center py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className={cn(
                                                                        "h-8 w-8 rounded-lg transition-all active:scale-95",
                                                                        editorOpen ? "bg-primary text-white" : "hover:bg-primary/10 hover:text-primary"
                                                                    )}
                                                                >
                                                                    <MoreVertical size={14} strokeWidth={2.5} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" sideOffset={6} className="min-w-[170px] border bg-white shadow-lg p-1">
                                                                <DropdownMenuItem
                                                                    onSelect={() => openEdit(b)}
                                                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                                                                >
                                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                                    Edit Booking
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onSelect={() => deleteRow(b)}
                                                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete Booking
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col text-center">
                                                        <span className="font-black text-primary tracking-tight">{b.ref_no}</span>
                                                        <span className="font-bold uppercase text-[10px] tracking-wide text-muted-foreground">{b.customer_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-4 font-black text-[10px] uppercase opacity-40">{b.supplier_name}</TableCell>
                                                <TableCell className="text-center py-4 font-black text-[10px] uppercase">{b.vehicle_reg_no || '-'}</TableCell>
                                                <TableCell className="text-center py-4 font-bold text-primary/80 whitespace-nowrap">{fmtDT(b.dropoff_datetime)}</TableCell>
                                                <TableCell className="text-center py-4 font-bold text-primary/80 whitespace-nowrap">{fmtDT(b.return_datetime)}</TableCell>
                                                <TableCell className="text-center py-4 font-black text-xs text-foreground bg-primary/5">{money(b.price)}</TableCell>
                                                <TableCell className="text-center py-4">
                                                    <span className={cn(
                                                        "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                                        b.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                                                        b.status === 'Completed' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                                                        'bg-muted text-muted-foreground border border-border/50'
                                                    )}>
                                                        {b.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>

                                            {/* MODERNIZED INLINE EDITOR */}
                                            {editorOpen && (
                                                <TableRow className="bg-muted/30 border-b border-border/50">
                                                    <TableCell colSpan={9} className="p-8">
                                                        <div className="glass border-border/50 rounded-2xl p-8 shadow-inner animate-in slide-in-from-top-2 duration-300">
                                                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                                                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                                                    <FileEdit size={16} /> Edit Booking Details
                                                                </h4>
                                                                <Button variant="ghost" size="icon" onClick={cancelEdit} className="rounded-full hover:bg-red-500/10 hover:text-red-500">
                                                                    <X size={18} />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                                {/* Column 1: Identity */}
                                                                <div className="space-y-4">
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Identity</h5>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">First Name</label>
                                                                        <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Name</label>
                                                                        <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                                                                    </div>
                                                                </div>

                                                                {/* Column 2: Logistics */}
                                                                <div className="space-y-4">
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Logistics</h5>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drop-off</label>
                                                                        <Input type="datetime-local" className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.dropoff_datetime} onChange={e => setForm({...form, dropoff_datetime: e.target.value})} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Return</label>
                                                                        <Input type="datetime-local" className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.return_datetime} onChange={e => setForm({...form, return_datetime: e.target.value})} />
                                                                    </div>
                                                                </div>

                                                                {/* Column 3: Vehicle */}
                                                                <div className="space-y-4">
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Vehicle</h5>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reg No</label>
                                                                        <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm uppercase" value={form.vehicle_reg_no} onChange={e => setForm({...form, vehicle_reg_no: e.target.value})} />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Make</label>
                                                                            <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.make_model} onChange={e => setForm({...form, make_model: e.target.value})} />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Color</label>
                                                                            <Input className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Column 4: Pricing */}
                                                                <div className="space-y-4">
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Finance</h5>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quote</label>
                                                                            <Input type="number" className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.quote_price} onChange={e => setForm({...form, quote_price: Number(e.target.value)})} />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Paid</label>
                                                                            <Input type="number" className="h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm" value={form.paid_price} onChange={e => setForm({...form, paid_price: Number(e.target.value)})} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-primary">Final Price</label>
                                                                        <Input type="number" className="h-10 bg-primary/5 border-primary/20 rounded-xl font-black text-sm text-primary" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                                                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                                                    {saveMsg && <span className="animate-pulse flex items-center gap-1.5"><Clock size={12} /> {saveMsg}</span>}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Button variant="outline" className="rounded-xl font-bold px-6" onClick={cancelEdit} disabled={saving}>Cancel</Button>
                                                                    <Button className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20" onClick={() => saveEdit(b.id)} disabled={saving}>
                                                                        {saving ? "Processing..." : "Save Changes"}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* PAGINATION SECTION */}
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <p className="text-xs font-bold text-muted-foreground">
                        Showing <span className="text-foreground">{filteredRows.length}</span> of <span className="text-foreground">{total}</span> records discovered
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-10 px-4 rounded-xl font-bold transition-all",
                                page <= 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary active:scale-95"
                            )}
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <div className="flex items-center px-4 h-10 rounded-xl bg-muted/50 border border-border/50">
                            <span className="text-xs font-black">Page {page} of {totalPages}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-10 px-4 rounded-xl font-bold transition-all",
                                page >= totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary active:scale-95"
                            )}
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
