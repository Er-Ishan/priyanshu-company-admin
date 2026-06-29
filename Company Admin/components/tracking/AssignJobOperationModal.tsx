"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { Save, User, ClipboardList } from "lucide-react";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { cn } from "@/lib/utils";

type Job = {
  id: number;
  booking_id: string;
  booking_ref: string;
  customer_name: string;
  passengers: number;
  vehiclemake: string;
  vehiclemodel: string;
  vehiclecolour: string;
  vehicleregnumber: string;
  booking_date: string;
  depdatetime: string;
  depflight: string;
  depterminal_id: number;
  returndatetime: string;
  returnflight: string;
  returnterminal_id: number;
  parkingdays: number;
  bookingnote: string;
};

type Driver = {
  id: number;
  first_name: string;
  last_name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: number;
  onSaved?: () => void;
};

function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy HH:mm");
  } catch {
    return value;
  }
}

function fmtDate(value?: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

function DisplayField({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground leading-none">{label}</p>
      <p className="text-xs font-semibold text-foreground truncate mt-0.5" title={String(value ?? "")}>
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function AssignJobOperationModal({
  open,
  onOpenChange,
  jobId,
  onSaved,
}: Props) {
  const [jobLoading, setJobLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [operationType, setOperationType] = useState("Receive");
  const [driverId, setDriverId] = useState("");

  useEffect(() => {
    if (!open) return;

    fetch(backendProxyPath("/api/tracking/drivers"), { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setDrivers(json.data);
      })
      .catch(() => {});

    setOperationType("Receive");
    setDriverId("");
  }, [open]);

  useEffect(() => {
    if (!open || !jobId) {
      setJob(null);
      setJobLoading(false);
      return;
    }

    setJobLoading(true);
    fetch(backendProxyPath(`/api/tracking/jobs/${jobId}`), { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setJob(json.data);
        } else {
          toast.error(json.message || "Job not found");
          onOpenChange(false);
        }
      })
      .catch(() => {
        toast.error("Failed to load job details");
        onOpenChange(false);
      })
      .finally(() => setJobLoading(false));
  }, [open, jobId, onOpenChange]);

  const handleSave = async () => {
    if (!jobId || !job) return;

    if (!driverId) {
      toast.error("Please assign a driver");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(backendProxyPath("/api/tracking/operations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          job_id: jobId,
          operation_type: operationType,
          driver_id: Number(driverId),
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Operation assigned successfully");
        onOpenChange(false);
        onSaved?.();
      } else {
        toast.error(json.message || "Failed to assign operation");
      }
    } catch {
      toast.error("Failed to assign operation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl overflow-hidden flex flex-col p-0 gap-0 border-border bg-background text-foreground">
        <DialogHeader className="px-5 py-3 border-b border-border/60 shrink-0">
          <DialogTitle className="text-base font-bold text-foreground">Assign Job Operation</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-3 space-y-3 shrink-0">
          {jobLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !job ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No job selected.</p>
          ) : (
            <>
              <div className="rounded-lg border border-border/60 bg-muted/20 dark:bg-muted/10 px-3 py-2.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">Booking & Customer</p>
                <div className="grid grid-cols-4 gap-x-3 gap-y-2">
                  <DisplayField label="Booking Ref" value={job.booking_ref} />
                  <DisplayField label="Booking ID" value={job.booking_id} />
                  <DisplayField label="Customer" value={job.customer_name} />
                  <DisplayField label="Booking Date" value={fmtDate(job.booking_date)} />
                  <DisplayField label="Passengers" value={job.passengers} />
                  <DisplayField label="Parking Days" value={job.parkingdays} />
                  <DisplayField label="Note" value={job.bookingnote || "—"} className="col-span-2" />
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 dark:bg-muted/10 px-3 py-2.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">Vehicle</p>
                <div className="grid grid-cols-4 gap-x-3 gap-y-2">
                  <DisplayField label="Make" value={job.vehiclemake} />
                  <DisplayField label="Model" value={job.vehiclemodel} />
                  <DisplayField label="Colour" value={job.vehiclecolour} />
                  <DisplayField label="Registration" value={job.vehicleregnumber} />
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 dark:bg-muted/10 px-3 py-2.5 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">Depart & Return</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left font-bold pb-1 w-14" />
                      <th className="text-left font-bold pb-1">Date & Time</th>
                      <th className="text-left font-bold pb-1 w-20">Flight</th>
                      <th className="text-left font-bold pb-1 w-16">Terminal</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground font-semibold">
                    <tr>
                      <td className="py-0.5 text-muted-foreground font-bold">Depart</td>
                      <td className="py-0.5">{fmtDateTime(job.depdatetime)}</td>
                      <td className="py-0.5">{job.depflight || "—"}</td>
                      <td className="py-0.5">{job.depterminal_id ?? "—"}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-muted-foreground font-bold">Return</td>
                      <td className="py-0.5">{fmtDateTime(job.returndatetime)}</td>
                      <td className="py-0.5">{job.returnflight || "—"}</td>
                      <td className="py-0.5">{job.returnterminal_id ?? "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10 px-3 py-2.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  Assign Operation
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Operation Type</Label>
                    <Select value={operationType} onValueChange={setOperationType}>
                      <SelectTrigger className="h-9 rounded-lg border-border bg-background text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Receive">Receive</SelectItem>
                        <SelectItem value="Shift">Shift</SelectItem>
                        <SelectItem value="Return">Return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Assign Driver
                    </Label>
                    <Select value={driverId} onValueChange={setDriverId}>
                      <SelectTrigger className="h-9 rounded-lg border-border bg-background text-sm">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.first_name} {d.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/60 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-lg border-border">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || jobLoading || !job}
            className="rounded-lg gap-2"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving…" : "Save Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
