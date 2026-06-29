'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { backendProxyPath } from "@/app/lib/backendProxy";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Telescope, Download, Send, FileEdit, Clock, StickyNote, Pencil, Trash2, X,
    Handshake, SquareParking, Eye, ChevronLeft, ChevronRight, NotebookPen,
    Lightbulb, CircleX, Mail, MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProtectedRoute from '@/components/ProtectedRoute';
import CancelPopup from '@/components/CancelPopup';
import BookingDetailsPopup from "@/components/BookingDetailsPopup";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";



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
	created_at: string;
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

    const [datePart] = String(input).split(" ");
    const [y, m, d] = datePart.split("-");

    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}

const isoToDDMMYYYY = (iso: string): string => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

const formatExactDateTime = (value?: string) => {
    if (!value) return { date: "", time: "" };

    const clean = String(value).replace("T", " ").replace("Z", "");
    const [datePart, timePart = ""] = clean.split(" ");

    const [y, m, d] = datePart.split("-");
    const [hh = "00", mm = "00"] = timePart.split(":");

    return {
        date: `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`,
        time: `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`,
    };
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


// REMOVED handleExtend placeholder

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


// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------- Helpers ---------- */
function getCookie(name: string) {
    const m = typeof document !== 'undefined'
        ? document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        : null;
    return m ? m.pop() : '';
}

function fmtDT(v?: string) {
    if (!v) return '';

    const { date, time } = formatExactDateTime(v);
    return `${date} ${time}`;
}

function toLocalInputValue(value?: string) {
    if (!value) return "";

    const clean = String(value).replace("T", " ").replace("Z", "");
    const [datePart, timePart = "00:00"] = clean.split(" ");
    const [hh = "00", mm = "00"] = timePart.split(":");

    return `${datePart}T${hh}:${mm}`;
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
    const [y, m, d] = dateStr.split("-");
    return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
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

    const router = useRouter();
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

    const [openedId, setOpenedId] = useState<null>(null);
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
                backendProxyPath("/api/bookings/email-csv"),
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
                `${backendProxyPath("/api/supplier-booking")}?${qs}`,
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
				created_at: b.created_at,
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


    // const filteredRows = useMemo(() => {
    //     return rows.filter(b => {

    //         const s = search.toLowerCase();

    //         return (
    //             (!search ||
    //                 b.ref_no.toLowerCase().includes(s) ||
    //                 b.customer_name.toLowerCase().includes(s) ||
    //                 b.contact_no?.toLowerCase().includes(s) ||
    //                 b.make_model.toLowerCase().includes(s) ||
    //                 b.model.toLowerCase().includes(s)
    //             ) &&

    //             (!status || b.status === status) &&
    //             (!airport || b.airport === airport) &&
    //             (!source || b.source === source) &&
    //             (!service || b.service === service) &&

    //             (!selectedDate || b.booked_on.startsWith(selectedDate)) &&
    //             (!departDate || b.dropoff_datetime.startsWith(departDate)) &&
    //             (!returnDate || b.return_datetime.startsWith(returnDate)) &&

    //             // BOOKING RANGE
    //             (!rangeFrom || new Date(b.booked_on) >= new Date(rangeFrom)) &&
    //             (!rangeTo || new Date(b.booked_on) <= new Date(rangeTo)) &&

    //             // DROPOFF RANGE
    //             (!dropoffFrom || new Date(b.dropoff_datetime) >= new Date(dropoffFrom)) &&
    //             (!dropoffTo || new Date(b.dropoff_datetime) <= new Date(dropoffTo)) &&

    //             // RETURN RANGE
    //             (!returnFrom || new Date(b.return_datetime) >= new Date(returnFrom)) &&
    //             (!returnTo || new Date(b.return_datetime) <= new Date(returnTo))
    //         );
    //     });
    // }, [
    //     rows,
    //     search,
    //     status,
    //     airport,
    //     source,
    //     service,
    //     selectedDate,
    //     departDate,
    //     returnDate,
    //     rangeFrom,
    //     rangeTo,
    //     dropoffFrom,
    //     dropoffTo,
    //     returnFrom,
    //     returnTo
    // ]);

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
        if (openRowId === b.id && editMode === mode) {
            setOpenRowId(null);
            setEditMode(null);
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

            // 🔹 Split customer name
            // const [first_name, ...rest] = form.customer_name.split(" ");
            // payload.first_name = first_name || "";
            // payload.last_name = rest.join(" ");

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

            const res = await fetch(backendProxyPath("/api/bookings/delete/${b.id}"), {
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
                backendProxyPath("/api/bookings/send-booking-email/${bookingId}"),
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


    // const saveExtension = async (bookingId: number) => {
    //     const dropSql = toSqlDateTimeSafe(form.drop_off_date);
    //     const returnSql = toSqlDateTimeSafe(form.return_date);

    //     if (!dropSql || !returnSql) return alert("Invalid dates");

    //     await fetch(
    //         backendProxyPath("/api/bookings/extend/${bookingId}"),
    //         {
    //             method: "PUT",
    //             credentials: "include",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 new_drop_off_date: dropSql,
    //                 new_return_date: returnSql,
    //             }),
    //         }
    //     );

    //     setEditMode(null);
    //     setOpenRowId(null);
    //     setExtendPreview(null);
    //     fetchData();
    // };

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
            alert("Invoice email sent successfully to customer");

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
                backendProxyPath("/api/bookings/extend/confirm-payment"),
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
            <div className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6">
                {/* POPUPS */}
                <CancelPopup
                    open={cancelPopupOpen}
                    booking={selectedBooking}
                    onClose={() => setCancelPopupOpen(false)}
                    refresh={fetchData}
                />

                {notesOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <div className="glass border-border/50 w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-border/50 bg-muted/30">
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                                    Notes – {notesBooking?.ref_no}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={() => setNotesOpen(false)} className="rounded-full">
                                    <X size={18} />
                                </Button>
                            </div>
                            <div className="p-6">
                                <textarea
                                    className="w-full min-h-[160px] bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all resize-none shadow-inner"
                                    placeholder="Append operational notes..."
                                    value={notesText}
                                    onChange={(e) => setNotesText(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/30">
                                <Button variant="outline" className="rounded-xl font-bold" onClick={() => setNotesOpen(false)} disabled={notesSaving}>Cancel</Button>
                                <Button className="rounded-xl font-bold shadow-lg shadow-primary/20" onClick={saveNotes} disabled={notesSaving}>
                                    {notesSaving ? "Processing..." : "Save Notes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
                            Supplier Portfolio
                        </h6>
                        <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
                            Fleet Bookings
                        </h1>
                        <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
                            Monitor fleet movements across all terminals. Manage operational statuses, extend durations, and coordinate vehicle logistics.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={sendBookingsCSVByEmail}
                            className="rounded-xl h-12 px-6 font-bold transition-all active:scale-95 border-border/50 hover:bg-muted/50 flex items-center gap-2"
                        >
                            <Mail size={18} className="text-primary" />
                            <span>Email CSV</span>
                        </Button>
                        <Button
                            onClick={downloadCSV}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Download size={18} strokeWidth={2.5} />
                            <span>Download Log</span>
                        </Button>
                    </div>
                </div>

                {/* FILTER PANEL */}
                <div className="glass border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[280px] relative group">
                            <Input
                                type="text"
                                placeholder="Ref, Name, Phone, Vehicle..."
                                className="h-11 bg-background/50 border-border/50 pl-11 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50 hover:border-primary/30 shadow-inner"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                            <Telescope className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
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
                            <select
                                className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] hover:border-primary/30 shadow-sm"
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            >
                                <option value="">Fleet Status</option>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <select
                                className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] hover:border-primary/30 shadow-sm"
                                value={pattern}
                                onChange={(e) => { setPattern(e.target.value); setPage(1); }}
                            >
                                <option value="booked">Booked On</option>
                                <option value="depart">Fleet Depart</option>
                                <option value="return">Fleet Return</option>
                            </select>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[150px] hover:border-primary/30 shadow-sm"
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
                                <span className="text-muted-foreground font-black text-[10px] uppercase opacity-30 px-1">to</span>
                                <Input
                                    type="date"
                                    className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[150px] hover:border-primary/30 shadow-sm"
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

                {/* TABLE SECTION */}
                <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50 text-[10px]">
                                    <TableHead className="w-[50px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                                    <TableHead className="w-[80px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Actions</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Reference</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Customer / Phone</TableHead>
									<TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">
    Booked Date
</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 underline decoration-primary/30 underline-offset-4">Drop-off Log</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 underline decoration-primary/30 underline-offset-4">Return Log</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Vehicle Detail</TableHead>
									<TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Amount</TableHead>
                                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                                <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing fleet data...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                                                <Telescope size={48} className="text-muted-foreground mb-2" />
                                                <p className="text-lg font-black tracking-tight text-foreground">Operational silence</p>
                                                <p className="text-xs font-medium text-muted-foreground">Adjust your scope to discover bookings</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((b, i) => (
                                        <Fragment key={b.id}>
                                            <TableRow className="hover:bg-muted/50 transition-colors border-b border-border/50 group">
                                                <TableCell className="text-center py-4 font-bold text-muted-foreground/50">{(page - 1) * limit + (i + 1)}</TableCell>
                                                <TableCell className="text-center py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-95">
                                                                    <MoreVertical size={14} strokeWidth={2.5} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" sideOffset={6} className="min-w-[180px] glass p-1">
                                                                <DropdownMenuItem onSelect={() => openDetailsPopup(b)} className="flex items-center gap-2 px-3 py-2 cursor-pointer font-bold text-xs">
                                                                    <Eye size={14} className="text-blue-600" /> View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => openNotesPopup(b)} className="flex items-center gap-2 px-3 py-2 cursor-pointer font-bold text-xs">
                                                                    <StickyNote size={14} className="text-emerald-600" /> Manage Notes
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => sendBookingToUser(b.id)} className="flex items-center gap-2 px-3 py-2 cursor-pointer font-bold text-xs">
                                                                    <Send size={14} className="text-blue-500" /> {emailStatus[b.id] === 1 ? "Resend Conf." : "Send Conf."}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => openEdit(b, "amend")} className="flex items-center gap-2 px-3 py-2 cursor-pointer font-bold text-xs">
                                                                    <FileEdit size={14} className="text-indigo-600" /> Amend Booking
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => openEdit(b, "extend")} className="flex items-center gap-2 px-3 py-2 cursor-pointer font-bold text-xs">
                                                                    <Clock size={14} className="text-orange-600" /> Extend Booking
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => openCancelPopup(b)} className="flex items-center gap-2 px-3 py-2 cursor-pointer font-bold text-xs text-red-600 focus:text-red-600">
                                                                    <CircleX size={14} /> Cancel Booking
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    <span className="font-black text-primary tracking-tight">{b.ref_no}</span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold uppercase text-[10px] tracking-wide text-foreground">{b.customer_name}</span>
                                                        <span className="text-[9px] font-medium text-muted-foreground">{b.contact_no || '-'}</span>
                                                    </div>
                                                </TableCell>
												<TableCell className="text-center py-4">
    <div className="flex flex-col items-center">
        <span className="font-bold text-xs">
            {formatExactDateTime(b.created_at).date}
        </span>
        <span className="text-[10px] text-muted-foreground">
            {formatExactDateTime(b.created_at).time}
        </span>
    </div>
</TableCell>
                                                <TableCell className="text-center py-4">
    <div className="flex flex-col items-center">
        <span className="font-bold text-xs">
            {formatExactDateTime(b.dropoff_datetime).date}
        </span>
        <span className="text-[10px] text-muted-foreground">
            {formatExactDateTime(b.dropoff_datetime).time}
        </span>
    </div>
</TableCell>
                                                <TableCell className="text-center py-4">
    <div className="flex flex-col items-center">
        <span className="font-bold text-xs">
            {formatExactDateTime(b.return_datetime).date}
        </span>
        <span className="text-[10px] text-muted-foreground">
            {formatExactDateTime(b.return_datetime).time}
        </span>
    </div>
</TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-black text-[10px] uppercase tracking-tighter text-foreground leading-none">{b.vehicle_reg_no || '-'}</span>
                                                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{b.make_model} {b.color}</span>
                                                    </div>
                                                </TableCell>
												
												<TableCell className="text-center py-4">
                                                    <span className="font-black text-foreground tracking-tight">{b.total_payable}</span>
                                                </TableCell>
												
                                                <TableCell className="text-center py-4">
                                                    <span className={cn(
                                                        "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                        b.status === 'active' || b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                                            b.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                                                                b.status === 'Extended' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' :
                                                                    'bg-muted text-muted-foreground border border-border/50'
                                                    )}>
                                                        {b.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>

                                            {/* INLINE EDITOR */}
                                            {editMode === "amend" && openRowId === b.id && (
                                                <TableRow className="bg-muted/20">
                                                    <TableCell colSpan={9} className="p-0">
                                                        <div className="bg-card text-card-foreground border border-border shadow-sm p-6 w-full">
                                                            {/* HEADER */}
                                                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-5 gap-2">
                                                                <h3 className="font-semibold text-sm text-foreground">
                                                                    Amend Parking Booking{" "}
                                                                    <span className="text-primary">{b.ref_no}</span>
                                                                </h3>
                                                                <span className="text-xs text-muted-foreground font-medium">
                                                                    Dates & price are locked
                                                                </span>
                                                            </div>

                                                            {/* GRID */}
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full">
                                                                {/* BOOKING DETAILS */}
                                                                <div className="border border-border bg-card p-4 rounded-xl shadow-sm">
                                                                    <h4 className="text-sm font-bold text-foreground mb-4">Booking Details</h4>
                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <label className="block mb-1 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Drop-off Date</label>
                                                                            <Input
                                                                                type="datetime-local"
                                                                                className="h-9 text-sm bg-background text-foreground border-border"
                                                                                value={form.drop_off_date}
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block mb-1 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Return Date</label>
                                                                            <Input
                                                                                type="datetime-local"
                                                                                className="h-9 text-sm bg-background text-foreground border-border"
                                                                                value={form.return_date}
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* CUSTOMER INFO */}
                                                                <div className="border border-border bg-card p-4 rounded-xl shadow-sm">
                                                                    <h4 className="text-sm font-bold text-foreground mb-4">Customer Info</h4>
                                                                    <div className="space-y-3">
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <Input placeholder="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                                                                            <Input placeholder="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                                                                        </div>
                                                                        <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                                                        <Input placeholder="Phone" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                                                                    </div>
                                                                </div>

                                                                {/* VEHICLE INFO */}
                                                                <div className="border border-border bg-card p-4 rounded-xl shadow-sm">
                                                                    <h4 className="text-sm font-bold text-foreground mb-4">Vehicle Info</h4>
                                                                    <div className="space-y-3">
                                                                        <Input placeholder="Registration" value={form.vehicle_registration} onChange={e => setForm({ ...form, vehicle_registration: e.target.value })} />
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <Input placeholder="Make" value={form.vehicle_make} onChange={e => setForm({ ...form, vehicle_make: e.target.value })} />
                                                                            <Input placeholder="Model" value={form.vehicle_model} onChange={e => setForm({ ...form, vehicle_model: e.target.value })} />
                                                                        </div>
                                                                        <Input placeholder="Colour" value={form.vehicle_colour} onChange={e => setForm({ ...form, vehicle_colour: e.target.value })} />
                                                                    </div>
                                                                </div>

                                                                {/* STATUS & PRICE */}
                                                                <div className="border border-border bg-card p-4 rounded-xl shadow-sm">
                                                                    <h4 className="text-sm font-bold text-foreground mb-4">Status & Price</h4>
                                                                    <div className="space-y-3">
                                                                        <select
                                                                            className="w-full h-9 border border-border bg-background text-foreground rounded-md px-3 text-sm"
                                                                            value={form.status}
                                                                            onChange={e => setForm({ ...form, status: e.target.value })}
                                                                        >
                                                                            <option value="Active">Active</option>
                                                                            <option value="Amended">Amended</option>
                                                                            <option value="Cancelled">Cancelled</option>
                                                                            <option value="Completed">Completed</option>
                                                                        </select>
                                                                        <Input type="number" className="bg-background text-foreground border-border" placeholder="Total Payable" value={form.total_payable} onChange={e => setForm({ ...form, total_payable: Number(e.target.value) })} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-3 mt-6">
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-border bg-background text-foreground hover:bg-muted"
                                                                    onClick={() => setOpenRowId(null)}
                                                                >Cancel</Button>
                                                                <Button disabled={saving} onClick={() => saveEdit(b.id)}>{saving ? "Saving..." : "Save Changes"}</Button>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {editMode === "extend" && openRowId === b.id && (
                                                <TableRow className="bg-muted/20">
                                                    <TableCell colSpan={8} className="p-0">
                                                        <div className="bg-card text-card-foreground border border-border shadow-sm p-6 w-full">
                                                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                                                                <h3 className="font-black text-sm text-foreground tracking-tight">Extend Booking <span className="text-primary">{b.ref_no}</span></h3>
                                                                <span className="text-xs text-muted-foreground font-medium">Price recalculates automatically when return date changes</span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                                <div className="border border-border bg-card p-5 rounded-xl shadow-sm">
                                                                    <h4 className="text-sm font-bold text-foreground mb-4">Extension Details</h4>
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5">Drop-off Date</label>
                                                                            <Input type="datetime-local" className="h-10 font-bold bg-muted/50" value={form.drop_off_date} disabled />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5">New Return Date</label>
                                                                            <Input type="datetime-local" className="h-10 font-bold border-emerald-200 focus:ring-emerald-500" value={form.return_date} onChange={e => setForm({ ...form, return_date: e.target.value })} />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="border border-border bg-card p-5 rounded-xl flex flex-col justify-center items-center text-center">
                                                                    <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2">Additional Charge</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-3xl font-black text-foreground leading-none">£</span>
                                                                        <input type="number" className="bg-transparent text-3xl font-black text-foreground w-24 outline-none border-b-2 border-border focus:border-primary" value={form.extra_charge} onChange={e => setForm({ ...form, extra_charge: Number(e.target.value) })} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-3 mt-8">
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-border bg-background text-foreground hover:bg-muted"
                                                                    onClick={() => setOpenRowId(null)}
                                                                >Cancel</Button>
                                                                <Button disabled={saving} onClick={() => saveExtension(b.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">{saving ? "Extending..." : "Confirm Extension"}</Button>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* PAGINATION SECTION */}
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <p className="text-xs font-bold text-muted-foreground">
                        Showing <span className="text-foreground">{rows.length}</span> of <span className="text-foreground">{total}</span> total discoverable units
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
                            <span className="text-xs font-black">Page {page} of {Math.ceil(total / limit)}</span>
                        </div>
                        <Button
                            variant="outline"
                            className="h-10 px-4 rounded-xl font-bold transition-all disabled:opacity-30"
                            disabled={page >= Math.ceil(total / limit) || loading}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>

                {selectedMyBooking && (
                    <BookingDetailsPopup
                        open={detailsOpen}
                        onClose={() => setDetailsOpen(false)}
                        booking={selectedMyBooking}
                    />
                )}

                {selectedBooking && (
                    <CancelPopup
                        open={cancelPopupOpen}
                        onClose={() => setCancelPopupOpen(false)}
                        booking={selectedBooking}
                        refresh={fetchData}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
