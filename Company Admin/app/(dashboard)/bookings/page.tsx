'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Telescope, Download, Send, FileEdit, Clock, StickyNote, Pencil, Trash2, X, Handshake, SquareParking, Eye, ChevronLeft, ChevronRight, NotebookPen, ChevronUp, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { backendProxyPath } from "@/app/lib/backendProxy";

type Booking = {
  id: number;
  ref_no: string;
  source: string;
  airport: string;
  service_type: string;
  customer_name: string;
  contact_no: string | null;
  customer_email: string | null;
  booked_on: string;
  dropoff_datetime: string;
  return_datetime: string;
  vehicle_reg_no: string | null;
  price: number;
  status: string;
  notes: string | null;
};

type BookingListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Booking[];
};

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SOURCES = ['Supplier','Direct','Partner','Website','Call Centre'] as const;
// const AIRPORTS = ['Heathrow','Gatwick','Stansted','Luton','Manchester','Birmingham','Other'] as const;
const SERVICES = ['Meet & Greet','Park & Ride','Meet & Greet (Indoor)'] as const;
const STATUSES = ['Amended', 'Active', 'Cancelled'] as const;

/** cookie helper */
function getCookie(name: string) {
  const m = typeof document !== 'undefined'
    ? document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
    : null;
  return m ? m.pop() : '';
}
function fmtDT(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
function money(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(n);
  } catch {
    return `£${Number(n || 0).toFixed(2)}`;
  }
}
function todayYMD() {
  const d = new Date();
  const pad = (n:number) => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const SortBadge = ({ active }: { active: boolean }) => {
    if (!active) return (
      <div className="flex flex-col -space-y-1 opacity-10 group-hover:opacity-30 transition-opacity">
        <ChevronUp size={8} strokeWidth={3} />
        <ChevronDown size={8} strokeWidth={3} />
      </div>
    );
    return (
      <div className="text-primary flex flex-col -space-y-1 animate-in zoom-in-50 duration-200">
        {sortOrder === 'asc' ? <ChevronUp size={10} strokeWidth={4} /> : <ChevronDown size={10} strokeWidth={4} />}
      </div>
    );
  };

  // table state
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'booked_on'|'dropoff'|'return'|'price'|'created_at'>('booked_on');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');

  // filter state (bound to URL)
  const [q, setQ]               = useState('');
  const [source, setSource]     = useState<string | ''>('');
  const [airport, setAirport]   = useState<string | ''>('');
  const [service, setService]   = useState<string | ''>('');
  const [status, setStatus]     = useState<string | ''>('');
  const [from, setFrom]         = useState<string>(''); // YYYY-MM-DD
  const [to, setTo]             = useState<string>(''); // YYYY-MM-DD

  const [airportList, setAirportList] = useState<{ airport_id: number; airport_name: string }[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Load initial filters from URL (and handle preset)
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || '');

    // preset handling
    const preset = sp.get('preset');
    if (preset === 'today') {
      const t = todayYMD();
      sp.set('from', t);
      sp.set('to',   t);
      sp.delete('preset');
      router.replace(`/bookings?${sp.toString()}`, { scroll: false });
    }
    if (preset === 'search') {
      // just focus search field
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    // apply to state
    setQ(sp.get('q') || '');
    setSource(sp.get('source') || '');
    setAirport(sp.get('airport') || '');
    setService(sp.get('service_type') || '');
    setStatus(sp.get('status') || '');
    setFrom(sp.get('from') || '');
    setTo(sp.get('to') || '');
    setPage(Number(sp.get('page') || 1));
    setLimit(Number(sp.get('limit') || 50));
    setSortBy((sp.get('sortBy') as any) || 'booked_on');
    setSortOrder((sp.get('sortOrder') as any) || 'desc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  useEffect(() => {
    fetch(backendProxyPath("/api/airports"))
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        setAirportList(list);
      })
      .catch((err) => console.error("Error fetching airports:", err));
  }, []);

  // keep URL in sync when filters change (debounced for q)
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (source) sp.set('source', source);
    if (airport) sp.set('airport', airport);
    if (service) sp.set('service_type', service);
    if (status) sp.set('status', status);
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    sp.set('page', String(page));
    sp.set('limit', String(limit));
    sp.set('sortBy', sortBy);
    sp.set('sortOrder', sortOrder);
    router.replace(`/bookings?${sp.toString()}`, { scroll: false });
  }, [q, source, airport, service, status, from, to, page, limit, sortBy, sortOrder, router]);

  // fetch
  const fetchData = async () => {
    setLoading(true);
    setErrMsg('');
    try {
      const token =
        (typeof window !== 'undefined' && localStorage.getItem('authToken')) ||
        getCookie('token') || '';

      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (q)        qs.set('q', q);
      if (source)   qs.set('source', source);
      if (airport)  qs.set('airport', airport);
      if (service)  qs.set('service_type', service);
      if (status)   qs.set('status', status);
      if (from)     qs.set('from', from);
      if (to)       qs.set('to', to);

      const res = await fetch(backendProxyPath(`/api/bookings?${qs.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Failed to fetch (${res.status})`);
      }
      const data: BookingListResponse = await res.json();
      setRows(data.data || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setErrMsg(e?.message || 'Failed to fetch');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, source, airport, service, status, from, to, page, limit, sortBy, sortOrder]);

  const handleSort = (key: 'booked_on'|'dropoff'|'return'|'price'|'created_at') => {
    if (sortBy === key) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortOrder('asc'); }
    setPage(1);
  };

  const resetFilters = () => {
    setQ('');
    setSource('');
    setAirport('');
    setService('');
    setStatus('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
              Internal Operations
            </h6>
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
              Admin Bookings
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
              Manage internal reservations, partner bookings, and call center entries. Refine your view using the advanced filters below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="rounded-xl h-12 px-6 font-bold transition-all active:scale-95 border-border/50 hover:bg-muted/50"
            >
              Reset Filters
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
              onClick={() => fetchData()}
            >
              <Telescope size={18} strokeWidth={2.5} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* FILTER PANEL */}
        <div className="glass border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* SEARCH */}
            <div className="flex-1 min-w-[280px] relative group">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search Reference, Reg No, Name..."
                className="h-11 bg-background/50 border-border/50 pl-11 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50 hover:border-primary/30 shadow-inner"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
              <Telescope className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <select
                  className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] hover:border-primary/30 shadow-sm"
                  value={airport}
                  onChange={(e) => { setAirport(e.target.value); setPage(1); }}
                >
                  <option value="">All Airports</option>
                  {airportList.map((a) => (
                    <option key={a.airport_id} value={a.airport_name}>
                      {a.airport_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <select
                  className="h-11 bg-card border border-border/50 px-4 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] hover:border-primary/30 shadow-sm"
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                >
                  <option value="">All Bookings</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="date"
                    className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[160px] hover:border-primary/30 shadow-sm"
                    value={from}
                    onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                  />
                </div>
                <span className="text-muted-foreground font-black text-[10px] uppercase opacity-30 px-1">to</span>
                <div className="relative">
                  <Input
                    type="date"
                    className="h-11 bg-card border-border/50 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-[160px] hover:border-primary/30 shadow-sm"
                    value={to}
                    onChange={(e) => { setTo(e.target.value); setPage(1); }}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                  <TableHead className="w-[80px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">ID</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Reference</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Customer</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Phone</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Airport</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Service</TableHead>
                  
                  <TableHead 
                    onClick={() => handleSort('booked_on')}
                    className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 cursor-pointer hover:text-primary transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-2">
                       Booked On <SortBadge active={sortBy==='booked_on'} />
                    </div>
                  </TableHead>

                  <TableHead 
                    onClick={() => handleSort('dropoff')}
                    className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 cursor-pointer hover:text-primary transition-colors group underline decoration-primary/30 underline-offset-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                       Drop-off <SortBadge active={sortBy==='dropoff'} />
                    </div>
                  </TableHead>

                  <TableHead 
                    onClick={() => handleSort('return')}
                    className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30 cursor-pointer hover:text-primary transition-colors group underline decoration-primary/30 underline-offset-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                       Return <SortBadge active={sortBy==='return'} />
                    </div>
                  </TableHead>

                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Reg No</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Amount</TableHead>
                  <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing transactions...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : errMsg ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-64 text-center">
                       <p className="text-sm font-bold text-red-500">{errMsg}</p>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-64 text-center text-muted-foreground font-medium">
                      No admin bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((b, i) => (
                    <TableRow key={b.id} className="hover:bg-muted/50 transition-all border-b border-border/50 group">
                      <TableCell className="text-center py-4 font-bold text-muted-foreground/50">{(page - 1) * limit + (i + 1)}</TableCell>
                      <TableCell className="text-center py-4 font-medium text-muted-foreground opacity-50 text-[10px]">{b.id}</TableCell>
                      <TableCell className="text-center py-4 font-black text-primary tracking-tight">{b.ref_no}</TableCell>
                      <TableCell className="text-center py-4 font-bold uppercase text-[10px] tracking-wide whitespace-nowrap">{b.customer_name}</TableCell>
                      <TableCell className="text-center py-4 font-medium text-muted-foreground">{b.contact_no || '-'}</TableCell>
                      <TableCell className="text-center py-4 font-black text-[10px] uppercase opacity-40">{b.airport || '-'}</TableCell>
                      <TableCell className="text-center py-4 font-bold text-xs text-muted-foreground/80 whitespace-nowrap">{b.service_type}</TableCell>
                      <TableCell className="text-center py-4 font-medium text-muted-foreground whitespace-nowrap">{fmtDT(b.booked_on)}</TableCell>
                      <TableCell className="text-center py-4 font-bold text-primary/80 whitespace-nowrap">{fmtDT(b.dropoff_datetime)}</TableCell>
                      <TableCell className="text-center py-4 font-bold text-primary/80 whitespace-nowrap">{fmtDT(b.return_datetime)}</TableCell>
                      <TableCell className="text-center py-4 font-black text-[10px] uppercase">{b.vehicle_reg_no || '-'}</TableCell>
                      <TableCell className="text-center py-4 font-black text-xs text-foreground bg-primary/5 whitespace-nowrap">{money(Number(b.price || 0))}</TableCell>
                      <TableCell className="text-center py-4">
                        <span className={cn(
                          "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          b.status === 'Booking Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                          b.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                          b.status === 'Completed' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                          b.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
                          'bg-muted text-muted-foreground border border-border/50'
                        )}>
                          {b.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* PAGINATION SECTION */}
        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <p className="text-xs font-bold text-muted-foreground">
             Showing <span className="text-foreground">{rows.length}</span> of <span className="text-foreground">{total}</span> bookings found
          </p>
          <div className="flex items-center gap-3">
             <select 
               className="h-10 bg-card border border-border/50 px-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
               value={limit} 
               onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1); }}
             >
                {[20, 50, 100, 200].map(n => <option key={n} value={n}>{n} / page</option>)}
             </select>

             <div className="flex items-center gap-1.5">
                <Button 
                   variant="outline" 
                   size="sm"
                   className="h-10 w-10 p-0 rounded-xl transition-all active:scale-95" 
                   onClick={()=>setPage(p=>Math.max(1, p-1))} 
                   disabled={page<=1 || loading}
                >
                   <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center px-4 h-10 rounded-xl bg-muted/50 border border-border/50">
                   <span className="text-xs font-black">Page {page} of {totalPages}</span>
                </div>
                <Button 
                   variant="outline" 
                   size="sm"
                   className="h-10 w-10 p-0 rounded-xl transition-all active:scale-95" 
                   onClick={()=>setPage(p=>Math.min(totalPages, p+1))} 
                   disabled={page>=totalPages || loading}
                >
                   <ChevronRight size={18} />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
