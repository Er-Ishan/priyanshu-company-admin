"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { cn } from "@/lib/utils";
import { Package, Tag, Shield, Calendar } from "lucide-react";

// Use same-origin backend proxy to avoid NEXT_PUBLIC_API_BASE_URL in browser code.
const API = "";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrettyDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}


function pad2(n: number) {
    return String(n).padStart(2, "0");
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${pad2(hours)}:${minutes}`;
});


function toYMD(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toHM(d: Date) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function toDisplayDate(ymd: string) {
    // ymd: YYYY-MM-DD
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return "";
    return `${d} ${MONTHS[m - 1]}, ${y}`; // "19 Jan, 2026"
}

function addDays(ymd: string, days: number) {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return toYMD(date);
}

function toBackendDateTime(ymd: string, hm: string) {
    if (!ymd || !hm) return null;
    return `${ymd.trim()} ${hm.trim()}`;
}


function safeImage(url?: string | null) {
    if (!url) return "";
    return url;
}

const Field = ({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground/80 leading-tight">
            {label}
            {required && <span className="text-primary ml-1">*</span>}
        </label>

        {/* input wrapper */}
        <div className="relative">
            {children}
        </div>
    </div>
);

export default function AdminAddBooking() {
    // ===================== SEARCH STATE =====================
    const [dropoffDate, setDropoffDate] = useState("");
    const [dropoffTime, setDropoffTime] = useState("12:00");
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceMessage, setInvoiceMessage] = useState("");

    const [airports, setAirports] = useState<any[]>([]);
    const [selectedAirport, setSelectedAirport] = useState("");



    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("12:00");

    const [bookingId, setBookingId] = useState<number | null>(null);


    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState("");

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");

    const today = new Date().toISOString().split("T")[0];

    // Display only (default today)
    const [displayFromDate, setDisplayFromDate] = useState<string>(today);
    const [displayToDate, setDisplayToDate] = useState<string>(today);

    // Applied filters (EMPTY initially)
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const [terminals, setTerminals] = useState<
        {
            terminal_id: number;
            terminal_name: string;
            terminal_code: string;
        }[]
    >([]);

    useEffect(() => {
        fetch(backendProxyPath("/api/terminals"))
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTerminals(data.data || []);
                }
            })
            .catch((err) => {
                console.error("Failed to load terminals", err);
            });
    }, []);

    useEffect(() => {
        fetch(backendProxyPath("/api/airports"))
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAirports(data.data || []);
                }
            })
            .catch(() => {
                console.error("Failed to load airports");
            });
    }, []);




    const [charges, setCharges] = useState<{
        cancellation?: { name: string; price: number };
        booking?: { name: string; price: number };
    }>({});

    const inputClass =
        "w-full border border-border rounded-md px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";



    // ===================== BOOKING STATE =====================
    const [hasTravel, setHasTravel] = useState<"yes" | "no">("yes");
    const [hasVehicle, setHasVehicle] = useState<"yes" | "no">("yes");

    const [message, setMessage] = useState("");

    const [booking, setBooking] = useState({
        // Customer
        title: "",
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",

        // Optional Address (admin style; doesn’t break backend if ignored server-side)
        address_1: "",
        address_2: "",
        city: "",
        postcode: "",
        country: "United Kingdom",

        // Travel
        depart_terminal: "",
        depart_flight: "",
        return_terminal: "",
        return_flight: "",

        // Vehicle
        vehicle_make: "",
        vehicle_model: "",
        vehicle_colour: "",
        vehicle_reg: "",
        passengers: "1",

        // Options
        cancellation_cover: false,
        terms: false,

        // Notes
        admin_notes: "",
    });

    const saveBookingAndGetId = async (): Promise<number | null> => {
        if (bookingId) return bookingId;

        if (!selectedProduct) {
            setInvoiceMessage("Please complete booking details first.");
            return null;
        }

        const payload = {
            product_name: selectedProduct.product_name,
            product_flexibility: selectedProduct.product_flexibility || "Flexible",
            travelling_from: selectedProduct.airport_name,
            service_provider: selectedProduct.service_provider || "Airport Parking",
            service: selectedProduct.service_type || "",

            dropoff: dropoffBackend,
            return_date: returnBackend,

            // ✅ PRICES (EXPLICIT)
            quote_amount: quoteFee,                 // 56.77
            booking_fee: bookingFee,                // 1.99
            has_cancellation_cover: booking.cancellation_cover ? 1 : 0,
            cancellation_fee: booking.cancellation_cover ? cancellationFee : 0,
            total_payable: totalPayable,            // 68.76

            discount: 0,

            title: booking.title,
            first_name: booking.first_name,
            last_name: booking.last_name,
            email: booking.email,
            mobile: booking.mobile,

            passengers: Number(booking.passengers),
            terms: booking.terms,
        };



        const res = await fetch(backendProxyPath("/api/admin/create-admin-booking"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            setInvoiceMessage(data.message || "Failed to save booking.");
            return null;
        }

        setBookingId(data.booking_id);
        setMessage(`✅ Booking created successfully (ID: ${data.booking_id})`);
        return data.booking_id;
    };


    const sendInvoice = async () => {
        setInvoiceMessage("");
        setInvoiceLoading(true);

        try {
            // 1️⃣ Ensure booking exists
            const id = await saveBookingAndGetId();

            if (!id) return;

            // 2️⃣ Send invoice
            const res = await fetch(backendProxyPath("/api/admin/send-invoice"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ booking_id: id }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setInvoiceMessage(data.message || "Failed to send invoice.");
                return;
            }

            setInvoiceMessage("✅ Invoice sent successfully to customer email.");
        } catch (err) {
            setInvoiceMessage("Failed to send invoice.");
        } finally {
            setInvoiceLoading(false);
        }
    };



    const handleBookingChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setBooking((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const verifyAndActivatePayment = async () => {
        if (!paymentIntentId) {
            setPaymentMessage("Enter a valid Transaction ID (pi_xxx).");
            return;
        }

        if (!bookingId) {
            setPaymentMessage("Booking ID missing.");
            return;
        }

        setPaymentLoading(true);
        setPaymentMessage("");

        try {
            const res = await fetch(backendProxyPath("/api/admin/manual-confirm-payment"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking_id: bookingId,          // ✅ ADD THIS
                    transaction_id: paymentIntentId // ✅ already correct
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setPaymentMessage(data.message || "Activation failed.");
                return;
            }

            setPaymentMessage(`✅ Booking Activated. Ref: ${data.ref_no}`);
            setShowPaymentModal(false);

        } catch (err) {
            setPaymentMessage("Activation failed.");
        } finally {
            setPaymentLoading(false);
        }
    };


    useEffect(() => {
        fetch(backendProxyPath("/api/admin/charges"))
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCharges(data.charges || {});
                }
            })
            .catch(() => {
                console.error("Failed to load charges");
            });
    }, []);

    const sendPaymentEmail = async () => {
        setEmailMessage("");

        if (!booking.email) {
            setEmailMessage("Customer email is required.");
            return;
        }

        if (!selectedProduct) {
            setEmailMessage("Select a product first.");
            return;
        }

        setEmailLoading(true);
        try {
            const res = await fetch(backendProxyPath("/api/admin/send-payment-email"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: booking.email,
                    first_name: booking.first_name,
                    last_name: booking.last_name,
                    product_name: selectedProduct.product_name,
                    amount: totalPayable,

                    dropoff: dropoffBackend,
                    return_date: returnBackend,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setEmailMessage(data.message || "Failed to send payment email.");
                return;
            }

            setEmailMessage("✅ Payment email sent successfully.");
        } catch (err: any) {
            setEmailMessage("Failed to send payment email.");
        } finally {
            setEmailLoading(false);
        }
    };



    // ===================== DEFAULT DATES =====================
    useEffect(() => {
        // Dropoff = tomorrow at 12:00
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
        const ymd = toYMD(tomorrow);

        setDropoffDate(ymd);
        setDropoffTime("12:00");

        // Return = +8 days after dropoff
        setReturnDate(addDays(ymd, 8));
        setReturnTime("12:00");
    }, []);

    // Auto-update return date to +8 days whenever dropoff date changes
    useEffect(() => {
        if (!dropoffDate) return;
        setReturnDate(addDays(dropoffDate, 8));
    }, [dropoffDate]);

    const dropoffDisplay = useMemo(() => toDisplayDate(dropoffDate), [dropoffDate]);
    const returnDisplay = useMemo(() => toDisplayDate(returnDate), [returnDate]);

    const dropoffBackend = useMemo(
        () => toBackendDateTime(dropoffDate, dropoffTime),
        [dropoffDate, dropoffTime]
    );

    // const [selectedAirport, setSelectedAirport] = useState("");


    const returnBackend = useMemo(
        () => toBackendDateTime(returnDate, returnTime),
        [returnDate, returnTime]
    );

    const filteredTerminals = useMemo(() => {
        if (!selectedProduct?.airport_name) return [];

        return terminals.filter(
            (t: any) => t.airport_name === selectedProduct.airport_name
        );
    }, [selectedProduct, terminals]);


    // ===================== PAYMENT CALCULATION (GLOBAL) =====================
    const quoteFee = useMemo(() => {
        return Number(selectedProduct?.total_price || 0);
    }, [selectedProduct]);

    const bookingFee = useMemo(() => {
        return Number(charges.booking?.price || 0);
    }, [charges.booking]);

    const cancellationFee = useMemo(() => {
        return booking.cancellation_cover
            ? Number(charges.cancellation?.price || 0)
            : 0;
    }, [booking.cancellation_cover, charges.cancellation]);

    const totalPayable = useMemo(() => {
        return Number((quoteFee + bookingFee + cancellationFee).toFixed(2));
    }, [quoteFee, bookingFee, cancellationFee]);




    // ===================== SEARCH PRODUCTS =====================
    const searchProducts = async () => {
        setSearchError("");
        setMessage("");
        setSelectedProduct(null);
        setProducts([]);

        if (!dropoffBackend || !returnBackend) {
            setSearchError("Please select valid drop-off and return date & time.");
            return;
        }


        setSearchLoading(true);
        try {
            const res = await fetch(backendProxyPath("/api/admin/search-products"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dropoff: String(dropoffBackend),
                    return_date: String(returnBackend),
                    airport_name: selectedAirport || null,
                }),
            });

            const text = await res.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error("Server did not return JSON. Check API URL / backend logs.");
            }

            if (!res.ok || !data?.success) {
                setSearchError(data?.message || "Failed to load products.");
                return;
            }

            setProducts(Array.isArray(data.data) ? data.data : []);
        } catch (err: any) {
            setSearchError(err?.message || "Search failed.");
        } finally {
            setSearchLoading(false);
        }
    };

    // ===================== CREATE BOOKING =====================
    // const createBooking = async (e: any) => {
    //     e.preventDefault();
    //     setMessage("");

    //     if (!selectedProduct) {
    //         setMessage("Please select a product first.");
    //         return;
    //     }
    //     if (!booking.terms) {
    //         setMessage("Please accept Terms & Conditions.");
    //         return;
    //     }

    //     const payload = {
    //         product_name: selectedProduct.product_name,
    //         product_flexibility: selectedProduct.product_flexibility || "Flexible",
    //         travelling_from: selectedProduct.airport_name,
    //         service_provider: selectedProduct.service_provider || "Airport Parking",
    //         service: selectedProduct.service_type || "",

    //         dropoff: dropoffBackend,
    //         return_date: returnBackend,

    //         // ✅ PRICES (MATCH BACKEND)
    //         quote_amount: quoteFee,
    //         booking_fee: bookingFee,
    //         has_cancellation_cover: booking.cancellation_cover ? 1 : 0,
    //         cancellation_fee: booking.cancellation_cover ? cancellationFee : 0,
    //         total_payable: totalPayable,

    //         discount: 0,

    //         title: booking.title,
    //         first_name: booking.first_name,
    //         last_name: booking.last_name,
    //         email: booking.email,
    //         mobile: booking.mobile,

    //         passengers: Number(booking.passengers),
    //         terms: booking.terms,
    //     };





    //     try {
    //         const res = await fetch(`${API}/api/admin/create-admin-booking`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(payload),
    //         });

    //         const text = await res.text();
    //         let data: any;
    //         try {
    //             data = JSON.parse(text);
    //         } catch {
    //             throw new Error("Server did not return JSON.");
    //         }

    //         if (!res.ok || !data?.success) {
    //             setMessage(data?.message || "Booking failed.");
    //             return;
    //         }

    //         setBookingId(data.booking_id);
    //         setMessage(`✅ Booking created successfully (ID: ${data.booking_id})`);


    //         // Reset booking form (keep dates/products so admin can continue)
    //         setBooking({
    //             title: "",
    //             first_name: "",
    //             last_name: "",
    //             email: "",
    //             mobile: "",
    //             address_1: "",
    //             address_2: "",
    //             city: "",
    //             postcode: "",
    //             country: "United Kingdom",
    //             depart_terminal: "",
    //             depart_flight: "",
    //             return_terminal: "",
    //             return_flight: "",
    //             vehicle_make: "",
    //             vehicle_model: "",
    //             vehicle_colour: "",
    //             vehicle_reg: "",
    //             passengers: "1",
    //             cancellation_cover: false,
    //             terms: false,
    //             admin_notes: "",
    //         });

    //         setHasTravel("yes");
    //         setHasVehicle("yes");
    //         setSelectedProduct(null);
    //     } catch (err: any) {
    //         setMessage(err?.message || "Booking failed.");
    //     }
    // };


    const createBooking = async (e: any) => {
        e.preventDefault();
        setMessage("");

        if (!selectedProduct) {
            setMessage("Please select a product first.");
            return;
        }


        const payload = {
            product_name: selectedProduct.product_name,
            product_flexibility: selectedProduct.product_flexibility || "Flexible",
            travelling_from: selectedProduct.airport_name,
            service_provider: selectedProduct.service_provider || "Airport Parking",
            service: selectedProduct.service_type || "",

            dropoff: dropoffBackend,
            return_date: returnBackend,

            // ✅ EXACT DB MAPPING
            quote_amount: Number(quoteFee),
            booking_fee: Number(bookingFee),
            has_cancellation_cover: booking.cancellation_cover ? 1 : 0,
            cancellation_fee: booking.cancellation_cover
                ? Number(cancellationFee)
                : 0,
            total_payable: Number(totalPayable),

            title: booking.title,
            first_name: booking.first_name,
            last_name: booking.last_name,
            email: booking.email,
            mobile: booking.mobile,
            passengers: Number(booking.passengers),
            terms: booking.terms,
        };


        try {
            const res = await fetch(`${API}/api/admin/create-admin-booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setMessage(data.message || "Booking failed.");
                return;
            }

            setBookingId(data.booking_id);
            setMessage(`✅ Booking created successfully (ID: ${data.booking_id})`);
        } catch {
            setMessage("Booking failed.");
        }
    };







    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Add New Booking</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Configure travel dates to view available products and dynamic pricing.
                        </p>
                    </div>
                </div>

                {/* ===========================
            SECTION 1 — DATE SEARCH (PRO)
        ============================ */}
                <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Flight & Schedule
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Airport Filter Card */}
                        <div className="bg-accent/40 rounded-lg p-5 border border-border/50 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-foreground">
                                    Departure Airport <span className="text-primary">*</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 flex-grow">
                                <select
                                    required
                                    value={selectedAirport}
                                    onChange={(e) => setSelectedAirport(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">All Airports</option>
                                    {airports.map((a) => (
                                        <option key={a.airport_id} value={a.airport_name}>
                                            {a.airport_name}
                                        </option>
                                    ))}
                                </select>

                                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                                    Results will filter travel options available at the selected location.
                                </p>
                            </div>
                        </div>

                        {/* Drop-off Card */}
                        <div className="bg-accent/40 rounded-lg p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-foreground">Drop-off Schedule</p>
                                <span className="text-[10px] font-medium text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {dropoffDisplay || "Not Selected"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Date" required>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={dropoffDate}
                                        min={today}
                                        onChange={(e) => setDropoffDate(e.target.value)}
                                        required
                                    />
                                </Field>

                                <Field label="Time" required>
                                    <select
                                        value={dropoffTime}
                                        onChange={(e) => setDropoffTime(e.target.value)}
                                        className={cn(inputClass, "cursor-pointer")}
                                    >
                                        {TIME_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* Return Card */}
                        <div className="bg-accent/40 rounded-lg p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-foreground">Return Schedule</p>
                                <span className="text-[10px] font-medium text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {returnDisplay || "Not Selected"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Date" required>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={returnDate}
                                        min={dropoffDate || today}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        required
                                    />
                                </Field>

                                <Field label="Time" required>
                                    <select
                                        value={returnTime}
                                        onChange={(e) => setReturnTime(e.target.value)}
                                        className={cn(inputClass, "cursor-pointer")}
                                    >
                                        {TIME_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                        <div className="text-sm text-destructive font-medium">{searchError}</div>

                        <button
                            type="button"
                            onClick={searchProducts}
                            disabled={searchLoading}
                            className={cn(
                                "btn-primary px-8 py-2.5 rounded-lg font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50",
                                searchLoading && "animate-pulse"
                            )}
                        >
                            {searchLoading ? "Consulting Pricing..." : "Find Best Rates"}
                        </button>
                    </div>
                </div>

                {/* ===========================
            SECTION 2 — PRODUCTS (CARD UI)
        ============================ */}
                {products.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                Optimal Solutions Found
                            </h3>
                            <span className="text-xs font-semibold text-muted-foreground bg-accent/50 px-2.5 py-1 rounded-md border border-border/50">
                                {products.length} {products.length === 1 ? 'Option' : 'Options'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((p) => {
                                const img = safeImage(p.image_url || p.image_data);
                                const isActive = selectedProduct?.id === p.id;

                                return (
                                    <div
                                        key={p.id}
                                        className={cn(
                                            "relative group overflow-hidden bg-background border rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                            isActive ? "border-primary ring-1 ring-primary/50 shadow-lg" : "border-border/50 shadow-sm"
                                        )}
                                    >
                                        {/* Image wrapper with gradient overlay */}
                                        <div className="h-44 bg-accent/20 relative overflow-hidden group">
                                            {img ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={img}
                                                    alt={p.product_name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                    <Package className="w-8 h-8 opacity-20" />
                                                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">No Preview</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Premium Service</span>
                                            </div>
                                        </div>

                                        {/* Content container */}
                                        <div className="p-5">
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-base leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                                                        {p.product_name}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <Tag className="w-3 h-3 text-primary/70" />
                                                        <span className="text-xs font-medium text-muted-foreground">{p.service_type || "Standard"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Rate</p>
                                                    <p className="text-xl font-black text-foreground">£{p.total_price}</p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setBooking((prev) => ({
                                                        ...prev,
                                                        depart_terminal: "",
                                                        return_terminal: "",
                                                    }));
                                                }}
                                                className={cn(
                                                    "w-full py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                                                    isActive 
                                                        ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20" 
                                                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                                                )}
                                            >
                                                {isActive ? "Selected Plan" : "Select Plan"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ===========================
            SECTION 3 — BOOKING FORM (ADMIN UI)
        ============================ */}
                {selectedProduct && (
                    <form onSubmit={createBooking}>
                        {/* Summary strip */}
                        <div className="glass border border-primary/20 p-6 mb-8 rounded-xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Active Selection</p>
                                    <p className="text-xl font-bold text-foreground">{selectedProduct.product_name}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/50 rounded text-[10px] font-bold text-muted-foreground border border-border/50 uppercase">
                                            <Tag size={10} /> {selectedProduct.service_type || "Standard"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2 bg-background/50 border border-border rounded-lg flex flex-col">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Drop-off</span>
                                        <span className="text-sm font-semibold text-foreground">{dropoffDisplay} <span className="text-muted-foreground text-xs">{dropoffTime}</span></span>
                                    </div>
                                    <div className="px-4 py-2 bg-background/50 border border-border rounded-lg flex flex-col">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Return</span>
                                        <span className="text-sm font-semibold text-foreground">{returnDisplay} <span className="text-muted-foreground text-xs">{returnTime}</span></span>
                                    </div>
                                    <div className="px-5 py-2 bg-primary text-primary-foreground rounded-lg flex flex-col shadow-lg shadow-primary/20 self-center lg:self-auto">
                                        <span className="text-[9px] font-bold uppercase tracking-widest mb-0.5 opacity-80">Total Payable</span>
                                        <span className="text-lg font-black leading-none">£{totalPayable.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===========================
                SECTION A — CUSTOMER INFO
            ============================ */}
                        {/* ===========================
                SECTION A — CUSTOMER INFO
            ============================ */}
                        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                Customer Contact Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Field label="Title" required>
                                    <select
                                        name="title"
                                        value={booking.title}
                                        onChange={handleBookingChange}
                                        className={cn(inputClass, "cursor-pointer")}
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option>Mr</option>
                                        <option>Mrs</option>
                                        <option>Miss</option>
                                        <option>Ms</option>
                                    </select>
                                </Field>

                                <Field label="First Name" required>
                                    <input
                                        name="first_name"
                                        value={booking.first_name}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required
                                    />
                                </Field>

                                <Field label="Last Name" required>
                                    <input
                                        name="last_name"
                                        value={booking.last_name}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required
                                    />
                                </Field>

                                <Field label="Email Address" required>
                                    <input
                                        type="email"
                                        name="email"
                                        value={booking.email}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required
                                    />
                                </Field>

                                <Field label="Mobile / WhatsApp" required>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={booking.mobile}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* ===========================
                SECTION B — TRAVEL DETAILS
            ============================ */}


                        <div className={cn(
                            "bg-card border border-border rounded-xl p-6 mb-8 shadow-sm transition-opacity duration-300",
                            hasTravel === "no" && "opacity-60"
                        )}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    Terminal & Flight Log
                                </h3>

                                <div className="flex bg-accent/40 p-1.5 rounded-lg gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setHasTravel("yes")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                            hasTravel === "yes" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/60"
                                        )}
                                    >
                                        RECORD FLIGHT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHasTravel("no")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                            hasTravel === "no" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/60"
                                        )}
                                    >
                                        SKIP DETAILS
                                    </button>
                                </div>
                            </div>

                            {hasTravel === "yes" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <Field label="Departure Terminal">
                                        <select
                                            name="depart_terminal"
                                            value={booking.depart_terminal}
                                            onChange={handleBookingChange}
                                            className={cn(inputClass, "cursor-pointer")}
                                        >
                                            <option value="">Select Terminal</option>
                                            {filteredTerminals.map((t) => (
                                                <option key={t.terminal_id} value={t.terminal_code}>
                                                    {t.terminal_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Outgoing Flight No">
                                        <input
                                            type="text"
                                            name="depart_flight"
                                            value={booking.depart_flight}
                                            onChange={handleBookingChange}
                                            className={inputClass}
                                            placeholder="e.g. BA123"
                                        />
                                    </Field>

                                    <Field label="Arrival Terminal">
                                        <select
                                            name="return_terminal"
                                            value={booking.return_terminal}
                                            onChange={handleBookingChange}
                                            className={cn(inputClass, "cursor-pointer")}
                                        >
                                            <option value="">Select Terminal</option>
                                            {filteredTerminals.map((t) => (
                                                <option key={t.terminal_id} value={t.terminal_code}>
                                                    {t.terminal_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Inbound Flight No">
                                        <input
                                            type="text"
                                            name="return_flight"
                                            value={booking.return_flight}
                                            onChange={handleBookingChange}
                                            className={inputClass}
                                            placeholder="e.g. CX456"
                                        />
                                    </Field>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-4 bg-accent/20 rounded-lg dashed border-2 border-border/50">
                                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-50">Flight logistics not being tracked for this entry</p>
                                </div>
                            )}
                        </div>

                        {/* ===========================
                SECTION C — VEHICLE DETAILS
            ============================ */}
                        <div className={cn(
                            "bg-card border border-border rounded-xl p-6 mb-8 shadow-sm transition-opacity duration-300",
                            hasVehicle === "no" && "opacity-60"
                        )}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    Vehicle Identification
                                </h3>

                                <div className="flex bg-accent/40 p-1.5 rounded-lg gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setHasVehicle("yes")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                            hasVehicle === "yes" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/60"
                                        )}
                                    >
                                        TRACK VEHICLE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHasVehicle("no")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                            hasVehicle === "no" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/60"
                                        )}
                                    >
                                        NOT APPLICABLE
                                    </button>
                                </div>
                            </div>

                            {hasVehicle === "yes" ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <Field label="Make">
                                            <input
                                                type="text"
                                                name="vehicle_make"
                                                value={booking.vehicle_make}
                                                onChange={handleBookingChange}
                                                className={inputClass}
                                                placeholder="e.g. BMW"
                                            />
                                        </Field>

                                        <Field label="Model">
                                            <input
                                                type="text"
                                                name="vehicle_model"
                                                value={booking.vehicle_model}
                                                onChange={handleBookingChange}
                                                className={inputClass}
                                                placeholder="e.g. X5 M-Sport"
                                            />
                                        </Field>

                                        <Field label="Colour">
                                            <input
                                                type="text"
                                                name="vehicle_colour"
                                                value={booking.vehicle_colour}
                                                onChange={handleBookingChange}
                                                className={inputClass}
                                                placeholder="e.g. San Marino Blue"
                                            />
                                        </Field>

                                        <Field label="VRM (Registration)">
                                            <input
                                                type="text"
                                                name="vehicle_reg"
                                                value={booking.vehicle_reg}
                                                onChange={handleBookingChange}
                                                className={cn(inputClass, "uppercase")}
                                                placeholder="e.g. AB12 CDE"
                                            />
                                        </Field>
                                    </div>

                                    <div className="max-w-xs">
                                        <Field label="Guest Passengers Count">
                                            <select
                                                name="passengers"
                                                value={booking.passengers}
                                                onChange={handleBookingChange}
                                                className={cn(inputClass, "cursor-pointer")}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                                    <option key={n} value={String(n)}>
                                                        {n} {n === 1 ? 'Person' : 'People'}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-4 bg-accent/20 rounded-lg dashed border-2 border-border/50">
                                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-50">Vehicle identification skipped</p>
                                </div>
                            )}
                        </div>

                        {/* ===========================
                SECTION D — OPTIONS & NOTES
            ============================ */}
                        {/* ===========================
OPTIONS & PAYMENT SUMMARY
=========================== */}
                        {/* ===========================
OPTIONS & PAYMENT SUMMARY
=========================== */}
                        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* LEFT — ADD ONS */}
                                <div className="lg:col-span-2">
                                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        Protection & Add-ons
                                    </h3>

                                    <label className={cn(
                                        "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-300",
                                        booking.cancellation_cover 
                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                            : "border-border hover:border-primary/30 hover:bg-accent/30"
                                    )}>
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                name="cancellation_cover"
                                                checked={booking.cancellation_cover}
                                                onChange={handleBookingChange}
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm text-foreground">
                                                    {charges.cancellation?.name || "Cancellation & Late Return Cover"}
                                                </span>
                                                <span className="font-black text-sm text-primary">
                                                    + £{charges.cancellation?.price?.toFixed(2) ?? "0.00"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Protect the booking against unforeseen changes or late flight returns. Highly recommended for flexible itineraries.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* RIGHT — PAYMENT SUMMARY */}
                                <div className="bg-accent/40 rounded-xl p-6 border border-border/50 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Financial Summary</h4>

                                        <div className="space-y-4 text-sm font-medium">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Standard Rate</span>
                                                <span className="text-foreground">£{quoteFee.toFixed(2)}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Processing Fee</span>
                                                <span className="text-foreground">£{bookingFee.toFixed(2)}</span>
                                            </div>

                                            {booking.cancellation_cover && (
                                                <div className="flex justify-between items-center text-primary">
                                                    <span className="flex items-center gap-1.5">
                                                        <Shield size={12} />
                                                        Protection
                                                    </span>
                                                    <span>£{cancellationFee.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 pt-5 mt-6 flex justify-between items-end">
                                        <div>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Total Value</span>
                                            <span className="text-2xl font-black text-foreground">
                                                £{totalPayable.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="bg-primary/20 text-primary px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-1">
                                            GBP
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>



                        {/* ===========================
                SUBMIT
            ============================ */}
                        {/* ===========================
                SUBMIT
            ============================ */}
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-6 border-t border-border/50">
                            <div className={cn(
                                "text-sm font-bold flex items-center gap-2",
                                message.includes("✅") ? "text-primary bg-primary/10 px-4 py-2 rounded-lg border border-primary/20" : "text-destructive"
                            )}>
                                {message}
                            </div>

                            <div className="flex gap-4 flex-wrap w-full lg:w-auto">
                                <button
                                    type="submit"
                                    className="flex-1 lg:flex-none border border-border bg-background text-foreground hover:bg-accent px-6 py-3 rounded-xl font-bold transition-all"
                                >
                                    Draft Booking
                                </button>

                                <button
                                    type="button"
                                    onClick={sendInvoice}
                                    disabled={invoiceLoading}
                                    className="flex-1 lg:flex-none border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {invoiceLoading ? "Generating..." : "E-mail Invoice"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex-1 lg:flex-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
                                >
                                    Activate & Confirm (£{totalPayable.toFixed(2)})
                                </button>
                            </div>
                        </div>

                        {invoiceMessage && (
                            <div className={cn(
                                "mt-4 p-3 rounded-lg text-xs font-bold border max-w-fit",
                                invoiceMessage.includes("✅") ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                {invoiceMessage}
                            </div>
                        )}
                    </form>
                )}



                {/* If no products yet */}
                {products.length === 0 && !searchLoading && !searchError && (
                    <p className="text-xs text-gray-500">
                        Choose drop-off and return dates, then search to see products and dynamic pricing.
                    </p>
                )}
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
                    <div className="bg-card border border-border w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Transaction Override</h2>
                                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-0.5">Payment Activation Panel</p>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            To manually activate this booking, please provide the <span className="font-bold text-foreground">Stripe Payment Intent ID</span> (format: pi_xxx). This will bypass normal payment flows and mark the entry as PAID.
                        </p>

                        <div className="space-y-4 mb-8">
                            <Field label="Security / Intent ID">
                                <input
                                    value={paymentIntentId}
                                    onChange={(e) => setPaymentIntentId(e.target.value)}
                                    placeholder="pi_XXXXXXXXXXXX"
                                    className={cn(inputClass, "font-mono")}
                                />
                            </Field>

                            {paymentMessage && (
                                <div className={cn(
                                    "p-3 rounded-lg text-xs font-bold border",
                                    paymentMessage.includes("✅") ? "bg-primary/20 text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/20"
                                )}>
                                    {paymentMessage}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 font-bold">
                            <button
                                onClick={verifyAndActivatePayment}
                                disabled={paymentLoading}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {paymentLoading ? "Authenticating..." : "Finalize Activation"}
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full py-3 bg-accent text-foreground rounded-xl hover:bg-accent/80 transition-all"
                            >
                                Cancel Operation
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </ProtectedRoute>
    );
}
