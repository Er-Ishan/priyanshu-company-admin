'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { X, Edit3, Info, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function EditGlobalBandModal({ open, onClose, band, refresh }: any) {
  const [bandName, setBandName] = useState("");
  const [incrementValue, setIncrementValue] = useState("");
  const [days, setDays] = useState<string[]>(Array(31).fill(""));

  useEffect(() => {
    if (!band) return;
    setBandName(band.band_name || "");
    setIncrementValue(band.increment_value || "");
    setDays(
      Array.from({ length: 31 }).map((_, i) => band[`day_${i + 1}`] ?? "")
    );
  }, [band]);

  if (!open || !band) return null;

  const handleChange = (index: number, value: string) => {
    const updated = [...days];
    updated[index] = value;
    setDays(updated);
  };

  const handleSave = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/global-bands/${band.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          band_name: bandName,
          increment_value: incrementValue,
          days,
        }),
      });
      refresh();
      onClose();
    } catch (err) {
      console.error("Failed to update global band", err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-background/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
        <div className="glass w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-border/50 shadow-2xl flex flex-col animate-in zoom-in-95 duration-500">
          
          {/* HEADER */}
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Edit3 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Edit Global Band</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Adjust daily pricing values for Band {bandName}</p>
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
            
            {/* BAND CONFIG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Band Identifier</label>
                <Input
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  className="h-12 glass-input rounded-2xl font-black text-lg border-transparent focus:border-primary/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Increment Value (31+ Days)</label>
                <Input
                  value={incrementValue}
                  onChange={(e) => setIncrementValue(e.target.value)}
                  type="number"
                  className="h-12 glass-input rounded-2xl font-black text-lg border-transparent focus:border-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="h-px bg-border/30" />

            {/* DAILY GRID */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Pricing Matrix (Days 1-31)</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
                {days.map((val, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Day {i + 1}</label>
                    <Input
                      value={val}
                      onChange={(e) => handleChange(i, e.target.value)}
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
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
