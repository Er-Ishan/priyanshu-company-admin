'use client';

import { Trash2, Edit3, Settings, ShieldCheck, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import AddGlobalBandModal from "./AddGlobalBandModal";
import EditGlobalBandModal from "./EditGlobalBandModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Band = {
  id: number;
  band_name: string;
  increment_value: number;
  product_id: number;
  [key: string]: number | string | null;
};

const formatPrice = (value: any) => {
  if (value === null || value === "" || value === "-") return "-";
  const num = Number(value);
  return Number.isInteger(num) ? num : num.toFixed(2).replace(/\.00$/, "");
};

export default function GlobalBandsTable({
  productId,
  productName,
  provider,
}: {
  productId: string;
  productName: string;
  provider: string;
}) {
  const [data, setData] = useState<Band[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/global-bands/${productId}`, {
        cache: "no-store",
        credentials: "include",
      });
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Failed to load global bands", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this global band definition?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/global-bands/${id}`, { 
        method: "DELETE", 
        credentials: "include" 
      });
      load();
    } catch (err) {
      console.error("Failed to delete band", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="glass rounded-3xl border border-border/50 shadow-xl overflow-hidden animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-6 bg-muted/20 border-b border-border/50 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{productName}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Provider: {provider}</p>
            </div>
          </div>

          <Button 
            onClick={() => setOpenAdd(true)}
            className="glass-primary rounded-xl h-11 px-6 font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Create New Band
          </Button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="sticky left-0 z-20 bg-muted/40 backdrop-blur-md px-4 py-3 text-center font-black uppercase tracking-widest border-r border-border/50 w-[60px]">#</th>
                <th className="sticky left-[60px] z-20 bg-muted/40 backdrop-blur-md px-4 py-3 text-center font-black uppercase tracking-widest border-r border-border/50 w-[100px]">Action</th>
                <th className="sticky left-[160px] z-20 bg-muted/40 backdrop-blur-md px-6 py-3 text-center font-black uppercase tracking-widest border-r border-border/50 w-[80px]">Band</th>
                {Array.from({ length: 30 }).map((_, i) => (
                  <th key={i} className={cn(
                    "px-3 py-3 text-center font-black uppercase tracking-widest border-r border-border/10 w-[45px]",
                    [7, 14, 21].includes(i) ? "bg-primary/10 text-primary" : "text-muted-foreground/60"
                  )}>
                    {i + 1}
                  </th>
                ))}
                <th className="px-6 py-3 text-center font-black uppercase tracking-widest border-l border-border/50 bg-primary/5 text-primary w-[80px]">31+</th>
                <th className="px-4 py-3 border-l border-border/50 w-[60px]"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={36} className="py-20 text-center">
                    <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={36} className="py-20 text-center text-muted-foreground/50 italic font-bold">No global bands defined.</td>
                </tr>
              ) : data.map((b, i) => (
                <tr key={b.id} className="border-b border-border/50 group hover:bg-muted/10 transition-all duration-300">
                  <td className="sticky left-0 z-10 bg-background/80 group-hover:bg-muted/20 backdrop-blur-md px-4 py-4 text-center font-black text-muted-foreground/40 border-r border-border/50">
                    {i + 1}
                  </td>
                  <td className="sticky left-[60px] z-10 bg-background/80 group-hover:bg-muted/20 backdrop-blur-md px-4 py-4 border-r border-border/50">
                    <div className="flex justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedBand(b);
                          setOpenEdit(true);
                        }}
                        className="h-8 w-8 rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="sticky left-[160px] z-10 bg-background/80 group-hover:bg-muted/20 backdrop-blur-md px-6 py-4 border-r border-border/50 text-center">
                    <span className="font-black text-sm text-primary">{b.band_name}</span>
                  </td>

                  {Array.from({ length: 30 }).map((_, idx) => (
                    <td key={idx} className={cn(
                      "px-3 py-4 text-center border-r border-border/10 font-bold transition-all",
                      [7, 14, 21].includes(idx) ? "bg-primary/[0.03] text-foreground" : "text-muted-foreground/70"
                    )}>
                      {formatPrice(b[`day_${idx + 1}`])}
                    </td>
                  ))}

                  <td className="px-6 py-4 text-center border-l border-border/50 bg-primary/[0.02] font-black text-primary">
                    +{formatPrice(b.increment_value)}
                  </td>

                  <td className="px-4 py-4 text-center border-l border-border/50">
                    <button 
                      onClick={() => handleDelete(b.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER INFO */}
        <div className="px-8 py-4 bg-muted/10 border-t border-border/50 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global configurations are synchronized across all price plans for this product.</p>
        </div>

      </div>

      {/* Modals portaled to body — must sit outside overflow-hidden container */}
      <AddGlobalBandModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        productId={productId}
        refresh={load}
        existingBands={data}
      />
      <EditGlobalBandModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedBand(null);
        }}
        band={selectedBand}
        refresh={load}
      />
    </>
  );
}
