"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  User,
  Truck,
  Plane,
  ClipboardList,
  Info,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { backendProxyPath } from "@/app/lib/backendProxy";

type Job = {
  id: number;
  booking_id: string;
  booking_ref: string;
  customer_name: string;
  airport_id: number;
  product_id: number;
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

function DisplayField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value ?? "—"}</p>
    </div>
  );
}

export default function CreateJobOperationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id");

  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [operationType, setOperationType] = useState("Receive");
  const [driverId, setDriverId] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (!jobId) {
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
        }
      })
      .catch(() => toast.error("Failed to load job details"))
      .finally(() => setJobLoading(false));
  }, [jobId]);

  const fetchDrivers = async () => {
    try {
      const res = await fetch(backendProxyPath("/api/tracking/drivers"), { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setDrivers(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId || !job) {
      toast.error("Job ID is required. Open this page from a job.");
      return;
    }

    if (!driverId) {
      toast.error("Please assign a driver");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(backendProxyPath("/api/tracking/operations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: Number(jobId),
          operation_type: operationType,
          driver_id: Number(driverId),
        }),
        credentials: "include",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Job operation assigned successfully");
        router.push("/tracking/job-operations");
      } else {
        toast.error(json.message || "Failed to create operation");
      }
    } catch (err) {
      console.error("Create operation error", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full max-w-screen-2xl mx-auto space-y-6 pb-20">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                Assign Job Operation
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Job details are shown for reference. Only driver and operation type are saved here — other fields are completed via the mobile app.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-fit rounded-xl gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        {!jobId ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              No job selected. Open this page from Jobs using <strong>Add Operation</strong>.
            </CardContent>
          </Card>
        ) : jobLoading ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading job details…
            </CardContent>
          </Card>
        ) : !job ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-12 text-center text-destructive">
              Job not found.
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Booking & Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DisplayField label="Job ID" value={job.id} />
                <DisplayField label="Booking Ref" value={job.booking_ref} />
                <DisplayField label="Booking ID" value={job.booking_id} />
                <DisplayField label="Customer" value={job.customer_name} />
                <DisplayField label="Booking Date" value={fmtDate(job.booking_date)} />
                <DisplayField label="Passengers" value={job.passengers} />
                <DisplayField label="Parking Days" value={job.parkingdays} />
                <DisplayField label="Booking Note" value={job.bookingnote || "—"} />
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DisplayField label="Make" value={job.vehiclemake} />
                <DisplayField label="Model" value={job.vehiclemodel} />
                <DisplayField label="Colour" value={job.vehiclecolour} />
                <DisplayField label="Registration" value={job.vehicleregnumber} />
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  Depart & Return
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Depart</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DisplayField label="Date & Time" value={fmtDateTime(job.depdatetime)} />
                    <DisplayField label="Flight" value={job.depflight} />
                    <DisplayField label="Terminal ID" value={job.depterminal_id} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Return</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DisplayField label="Date & Time" value={fmtDateTime(job.returndatetime)} />
                    <DisplayField label="Flight" value={job.returnflight} />
                    <DisplayField label="Terminal ID" value={job.returnterminal_id} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-md">
              <CardHeader className="border-b border-border/60 py-4 bg-primary/5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Assign Operation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Operation Type</Label>
                  <Select value={operationType} onValueChange={setOperationType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receive">Receive</SelectItem>
                      <SelectItem value="Shift">Shift</SelectItem>
                      <SelectItem value="Return">Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assign Driver
                  </Label>
                  <Select value={driverId} onValueChange={setDriverId}>
                    <SelectTrigger className="rounded-xl">
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
              </CardContent>
            </Card>

            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-6 rounded-xl text-base font-bold gap-2"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {loading ? "Saving…" : "Save Assignment"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}
