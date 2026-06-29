'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { X, Check, Info, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Band = {
  id: number;
  band_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  month: string;
  year: number;
  bandData: string[];
  bandId: number | null;
  refresh: () => void;
  productId: string;
};

export default function AddBandModal({
  open,
  onClose,
  month,
  year,
  bandData,
  bandId,
  refresh,
  productId,
}: Props) {
  const [formValues, setFormValues] = useState<string[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [selectedBand, setSelectedBand] = useState("");

  useEffect(() => {
    if (!open) return;
    const loadBands = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/global-bands/${productId}`,
          { cache: "no-store", credentials: "include" }
        );
        const data = await res.json();
        setBands(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load bands", err);
      }
    };
    loadBands();
  }, [open, productId]);

  useEffect(() => {
    if (open) {
      setFormValues(bandData);
      setSelectedBand("");
    }
  }, [open, bandData]);

  const handleInputChange = (val: string, index: number) => {
    const upperVal = val.toUpperCase();
    if (upperVal && !bands.some(b => b.band_name === upperVal)) {
      // We'll let them type but show a warning if possible, 
      // or keep the original alert logic if critical.
      // Keeping original alert logic to prevent invalid data.
      alert("This band is not available. Please select a valid band.");
      return;
    }
    const updated = [...formValues];
    updated[index] = upperVal;
    if (index === 0) {
      updated.fill(upperVal);
    }
    setFormValues(updated);
  };

  const handleSelectBand = (val: string) => {
    if (!bands.some(b => b.band_name === val)) return;
    setSelectedBand(val);
    setFormValues(formValues.map(() => val));
  };

  const handleSave = async () => {
    if (!bandId) {
      alert("No band selected!");
      return;
    }
    const hasInvalid = formValues.some(
      (v) => v && v !== "-" && !bands.some(b => b.band_name === v)
    );
    if (hasInvalid) {
      alert("One or more days contain an unavailable band.");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/price-bands/${bandId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bandRow: formValues }),
        }
      );
      if (res.ok) {
        onClose();
        refresh();
      }
    } catch (err) {
      console.error("Failed to save band", err);
    }
  };

  if (!open) return null;

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-background/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
        <div className="glass w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-border/50 shadow-2xl flex flex-col animate-in zoom-in-95 duration-500">
          
          {/* HEADER */}
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Apply Price Band</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{month} {year}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all text-muted-foreground/30"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* BULK SELECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Bulk Selection</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBand(b.band_name)}
                    className={`h-14 px-6 rounded-2xl border flex items-center justify-between transition-all group ${selectedBand === b.band_name ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border/50 hover:border-primary/30 bg-muted/20'}`}
                  >
                    <span className="font-black text-lg">{b.band_name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Apply to All Days</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/30" />

            {/* DAILY GRID */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Individual Day Adjustments</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {formValues.map((val, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Day {i + 1}</label>
                    <Input
                      value={val}
                      onChange={(e) => handleInputChange(e.target.value, i)}
                      className="h-10 glass-input rounded-xl text-center font-black text-sm border-transparent focus:border-primary/30 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-8 py-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]"
            >
              Discard Changes
            </Button>
            <Button 
              onClick={handleSave}
              className="glass-primary h-12 px-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Update Price Matrix
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
