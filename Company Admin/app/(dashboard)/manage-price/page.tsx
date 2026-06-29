'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  Settings2, 
  Search, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Plus,
  Table as TableIcon,
  CheckCircle2
} from "lucide-react";
import AddBandModal from "./AddBandModal";
import GlobalBandsTable from "./GlobalBandsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/lib/utils";

type PriceBand = {
  id: number;
  year: number;
  month: string;
  bandRow: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH_INDEX = now.getMonth();

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getAllowedMonths = (year: number | null) => {
  if (!year) return [];
  if (year === CURRENT_YEAR) return MONTHS.slice(CURRENT_MONTH_INDEX);
  if (year > CURRENT_YEAR) return MONTHS;
  return [];
};

const getDaysInMonth = (month: string, year: number) => {
  const months: any = {
    January: 31,
    February: (year % 4 === 0 ? 29 : 28),
    March: 31,
    April: 30,
    May: 31,
    June: 30,
    July: 31,
    August: 31,
    September: 30,
    October: 31,
    November: 30,
    December: 31,
  };
  return months[month] || 31;
};

export default function ManagePrice() {
  const params = useSearchParams();
  const router = useRouter();

  const id = params.get("id");
  const productName = params.get("name");
  const provider = params.get("provider");

  const [bands, setBands] = useState<PriceBand[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedBandRow, setSelectedBandRow] = useState<string[]>([]);
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);

  const [newYear, setNewYear] = useState("");
  const [newMonth, setNewMonth] = useState("");

  const loadPriceBands = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/price-bands/${id}`, {
        cache: "no-store",
        credentials: "include",
      });
      const json = await res.json();
      const formatted = json.map((item: any) => ({
        id: item.id,
        year: item.year,
        month: item.month,
        bandRow: Array.from({ length: 31 }, (_, i) => item[`day_${i + 1}`] || "-"),
      }));
      setBands(formatted);
    } catch (err) {
      console.error("Failed to load price bands", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriceBands();
  }, [id]);

  const handleDelete = async (bandId: number) => {
    if (!confirm("Remove this price plan?")) return;
    setBands(prev => prev.filter(b => b.id !== bandId));
    try {
      await fetch(`${API_BASE_URL}/api/price-bands/${bandId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to delete price band", err);
      loadPriceBands();
    }
  };

  const handleEdit = (id: number, month: string, year: number, bandRow: string[]) => {
    setSelectedBandId(id);
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedBandRow(bandRow);
    setModalOpen(true);
  };

  const handleNewBand = async () => {
    if (!newYear || !newMonth) {
      alert("Select Year and Month first");
      return;
    }
    const yearNum = Number(newYear);
    const alreadyExists = bands.some(b => b.year === yearNum && b.month === newMonth);
    if (alreadyExists) {
      alert(`Price plan for ${newMonth} ${yearNum} already exists.`);
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/api/price-bands`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id, year: yearNum, month: newMonth }),
      });
      setNewMonth("");
      await loadPriceBands();
    } catch (err) {
      console.error("Failed to create new band", err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/viewProducts")}
              className="h-10 w-10 glass flex items-center justify-center rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                Manage Price Plans
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-widest">{provider}</span>
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">{productName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-2 p-1.5 glass rounded-2xl border border-border/50">
              <select
                className="h-10 bg-transparent text-xs font-black px-3 outline-none border-r border-border/50 uppercase tracking-widest cursor-pointer"
                value={newYear}
                onChange={(e) => {
                  setNewYear(e.target.value);
                  setNewMonth("");
                }}
              >
                <option value="">Year</option>
                {[CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="h-10 bg-transparent text-xs font-black px-3 outline-none uppercase tracking-widest cursor-pointer disabled:opacity-30"
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                disabled={!newYear}
              >
                <option value="">Month</option>
                {getAllowedMonths(newYear ? Number(newYear) : null).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <Button 
                onClick={handleNewBand}
                disabled={!newYear || !newMonth}
                className="glass-primary rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest transition-all hover:scale-[1.02]"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Month
              </Button>
            </div>
          </div>
        </div>

        {/* ACTIVE PRICE BANDS TABLE */}
        <div className="glass rounded-3xl border border-border/50 shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-muted/20 border-b border-border/50 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest">Active Product Price Matrix</h2>
          </div>
          
          <div className="overflow-x-auto relative">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="sticky left-0 z-20 bg-muted/40 backdrop-blur-md px-4 py-3 text-left font-black uppercase tracking-widest border-r border-border/50 w-[80px]">Year</th>
                  <th className="sticky left-[80px] z-20 bg-muted/40 backdrop-blur-md px-4 py-3 text-left font-black uppercase tracking-widest border-r border-border/50 w-[120px]">Month</th>
                  <th className="sticky left-[200px] z-20 bg-muted/40 backdrop-blur-md px-4 py-3 text-center font-black uppercase tracking-widest border-r border-border/50 w-[120px]">Actions</th>
                  {Array.from({ length: 31 }).map((_, i) => (
                    <th key={i} className="px-3 py-3 text-center font-black text-muted-foreground border-r border-border/10 w-[45px] hover:bg-primary/5 transition-colors">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={34} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Syncing Matrix...</p>
                      </div>
                    </td>
                  </tr>
                ) : bands.length === 0 ? (
                  <tr>
                    <td colSpan={34} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <TableIcon className="h-12 w-12" />
                        <p className="text-sm font-bold">No price plans configured for this product.</p>
                      </div>
                    </td>
                  </tr>
                ) : bands.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/10 transition-all duration-300 group">
                    <td className="sticky left-0 z-10 bg-background/80 group-hover:bg-muted/20 backdrop-blur-md px-4 py-3 font-black text-foreground border-r border-border/50 text-xs">
                      {b.year}
                    </td>
                    <td className="sticky left-[80px] z-10 bg-background/80 group-hover:bg-muted/20 backdrop-blur-md px-4 py-3 font-bold text-foreground border-r border-border/50 text-xs">
                      {b.month}
                    </td>
                    <td className="sticky left-[200px] z-10 bg-background/80 group-hover:bg-muted/20 backdrop-blur-md px-4 py-3 border-r border-border/50">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          size="sm"
                          className="h-7 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                          onClick={() => handleEdit(b.id, b.month, b.year, b.bandRow)}
                        >
                          Modify
                        </Button>
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    {b.bandRow.slice(0, getDaysInMonth(b.month, b.year)).map((d, index) => (
                      <td key={index} className={cn(
                        "px-3 py-3 text-center border-r border-border/10 font-black transition-all",
                        d === "-" ? "text-muted-foreground/20 font-normal" : "text-primary"
                      )}>
                        {d}
                      </td>
                    ))}
                    {/* Fill empty cells for shorter months */}
                    {Array.from({ length: 31 - getDaysInMonth(b.month, b.year) }).map((_, i) => (
                      <td key={`empty-${i}`} className="bg-muted/10 border-r border-border/10" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GLOBAL BANDS SECTION */}
        <div className="animate-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">Global Product Bands</h2>
              <p className="text-xs text-muted-foreground font-medium">Define the price values for each band letter (A, B, C...) assigned above.</p>
            </div>
          </div>
          <GlobalBandsTable
            productId={id!}
            productName={productName!}
            provider={provider!}
          />
        </div>

        {/* MODAL */}
        <AddBandModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          month={selectedMonth}
          year={selectedYear}
          bandData={selectedBandRow}
          bandId={selectedBandId}
          refresh={loadPriceBands}
          productId={id!}
        />

      </div>
    </ProtectedRoute>
  );
}
