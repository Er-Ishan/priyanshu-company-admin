"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Edit, MapPin, Calendar, User, Car, 
  Plane, Package, Clock, ShieldCheck, Camera, 
  ChevronRight, ExternalLink, Info
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

type OperationDetails = {
  id: number;
  job_id: number;
  operation_type: string;
  status: string;
  driver_name: string;
  accepted_at: string;
  started_at: string;
  completed_at: string;
  booking_ref: string;
  customer_name: string;
  vehiclemake: string;
  vehiclemodel: string;
  vehicleregnumber: string;
  vehiclecolour: string;
  passengers: number;
  booking_date: string;
  depdatetime: string;
  returndatetime: string;
  depflight: string;
  returnflight: string;
  parkingdays: number;
  terminal_name: string;
  retern_terminal_name: string;
  airport_name: string;
  product_name: string;
  start_scratched: string;
  start_damaged: string;
  start_dirty: string;
  start_condition_notes: string;
  start_lat: string;
  start_lng: string;
  start_images: string;
  start_notes: string;
  end_scratched: string;
  end_damaged: string;
  end_dirty: string;
  end_condition_notes: string;
  end_lat: string;
  end_lng: string;
  end_images: string;
  end_notes: string;
};

export default function JobOperationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<OperationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(backendProxyPath(`/api/tracking/operations/${id}`), { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.message || "Failed to fetch details");
      }
    } catch (err) {
      console.error("Fetch error", err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center font-bold text-slate-500">Operation not found</div>;

  const parseImages = (imgStr: string) => {
    try {
      if (!imgStr) return [];
      // Handle the double-escaped JSON seen in the DB dump if necessary
      const parsed = JSON.parse(imgStr.startsWith('"') ? JSON.parse(imgStr) : imgStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Image parse error", e);
      return [];
    }
  };

  const InfoItem = ({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue?: string }) => (
    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[200px]">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
        {subValue && <p className="text-[11px] text-slate-500 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );

  const ConditionBadge = ({ label, value }: { label: string, value: string }) => (
    <Badge variant="secondary" className={`${value === 'Y' ? 'bg-red-100 text-red-700' : 'bg-slate-700 text-white'} border-none px-3 py-1 text-[10px] font-bold`}>
      {label}: {value === 'Y' ? 'Yes' : 'No'}
    </Badge>
  );

  return (
    <ProtectedRoute>
      <div className="w-full space-y-8 pb-20">
        {/* Page Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Operation Details</h1>
              <p className="text-sm text-slate-500 font-medium">Detailed breakdown of the vehicle movement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl px-6 gap-2" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button className="rounded-xl px-6 gap-2 bg-primary hover:bg-primary/90 shadow-md">
              <Edit className="h-4 w-4" /> Update
            </Button>
          </div>
        </div>

        {/* Row 1: Summary Info */}
        <div className="flex flex-wrap gap-4">
          <InfoItem icon={Package} label="Booking Ref" value={data.booking_ref} />
          <InfoItem icon={Car} label="Vehicle Make" value={data.vehiclemake} />
          <InfoItem icon={Car} label="Vehicle Color" value={data.vehiclecolour} />
          <InfoItem icon={Car} label="Vehicle Reg" value={data.vehicleregnumber} />
          <InfoItem icon={User} label="Customer" value={data.customer_name} />
          <InfoItem icon={Plane} label="Airport" value={data.airport_name || "Heathrow"} />
        </div>

        {/* Row 2: Service Info */}
        <div className="flex flex-wrap gap-4">
          <InfoItem icon={Package} label="Product" value={data.product_name || "Meet & Greet"} />
          <InfoItem icon={User} label="Passengers" value={data.passengers.toString()} />
          <InfoItem icon={Calendar} label="Parking Days" value={`${data.parkingdays} Days`} />
          <InfoItem 
            icon={Plane} label="Departure" 
            value={data.depdatetime ? format(new Date(data.depdatetime), "dd MMM yyyy HH:mm") : "N/A"} 
            subValue={data.depflight ? `Flight: ${data.depflight}` : undefined} 
          />
          <InfoItem 
            icon={Plane} label="Return" 
            value={data.returndatetime ? format(new Date(data.returndatetime), "dd MMM yyyy HH:mm") : "N/A"} 
            subValue={data.returnflight ? `Flight: ${data.returnflight}` : undefined} 
          />
        </div>

        {/* Operation Timeline Section */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-slate-100">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 px-6 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
              <Clock className="h-4 w-4" /> Job Operation Details
            </CardTitle>
            <div className="flex gap-6 text-[11px] font-bold text-slate-400">
              <div className="flex flex-col items-end">
                <span>STARTED</span>
                <span className="text-primary">{data.started_at ? format(new Date(data.started_at), "dd MMM yyyy HH:mm") : "N/A"}</span>
              </div>
              <div className="flex flex-col items-end">
                <span>COMPLETED</span>
                <span className="text-slate-600">{data.completed_at ? format(new Date(data.completed_at), "dd MMM yyyy HH:mm") : "N/A"}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
              <Badge className="bg-orange-500 hover:bg-orange-600 border-none px-4 py-1 uppercase text-[10px]">{data.operation_type}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
              <Badge className="bg-orange-500 hover:bg-orange-600 border-none px-4 py-1 uppercase text-[10px]">{data.status}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Driver</p>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg"><User className="h-3 w-3 text-slate-500" /></div>
                <span className="text-sm font-bold text-slate-700">{data.driver_name || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Accepted</p>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg"><Clock className="h-3 w-3 text-slate-500" /></div>
                <span className="text-sm font-bold text-slate-700">{data.accepted_at ? format(new Date(data.accepted_at), "dd MMM yyyy HH:mm") : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start & End Information Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Start Info */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-slate-100">
            <CardHeader className="bg-blue-600 text-white p-4 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Start Information
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-lg">
                <MapPin className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 mr-4">
                  <Info className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Condition:</span>
                </div>
                <ConditionBadge label="Scratched" value={data.start_scratched} />
                <ConditionBadge label="Damaged" value={data.start_damaged} />
                <ConditionBadge label="Dirty" value={data.start_dirty} />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Images:</p>
                <div className="flex flex-wrap gap-4">
                  {parseImages(data.start_images).length > 0 ? (
                    parseImages(data.start_images).map((img, i) => (
                      <div key={i} className="relative group cursor-pointer">
                        <img 
                          src={img.startsWith('http') ? img : `/uploads/${img}`} 
                          alt="Start condition" 
                          className="w-24 h-24 object-cover rounded-xl border-2 border-slate-100 group-hover:border-primary transition-all shadow-sm"
                        />
                        <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded-md font-bold">{i+1}</div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                      <Camera className="h-8 w-8 mb-2" />
                      <span className="text-xs font-medium">No images uploaded</span>
                    </div>
                  )}
                </div>
              </div>
              
              {data.start_notes && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{data.start_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* End Info */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-slate-100">
            <CardHeader className="bg-emerald-600 text-white p-4 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> End Information
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-lg">
                <MapPin className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 mr-4">
                  <Info className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Condition:</span>
                </div>
                <ConditionBadge label="Scratched" value={data.end_scratched} />
                <ConditionBadge label="Damaged" value={data.end_damaged} />
                <ConditionBadge label="Dirty" value={data.end_dirty} />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Images:</p>
                <div className="flex flex-wrap gap-4">
                  {parseImages(data.end_images).length > 0 ? (
                    parseImages(data.end_images).map((img, i) => (
                      <div key={i} className="relative group cursor-pointer">
                        <img 
                          src={img.startsWith('http') ? img : `/uploads/${img}`} 
                          alt="End condition" 
                          className="w-24 h-24 object-cover rounded-xl border-2 border-slate-100 group-hover:border-primary transition-all shadow-sm"
                        />
                        <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded-md font-bold">{i+1}</div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                      <Camera className="h-8 w-8 mb-2" />
                      <span className="text-xs font-medium">No images uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {data.end_notes && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{data.end_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
