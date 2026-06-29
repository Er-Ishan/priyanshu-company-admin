'use client';

import { useEffect, useState } from 'react';
import { 
  Plane, 
  MapPin, 
  Plus, 
  Trash2, 
  X, 
  Search, 
  Globe, 
  Terminal as TerminalIcon, 
  CheckCircle2, 
  AlertCircle,
  Info
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ProtectedRoute from '@/components/ProtectedRoute';
import { backendProxyPath } from '@/app/lib/backendProxy';

type Terminal = {
  terminal_id: number;
  airport_id: number;
  terminal_name: string;
  postcode: string;
};

type Airport = {
  airport_id: number;
  airport_name: string;
  iata_code: string;
  city: string;
  country: string;
};

type GlobalAirport = {
  airport_id: number;
  airport_name: string;
  iata_code: string;
  city: string;
  country: string;
};

type GlobalTerminal = {
  id: number;
  terminal_name: string;
};

export default function AirportSettingsPage() {
  const [companyAirports, setCompanyAirports] = useState<Airport[]>([]);
  const [globalAirports, setGlobalAirports] = useState<GlobalAirport[]>([]);
  const [globalTerminals, setGlobalTerminals] = useState<GlobalTerminal[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddAirport, setShowAddAirport] = useState(false);
  const [selectedGlobalAirportId, setSelectedGlobalAirportId] = useState<number | null>(null);
  
  const [expandedAirportId, setExpandedAirportId] = useState<number | null>(null);
  const [airportTerminals, setAirportTerminals] = useState<Terminal[]>([]);
  const [terminalLoading, setTerminalLoading] = useState(false);

  const [showAddTerminal, setShowAddTerminal] = useState(false);
  const [selectedGlobalTerminalId, setSelectedGlobalTerminalId] = useState<number | null>(null);
  const [customTerminalName, setCustomTerminalName] = useState("");
  const [postcode, setPostcode] = useState("");

  const fetchCompanyAirports = async () => {
    try {
      const res = await fetch(backendProxyPath('/api/data/airport-data'), { credentials: 'include' });
      const data = await res.json();
      setCompanyAirports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch company airports", err);
    }
  };

  const fetchGlobalAirports = async () => {
    try {
      const res = await fetch(backendProxyPath('/api/data/global-airports'), { credentials: 'include' });
      const data = await res.json();
      setGlobalAirports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch global airports", err);
    }
  };

  const fetchTerminals = async (airportId: number) => {
    setTerminalLoading(true);
    try {
      const res = await fetch(backendProxyPath(`/api/data/parking-terminals/${airportId}`), { credentials: 'include' });
      const data = await res.json();
      setAirportTerminals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch terminals", err);
      setAirportTerminals([]);
    } finally {
      setTerminalLoading(false);
    }
  };

  const fetchGlobalTerminals = async () => {
    try {
      const res = await fetch(backendProxyPath('/api/data/global-terminals'), { credentials: 'include' });
      const data = await res.json();
      setGlobalTerminals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch global terminals", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCompanyAirports().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showAddAirport) {
      fetchGlobalAirports();
    }
  }, [showAddAirport]);

  const handleAddAirport = async () => {
    if (!selectedGlobalAirportId) return;
    try {
      const res = await fetch(backendProxyPath('/api/data/link-airport'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airport_id: selectedGlobalAirportId }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchCompanyAirports();
        setShowAddAirport(false);
        setSelectedGlobalAirportId(null);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to add airport");
      }
    } catch (err) {
      console.error("Failed to add airport", err);
    }
  };

  const handleDeleteAirport = async (id: number) => {
    if (!confirm("Remove this airport from your company?")) return;
    try {
      const res = await fetch(backendProxyPath(`/api/data/delete-airport/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchCompanyAirports();
    } catch (err) {
      console.error("Failed to delete airport", err);
    }
  };

  const handleAddTerminal = async (airportId: number) => {
    if (!selectedGlobalTerminalId) return;
    try {
      const res = await fetch(backendProxyPath('/api/data/parking-terminals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          airport_id: airportId,
          terminal_id: selectedGlobalTerminalId,
          terminal_name: customTerminalName,
          postcode
        }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchTerminals(airportId);
        setShowAddTerminal(false);
        setSelectedGlobalTerminalId(null);
        setCustomTerminalName("");
        setPostcode("");
      }
    } catch (err) {
      console.error("Failed to add terminal", err);
    }
  };

  const handleDeleteTerminal = async (terminalId: number) => {
    if (!confirm("Remove this terminal?")) return;
    try {
      const res = await fetch(backendProxyPath(`/api/data/delete-parking-terminal/${terminalId}`), {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok && expandedAirportId) fetchTerminals(expandedAirportId);
    } catch (err) {
      console.error("Failed to delete terminal", err);
    }
  };

  const filteredAirports = companyAirports.filter(a => 
    a.airport_name.toLowerCase().includes(search.toLowerCase()) ||
    a.city?.toLowerCase().includes(search.toLowerCase()) ||
    a.iata_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="w-full space-y-8 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Airport Settings</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Configure your active airports and manage specific terminals for parking operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search active airports..."
                className="pl-10 h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setShowAddAirport(v => !v)} 
              className={`glass-primary rounded-xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${showAddAirport ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : ''}`}
            >
              {showAddAirport ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showAddAirport ? 'Cancel' : 'Activate Airport'}</span>
            </Button>
          </div>
        </div>

        {/* ADD AIRPORT FORM */}
        {showAddAirport && (
          <div className="glass p-8 rounded-3xl border border-primary/20 shadow-xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Global Airport Registry</h2>
                <p className="text-sm text-muted-foreground font-medium">Select an airport from our global database to activate for your company.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Airport</label>
                <select
                  className="w-full h-12 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold text-sm px-4 outline-none bg-background/50"
                  value={selectedGlobalAirportId || ""}
                  onChange={e => setSelectedGlobalAirportId(Number(e.target.value))}
                >
                  <option value="">Choose an airport...</option>
                  {globalAirports.map(a => (
                    <option key={a.airport_id} value={a.airport_id}>{a.airport_name} ({a.iata_code}) - {a.city}, {a.country}</option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={handleAddAirport}
                disabled={!selectedGlobalAirportId}
                className='glass-primary rounded-xl px-10 h-12 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50'
              >
                Activate Airport
              </Button>
            </div>
          </div>
        )}

        {/* AIRPORTS GRID / LIST */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="h-64 glass rounded-3xl flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <p className="text-sm font-black text-muted-foreground/40 italic tracking-widest">LOADING AIRPORTS...</p>
            </div>
          ) : filteredAirports.length === 0 ? (
            <div className="h-64 glass rounded-3xl flex flex-col items-center justify-center gap-3">
              <Plane className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm font-bold text-muted-foreground/50">No airports are currently active for your company.</p>
            </div>
          ) : filteredAirports.map((airport) => (
            <div key={airport.airport_id} className={`glass rounded-3xl border border-border/50 shadow-lg overflow-hidden transition-all duration-500 ${expandedAirportId === airport.airport_id ? 'ring-2 ring-primary/20' : ''}`}>
              <div className="p-6 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <Plane className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{airport.airport_name} ({airport.iata_code})</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60">•</span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{airport.city}, {airport.country}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (expandedAirportId === airport.airport_id) {
                        setExpandedAirportId(null);
                      } else {
                        setExpandedAirportId(airport.airport_id);
                        fetchTerminals(airport.airport_id);
                        fetchGlobalTerminals();
                      }
                    }}
                    className={`h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${expandedAirportId === airport.airport_id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:text-primary'}`}
                  >
                    {expandedAirportId === airport.airport_id ? 'Close Manager' : 'Manage Terminals'}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-11 w-11 rounded-xl hover:bg-red-500/10 hover:text-red-600 text-muted-foreground/30 transition-all"
                        onClick={() => handleDeleteAirport(airport.airport_id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Deactivate Airport</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {expandedAirportId === airport.airport_id && (
                <div className="p-8 bg-background/30 border-t border-border/50 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* TERMINALS LIST */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TerminalIcon className="h-4 w-4 text-primary" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Operational Terminals</h4>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setShowAddTerminal(!showAddTerminal)}
                          className={`h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest ${showAddTerminal ? 'bg-red-500/10 text-red-500' : 'text-primary hover:bg-primary/10'}`}
                        >
                          {showAddTerminal ? 'Cancel' : 'Add New'}
                        </Button>
                      </div>

                      {showAddTerminal && (
                        <div className="glass p-6 rounded-2xl border border-primary/20 mb-6 animate-in zoom-in-95 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Global Terminal</label>
                              <select
                                className="w-full h-10 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold text-xs px-3 outline-none bg-background/50"
                                value={selectedGlobalTerminalId || ""}
                                onChange={e => setSelectedGlobalTerminalId(Number(e.target.value))}
                              >
                                <option value="">Select registry item...</option>
                                {globalTerminals.map(t => (
                                  <option key={t.id} value={t.id}>{t.terminal_name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Postcode (Optional)</label>
                              <Input 
                                className="h-10 glass-input rounded-xl"
                                placeholder="e.g. TW6 1QG"
                                value={postcode}
                                onChange={e => setPostcode(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                             <Button 
                                size="sm" 
                                onClick={() => handleAddTerminal(airport.airport_id)}
                                disabled={!selectedGlobalTerminalId}
                                className="glass-primary h-10 rounded-xl px-8 font-black text-[10px] uppercase tracking-widest"
                              >
                                Add Terminal
                              </Button>
                          </div>
                        </div>
                      )}

                      {terminalLoading ? (
                        <div className="py-12 flex justify-center">
                          <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {airportTerminals.length === 0 ? (
                            <div className="col-span-full py-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground/30" />
                              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">No Terminals Configured</p>
                            </div>
                          ) : airportTerminals.map(t => (
                            <div key={t.terminal_id} className="group flex items-center justify-between p-4 glass rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:bg-muted/20">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                  <TerminalIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm text-foreground">{t.terminal_name}</span>
                                  {t.postcode && <span className="text-[10px] text-muted-foreground/60 font-medium">{t.postcode}</span>}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteTerminal(t.terminal_id)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AIRPORT INFO CARD */}
                    <div className="w-full md:w-72 space-y-4">
                      <div className="p-5 glass rounded-2xl border border-border/50 bg-primary/[0.02]">
                        <div className="flex items-center gap-2 mb-4">
                          <Info className="h-4 w-4 text-primary" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Operational Intel</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">IATA Code</span>
                            <span className="text-xs font-black text-foreground">{airport.iata_code}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">System ID</span>
                            <span className="text-xs font-black text-foreground">#{airport.airport_id}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Location</span>
                            <span className="text-xs font-black text-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-primary" /> {airport.city}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <p className="text-[9px] leading-relaxed text-muted-foreground/60 font-medium italic">
                            Terminals added here will appear in product management and reporting modules.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </ProtectedRoute>
  );
}
