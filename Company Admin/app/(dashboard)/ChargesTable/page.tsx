'use client';

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Settings, CreditCard, Edit3, XCircle, Search, Info, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import { backendProxyPath } from "@/app/lib/backendProxy";

type ChargeType = 'booking' | 'amended' | 'cancellation';

type Charge = {
  id: number;
  charge_name: string;
  price: number;
  is_enabled: number;
};

export default function ChargesPage() {
  const [activeTab, setActiveTab] = useState<ChargeType>('booking');
  const [rows, setRows] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ charge_name: "", price: "", is_enabled: true });

  const fetchCharges = async (type: ChargeType) => {
    setLoading(true);
    try {
      const res = await fetch(backendProxyPath(`/api/charges/${type}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Failed to fetch ${type} charges:`, err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges(activeTab);
    setShowForm(false);
    setSearch("");
  }, [activeTab]);

  const addCharge = async () => {
    if (!form.charge_name.trim()) {
      alert("Charge name required");
      return;
    }
    try {
      const res = await fetch(backendProxyPath(`/api/charges/${activeTab}`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charge_name: form.charge_name,
          price: Number(form.price) || 0,
          is_enabled: form.is_enabled ? 1 : 0,
        }),
      });
      const json = await res.json();
      if (json?.data) setRows((prev) => [...prev, json.data]);
      setForm({ charge_name: "", price: "", is_enabled: true });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add charge:", err);
    }
  };

  const updatePrice = async (id: number, price: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, price } : r)));
    try {
      await fetch(backendProxyPath(`/api/charges/${id}/price`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
    } catch (err) {
      console.error("Failed to update price:", err);
    }
  };

  const toggleStatus = async (c: Charge) => {
    const value = c.is_enabled ? 0 : 1;
    setRows((prev) => prev.map((r) => (r.id === c.id ? { ...r, is_enabled: value } : r)));
    try {
      await fetch(backendProxyPath(`/api/charges/${c.id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: value }),
      });
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const deleteCharge = async (id: number) => {
    if (!confirm("Delete this charge?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(backendProxyPath(`/api/charges/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to delete charge:", err);
    }
  };

  const filteredRows = rows.filter(r => 
    r.charge_name.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: ChargeType; label: string; icon: any; color: string }[] = [
    { id: 'booking', label: 'Booking Charges', icon: CreditCard, color: 'text-blue-500' },
    { id: 'amended', label: 'Amendment Charges', icon: Edit3, color: 'text-amber-500' },
    { id: 'cancellation', label: 'Cancellation Charges', icon: XCircle, color: 'text-rose-500' }
  ];

  return (
    <ProtectedRoute>
      <div className="w-full space-y-8 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Website Settings</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Configure service fees and operational charges for the booking engine.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Find charges..."
                className="pl-10 h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setShowForm(v => !v)} 
              className={`glass-primary rounded-xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${showForm ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : ''}`}
            >
              {showForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showForm ? 'Cancel' : 'New Charge'}</span>
            </Button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex p-1.5 glass rounded-2xl border border-border/50 shadow-sm w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-black text-xs uppercase tracking-widest ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ADD FORM */}
        {showForm && (
          <div className="glass p-6 rounded-3xl border border-primary/20 shadow-xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Configure {tabs.find(t => t.id === activeTab)?.label}</h2>
                <p className="text-xs text-muted-foreground font-medium">Add a new fee item to the website calculation engine.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Charge Name</label>
                <Input 
                  className='h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold' 
                  placeholder="e.g. Booking Fee" 
                  value={form.charge_name} 
                  onChange={e => setForm({ ...form, charge_name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price (GBP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground/40">£</span>
                  <Input 
                    type="number"
                    className='pl-8 h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold' 
                    placeholder="0.00" 
                    value={form.price} 
                    onChange={e => setForm({ ...form, price: e.target.value })} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</label>
                <div className="h-11 flex items-center px-4 glass-input rounded-xl">
                   <span className="text-xs font-bold mr-3">{form.is_enabled ? 'Enabled' : 'Disabled'}</span>
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={form.is_enabled}
                      onChange={() => setForm({ ...form, is_enabled: !form.is_enabled })}
                    />
                    <div className="w-10 h-5 bg-muted peer-checked:bg-emerald-500 rounded-full relative transition-all after:absolute after:content-[''] after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowForm(false)}>Discard</Button>
              <Button className='glass-primary rounded-xl px-8 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20' onClick={addCharge}>Save Configuration</Button>
            </div>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="glass rounded-3xl border border-border/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-16 h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">S.L</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Service Name</TableHead>
                  <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Price (GBP)</TableHead>
                  <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Visibility</TableHead>
                  <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <p className="text-sm font-bold text-muted-foreground/50 italic tracking-widest">FETCHING RATES...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Info className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground/50">No charge configurations found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRows.map((c, i) => (
                  <TableRow key={c.id} className="group hover:bg-muted/30 transition-all border-border/40">
                    <TableCell className="py-5 text-center font-bold text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{c.charge_name}</span>
                        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">Financial Modifier</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <div className="relative group/input w-32 mx-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground opacity-50">£</span>
                        <Input 
                          type="number"
                          className="pl-6 h-10 glass-input rounded-xl text-center font-black border-transparent focus:border-primary/30 transition-all bg-transparent group-hover/input:bg-background/50"
                          value={c.price}
                          onChange={(e) => updatePrice(c.id, Number(e.target.value))}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <div className="flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => toggleStatus(c)}
                              className={`p-1.5 rounded-lg transition-all ${c.is_enabled ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground/40 bg-muted/50'}`}
                            >
                              {c.is_enabled ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{c.is_enabled ? 'Currently Active' : 'Currently Inactive'}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-600 text-muted-foreground/30 transition-all"
                            onClick={() => deleteCharge(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove Configuration</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}
