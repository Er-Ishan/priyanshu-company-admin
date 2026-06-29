'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Eye, BarChart3, List, Share2, Telescope } from 'lucide-react';
import { ApexOptions } from 'apexcharts';
import PermissionRoute from '@/components/PermissionRoute';
import BookingDetailsPopup from '@/components/BookingDetailsPopup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { backendProxyPath } from '@/app/lib/backendProxy';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type MediaSourceOption = {
  id: number;
  media_name: string;
  acronym: string;
};

type MarketingLink = {
  id: number;
  name: string;
  slug: string;
  media_name?: string;
  acronym?: string;
  tracking_code?: string | null;
  media_source_id: number | null;
  is_active: number;
};

type BookingRow = {
  id: number;
  ref_no: string;
  customer_name: string;
  contact_no: string | null;
  product_name: string;
  created_at: string;
  dropoff_datetime: string;
  return_datetime: string;
  vehicle_reg_no: string | null;
  make_model: string;
  color: string;
  total_payable: number;
  status: string;
  marketing_source_name?: string;
  media_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  notes?: string | null;
  [key: string]: unknown;
};

type AnalyticsSummary = {
  slug: string;
  name: string;
  bookings: number;
  active_bookings: number;
  revenue: number;
};

type TrendPoint = {
  date: string;
  slug: string;
  bookings: number;
  revenue?: number;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function defaultFromDate() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatExactDateTime(value?: string) {
  if (!value) return { date: '', time: '' };
  const clean = String(value).replace('T', ' ').replace('Z', '');
  const [datePart, timePart = ''] = clean.split(' ');
  const [y, m, d] = datePart.split('-');
  const [hh = '00', mm = '00'] = timePart.split(':');
  if (!y || !m || !d) return { date: value, time: '' };
  return {
    date: `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`,
    time: `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`,
  };
}

function money(n: number) {
  return `£${Number(n || 0).toFixed(2)}`;
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

async function resolveCompanyId(): Promise<number | null> {
  const stored = getStoredUser();
  if (stored?.company_id) return Number(stored.company_id);
  try {
    const res = await fetch('/api/session/me', { cache: 'no-store', credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user?.company_id ? Number(data.user.company_id) : null;
  } catch {
    return null;
  }
}

function mapBooking(b: Record<string, unknown>): BookingRow {
  return {
    ...b,
    id: Number(b.id),
    ref_no: b.ref_no ? String(b.ref_no) : '-',
    customer_name: `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim() || '-',
    contact_no: (b.mobile as string) || null,
    product_name: (b.product_name as string) || '-',
    created_at: (b.created_at as string) || '',
    dropoff_datetime: (b.drop_off_date as string) || '',
    return_datetime: (b.return_date as string) || '',
    vehicle_reg_no: (b.vehicle_registration as string) || null,
    make_model: (b.vehicle_make as string) || '',
    color: (b.vehicle_colour as string) || '',
    total_payable: parseFloat(String(b.total_payable ?? 0)),
    status: (b.status as string) || '',
    marketing_source_name: (b.marketing_source_name as string) || (b.marketing_source as string) || '',
    media_name: (b.media_name as string) || '',
    first_name: (b.first_name as string) || '',
    last_name: (b.last_name as string) || '',
    email: (b.email as string) || '',
    mobile: (b.mobile as string) || '',
    notes: (b.notes as string) || null,
  };
}

export default function SocialMediaReportPage() {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [mediaOptions, setMediaOptions] = useState<MediaSourceOption[]>([]);
  const [links, setLinks] = useState<MarketingLink[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'sales'>('details');

  const [fromDate, setFromDate] = useState(defaultFromDate());
  const [toDate, setToDate] = useState(todayDate());
  const [mediaSourceId, setMediaSourceId] = useState('');
  const [selectedLinkIds, setSelectedLinkIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const [rows, setRows] = useState<BookingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const [summary, setSummary] = useState<AnalyticsSummary[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);

  const apiHeaders = useCallback((resolvedCompanyId?: number | null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const id = resolvedCompanyId ?? companyId;
    if (id) headers['x-company-id'] = id.toString();
    return headers;
  }, [companyId]);

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams({ from: fromDate, to: toDate });
    if (mediaSourceId) params.set('media_source_id', mediaSourceId);
    if (selectedLinkIds.length) params.set('link_ids', selectedLinkIds.join(','));
    return params;
  }, [fromDate, toDate, mediaSourceId, selectedLinkIds]);

  const filteredLinks = useMemo(() => {
    if (!mediaSourceId) return links;
    return links.filter((l) => String(l.media_source_id) === mediaSourceId);
  }, [links, mediaSourceId]);

  const linkLabel = (link: MarketingLink) => {
    const name = link.media_name || link.name;
    const code = link.acronym || link.slug;
    const cid = link.tracking_code ? ` · ${link.tracking_code}` : '';
    return `${name} (${code})${cid}`;
  };

  const fetchLinks = async (resolvedCompanyId: number) => {
    const res = await fetch(backendProxyPath('/api/marketing-sources'), {
      cache: 'no-store',
      credentials: 'include',
      headers: apiHeaders(resolvedCompanyId),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setLinks(data.data || []);
  };

  const fetchMediaOptions = async () => {
    const res = await fetch(backendProxyPath('/api/media-sources'), {
      cache: 'no-store',
      credentials: 'include',
      headers: apiHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setMediaOptions(data.data || []);
  };

  const fetchBookings = async (resolvedCompanyId?: number | null) => {
    setLoading(true);
    setErrMsg('');
    try {
      const params = buildFilterParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(
        backendProxyPath(`/api/marketing-sources/bookings?${params}`),
        { cache: 'no-store', credentials: 'include', headers: apiHeaders(resolvedCompanyId) }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to load bookings');
      setRows((data.data || []).map(mapBooking));
      setTotal(Number(data.total || 0));
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to load bookings');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (resolvedCompanyId?: number | null) => {
    setAnalyticsLoading(true);
    try {
      const params = buildFilterParams();
      const res = await fetch(
        backendProxyPath(`/api/marketing-sources/analytics?${params}`),
        { cache: 'no-store', credentials: 'include', headers: apiHeaders(resolvedCompanyId) }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummary(data.summary || []);
      setTrend(data.trend || []);
    } catch {
      setSummary([]);
      setTrend([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchBookings();
    fetchAnalytics();
  };

  useEffect(() => {
    (async () => {
      const id = await resolveCompanyId();
      if (!id) {
        setErrMsg('Could not determine your company. Please log in again.');
        return;
      }
      setCompanyId(id);
      await Promise.all([fetchMediaOptions(), fetchLinks(id)]);
      await Promise.all([fetchBookings(id), fetchAnalytics(id)]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (companyId) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleLink = (id: number) => {
    setSelectedLinkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const chartData = useMemo(() => {
    const dates = [...new Set(trend.map((t) => String(t.date).slice(0, 10)))].sort();
    const slugs = [...new Set(trend.map((t) => t.slug))];
    const bookingsSeries = slugs.map((slug) => ({
      name: summary.find((s) => s.slug === slug)?.name || slug,
      data: dates.map((date) => {
        const match = trend.find(
          (t) => String(t.date).slice(0, 10) === date && t.slug === slug
        );
        return Number(match?.bookings || 0);
      }),
    }));
    const revenueSeries = slugs.map((slug) => ({
      name: summary.find((s) => s.slug === slug)?.name || slug,
      data: dates.map((date) => {
        const match = trend.find(
          (t) => String(t.date).slice(0, 10) === date && t.slug === slug
        );
        return Number(match?.revenue || 0);
      }),
    }));
    return { categories: dates, bookingsSeries, revenueSeries };
  }, [trend, summary]);

  const bookingsChartOptions: ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, height: 320 },
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, labels: { rotate: -45 } },
    yaxis: { title: { text: 'Bookings' }, min: 0, forceNiceScale: true },
    legend: { position: 'top' },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
  };

  const revenueChartOptions: ApexOptions = {
    chart: { type: 'area', stacked: true, toolbar: { show: false }, height: 320 },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: chartData.categories, labels: { rotate: -45 } },
    yaxis: {
      title: { text: 'Revenue (£)' },
      min: 0,
      labels: { formatter: (v) => `£${Number(v).toFixed(0)}` },
    },
    legend: { position: 'top' },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
    tooltip: { y: { formatter: (v) => `£${Number(v).toFixed(2)}` } },
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PermissionRoute permission="access_social_media_report">
      <div className="w-full min-h-screen px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
              Report
            </h6>
            <h3 className="text-xl font-black tracking-tight text-foreground leading-none flex items-center gap-2">
              <Share2 size={22} className="text-primary" />
              Social Media Links Report
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="glass border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 rounded-xl w-[160px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">To</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 rounded-xl w-[160px]" />
            </div>
            <div className="space-y-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Social Media</label>
              <Select
                value={mediaSourceId || '__all'}
                onValueChange={(v) => {
                  setMediaSourceId(v === '__all' ? '' : v);
                  setSelectedLinkIds([]);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="All media types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All media types</SelectItem>
                  {mediaOptions.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.media_name} ({m.acronym})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ref, name, email, vehicle..."
                className="h-10 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <Button onClick={applyFilters} disabled={loading || analyticsLoading} className="rounded-xl h-10">
              {loading ? 'Loading...' : 'Apply'}
            </Button>
          </div>

          {filteredLinks.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Filter by Links
              </label>
              <div className="flex flex-wrap gap-2">
                {filteredLinks.map((link) => {
                  const selected = selectedLinkIds.includes(link.id);
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => toggleLink(link.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                        selected
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-background border-border/50 text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      {linkLabel(link)}
                    </button>
                  );
                })}
              </div>
              {selectedLinkIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedLinkIds([])}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Clear link filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all',
              activeTab === 'details'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <List size={16} />
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all',
              activeTab === 'sales'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <BarChart3 size={16} />
            Sales
          </button>
        </div>

        {errMsg && (
          <p className="text-sm text-red-500 font-medium">{errMsg}</p>
        )}

        {activeTab === 'details' && (
          <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="w-[60px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">#</TableHead>
                    <TableHead className="w-[80px] text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">View</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Reference</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Source / Link</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Customer / Phone</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Product</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Booking Date</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Drop-off</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Return</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Vehicle</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Amount</TableHead>
                    <TableHead className="text-center font-black text-muted-foreground uppercase tracking-widest py-5 px-4 bg-muted/30">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={12} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                          <p className="text-sm font-bold text-muted-foreground animate-pulse">Fetching bookings...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                          <Telescope size={48} className="text-muted-foreground mb-2" />
                          <p className="text-lg font-black tracking-tight text-foreground">No attributed bookings found</p>
                          <p className="text-xs font-medium text-muted-foreground">Adjust your date range or link filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && rows.map((b, i) => (
                    <TableRow key={b.id} className="hover:bg-muted/50 transition-colors border-b border-border/50">
                      <TableCell className="text-center py-4 font-bold text-muted-foreground/50">
                        {(page - 1) * limit + (i + 1)}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <button
                          onClick={() => { setSelectedBooking(b); setDetailsOpen(true); }}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all active:scale-95"
                          title="View Booking"
                        >
                          <Eye size={14} strokeWidth={2.5} />
                        </button>
                      </TableCell>
                      <TableCell className="text-center py-4 font-black text-primary tracking-tight">{b.ref_no}</TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-[10px] uppercase tracking-wide">{b.media_name || b.marketing_source_name}</span>
                          <span className="text-[9px] text-muted-foreground">{b.marketing_source_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col items-center">
                          <span className="font-bold uppercase text-[10px] tracking-wide text-foreground">{b.customer_name}</span>
                          <span className="text-[9px] font-medium text-muted-foreground">{b.contact_no || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4 font-bold text-xs text-muted-foreground/80">{b.product_name}</TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary/80">{formatExactDateTime(b.created_at).date}</span>
                          <span className="text-xs text-muted-foreground">{formatExactDateTime(b.created_at).time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary/80">{formatExactDateTime(b.dropoff_datetime).date}</span>
                          <span className="text-xs text-muted-foreground">{formatExactDateTime(b.dropoff_datetime).time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary/80">{formatExactDateTime(b.return_datetime).date}</span>
                          <span className="text-xs text-muted-foreground">{formatExactDateTime(b.return_datetime).time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-[10px] uppercase tracking-tighter text-foreground leading-none">{b.vehicle_reg_no || '-'}</span>
                          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{b.make_model} {b.color}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4 font-black text-xs text-foreground bg-primary/5">{money(b.total_payable)}</TableCell>
                      <TableCell className="text-center py-4">
                        <span className={cn(
                          'inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest',
                          b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            b.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                              'bg-muted text-muted-foreground border border-border/50'
                        )}>
                          {b.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="glass border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                <h3 className="font-black tracking-tight text-base">Bookings by Source</h3>
              </div>

              {analyticsLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading analytics...</p>
              ) : summary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {summary.map((item) => (
                    <div key={item.slug} className="rounded-xl border border-border/50 p-4 bg-background/40">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.name}</p>
                      <p className="text-2xl font-black mt-1">{item.bookings} bookings</p>
                      <p className="text-sm text-muted-foreground mt-1">£{Number(item.revenue || 0).toFixed(2)} revenue</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.active_bookings} active</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No attributed bookings in this date range.</p>
              )}
            </div>

            {chartData.bookingsSeries.length > 0 && (
              <div className="glass border-border/50 rounded-2xl p-6 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-foreground">Bookings over time</h4>
                <Chart options={bookingsChartOptions} series={chartData.bookingsSeries} type="bar" height={320} />
              </div>
            )}

            {chartData.revenueSeries.length > 0 && (
              <div className="glass border-border/50 rounded-2xl p-6 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-foreground">Sales (revenue) over time</h4>
                <Chart options={revenueChartOptions} series={chartData.revenueSeries} type="area" height={320} />
              </div>
            )}
          </div>
        )}

        {selectedBooking && (
          <BookingDetailsPopup
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            booking={selectedBooking}
          />
        )}
      </div>
    </PermissionRoute>
  );
}