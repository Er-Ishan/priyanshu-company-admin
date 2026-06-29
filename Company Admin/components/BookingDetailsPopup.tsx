"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  booking: any;
  onClose: () => void;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month}, ${year}`;
};

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between py-1 gap-4">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="font-medium text-foreground text-right">{value || "-"}</span>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h4 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
    {title}
  </h4>
);

const statusClass = (status: string) => {
  if (status === "Confirmed" || status === "Active") return "bg-emerald-700 text-white";
  if (status === "Cancelled") return "bg-red-600 text-white";
  if (status === "Pending") return "bg-amber-500 text-white";
  if (status === "Extended") return "bg-orange-700 text-white";
  return "bg-muted text-muted-foreground";
};

export default function BookingDetailsPopup({ open, booking, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !booking || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-details-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 flex flex-1 flex-col w-full max-w-4xl mx-auto my-4 md:my-8 px-4 md:px-6 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass flex flex-1 flex-col min-h-0 rounded-3xl border border-border/50 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          {/* HEADER */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/30 shrink-0">
            <h3
              id="booking-details-title"
              className="text-base font-bold tracking-tight text-foreground"
            >
              Booking Details –{" "}
              <span className="text-primary">{booking.ref_no}</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SectionTitle title="Travel Info" />
                <InfoRow label="Booked On" value={formatDate(booking.booked_on) || "TBC"} />
                <InfoRow label="Drop-off" value={formatDate(booking.dropoff_datetime) || "TBC"} />
                <InfoRow label="Return" value={formatDate(booking.return_datetime) || "TBC"} />
              </div>
              <div>
                <SectionTitle title="Booking Info" />
                <InfoRow label="Product" value={booking.product_name || "TBC"} />
                <InfoRow label="Airport" value={booking.travelling_from || "TBC"} />
                <InfoRow label="Service" value={booking.service || "TBC"} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SectionTitle title="Customer Info" />
                <InfoRow label="Name" value={booking.customer_name || "TBC"} />
                <InfoRow label="Phone" value={booking.contact_no || booking.mobile || "TBC"} />
                <InfoRow label="Email" value={booking.customer_email || "TBC"} />
              </div>
              <div>
                <SectionTitle title="Flight Info" />
                <InfoRow label="Depart Flight" value={booking.depart_flight || "TBC"} />
                <InfoRow label="Depart Terminal" value={booking.depart_terminal || "TBC"} />
                <InfoRow label="Return Flight" value={booking.return_flight || "TBC"} />
                <InfoRow label="Return Terminal" value={booking.return_terminal || "TBC"} />
              </div>
            </div>

            <div>
              <SectionTitle title="Vehicle Details" />
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      {["Make", "Model", "Colour", "Reg"].map((h) => (
                        <th key={h} className="px-4 py-2 text-center font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 text-center py-2 font-medium">{booking.vehicle_make || "TBC"}</td>
                      <td className="px-4 text-center py-2 font-medium">{booking.vehicle_model || "TBC"}</td>
                      <td className="px-4 text-center py-2 font-medium">{booking.color || "TBC"}</td>
                      <td className="px-4 text-center py-2 font-semibold text-primary">
                        {booking.vehicle_reg_no || "TBC"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <SectionTitle title="Payment Summary" />
              <div className="border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      {["Quote", "Booking Fee", "Discount", "Total Paid", "Transaction ID", "Status"].map((h) => (
                        <th key={h} className="px-4 py-2 text-center font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 text-center py-2 font-medium">£{booking.quote_amount || "0.00"}</td>
                      <td className="px-4 text-center py-2 font-medium">£{booking.booking_fee || "0.00"}</td>
                      <td className="px-4 text-center py-2 font-medium">£{booking.discount || "0.00"}</td>
                      <td className="px-4 text-center py-2">£{booking.total_payable || "0.00"}</td>
                      <td className="px-4 text-center py-2 font-bold">{booking.transaction_id || "TBC"}</td>
                      <td className="px-4 text-center py-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusClass(booking.status)}`}>
                          {booking.status || "TBC"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <SectionTitle title="Extended Payment Summary" />
              <div className="border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      {["Quote", "Optional", "Extra Charge", "Total Payable", "Extended Transaction ID", "Status"].map((h) => (
                        <th key={h} className="px-4 py-2 text-center font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 text-center py-2 font-medium">£{booking.quote_amount || "0.00"}</td>
                      <td className="px-4 text-center py-2 font-medium">£{booking.optional || "0.00"}</td>
                      <td className="px-4 text-center py-2 font-medium">£{booking.extra_charge || "0.00"}</td>
                      <td className="px-4 text-center py-2">£{booking.total_payable || "0.00"}</td>
                      <td className="px-4 text-center py-2 font-bold">{booking.extended_transaction_id || "TBC"}</td>
                      <td className="px-4 text-center py-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusClass(booking.status)}`}>
                          {booking.status || "TBC"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4 bg-muted/30 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button type="button" onClick={onClose} className="rounded-xl px-6">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
