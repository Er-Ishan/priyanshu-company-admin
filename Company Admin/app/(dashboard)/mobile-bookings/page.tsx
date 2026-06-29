'use client';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
    FileEdit, Clock, Eye, Telescope, CircleX, 
    StickyNote, Pencil, Trash2, X, Handshake, SquareParking, 
    Download, Search, Send, NotebookPen, Lightbulb, MoreVertical
} from 'lucide-react';
import BookingDetailsPopup from "@/components/BookingDetailsPopup";


import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from '@/components/ProtectedRoute';
import CancelPopup from '@/components/CancelPopup';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { backendProxyPath } from "@/app/lib/backendProxy";



/* ---------- ENUM options from SQL ---------- */
const SOURCES = ['Supplier', 'Website'] as const;
// const AIRPORTS = ['Heathrow', 'Gatwick'] as const;
const SERVICES = ['Meet & Greet', 'Park & Ride'] as const;
const STATUSES = ['Active', 'No Show', 'Confirmed', 'Extended'] as const;

/* ---------- Types ---------- */
type Booking = {
    id: number;
    ref_no: string;
    source: string;
    airport: string;
    service: string;
    customer_name: string;
    first_name: string;
    last_name: string;
    mobile: string;
    email: string;
    contact_no: string | null;
    vehicle_registration: string | null;
    travelling_from: string | null;
    vehicle_make: string | null;
    depart_flight: string | null;
    depart_terminal: string | null;
    return_flight: string | null;
    return_terminal: string | null;
    vehicle_model: string | null;
    vehicle_colour: string | null;
    drop_off_date: string;
    return_date: string;
    customer_email: string | null;
    booked_on: string;
    booked_at?: string;
    dropoff_datetime: string;
    return_datetime: string;
    vehicle_reg_no: string | null;
    total_payable: number;
    extra_charge: number;
    discount: number;
    quote_amount: number;
    booking_fee: number;
    cancellation_cover: number;
    optional: number;
    transaction_id: string;
    status: string;
    notes: string | null;
    airport_alias: string | null;
    make_model: string;
    model: string;
    color: string;
    product_name: string;
    supplier_name: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrettyDateFromAny(input?: string) {
    if (!input) return "";

    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "";

    return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}
const isoToDDMMYYYY = (iso: string): string => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

const ddmmyyyyToISO = (v: string): string => {
    if (!v) return "";
    const [d, m, y] = v.split("/");
    if (!d || !m || !y) return "";
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

const calculateOptional = (
    extend: number,
    admin: number,
    diff: number
) => {
    const e = Number(extend) || 0;
    const a = Number(admin) || 0;
    const d = Number(diff) || 0;

    return e + a - d;
};


function formatPrettyDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}

const actionIconClass =
    "flex items-center justify-center w-6 h-6 cursor-pointer";


const handleExtend = (row: any) => {
    console.log("Extend booking:", row);
    // later: open extend modal or logic
};

const splitDateTime = (value?: string) => {
    if (!value) return { date: "", time: "" };
    const d = new Date(value);
    if (isNaN(d.getTime())) return { date: "", time: "" };

    const pad = (n: number) => String(n).padStart(2, "0");

    return {
        date: `${pad(d.getDate())} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
};

const n0 = (v: any) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
};


const mergeDateTime = (originalISO: string, time: string) => {
    const d = new Date(originalISO);
    const [hh, mm] = time.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    return d.toISOString().slice(0, 19).replace("T", " ");
};


// // const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------- Helpers ---------- */
function getCookie(name: string) {
    const m = typeof document !== 'undefined'
        ? document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        : null;
    return m ? m.pop() : '';
}

function fmtDT(v?: string) {
    if (!v) return '';

    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;

    return d
        .toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        .replace(',', '');
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
    if (s === 'confirmed') return 'bg-emerald-100';
    if (s === 'active') return 'bg-emerald-100';
    if (s === 'cancelled') return 'bg-red-100';
    if (s === 'completed') return 'bg-blue-100';
    if (s === 'pending') return 'bg-yellow-100';
    if (s === 'extended') return 'bg-orange-100';
    if (s === 'refunded') return 'bg-pink-100';
    if (s === 'no show') return 'bg-gray-100';
    return 'bg-neutral-100';
}


// Format visible date like "10 Nov 2025"
function formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}



// Format value for <input type="date"> (yyyy-mm-dd)
function formatInputDate(date: Date): string {
    return date.toISOString().split("T")[0];
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

    const searchParams = useSearchParams();
    const extendSessionId = searchParams.get("extend_session_id");

    const [pendingExtendSession, setPendingExtendSession] = useState<string | null>(null);
    const [confirmingExtend, setConfirmingExtend] = useState(false);


    /* ---------- Table State ---------- */
    const [rows, setRows] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedMyBooking, setSelectedMyBooking] = useState<any>(null);

    const [extendConfirmOpen, setExtendConfirmOpen] = useState(false);
    const [extendBookingId, setExtendBookingId] = useState<number | null>(null);
    const [extendPiId, setExtendPiId] = useState("");
    const [extendConfirmLoading, setExtendConfirmLoading] = useState(false);


    const [extendCharge, setExtendCharge] = useState(0);
    const [discountValue, setDiscountValue] = useState(0);

    const [search, setSearch] = useState('');

    const todayDate = formatInputDate(new Date());

    const [selectDate, setSelectDate] = useState(todayDate);

    const [notesOpen, setNotesOpen] = useState(false);
    const [notesBooking, setNotesBooking] = useState<any>(null);
    const [notesText, setNotesText] = useState("");
    const [notesSaving, setNotesSaving] = useState(false);


    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [total, setTotal] = useState(0);

    const [editMode, setEditMode] = useState<"amend" | "extend" | null>(null);


    /* ---------- Filters ---------- */
    const [status, setStatus] = useState('');
    const [airport, setAirport] = useState('');
    const [source, setSource] = useState('');
    const [service, setServiceType] = useState('');

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const [airportList, setAirportList] = useState<{ airport_id: number; airport_name: string }[]>([]);

    const [emailStatus, setEmailStatus] = useState<Record<number, number>>({});


    const [selectedDate, setSelectedDate] = useState("");
    const [departDate, setDepartDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    // const [rangeFrom, setRangeFrom] = useState("");
    // const [rangeTo, setRangeTo] = useState("");
    const [pattern, setPattern] = useState("booked");

    // 🔹 Extend preview state
    const [extendPreview, setExtendPreview] = useState<any>(null);
    const [extendLoading, setExtendLoading] = useState(false);

    const dropoffRef = useRef<HTMLInputElement | null>(null);
    const returnRef = useRef<HTMLInputElement | null>(null);



    // Display only (default today)


    // Applied filters (EMPTY initially)
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");



    const todaydate = new Date().toISOString().split("T")[0];

    const [dropoffFrom, setDropoffFrom] = useState("");
    const [dropoffTo, setDropoffTo] = useState("");

    const [returnFrom, setReturnFrom] = useState("");
    const [returnTo, setReturnTo] = useState("");

    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");


    const [activeTab, setActiveTab] = useState("customer");


    const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    const [alreadyDrawer, setAlreadyDrawer] = useState(false);
    const [drawerBooking, setDrawerBooking] = useState<any>(null);

    // const [openedId, setOpenedId] = useState<null>(null);
    const [extendError, setExtendError] = useState("");

    const [searchLimit, setSearchLimit] = useState(limit);

    // DEPART
    const [departFromText, setDepartFromText] = useState("");
    const [departToText, setDepartToText] = useState("");
    const departFromRef = useRef<HTMLInputElement | null>(null);
    const departToRef = useRef<HTMLInputElement | null>(null);

    // RETURN
    const [returnFromText, setReturnFromText] = useState("");
    const [returnToText, setReturnToText] = useState("");
    const returnFromRef = useRef<HTMLInputElement | null>(null);
    const returnToRef = useRef<HTMLInputElement | null>(null);


    const openNotesPopup = (booking: any) => {
        setNotesBooking(booking);
        setNotesText(booking.notes || "");
        setNotesOpen(true);
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

    useEffect(() => {
        if (extendSessionId) {
            setPendingExtendSession(extendSessionId);
        }
    }, [extendSessionId]);

    const openExtendConfirmPopup = (bookingId: number) => {
        setExtendBookingId(bookingId);
        setExtendPiId("");
        setExtendConfirmOpen(true);
    };



    useEffect(() => {
        if (!extendPreview) return;

        setExtendCharge(Number(extendPreview.extend_charge || 0));
        setDiscountValue(Number(extendPreview.discount || 0));
    }, [extendPreview]);

    // const calculateFinalPayable = () => {
    //     if (!extendPreview) return 0;

    //     const oldQuote = n0(extendPreview.old_quote);
    //     const newQuote = n0(extendPreview.new_quote);
    //     const extend = n0(extendPreview.extend_charge); // ✅ FIX
    //     const discount = n0(extendPreview.discount);

    //     const base = 0;
    //     return (
    //         base +
    //         n0(newQuote) +
    //         n0(extend) -
    //         n0(oldQuote) -
    //         n0(discount)
    //     );

    // };


    const calculateFinalPayable = () => {
        if (!extendPreview) return 0;
        return Number(extendPreview.new_total_payable || 0);
    };



    // const calculateExtendPrice = async (
    //     bookingId: number,
    //     newDropSql: string,
    //     newReturnSql: string
    // ) => {
    //     const res = await fetch(
    //         backendProxyPath("/api/bookings/extend/preview/${bookingId}"),
    //         {
    //             method: "POST",
    //             credentials: "include",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 new_drop_off_date: newDropSql,
    //                 new_return_date: newReturnSql,
    //             }),
    //         }
    //     );

    //     const data = await res.json();
    //     setExtendPreview(data);

    //     setForm(f => ({
    //         ...f,
    //         total_payable: Number(data.new_total_payable || 0),
    //     }));
    // };


    const calculateExtendPrice = async (
        bookingId: number,
        newDropSql: string,
        newReturnSql: string,
        extraCharge?: number
    ) => {
        try {
            setExtendLoading(true);
            setExtendError("");

            const res = await fetch(
                backendProxyPath(`/api/bookings/extend/preview/${bookingId}`),
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        new_drop_off_date: newDropSql,
                        new_return_date: newReturnSql,
                        extra_charge: extraCharge ?? form.extra_charge ?? 0
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Preview failed");
            }

            setExtendPreview(data);

            // 🔥 VERY IMPORTANT
            setForm(f => ({
                ...f,
                total_payable: Number(data.new_total_payable || 0),
            }));

        } catch (err: any) {
            setExtendError(err.message || "Calculation failed");
            setExtendPreview(null);
        } finally {
            setExtendLoading(false);
        }
    };

    const openDetailsPopup = (booking: any) => {
        setSelectedMyBooking({
            ...booking,
            extend_payment: booking.extend_payment || null,
            // make sure backend sends this if extended
        });
        setDetailsOpen(true);
    };


    const confirmExtendManual = async () => {
        if (!extendBookingId) return;

        if (!extendPiId.trim()) {
            alert("Please enter Stripe Payment Intent ID");
            return;
        }

        const dropSql = toSqlDateTimeSafe(form.drop_off_date);
        const returnSql = toSqlDateTimeSafe(form.return_date);

        if (!dropSql || !returnSql) {
            alert("Invalid dates");
            return;
        }

        try {
            setExtendConfirmLoading(true);

            const res = await fetch(
                backendProxyPath(`/api/bookings/extend/${extendBookingId}`),
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        new_drop_off_date: dropSql,
                        new_return_date: returnSql,
                        extended_transaction_id: extendPiId.trim(),
                        extra_charge: extendPreview?.extra_charge || 0,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Extension failed");
            }

            alert("Booking extended successfully");

            setExtendConfirmOpen(false);
            setExtendBookingId(null);
            setExtendPiId("");
            setExtendPreview(null);
            setEditMode(null);
            setOpenRowId(null);

            fetchData();

        } catch (err: any) {
            alert(err.message || "Extension failed");
        } finally {
            setExtendConfirmLoading(false);
        }
    };



    function toSqlDateTimeSafe(local: string): string | null {
        if (!local) return null;
        return local.replace("T", " ") + ":00";
    }


    const sendBookingsCSVByEmail = async () => {
        try {
            const res = await fetch(
                backendProxyPath(`/api/bookings/email-csv`),
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed");

            alert(data.message || "Email sent successfully");

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to send email");
        }
    };

    const sendBookingToUser = async (bookingId: number) => {
        try {
            const res = await fetch(
                backendProxyPath(`/api/bookings/send-booking-email/${bookingId}`),
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert("Booking email sent successfully");
            fetchEmailStatus(bookingId);

        } catch (err: any) {
            alert(err.message || "Failed to send email");
        }
    };



    const saveNotes = async () => {
        if (!notesBooking) return;

        const cleanNotes =
            notesText && notesText.trim() !== "" ? notesText.trim() : null;

        try {
            setNotesSaving(true);

            const authToken =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || getCookie("token"))) ||
                "";

            const res = await fetch(
                backendProxyPath(`/api/bookings/update-notes/${notesBooking.id}`), // ✅ FIXED
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({
                        notes: cleanNotes, // ✅ ONLY NOTES
                    }),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            // ✅ CLOSE & REFRESH
            setNotesOpen(false);
            setNotesBooking(null);
            setNotesText("");
            fetchData();

        } catch (e: any) {
            alert(e.message);
        } finally {
            setNotesSaving(false);
        }
    };

    const fetchEmailStatus = async (bookingId: number) => {
        try {
            const res = await fetch(
                backendProxyPath(`/api/bookings/email-status/${bookingId}`),
                { credentials: "include" }
            );

            if (!res.ok) return;

            const json = await res.json();

            if (json.success) {
                setEmailStatus(prev => ({
                    ...prev,
                    [bookingId]: json.email_sent
                }));
            }
        } catch (err) {
            console.error("Email status error:", err);
        }
    };


    const openCancelPopup = (booking: any) => {

        if (booking.status === "Cancelled") {
            alert(`Booking ${booking.ref_no} is already cancelled.`);
            return;
        }

        setSelectedBooking(booking);
        setCancelPopupOpen(true);
    };

    const downloadCSV = () => {
        if (!rows.length) {
            alert("No data to download");
            return;
        }

        const headers = [
            "Ref No",
            "Source",
            "Customer Name",
            "Phone",
            "Product",
            "Make/Model",
            "Color",
            "Booked On",
            "Dropoff",
            "Return",
            "Reg",
            "Amount",
            "Status",
        ];

        const csvRows = rows.map(b =>
            [
                b.ref_no,
                b.source,
                b.customer_name,
                b.contact_no,
                b.product_name,
                b.supplier_name,
                `${b.make_model}/${b.model}`,
                b.color,
                fmtDT(b.booked_on),
                fmtDT(b.dropoff_datetime),
                fmtDT(b.return_datetime),
                b.vehicle_reg_no,
                b.total_payable,
                b.status,
            ]
                .map(v => `"${v ?? ""}"`) // wrap in quotes
                .join(",")
        );

        const csvString = [headers.join(","), ...csvRows].join("\n");

        const blob = new Blob([csvString], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "bookings.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };



    const handleCancelAction = async (payload: any) => {
        try {
            const res = await fetch(backendProxyPath(`/api/bookings/cancel/${selectedBooking.id}`), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(await res.text());

            alert("Action completed successfully!");

            setCancelPopupOpen(false);
            fetchData();

        } catch (err: any) {
            alert(err.message);
        }
    };



    /* ---------- Inline Editing ---------- */
    const [openRowId, setOpenRowId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        mobile: '',
        email: '',
        vehicle_registration: '',
        travelling_from: '',
        service: 'Park & Ride',
        status: 'Active',
        total_payable: 0,
        drop_off_date: '',
        return_date: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_colour: '',
        product_name: '',
        supplier_name: '',
        depart_flight: '',
        extra_charge: 0,
        depart_terminal: '',
        return_flight: '',
        return_terminal: '',
    });

    const totalPages = useMemo(() => {
        if (search.trim()) return 1; // 🔒 disable pagination during search
        return Math.max(1, Math.ceil(total / limit));
    }, [total, limit, search]);


    /* ===========================================================
       FETCH DATA
    =========================================================== */
    const fetchData = async () => {
        setLoading(true);
        setErrMsg("");

        try {
            const qs = new URLSearchParams({
                page: String(page),
                limit: String(searchLimit),
            });

            if (status) qs.append("status", status);
            if (source) qs.append("source", source);
            if (airport) qs.append("airport", airport);
            if (service) qs.append("service", service);

            // if (selectedDate) qs.append("booking_date", selectedDate);
            // if (departDate) qs.append("depart_date", departDate);
            // if (returnDate) qs.append("return_date", returnDate);

            // ================= DATE FILTERS =================

            // BOOKED DATE
            if (pattern === "booked") {
                if (rangeFrom) qs.append("range_from", rangeFrom);
                if (rangeTo) qs.append("range_to", rangeTo);
            }

            // 👇 IMPORTANT: ALL = no date filters
            if (pattern === "all") {
                // do nothing
            }


            // DEPART DATE
            if (pattern === "depart") {
                if (dropoffFrom) qs.append("dropoff_from", dropoffFrom);
                if (dropoffTo) qs.append("dropoff_to", dropoffTo);
            }

            // RETURN DATE
            if (pattern === "return") {
                if (returnFrom) qs.append("return_from", returnFrom);
                if (returnTo) qs.append("return_to", returnTo);
            }


            if (search) qs.append("search", search);



            const res = await fetch(
                backendProxyPath(`/api/mobile-bookings?${qs}`),
                {
                    credentials: "include", // 🔐 REQUIRED
                }
            );

            // 🔐 Handle expired session nicely
            if (res.status === 401) {
                window.location.href = "/auth/login";
                return;
            }

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            const apiRows = json.data || [];

            const mapped = apiRows.map((b: any) => ({
                id: b.id,
                ref_no: b.ref_no ? String(b.ref_no) : "-",  // ✅ FIX

                source: b.source || "",

                first_name: b.first_name || "",
                last_name: b.last_name || "",
                mobile: b.mobile || "",
                email: b.email || "",
                vehicle_registration: b.vehicle_registration || "",
                travelling_from: b.travelling_from || "",
                service: b.service || "Park & Ride",
                drop_off_date: b.drop_off_date || "",
                return_date: b.return_date || "",
                vehicle_make: b.vehicle_make || "",
                vehicle_model: b.vehicle_model || "",
                vehicle_colour: b.vehicle_colour || "",
                product_name: b.product_name || "",
                supplier_name: b.supplier_name || "",
                notes: b.notes || null,
                depart_flight: b.depart_flight || "",
                depart_terminal: b.depart_terminal || "",
                return_flight: b.return_flight || "",
                return_terminal: b.return_terminal || "",
                transaction_id: b.transaction_id || null, // ✅ ADD THIS
                extend_charge: b.extend_charge || null, // ✅ ADD THIS
                extended_transaction_id: b.extended_transaction_id || null,



                customer_name: `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim(),
                contact_no: b.mobile,
                customer_email: b.email,
                booked_on: b.created_at || b.booked_on,

                dropoff_datetime: b.drop_off_date,
                return_datetime: b.return_date,
                vehicle_reg_no: b.vehicle_registration,
                total_payable: parseFloat(b.total_payable ?? 0),
                quote_amount: parseFloat(b.quote_amount ?? 0),
                booking_fee: parseFloat(b.booking_fee ?? 0),
                cancellation_cover: parseFloat(b.cancellation_cover ?? 0),
                optional: parseFloat(b.optional ?? 0),
                extra_charge: parseFloat(b.extra_charge ?? 0),
                discount: parseFloat(b.discount ?? 0),
                status: b.status,
                make_model: b.vehicle_make,
                model: b.vehicle_model,
                color: b.vehicle_colour,
                service_type: b.service || "Park & Ride",
            }));

            setRows(mapped);
            setTotal(json.total || mapped.length);

            mapped.forEach((b: any) => {
                fetchEmailStatus(b.id);
            });

        } catch (e) {
            console.error(e);
            setErrMsg("Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, [
        page,
        status,
        airport,
        source,
        service,
        search,

        pattern,

        rangeFrom,
        rangeTo,

        dropoffFrom,
        dropoffTo,

        returnFrom,
        returnTo
    ]);




    /* ===========================================================
       EDIT HANDLERS
    =========================================================== */
    const openEdit = (b: Booking, mode: "amend" | "extend") => {
        if (openRowId === b.id) {
            setOpenRowId(null);
            return;
        }
        setOpenRowId(b.id);
        setEditMode(mode);
        setForm({
            first_name: b.first_name,
            last_name: b.last_name,
            mobile: b.mobile || '',
            email: b.email || '',
            vehicle_registration: b.vehicle_registration || '',
            travelling_from: b.travelling_from || '',
            service: b.service || '',
            status: b.status,
            total_payable: Number(b.total_payable || 0),
            extra_charge: Number(b.extra_charge || 0),
            drop_off_date: toLocalInputValue(b.drop_off_date),
            return_date: toLocalInputValue(b.return_date),
            vehicle_make: b.vehicle_make || '',
            vehicle_model: b.vehicle_model || '',
            product_name: b.product_name || '',
            supplier_name: b.supplier_name || '',
            vehicle_colour: b.vehicle_colour || '',
            depart_flight: b.depart_flight || '',
            depart_terminal: b.depart_terminal || '',
            return_flight: b.return_flight || '',
            return_terminal: b.return_terminal || ''
        });
    };

    const saveEdit = async (id: number) => {
        setSaving(true);
        setSaveMsg("Saving...");

        try {
            const authToken =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || getCookie("token"))) ||
                "";

            const payload: any = {};

            // 🔹 Direct first_name
            payload.first_name = form.first_name || null;
            payload.last_name = form.last_name || null;
            payload.mobile = form.mobile || null;
            payload.email = form.email || null;
            payload.vehicle_registration = form.vehicle_registration || null;
            payload.service = form.service;
            payload.status = form.status;
            payload.total_payable = Number(form.total_payable);
            payload.vehicle_make = form.vehicle_make;
            payload.vehicle_model = form.vehicle_model;
            payload.vehicle_colour = form.vehicle_colour;
            payload.product_name = form.product_name;
            payload.supplier_name = form.supplier_name;
            payload.depart_flight = form.depart_flight || null;
            payload.depart_terminal = form.depart_terminal || null;
            payload.return_flight = form.return_flight || null;
            payload.return_terminal = form.return_terminal || null;


            // 🔹 Date handling
            if (form.drop_off_date) {
                payload.drop_off_date = toSqlDateTime(form.drop_off_date);
            }

            if (form.return_date) {
                payload.return_date = toSqlDateTime(form.return_date);
            }

            const res = await fetch(
                backendProxyPath(`/api/bookings/update/${id}`),
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            setSaveMsg("Saved ✓");
            await fetchData();
            setTimeout(() => setSaveMsg(""), 1000);
            setOpenRowId(null);
        } catch (e: any) {
            setSaveMsg(e.message);
        } finally {
            setSaving(false);
        }
    };


    const deleteRow = async (b: Booking) => {
        if (!confirm(`Delete booking ${b.ref_no}? This action cannot be undone.`)) return;

        try {
            const authToken =
                (typeof window !== 'undefined' &&
                    (localStorage.getItem('authToken') || getCookie('token'))) ||
                '';

            const res = await fetch(backendProxyPath(`/api/bookings/delete/${b.id}`), {
                method: 'DELETE',
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });

            if (!res.ok) throw new Error(await res.text());

            await fetchData();
            alert('Deleted successfully.');
        } catch (e: any) {
            alert(e.message);
        }
    };



    const today = new Date().toISOString().split("T")[0];
    const [rangeFromDisplay, setRangeFromDisplay] = useState(today);
    const [rangeToDisplay, setRangeToDisplay] = useState(today);

    const [dropoffFromDisplay, setDropoffFromDisplay] = useState(today);
    const [dropoffToDisplay, setDropoffToDisplay] = useState(today);

    const [returnFromDisplay, setReturnFromDisplay] = useState(today);
    const [returnToDisplay, setReturnToDisplay] = useState(today);

    const [displayFromDate, setDisplayFromDate] = useState<string>(today);
    const [displayToDate, setDisplayToDate] = useState<string>(today);


    const [displayDate, setDisplayDate] = useState(
        formatDisplayDate(today) // 👈 shown by default
    );

    const sendBooking = async (bookingId: number) => {
        try {
            const res = await fetch(
                backendProxyPath(`/api/bookings/send-booking-email/${bookingId}`),
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed");

            alert("Booking email sent successfully");

            // refresh email icon color
            fetchEmailStatus(bookingId);

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to send email");
        }
    };


    const saveExtension = async (bookingId: number) => {
        const dropSql = toSqlDateTimeSafe(form.drop_off_date);
        const returnSql = toSqlDateTimeSafe(form.return_date);

        if (!dropSql || !returnSql) {
            alert("Invalid dates");
            return;
        }

        try {
            setSaving(true);

            const res = await fetch(
                backendProxyPath(`/api/bookings/extend/${bookingId}`),
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        new_drop_off_date: dropSql,
                        new_return_date: returnSql,
                        extra_charge: form.extra_charge || 0
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to send invoice");
            }

            // ✅ DO NOT REDIRECT
            alert("Booking extended successfully ✓");

            // Optional: refresh table
            fetchData();

        } catch (err: any) {
            alert(err.message || "Extension failed");
        } finally {
            setSaving(false);
        }
    };


    const confirmExtendPayment = async (bookingId: number) => {
        if (!pendingExtendSession) return;

        try {
            setConfirmingExtend(true);

            const res = await fetch(
                backendProxyPath(`/api/bookings/extend/confirm-payment`),
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: pendingExtendSession,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Confirmation failed");
            }

            alert("Extension confirmed successfully");

            setPendingExtendSession(null);

            // remove session param from URL
            window.history.replaceState({}, "", "/admin/bookings");

            fetchData();

        } catch (err: any) {
            alert(err.message || "Confirmation failed");
        } finally {
            setConfirmingExtend(false);
        }
    };



    /* ===========================================================
       RENDER
    =========================================================== */
    return (
        <ProtectedRoute>
            <div className="w-full min-h-screen px-4 py-8 space-y-6 animate-in fade-in duration-700">

                <CancelPopup
                    open={cancelPopupOpen}
                    booking={selectedBooking}
                    onClose={() => setCancelPopupOpen(false)}
                    refresh={fetchData}
                />

                <BookingDetailsPopup
                    open={detailsOpen}
                    booking={selectedMyBooking}
                    onClose={() => setDetailsOpen(false)}
                />

                {notesOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNotesOpen(false)} />
                        <div className="glass w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10 border-primary/20">
                            <div className="p-6 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <StickyNote className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-foreground tracking-tight">Booking Notes</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{notesBooking?.ref_no}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotesOpen(false)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-all"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Internal Notes</label>
                                    <textarea
                                        className="w-full min-h-[160px] bg-background/50 border border-border/50 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none placeholder:font-normal placeholder:text-muted-foreground/30 shadow-inner"
                                        placeholder="Enter private notes about this booking..."
                                        value={notesText}
                                        onChange={(e) => setNotesText(e.target.value)}
                                    />
                                    <p className="text-[9px] text-muted-foreground/60 font-medium px-1 uppercase tracking-widest">
                                        These notes are only visible to administrators.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-muted/30 border-t border-border/50 flex items-center gap-3 justify-end">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 hover:bg-red-500/10 hover:text-red-600 transition-all"
                                    onClick={() => setNotesOpen(false)}
                                    disabled={notesSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                                    onClick={saveNotes}
                                    disabled={notesSaving}
                                >
                                    {notesSaving ? "Saving..." : "Save Notes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
                            Booking Management
                        </h6>
                        <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
                            Admin Bookings
                        </h1>
                        <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
                            Search, filter, and manage all customer bookings. Amend details, extend stays, or process cancellations.
                        </p>
                    </div>
                </div>

                {/* FILTER PANEL */}
                <div className="glass border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* SEARCH */}
                        <div className="relative flex-1 min-w-[300px] group">
                            <Input
                                placeholder="Search by name, ref, or phone..."
                                value={search}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearch(value);
                                    setPage(1);
                                    if (value.trim() !== "") setSearchLimit(10000);
                                    else setSearchLimit(limit);
                                }}
                                className="h-12 w-full pl-11 pr-4 bg-background/50 border-border/50 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 transition-all group-hover:border-primary/30"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>

                        {/* STATUS */}
                        <div className="min-w-[160px]">
                            <select
                                className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            >
                                <option value="">All Status</option>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* AIRPORT */}
                        <div className="min-w-[160px]">
                            <select
                                className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={airport}
                                onChange={(e) => { setAirport(e.target.value); setPage(1); }}
                            >
                                <option value="">All Airports</option>
                                {airportList.map((a) => (
                                    <option key={a.airport_id} value={a.airport_name}>
                                        {a.airport_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* DATE TYPE */}
                        <div className="min-w-[160px]">
                            <select
                                className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={pattern}
                                onChange={(e) => {
                                    setPattern(e.target.value);
                                    setRangeFrom(""); setRangeTo("");
                                    setDropoffFrom(""); setDropoffTo("");
                                    setReturnFrom(""); setReturnTo("");
                                    setPage(1);
                                }}
                            >
                                <option value="all">All Dates</option>
                                <option value="booked">Booked Date</option>
                                <option value="depart">Depart</option>
                                <option value="return">Return</option>
                            </select>
                        </div>

                        {/* EXPORT BUTTONS */}
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                onClick={downloadCSV}
                                variant="outline"
                                className="h-12 w-12 rounded-xl border-border/50 bg-background/50 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                title="Download CSV"
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <Button
                                onClick={sendBookingsCSVByEmail}
                                variant="outline"
                                className="h-12 w-12 rounded-xl border-border/50 bg-background/50 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                title="Email CSV"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* DATE RANGE FILTERS (CONDITIONAL) */}
                    {pattern !== "all" && (
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">From</span>
                                <div className="relative w-[180px]">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formatPrettyDate(
                                            pattern === "booked" ? (fromDate || displayFromDate) :
                                            pattern === "depart" ? (dropoffFrom || dropoffFromDisplay) :
                                            (returnFrom || returnFromDisplay)
                                        )}
                                        className="h-10 w-full px-4 text-sm font-bold bg-background/50 border border-border/50 rounded-xl cursor-pointer hover:border-primary/30 transition-all"
                                        onClick={() => (document.getElementById("dateFromNative") as HTMLInputElement)?.showPicker()}
                                    />
                                    <input
                                        id="dateFromNative"
                                        type="date"
                                        className="absolute inset-0 opacity-0"
                                        value={pattern === "booked" ? (fromDate || "") : pattern === "depart" ? (dropoffFrom || "") : (returnFrom || "")}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (pattern === "booked") { setRangeFrom(v); setFromDate(v); setDisplayFromDate(v); }
                                            else if (pattern === "depart") { setDropoffFrom(v); setDropoffFromDisplay(v); }
                                            else { setReturnFrom(v); setReturnFromDisplay(v); }
                                            setPage(1);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">To</span>
                                <div className="relative w-[180px]">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formatPrettyDate(
                                            pattern === "booked" ? (toDate || displayToDate) :
                                            pattern === "depart" ? (dropoffTo || dropoffToDisplay) :
                                            (returnTo || returnToDisplay)
                                        )}
                                        className="h-10 w-full px-4 text-sm font-bold bg-background/50 border border-border/50 rounded-xl cursor-pointer hover:border-primary/30 transition-all"
                                        onClick={() => (document.getElementById("dateToNative") as HTMLInputElement)?.showPicker()}
                                    />
                                    <input
                                        id="dateToNative"
                                        type="date"
                                        className="absolute inset-0 opacity-0"
                                        value={pattern === "booked" ? (toDate || "") : pattern === "depart" ? (dropoffTo || "") : (returnTo || "")}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (pattern === "booked") { setRangeTo(v); setToDate(v); setDisplayToDate(v); }
                                            else if (pattern === "depart") { setDropoffTo(v); setDropoffToDisplay(v); }
                                            else { setReturnTo(v); setReturnToDisplay(v); }
                                            setPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* TABLE SECTION */}
                <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50">
                                    <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Actions</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Ref No</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Customer</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Product</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 whitespace-nowrap">Travel Dates</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Quote</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Total</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Email</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Status</TableHead>
                                </TableRow>
                            </TableHeader>


                            <TableBody>

                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={15} className="text-center py-4">
                                            Loading…
                                        </TableCell>
                                    </TableRow>
                                )}

                                {errMsg && (
                                    <TableRow>
                                        <TableCell colSpan={15} className="text-center py-4 text-red-600">
                                            {errMsg}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={15} className="text-center py-4 text-muted-foreground">
                                            No bookings found.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && rows.map((b, i) => {
                                    const sl = (page - 1) * limit + (i + 1);
                                    const editorOpen = openRowId === b.id;

                                    return (
                                        <Fragment key={b.id}>
                                            <TableRow className="hover:bg-muted/50 transition-all border-b border-border/50 group">
                                                <TableCell className="text-center py-4 font-bold text-muted-foreground/50">
                                                    {String(sl).padStart(2, '0')}
                                                </TableCell>

                                                <TableCell className="text-center py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-all"
                                                            onClick={() => openDetailsPopup(b)}
                                                            title="View Details"
                                                        >
                                                            <Telescope className="w-4 h-4" />
                                                        </Button>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className={cn(
                                                                        "h-8 w-8 rounded-lg transition-all",
                                                                        b.notes?.trim() ? "text-red-500 hover:bg-red-500/10" : "text-emerald-500 hover:bg-emerald-500/10"
                                                                    )}
                                                                    onClick={() => openNotesPopup(b)}
                                                                >
                                                                    <NotebookPen className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs text-[10px] font-bold uppercase tracking-tight">
                                                                {b.notes?.trim() ? b.notes : "No Notes Available"}
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className={cn("h-8 w-8 rounded-lg transition-all", editorOpen ? "bg-primary text-white" : "text-primary hover:bg-primary/10")}
                                                                >
                                                                    {editorOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="glass border-border/50 min-w-[160px] p-1 shadow-xl">
                                                                <DropdownMenuItem onSelect={() => openEdit(b, "amend")} className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs hover:bg-primary/10 transition-colors cursor-pointer">
                                                                    <FileEdit className="w-4 h-4 text-blue-500" /> Amend Booking
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => openEdit(b, "extend")} className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs hover:bg-primary/10 transition-colors cursor-pointer">
                                                                    <Clock className="w-4 h-4 text-emerald-500" /> Extend Booking
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                                                            onClick={() => openCancelPopup(b)}
                                                            title="Cancel / Refund"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center py-4 font-black text-foreground tracking-tight">
                                                    {b.ref_no}
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold text-foreground text-xs">{b.customer_name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium">{b.mobile || b.contact_no || '-'}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold text-foreground text-xs">{b.product_name}</span>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            {(() => {
                                                                const s = (b.service || "").toLowerCase().replace(/[^a-z]/g, "");
                                                                if (s.includes("meet")) return <Handshake className="w-3 h-3 text-orange-500" />;
                                                                if (s.includes("park")) return <SquareParking className="w-3 h-3 text-blue-500" />;
                                                                return null;
                                                            })()}
                                                            <span className="text-[9px] font-black uppercase text-muted-foreground/60">{b.travelling_from}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center py-4 font-bold text-xs whitespace-nowrap">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-emerald-600">{fmtDT(b.dropoff_datetime)}</span>
                                                        <span className="text-muted-foreground/30 text-[8px] font-black">TO</span>
                                                        <span className="text-red-600">{fmtDT(b.return_datetime)}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center py-4 font-bold text-xs text-muted-foreground">
                                                    {money(b.quote_amount)}
                                                </TableCell>

                                                <TableCell className="text-center py-4 font-black text-xs text-primary">
                                                    {money(b.total_payable)}
                                                </TableCell>

                                                <TableCell className="text-center py-4">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={b.source === "Supplier"}
                                                        className={cn(
                                                            "h-9 w-9 rounded-xl transition-all",
                                                            emailStatus[b.id] === 1 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
                                                            b.source === "Supplier" && "opacity-20 cursor-not-allowed"
                                                        )}
                                                        onClick={() => sendBooking(b.id)}
                                                        title={b.source === "Supplier" ? "Email disabled for Supplier" : "Send Email"}
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>

                                                <TableCell className="text-center py-4">
                                                    <span
                                                        className={cn(
                                                            "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                                            b.status === 'Active' || b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                                            b.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                                                            b.status === 'Completed' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                                                            b.status === 'Extended' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' :
                                                            'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                                        )}
                                                    >
                                                        {b.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>

                                            {/* INLINE EDITOR: AMEND */}
                                            {editMode === "amend" && openRowId === b.id && (
                                                <TableRow className="bg-muted/30 border-b border-border/50">
                                                    <TableCell colSpan={10} className="p-6">
                                                        <div className="glass border-primary/20 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                                            <div className="p-6 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                                        <FileEdit className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-black text-foreground tracking-tight">Amend Booking</h3>
                                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{b.ref_no}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-[10px] font-black uppercase tracking-tight bg-orange-500/10 text-orange-600 px-2 py-1 rounded-full border border-orange-500/20">
                                                                        Dates & Price Locked
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="p-8">
                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                                    {/* Column 1: Core Details */}
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <StickyNote className="w-4 h-4 text-primary/50" />
                                                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Core Details</h4>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Current Status</label>
                                                                                <select
                                                                                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                                                    value={form.status}
                                                                                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                                                                                >
                                                                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                                                </select>
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Total Payable</label>
                                                                                <div className="px-4 py-2 bg-muted/50 rounded-xl border border-border/30 text-xs font-black text-primary">
                                                                                    {money(form.total_payable)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Column 2: Customer */}
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <NotebookPen className="w-4 h-4 text-emerald-500/50" />
                                                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customer</h4>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">First Name</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Last Name</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Email Address</label>
                                                                                <Input className="glass-input h-10 text-xs font-bold" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Mobile No</label>
                                                                                <Input className="glass-input h-10 text-xs font-bold" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Column 3: Vehicle */}
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <SquareParking className="w-4 h-4 text-blue-500/50" />
                                                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vehicle</h4>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Make</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.vehicle_make} onChange={e => setForm(f => ({ ...f, vehicle_make: e.target.value }))} />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Model</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.vehicle_model} onChange={e => setForm(f => ({ ...f, vehicle_model: e.target.value }))} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Color</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.vehicle_colour} onChange={e => setForm(f => ({ ...f, vehicle_colour: e.target.value }))} />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Registration</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold uppercase" value={form.vehicle_registration} onChange={e => setForm(f => ({ ...f, vehicle_registration: e.target.value }))} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Column 4: Flight */}
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Send className="w-4 h-4 text-orange-500/50 rotate-45" />
                                                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Flight</h4>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Dep Flight</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.depart_flight} onChange={e => setForm(f => ({ ...f, depart_flight: e.target.value }))} />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Dep Term</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.depart_terminal} onChange={e => setForm(f => ({ ...f, depart_terminal: e.target.value }))} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Ret Flight</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.return_flight} onChange={e => setForm(f => ({ ...f, return_flight: e.target.value }))} />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Ret Term</label>
                                                                                    <Input className="glass-input h-10 text-xs font-bold" value={form.return_terminal} onChange={e => setForm(f => ({ ...f, return_terminal: e.target.value }))} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between">
                                                                    <div>
                                                                        {saveMsg && (
                                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                                                <Lightbulb className="w-3 h-3" />
                                                                                {saveMsg}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 hover:bg-red-500/10 hover:text-red-600 transition-all"
                                                                            onClick={() => setOpenRowId(null)}
                                                                            disabled={saving}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                                                                            onClick={() => saveEdit(b.id)}
                                                                            disabled={saving}
                                                                        >
                                                                            {saving ? "Updating..." : "Save Changes"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {/* INLINE EDITOR: EXTEND */}
                                            {editMode === "extend" && openRowId === b.id && (
                                                <TableRow className="bg-emerald-50/30 border-b border-border/50">
                                                    <TableCell colSpan={10} className="p-6">
                                                        <div className="glass border-emerald-500/20 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                                            <div className="p-6 border-b border-border/50 bg-emerald-500/5 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                                        <Clock className="w-5 h-5 text-emerald-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-black text-foreground tracking-tight text-emerald-700">Extend Booking</h3>
                                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{b.ref_no}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-[10px] font-black uppercase tracking-tight bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full border border-blue-500/20">
                                                                        Recalculates Automatically
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="p-8">
                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                                    {/* Column 1: Extension Details */}
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Clock className="w-4 h-4 text-emerald-500/50" />
                                                                            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700">Extension</h4>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Drop-off Date</label>
                                                                                <Input
                                                                                    type="datetime-local"
                                                                                    className="glass-input h-10 text-xs font-bold"
                                                                                    value={form.drop_off_date}
                                                                                    onChange={e => setForm(f => ({ ...f, drop_off_date: e.target.value }))}
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">New Return Date</label>
                                                                                <Input
                                                                                    type="datetime-local"
                                                                                    className="glass-input h-10 text-xs font-bold border-emerald-500/30 ring-emerald-500/10"
                                                                                    value={form.return_date}
                                                                                    onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))}
                                                                                />
                                                                                {extendLoading && <p className="text-[9px] font-black text-blue-500 animate-pulse uppercase tracking-widest ml-1">Calculating...</p>}
                                                                                {extendError && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{extendError}</p>}
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Extra Charges (£)</label>
                                                                                <Input
                                                                                    type="number"
                                                                                    className="glass-input h-10 text-xs font-bold"
                                                                                    value={form.extra_charge}
                                                                                    onChange={e => setForm(f => ({ ...f, extra_charge: Number(e.target.value) }))}
                                                                                />
                                                                            </div>
                                                                            <Button
                                                                                className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-10 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
                                                                                onClick={() => {
                                                                                    const dropSql = toSqlDateTimeSafe(form.drop_off_date);
                                                                                    const returnSql = toSqlDateTimeSafe(form.return_date);
                                                                                    if (dropSql && returnSql) calculateExtendPrice(b.id, dropSql, returnSql, form.extra_charge || 0);
                                                                                }}
                                                                                disabled={extendLoading}
                                                                            >
                                                                                Apply Quote
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Column 2: Price Breakdown */}
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Lightbulb className="w-4 h-4 text-orange-500/50" />
                                                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pricing</h4>
                                                                        </div>
                                                                        <div className="glass border-border/30 rounded-2xl p-5 space-y-4">
                                                                            {!extendPreview ? (
                                                                                <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center">
                                                                                    <Clock className="w-8 h-8 mb-2" />
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest">Update dates to see pricing</p>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="space-y-3">
                                                                                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Old Quote</span>
                                                                                        <span className="text-xs font-black">{money(n0(extendPreview.old_quote))}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Quote</span>
                                                                                        <span className="text-xs font-black text-emerald-600">{money(n0(extendPreview.new_quote))}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diff (Base)</span>
                                                                                        <span className="text-xs font-black">{money(n0(extendPreview.diff))}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Extra Charges</span>
                                                                                        <span className="text-xs font-black text-primary">{money(n0(extendPreview.extra_charge))}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center pt-2">
                                                                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Extend Payable</span>
                                                                                        <span className="text-base font-black text-emerald-700">{money(n0(extendPreview.optional))}</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Column 3: Summary (Vehicle & Flight) */}
                                                                    <div className="md:col-span-2 grid grid-cols-2 gap-8">
                                                                        <div className="space-y-6">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <SquareParking className="w-4 h-4 text-blue-500/50" />
                                                                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vehicle Summary</h4>
                                                                            </div>
                                                                            <div className="glass border-border/30 rounded-2xl p-5 space-y-3">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Make / Model</span>
                                                                                    <span className="text-[11px] font-black">{b.vehicle_make} {b.vehicle_model}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Color</span>
                                                                                    <span className="text-[11px] font-black">{b.vehicle_colour}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Reg No</span>
                                                                                    <span className="text-sm font-black text-primary">{b.vehicle_reg_no}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-6">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <Send className="w-4 h-4 text-orange-500/50 rotate-45" />
                                                                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Flight Summary</h4>
                                                                            </div>
                                                                            <div className="glass border-border/30 rounded-2xl p-5 space-y-3">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Dep Flight / Term</span>
                                                                                    <span className="text-[11px] font-black">{b.depart_flight} / {b.depart_terminal}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Ret Flight / Term</span>
                                                                                    <span className="text-[11px] font-black">{b.return_flight} / {b.return_terminal}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between">
                                                                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                                        Recalculated prices include VAT and administrative adjustments.
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 hover:bg-red-500/10 hover:text-red-600 transition-all"
                                                                            onClick={() => { setOpenRowId(null); setEditMode(null); setExtendPreview(null); }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 transition-all"
                                                                            onClick={() => saveExtension(b.id)}
                                                                            disabled={saving || extendLoading}
                                                                        >
                                                                            Extend Booking
                                                                        </Button>
                                                                        <Button
                                                                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all"
                                                                            onClick={() => openExtendConfirmPopup(b.id)}
                                                                            disabled={saving || extendLoading}
                                                                        >
                                                                            Confirm Manually
                                                                        </Button>
                                                                    </div>
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

                    {/* PAGINATION */}
                    <div className="flex justify-between items-center px-8 py-6 bg-muted/20 border-t border-border/50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Showing <span className="text-foreground">{rows.length}</span> of <span className="text-foreground">{total}</span> Bookings
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 h-9 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
                            >
                                Previous
                            </Button>

                            <div className="flex items-center gap-1 mx-2">
                                {[...Array(totalPages)].map((_, index) => {
                                    const pNum = index + 1;
                                    // Simple logic to show only few pages if many
                                    if (totalPages > 7) {
                                        if (pNum !== 1 && pNum !== totalPages && Math.abs(pNum - page) > 1) {
                                            if (Math.abs(pNum - page) === 2) return <span key={pNum} className="px-1 opacity-30">...</span>;
                                            return null;
                                        }
                                    }
                                    return (
                                        <button
                                            key={pNum}
                                            onClick={() => setPage(pNum)}
                                            className={cn(
                                                "w-9 h-9 rounded-xl text-[10px] font-black transition-all border border-transparent",
                                                page === pNum 
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary/20" 
                                                    : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                                            )}
                                        >
                                            {pNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 h-9 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
                            >
                                Next
                            </Button>
                        </div>
                    </div>


                </div>


            </div>

            {extendConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setExtendConfirmOpen(false)} />
                    <div className="glass w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10 border-emerald-500/20">
                        <div className="p-6 border-b border-border/50 bg-emerald-500/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground tracking-tight">Activate Extension</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Manual Confirmation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setExtendConfirmOpen(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-all"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">
                                    Stripe Payment Intent ID (pi_xxx)
                                </label>
                                <Input
                                    className="glass-input h-12 text-sm font-bold placeholder:font-normal placeholder:text-muted-foreground/40"
                                    placeholder="pi_XXXXXXXXXXXX"
                                    value={extendPiId}
                                    onChange={(e) => setExtendPiId(e.target.value)}
                                />
                                <p className="text-[9px] text-muted-foreground/60 font-medium px-1">
                                    Provide the Stripe transaction ID to manually verify this extension payment.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-muted/30 border-t border-border/50 flex items-center gap-3 justify-end">
                            <Button
                                variant="ghost"
                                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 hover:bg-red-500/10 hover:text-red-600 transition-all"
                                onClick={() => setExtendConfirmOpen(false)}
                                disabled={extendConfirmLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all"
                                onClick={confirmExtendManual}
                                disabled={extendConfirmLoading}
                            >
                                {extendConfirmLoading ? "Confirming..." : "Activate Extension"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </ProtectedRoute>
    );
}
