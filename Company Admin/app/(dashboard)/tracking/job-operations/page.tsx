"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, List, Eye, Trash2, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type JobOperation = {
  id: number;
  job_id: number;
  operation_type: string;
  driver_id: number;
  status: string;
  booking_ref: string;
  customer_name: string;
  vehiclemake: string;
  vehiclemodel: string;
  vehicleregnumber: string;
  vehiclecolour: string;
  created_at: string;
  driver_first?: string;
  driver_last?: string;
};

type StatusCounts = Record<string, Record<string, number>>;

function statusDotClass(status: string) {
  switch (status?.toLowerCase()) {
    case "parked":
    case "completed":
    case "delivered":
      return "bg-emerald-500";
    case "started":
    case "ontheway":
    case "in_progress":
      return "bg-orange-500";
    case "accepted":
      return "bg-cyan-500";
    case "pending":
      return "bg-blue-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-slate-500 dark:bg-slate-400";
  }
}

function statusBadgeClass(status: string) {
  switch (status?.toLowerCase()) {
    case "parked":
    case "completed":
    case "delivered":
      return "bg-emerald-500/90 text-white dark:bg-emerald-600";
    case "started":
    case "ontheway":
    case "in_progress":
      return "bg-orange-500/90 text-white dark:bg-orange-600";
    case "accepted":
      return "bg-cyan-500/90 text-white dark:bg-cyan-600";
    case "pending":
      return "bg-blue-500/90 text-white dark:bg-blue-600";
    case "cancelled":
      return "bg-red-500/90 text-white dark:bg-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function operationBadgeClass(type: string) {
  switch (type) {
    case "Receive":
      return "bg-blue-500/90 text-white dark:bg-blue-600";
    case "Return":
      return "bg-cyan-500/90 text-white dark:bg-cyan-600";
    case "Shift":
      return "bg-orange-500/90 text-white dark:bg-orange-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function JobOperationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [operations, setOperations] = useState<JobOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
  const [opTypeCounts, setOpTypeCounts] = useState<Record<string, number>>({});
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    if (searchParams.get("view") === "calendar") {
      setView("calendar");
    }
  }, [searchParams]);

  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [selectedDateDetails, setSelectedDateDetails] = useState<{ date: string; type: string } | null>(null);
  const [dateDetails, setDateDetails] = useState<JobOperation[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("all");

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (view === "list") {
      fetchOperations();
    } else if (currentMonth) {
      fetchCalendarData();
    }
  }, [view, statusFilter, typeFilter, currentMonth]);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const typeQuery = typeFilter === "all" ? "" : typeFilter;
      const res = await fetch(
        backendProxyPath(`/api/tracking/operations?status=${statusFilter}&operation_type=${typeQuery}`),
        { credentials: "include" }
      );
      const json = await res.json();
      if (json.success) {
        setOperations(json.data);
        setStatusCounts(json.statusCounts);
        setOpTypeCounts(json.operationTypeCounts);
      }
    } catch (err) {
      console.error("Failed to fetch operations", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this operation?")) return;
    try {
      const res = await fetch(backendProxyPath(`/api/tracking/operations/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Operation deleted");
        fetchOperations();
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const fetchCalendarData = async () => {
    try {
      const driverQuery = selectedDriver !== "all" ? `?driver_id=${selectedDriver}` : "";
      const res = await fetch(backendProxyPath(`/api/tracking/operations/calendar${driverQuery}`), {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setCalendarData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch calendar data", err);
    }
  };

  const handleFetchDetails = async (date: string, type: string) => {
    try {
      const res = await fetch(
        backendProxyPath(`/api/tracking/operations/details?date=${date}&type=${type}`),
        { credentials: "include" }
      );
      const json = await res.json();
      if (json.success) {
        setDateDetails(json.data);
        setSelectedDateDetails({ date, type });
      }
    } catch (err) {
      console.error("Failed to fetch details", err);
    }
  };

  const StatusCard = ({
    title,
    counts,
    total,
  }: {
    title: string;
    counts: Record<string, number>;
    total: number;
  }) => (
    <div className="glass border-border/50 p-5 rounded-2xl shadow-sm flex-1 min-w-[280px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-foreground text-lg">{title}</h3>
        <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-none">
          {total}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(counts || {}).map(([status, count]) => (
          <div
            key={status}
            className="flex justify-between items-center p-2 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/60"
          >
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", statusDotClass(status))} />
              <span className="text-sm font-medium text-muted-foreground capitalize">{status}</span>
            </div>
            <span className="text-sm font-bold text-foreground">({count})</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendar = () => {
    if (!currentMonth) {
      return (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(start);
    const calendarStart = startOfWeek(start);
    const calendarEnd = endOfWeek(end);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-6">
        <div className="glass border-border/50 p-6 rounded-2xl shadow-sm space-y-4">
          <p className="text-sm font-bold text-foreground">Filter by Driver</p>
          <div className="flex flex-wrap gap-3 max-w-md">
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="rounded-xl border-border bg-background text-foreground">
                <SelectValue placeholder="All Drivers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.first_name} {d.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchCalendarData} className="rounded-xl gap-2 px-6">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="glass border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-border/60">
            <Button
              variant="outline"
              className="rounded-xl gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-extrabold text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
            </div>
            <Button
              variant="outline"
              className="rounded-xl gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 border-b border-border/60">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <div
                key={day}
                className="py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/40 dark:bg-muted/20"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-background/50">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const data = calendarData[dateStr] || { receive: 0, return: 0, shift: 0, total: 0 };
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "min-h-[140px] border-b border-r border-border/60 p-4 transition-colors hover:bg-muted/30 dark:hover:bg-muted/20",
                    !isCurrentMonth && "bg-muted/20 dark:bg-muted/10 opacity-60"
                  )}
                >
                  <div className="flex justify-start mb-4">
                    <span
                      className={cn(
                        "text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center transition-colors",
                        isToday
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {data.total > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFetchDetails(dateStr, "Receive")}
                          className="w-full flex justify-between items-center px-2 py-1 bg-blue-500 dark:bg-blue-600 text-white text-[10px] font-bold rounded-md shadow-sm hover:opacity-90 transition-opacity"
                        >
                          <span>Rec:</span>
                          <span className="bg-white/20 px-1.5 rounded">{data.receive}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFetchDetails(dateStr, "Return")}
                          className="w-full flex justify-between items-center px-2 py-1 bg-cyan-500 dark:bg-cyan-600 text-white text-[10px] font-bold rounded-md shadow-sm hover:opacity-90 transition-opacity"
                        >
                          <span>Ret:</span>
                          <span className="bg-white/20 px-1.5 rounded">{data.return}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFetchDetails(dateStr, "Shift")}
                          className="w-full flex justify-between items-center px-2 py-1 bg-orange-500 dark:bg-orange-600 text-white text-[10px] font-bold rounded-md shadow-sm hover:opacity-90 transition-opacity"
                        >
                          <span>Shf:</span>
                          <span className="bg-white/20 px-1.5 rounded">{data.shift}</span>
                        </button>
                        <div className="pt-1 mt-1 border-t border-border/60 flex justify-between items-center text-[10px] font-bold text-muted-foreground px-1">
                          <span>Total:</span>
                          <span>{data.total}</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center py-4">
                        <span className="text-[11px] font-medium text-muted-foreground/60 italic">No jobs</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 p-6 glass border-border/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-500 dark:bg-blue-600" />
            <span className="text-xs font-bold text-muted-foreground">Receive Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500 dark:bg-cyan-600" />
            <span className="text-xs font-bold text-muted-foreground">Return Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-orange-500 dark:bg-orange-600" />
            <span className="text-xs font-bold text-muted-foreground">Shift Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-500 dark:bg-slate-400" />
            <span className="text-xs font-bold text-muted-foreground">Total Jobs</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="w-full space-y-6 pb-10 p-1">
        <div className="glass border-border/50 p-5 rounded-2xl shadow-sm flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
              <CalendarIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Job Operations</h1>
              <p className="text-sm text-muted-foreground font-medium">Manage and track all vehicle operations</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-muted/60 dark:bg-muted/40 p-1 rounded-xl border border-border/50">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                onClick={() => setView("list")}
                className={cn(
                  "rounded-lg px-6",
                  view !== "list" && "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <List className="h-4 w-4 mr-2" /> List View
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "ghost"}
                onClick={() => setView("calendar")}
                className={cn(
                  "rounded-lg px-6",
                  view !== "calendar" && "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <CalendarIcon className="h-4 w-4 mr-2" /> Calendar View
              </Button>
            </div>
            <Button className="rounded-xl shadow-md" onClick={() => router.push("/tracking/job-operations/create")}>
              Create Operations
            </Button>
          </div>
        </div>

        {view === "list" ? (
          <>
            <div className="flex flex-wrap gap-6">
              <StatusCard title="Receive Jobs" counts={statusCounts["Receive"] || {}} total={opTypeCounts["Receive"] || 0} />
              <StatusCard title="Return Jobs" counts={statusCounts["Return"] || {}} total={opTypeCounts["Return"] || 0} />
              <StatusCard title="Shift Jobs" counts={statusCounts["Shift"] || {}} total={opTypeCounts["Shift"] || 0} />
            </div>

            <div className="glass border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border/60 bg-muted/30 dark:bg-muted/20 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Filters</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 min-w-[160px] rounded-xl border-border bg-background text-foreground">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="ontheway">On The Way</SelectItem>
                      <SelectItem value="parked">Parked</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-10 min-w-[160px] rounded-xl border-border bg-background text-foreground">
                      <SelectValue placeholder="All Operations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Operations</SelectItem>
                      <SelectItem value="Receive">Receive</SelectItem>
                      <SelectItem value="Return">Return</SelectItem>
                      <SelectItem value="Shift">Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 dark:bg-muted/20">
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="w-12 text-center font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                        #
                      </TableHead>
                      <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                        Booking Ref
                      </TableHead>
                      <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                        Customer
                      </TableHead>
                      <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                        Vehicle Details
                      </TableHead>
                      <TableHead className="text-center font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                        Operation
                      </TableHead>
                      <TableHead className="text-center font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-center font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow className="border-border/60">
                        <TableCell colSpan={7} className="text-center py-20">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <span className="text-muted-foreground font-medium italic">Synchronizing operations...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : operations.length === 0 ? (
                      <TableRow className="border-border/60">
                        <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                          No operations found for the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      operations.map((op, idx) => (
                        <TableRow
                          key={op.id}
                          className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors group border-border/60"
                        >
                          <TableCell className="text-center font-medium text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-bold text-foreground">{op.booking_ref}</TableCell>
                          <TableCell>
                            <div className="font-bold text-foreground">{op.customer_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-bold text-foreground">
                              {op.vehiclemake} {op.vehiclemodel}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-tighter">
                              {op.vehicleregnumber} • {op.vehiclecolour}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn(operationBadgeClass(op.operation_type), "border-none px-3 py-1")}>
                              {op.operation_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={cn(
                                statusBadgeClass(op.status),
                                "border-none px-3 py-1 uppercase text-[10px] font-bold tracking-wider"
                              )}
                            >
                              {op.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg"
                                onClick={() => router.push(`/tracking/job-operations/${op.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-lg"
                                onClick={() => handleDelete(op.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        ) : (
          renderCalendar()
        )}

        <Dialog open={!!selectedDateDetails} onOpenChange={() => setSelectedDateDetails(null)}>
          <DialogContent className="max-w-6xl rounded-3xl p-0 overflow-hidden border border-border bg-background text-foreground shadow-2xl">
            <DialogHeader className="p-6 glass border-b border-border/60 flex flex-row justify-between items-center space-y-0">
              <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-3">
                <div className="p-2 bg-muted/50 dark:bg-muted/30 rounded-xl">
                  <List className="h-5 w-5 text-muted-foreground" />
                </div>
                {selectedDateDetails?.type} Jobs - {selectedDateDetails?.date}
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 bg-muted/20 dark:bg-muted/10">
              <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 dark:bg-muted/20">
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="font-bold text-muted-foreground py-4 px-6">Driver</TableHead>
                        <TableHead className="font-bold text-muted-foreground py-4 px-6">Job ID</TableHead>
                        <TableHead className="font-bold text-muted-foreground py-4 px-6">Booking Ref</TableHead>
                        <TableHead className="font-bold text-muted-foreground py-4 px-6">Customer</TableHead>
                        <TableHead className="font-bold text-muted-foreground py-4 px-6">Vehicle</TableHead>
                        <TableHead className="text-center font-bold text-muted-foreground py-4 px-6">Status</TableHead>
                        <TableHead className="text-center font-bold text-muted-foreground py-4 px-6">Start Condition</TableHead>
                        <TableHead className="text-center font-bold text-muted-foreground py-4 px-6">End Condition</TableHead>
                        <TableHead className="font-bold text-muted-foreground py-4 px-6">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dateDetails.map((op) => (
                        <TableRow
                          key={op.id}
                          className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors border-border/60"
                        >
                          <TableCell className="font-bold text-foreground py-4 px-6">
                            {op.driver_first} {op.driver_last || `Driver #${op.driver_id}`}
                          </TableCell>
                          <TableCell className="font-bold text-muted-foreground py-4 px-6">{op.job_id}</TableCell>
                          <TableCell className="font-bold text-foreground py-4 px-6">{op.booking_ref}</TableCell>
                          <TableCell className="font-medium text-muted-foreground py-4 px-6">{op.customer_name}</TableCell>
                          <TableCell className="text-muted-foreground py-4 px-6">
                            <div className="text-sm font-bold text-foreground">
                              {op.vehiclemake} {op.vehiclemodel}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground">({op.vehicleregnumber})</div>
                          </TableCell>
                          <TableCell className="text-center py-4 px-6">
                            <Badge
                              className={cn(
                                statusBadgeClass(op.status),
                                "border-none px-3 py-1 text-[11px] font-bold shadow-sm"
                              )}
                            >
                              {op.status.charAt(0).toUpperCase() + op.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center py-4 px-6">
                            <Badge className="bg-emerald-500/90 dark:bg-emerald-600 border-none text-[10px] font-bold px-2 py-0.5 text-white">
                              OK
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center py-4 px-6">
                            <Badge className="bg-emerald-500/90 dark:bg-emerald-600 border-none text-[10px] font-bold px-2 py-0.5 text-white">
                              OK
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs py-4 px-6">
                            {op.created_at ? format(new Date(op.created_at), "yyyy-MM-dd HH:mm") : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 glass border-t border-border/60 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedDateDetails(null)} className="rounded-xl px-8 gap-2 font-bold border-border">
                <X className="h-4 w-4" /> Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
