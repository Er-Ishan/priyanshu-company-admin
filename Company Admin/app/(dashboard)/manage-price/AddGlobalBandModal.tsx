'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AddGlobalBandModal({ open, onClose, productId, refresh, existingBands }: any) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bandName, setBandName] = useState("");
  const [incrementValue, setIncrementValue] = useState("");
  const [days, setDays] = useState(Array(30).fill(""));

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = () => {
    setIncrementValue("");
    setDays(Array(30).fill(""));
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...days];
    updated[index] = value;
    setDays(updated);
  };

  const getNextBandName = (bands: { band_name: string }[]) => {
    if (!bands || bands.length === 0) return "A";
    const letters = bands
      .map(b => b.band_name?.toUpperCase())
      .filter(b => /^[A-Z]$/.test(b));
    if (letters.length === 0) return "A";
    const maxCharCode = Math.max(...letters.map(l => l.charCodeAt(0)));
    if (maxCharCode >= 90) throw new Error("Maximum band limit reached (Z)");
    return String.fromCharCode(maxCharCode + 1);
  };

  const handleSave = async () => {
    const lastDay = Number(days[29]);
    const inc = Number(incrementValue);
    const autoDays = [...days];
    if (lastDay && inc) {
      for (let i = 30; i < 60; i++) {
        autoDays[i] = String(lastDay + inc * (i - 29));
      }
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/global-bands`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          band_name: bandName,
          increment_value: incrementValue,
          days: autoDays,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to save band. Please try again.");
        return;
      }
      await refresh();
      toast.success(`Band ${bandName} created successfully`);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to save global band", err);
      toast.error("Failed to save band. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (open) {
      try {
        const nextBand = getNextBandName(existingBands || []);
        setBandName(nextBand);
      } catch {
        toast.error("Maximum band limit reached (Z)");
        onClose();
      }
    }
  }, [open, existingBands, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-new-band-title"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div
        className="relative z-10 flex flex-1 flex-col w-full max-w-6xl mx-auto my-4 md:my-8 px-4 md:px-6 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass flex flex-1 flex-col min-h-0 rounded-3xl border border-border/50 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
          
          {/* HEADER */}
          <div className="px-6 md:px-8 py-5 border-b border-border/50 flex items-center justify-between bg-muted/20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 id="create-new-band-title" className="text-xl font-black tracking-tight text-foreground">
                  Create New Band
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Define daily pricing values for the registry
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 min-h-0">
            
            {/* BAND CONFIG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Band Letter</label>
                <Input
                  value={bandName}
                  disabled
                  className="h-12 glass-input rounded-2xl font-black text-lg bg-muted/50 border-transparent cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Increment Value (31+ Days)</label>
                <Input
                  value={incrementValue}
                  onChange={(e) => setIncrementValue(e.target.value)}
                  type="number"
                  placeholder="e.g. 5.00"
                  className="h-12 glass-input rounded-2xl font-black text-lg border-transparent focus:border-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="h-px bg-border/30" />

            {/* DAILY GRID */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Daily Price Setup (Days 1-30)</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
                {days.map((val, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Day {i + 1}</label>
                    <Input
                      value={val}
                      onChange={(e) => handleChange(i, e.target.value)}
                      className="h-10 glass-input rounded-xl text-center font-black text-sm border-transparent focus:border-primary/30 transition-all"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 md:px-8 py-5 border-t border-border/50 bg-muted/10 flex justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
              className="h-11 px-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="glass-primary h-11 px-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? "Saving…" : "Save Band"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
