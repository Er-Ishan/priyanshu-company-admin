"use client";

import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Settings, List, Eye, ArrowLeft, Save, X, Info, Truck, Plane, ClipboardList, Home, ChevronRight, User, CheckCircle2, AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import AssignJobOperationModal from "@/components/tracking/AssignJobOperationModal";

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
  job_overall_status: string;
  park_operation_status: string;
  deliver_operation_status: string;
  park_completed_at: string;
  deliver_completed_at: string;
  bookingnote: string;
  created_at: string;
};

type Operation = {
  id: number;
  job_id: number;
  operation_type: string;
  driver_id: number;
  driver_name?: string;
  status: string;
  yard_id: number;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  start_condition_notes?: string;
  end_condition_notes?: string;
  damage?: string;
  created_at: string;
};

type Driver = {
  id: number;
  first_name: string;
  last_name: string;
  active_status: string;
};

type Terminal = {
  id: number;
  terminal_name: string;
};

type Airport = {
  airport_id: number;
  airport_name: string;
};

type Product = {
  id: number;
  product_name: string;
};

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [view, setView] = useState<"list" | "create" | "edit" | "operations">("list");
  const [currentJob, setCurrentJob] = useState<Partial<Job>>({});
  
  const [jobOperations, setJobOperations] = useState<Operation[]>([]);
  const [opsLoading, setOpsLoading] = useState(false);
  
  const [isAddOpOpen, setIsAddOpOpen] = useState(false);
  const [isAssignOpOpen, setIsAssignOpOpen] = useState(false);
  const [currentOp, setCurrentOp] = useState<Partial<Operation>>({});

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchDrivers();
    fetchAirports();
    fetchProducts();
  }, [page, search]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(backendProxyPath(`/api/tracking/jobs?page=${page}&search=${search}`), { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
        setTotal(json.total);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
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

  const fetchAirports = async () => {
    try {
      const res = await fetch(backendProxyPath("/api/airports"), { credentials: "include" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAirports(json.data);
      } else if (Array.isArray(json)) {
        setAirports(json);
      }
    } catch (err) {
      console.error("Failed to fetch airports", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(backendProxyPath("/api/parking/products"), { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchJobOperations = async (jobId: number) => {
    setOpsLoading(true);
    try {
      const res = await fetch(backendProxyPath(`/api/tracking/jobs/${jobId}/operations`), { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setJobOperations(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch operations", err);
    } finally {
      setOpsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(backendProxyPath(`/api/tracking/jobs/${id}`), { method: "DELETE", credentials: "include" });
      const json = await res.json();
      if (json.success) {
        toast.success("Job deleted successfully");
        fetchJobs();
      }
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  const handleOpenForm = (job?: Job) => {
    if (job) {
      setCurrentJob(job);
      setView("edit");
    } else {
      setCurrentJob({
        job_overall_status: "Pending",
        park_operation_status: "Not Started",
        deliver_operation_status: "Not Started",
        booking_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
      setView("create");
    }
  };

  const handleOpenOperationsView = (job: Job) => {
    setCurrentJob(job);
    fetchJobOperations(job.id);
    setView("operations");
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentJob?.id ? "PUT" : "POST";
    const url = currentJob?.id ? `/api/tracking/jobs/${currentJob.id}` : "/api/tracking/jobs";
    
    try {
      const res = await fetch(backendProxyPath(url), {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentJob),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(currentJob?.id ? "Job updated" : "Job created");
        setView("list");
        fetchJobs();
      }
    } catch (err) {
      toast.error("Failed to save job");
    }
  };

  const handleSaveOperation = async () => {
    try {
      const res = await fetch(backendProxyPath("/api/tracking/jobs/save-operations"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          job_id: currentJob.id, 
          operations: { [currentOp.operation_type!]: currentOp } 
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Operation saved");
        setIsAddOpOpen(false);
        fetchJobOperations(currentJob.id!);
      }
    } catch (err) {
      toast.error("Failed to save operation");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "parked": return <Badge className="bg-green-600">Parked</Badge>;
      case "in_progress": return <Badge className="bg-orange-500">In progress</Badge>;
      case "pending": return <Badge className="bg-blue-500">Pending</Badge>;
      case "not_started": return <Badge variant="outline" className="text-muted-foreground">Not started</Badge>;
      case "park_completed": return <Badge className="bg-blue-600">Park completed</Badge>;
      default: return <Badge variant="secondary">{status || "Not started"}</Badge>;
    }
  };

  const getConditionBadge = (cond: string) => {
    if (!cond || cond === "OK") return <Badge className="bg-green-500">OK</Badge>;
    return <Badge variant="destructive">{cond}</Badge>;
  };

  const getDamageBadge = (damage: string) => {
    if (damage === "Y") return <Badge variant="destructive">Yes</Badge>;
    return <Badge className="bg-green-500">No</Badge>;
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-6">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">{title}</h3>
    </div>
  );

  if (view === "operations") {
    return (
      <ProtectedRoute>
        <div className="w-full space-y-6 pb-20">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Job Operations - Job #{currentJob.id}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/" className="hover:text-primary">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <button onClick={() => setView("list")} className="hover:text-primary">Jobs</button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-400">Job #{currentJob.id}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-400">Operations</span>
              </div>
            </div>
          </div>

          <Card className="shadow-sm border-border bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex gap-12">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Ref</div>
                    <div className="text-sm font-bold text-slate-800">{currentJob.booking_ref}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Make</div>
                    <div className="text-sm font-bold text-slate-800">{currentJob.vehiclemake}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-slate-200 border border-slate-300"></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Color</div>
                    <div className="text-sm font-bold text-slate-800">{currentJob.vehiclecolour}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-50 rounded-lg">
                    <Info className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Reg</div>
                    <div className="text-sm font-bold text-slate-800">{currentJob.vehicleregnumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</div>
                    <div className="text-sm font-bold text-slate-800">{currentJob.customer_name}</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setView("list")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Jobs
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-4">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-base font-bold text-slate-800">Job Operations</CardTitle>
              </div>
              <Button
                onClick={() => setIsAssignOpOpen(true)}
                className="gap-2 bg-primary text-white"
              >
                <Plus className="h-4 w-4" /> Add Operation
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-background">
                  <TableRow>
                    <TableHead className="w-12 text-center font-bold text-slate-600">#</TableHead>
                    <TableHead className="font-bold text-slate-600">Operation Type</TableHead>
                    <TableHead className="font-bold text-slate-600">Driver</TableHead>
                    <TableHead className="text-center font-bold text-slate-600">Status</TableHead>
                    <TableHead className="text-center font-bold text-slate-600">Start Condition</TableHead>
                    <TableHead className="text-center font-bold text-slate-600">End Condition</TableHead>
                    <TableHead className="text-center font-bold text-slate-600">Damage</TableHead>
                    <TableHead className="text-center font-bold text-slate-600">Yard</TableHead>
                    <TableHead className="font-bold text-slate-600">Accepted</TableHead>
                    <TableHead className="font-bold text-slate-600">Started</TableHead>
                    <TableHead className="font-bold text-slate-600">Completed</TableHead>
                    <TableHead className="text-center font-bold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opsLoading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span className="text-slate-500">Loading operations...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : jobOperations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12 text-slate-400">
                        No operations recorded for this job.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobOperations.map((op, idx) => (
                      <TableRow key={op.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-center text-slate-500">{idx + 1}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            op.operation_type === 'Receive' ? 'bg-blue-500' : 
                            op.operation_type === 'Return' ? 'bg-green-500' : 'bg-purple-500'
                          )}>
                            {op.operation_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{op.driver_name || `Driver #${op.driver_id}`}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(op.status)}</TableCell>
                        <TableCell className="text-center">{getConditionBadge(op.start_condition_notes || "OK")}</TableCell>
                        <TableCell className="text-center">{getConditionBadge(op.end_condition_notes || "OK")}</TableCell>
                        <TableCell className="text-center">{getDamageBadge(op.damage || "N")}</TableCell>
                        <TableCell className="text-center text-slate-500">{op.yard_id || "-"}</TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {op.accepted_at ? format(new Date(op.accepted_at), "dd MMM yyyy HH:mm") : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {op.started_at ? format(new Date(op.started_at), "dd MMM yyyy HH:mm") : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {op.completed_at ? format(new Date(op.completed_at), "dd MMM yyyy HH:mm") : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center items-center gap-1.5">
                            <Button 
                              size="icon" variant="ghost" 
                              className="h-8 w-8 text-cyan-600 bg-cyan-50 hover:bg-cyan-100"
                              onClick={() => router.push(`/tracking/job-operations/${op.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-orange-600 bg-orange-50 hover:bg-orange-100"
                              onClick={() => { setCurrentOp(op); setIsAddOpOpen(true); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <AssignJobOperationModal
            open={isAssignOpOpen}
            onOpenChange={setIsAssignOpOpen}
            jobId={currentJob.id}
            onSaved={() => currentJob.id && fetchJobOperations(currentJob.id)}
          />

          <Dialog open={isAddOpOpen} onOpenChange={setIsAddOpOpen}>
            <DialogContent className="border-border bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>{currentOp.id ? "Edit Operation" : "Add Operation"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Operation Type</Label>
                  <Select 
                    value={currentOp.operation_type} 
                    onValueChange={v => setCurrentOp({...currentOp, operation_type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receive">Receive</SelectItem>
                      <SelectItem value="Return">Return</SelectItem>
                      <SelectItem value="Shift">Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Driver</Label>
                  <Select 
                    value={currentOp.driver_id?.toString()} 
                    onValueChange={v => setCurrentOp({...currentOp, driver_id: Number(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.first_name} {d.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={currentOp.status} 
                    onValueChange={v => setCurrentOp({...currentOp, status: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="parked">Parked</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveOperation} className="bg-primary text-white">Save Operation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ProtectedRoute>
    );
  }

  if (view !== "list") {
    return (
      <ProtectedRoute>
        <div className="w-full space-y-6 pb-20">
          <div className="flex justify-between items-center bg-background p-4 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">{view === "create" ? "Create Job" : "Edit Job"}</h1>
            </div>
            <Button variant="outline" onClick={() => setView("list")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to List
            </Button>
          </div>

          <form onSubmit={handleSaveJob} className="space-y-6">
            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-6">
                <SectionHeader icon={Info} title="Basic Information" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Booking ID</Label>
                    <Input 
                      value={currentJob.booking_id || ""} 
                      onChange={e => setCurrentJob({...currentJob, booking_id: e.target.value})}
                      placeholder="Enter booking ID"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Booking Reference</Label>
                    <Input 
                      value={currentJob.booking_ref || ""} 
                      onChange={e => setCurrentJob({...currentJob, booking_ref: e.target.value})}
                      placeholder="Enter booking reference"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Customer Name</Label>
                    <Input 
                      value={currentJob.customer_name || ""} 
                      onChange={e => setCurrentJob({...currentJob, customer_name: e.target.value})}
                      placeholder="Enter customer name"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Airport</Label>
                    <Select 
                      value={currentJob.airport_id?.toString()} 
                      onValueChange={v => setCurrentJob({...currentJob, airport_id: Number(v)})}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Airport" />
                      </SelectTrigger>
                      <SelectContent>
                        {airports.map(a => (
                          <SelectItem key={a.airport_id} value={a.airport_id.toString()}>{a.airport_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Product</Label>
                    <Select 
                      value={currentJob.product_id?.toString()} 
                      onValueChange={v => setCurrentJob({...currentJob, product_id: Number(v)})}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.product_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Passengers</Label>
                    <Input 
                      type="number"
                      value={currentJob.passengers || ""} 
                      onChange={e => setCurrentJob({...currentJob, passengers: Number(e.target.value)})}
                      placeholder="Enter number of passengers"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-6">
                <SectionHeader icon={Truck} title="Vehicle Information" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Make</Label>
                    <Input 
                      value={currentJob.vehiclemake || ""} 
                      onChange={e => setCurrentJob({...currentJob, vehiclemake: e.target.value})}
                      placeholder="Enter vehicle make"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Model</Label>
                    <Input 
                      value={currentJob.vehiclemodel || ""} 
                      onChange={e => setCurrentJob({...currentJob, vehiclemodel: e.target.value})}
                      placeholder="Enter vehicle model"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Colour</Label>
                    <Input 
                      value={currentJob.vehiclecolour || ""} 
                      onChange={e => setCurrentJob({...currentJob, vehiclecolour: e.target.value})}
                      placeholder="Enter vehicle colour"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Registration Number</Label>
                    <Input 
                      value={currentJob.vehicleregnumber || ""} 
                      onChange={e => setCurrentJob({...currentJob, vehicleregnumber: e.target.value})}
                      placeholder="Enter registration number"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-6">
                <SectionHeader icon={Plane} title="Flight Details" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Booking Date</Label>
                    <Input 
                      type="date"
                      value={currentJob.booking_date ? format(new Date(currentJob.booking_date), "yyyy-MM-dd") : ""} 
                      onChange={e => setCurrentJob({...currentJob, booking_date: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Departure Date & Time</Label>
                    <Input 
                      type="datetime-local"
                      value={currentJob.depdatetime ? format(new Date(currentJob.depdatetime), "yyyy-MM-dd'T'HH:mm") : ""} 
                      onChange={e => setCurrentJob({...currentJob, depdatetime: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Departure Flight</Label>
                    <Input 
                      value={currentJob.depflight || ""} 
                      onChange={e => setCurrentJob({...currentJob, depflight: e.target.value})}
                      placeholder="Enter departure flight"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Departure Terminal ID</Label>
                    <Input 
                      type="number"
                      value={currentJob.depterminal_id || ""} 
                      onChange={e => setCurrentJob({...currentJob, depterminal_id: Number(e.target.value)})}
                      placeholder="Enter departure terminal ID"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Return Date & Time</Label>
                    <Input 
                      type="datetime-local"
                      value={currentJob.returndatetime ? format(new Date(currentJob.returndatetime), "yyyy-MM-dd'T'HH:mm") : ""} 
                      onChange={e => setCurrentJob({...currentJob, returndatetime: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Return Flight</Label>
                    <Input 
                      value={currentJob.returnflight || ""} 
                      onChange={e => setCurrentJob({...currentJob, returnflight: e.target.value})}
                      placeholder="Enter return flight"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Return Terminal ID</Label>
                    <Input 
                      type="number"
                      value={currentJob.returnterminal_id || ""} 
                      onChange={e => setCurrentJob({...currentJob, returnterminal_id: Number(e.target.value)})}
                      placeholder="Enter return terminal ID"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Parking Days</Label>
                    <Input 
                      type="number"
                      value={currentJob.parkingdays || ""} 
                      onChange={e => setCurrentJob({...currentJob, parkingdays: Number(e.target.value)})}
                      placeholder="Enter parking days"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-6">
                <SectionHeader icon={ClipboardList} title="Job Status" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Overall Status</Label>
                    <Input 
                      value={currentJob.job_overall_status || ""} 
                      onChange={e => setCurrentJob({...currentJob, job_overall_status: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Park Operation Status</Label>
                    <Input 
                      value={currentJob.park_operation_status || ""} 
                      onChange={e => setCurrentJob({...currentJob, park_operation_status: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Deliver Operation Status</Label>
                    <Input 
                      value={currentJob.deliver_operation_status || ""} 
                      onChange={e => setCurrentJob({...currentJob, deliver_operation_status: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Park Completed At</Label>
                    <Input 
                      type="datetime-local"
                      value={currentJob.park_completed_at ? format(new Date(currentJob.park_completed_at), "yyyy-MM-dd'T'HH:mm") : ""} 
                      onChange={e => setCurrentJob({...currentJob, park_completed_at: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Deliver Completed At</Label>
                    <Input 
                      type="datetime-local"
                      value={currentJob.deliver_completed_at ? format(new Date(currentJob.deliver_completed_at), "yyyy-MM-dd'T'HH:mm") : ""} 
                      onChange={e => setCurrentJob({...currentJob, deliver_completed_at: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-6">
                <SectionHeader icon={ClipboardList} title="Additional Information" />
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Booking Notes</Label>
                  <Textarea 
                    value={currentJob.bookingnote || ""} 
                    onChange={e => setCurrentJob({...currentJob, bookingnote: e.target.value})}
                    placeholder="Enter booking notes"
                    className="min-h-[100px] bg-slate-50/50"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-start gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg z-10">
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md">
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button type="button" variant="outline" onClick={() => setView("list")} className="gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          </form>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center bg-background p-4 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <List className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Jobs</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Input
                placeholder="Search booking ref, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-lg border-slate-200"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <Button onClick={() => handleOpenForm()} className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md">
              <Plus className="h-4 w-4" /> Create Job
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center font-bold text-foreground">#</TableHead>
                <TableHead className="font-bold text-foreground">Booking Ref</TableHead>
                <TableHead className="font-bold text-foreground">Customer</TableHead>
                <TableHead className="font-bold text-foreground">Vehicle</TableHead>
                <TableHead className="text-center font-bold text-foreground">Receive Operation Status</TableHead>
                <TableHead className="text-center font-bold text-foreground">Return Operation Status</TableHead>
                <TableHead className="text-center font-bold text-foreground">Overall Status</TableHead>
                <TableHead className="text-center font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <span>Loading jobs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 text-slate-500">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job, idx) => (
                  <TableRow key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-center text-slate-500">{(page - 1) * limit + idx + 1}</TableCell>
                    <TableCell className="font-semibold text-foreground">{job.booking_ref}</TableCell>
                    <TableCell className="text-slate-600">{job.customer_name}</TableCell>
                    <TableCell className="text-slate-600">
                      <div>{job.vehiclemake} {job.vehiclemodel}</div>
                      <div className="text-xs font-mono text-slate-400">({job.vehicleregnumber})</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(job.park_operation_status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(job.deliver_operation_status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(job.job_overall_status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenOperationsView(job)}
                          className="h-8 w-8 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenForm(job)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(job.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </ProtectedRoute>
  );
}
