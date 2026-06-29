'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Plus, Copy, Check, Pencil, Trash2, Megaphone, BarChart3, Globe, ExternalLink,
} from 'lucide-react';
import { ApexOptions } from 'apexcharts';
import ProtectedRoute from '@/components/ProtectedRoute';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  is_active: number;
};

type MarketingSource = {
  id: number;
  media_source_id: number | null;
  name: string;
  slug: string;
  tracking_code: string | null;
  media_name?: string;
  acronym?: string;
  description: string | null;
  is_active: number;
  booking_count: number;
  booking_link: string | null;
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
};

type PageMessage = {
  type: 'success' | 'error';
  text: string;
};

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

async function resolveCompanyContext() {
  const stored = getStoredUser();
  if (stored?.company_id) {
    return {
      companyId: Number(stored.company_id),
      domain: stored.company_domain || null,
      companyName: stored.company_name || null,
    };
  }

  try {
    const res = await fetch('/api/session/me', { cache: 'no-store', credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.user;
    if (!user?.company_id) return null;
    return {
      companyId: Number(user.company_id),
      domain: user.company_domain || null,
      companyName: user.company_name || null,
    };
  } catch {
    return null;
  }
}

function formatDomain(domain: string | null) {
  if (!domain) return '';
  return domain.startsWith('http') ? domain : `https://${domain}`;
}

function buildCampaignLink(
  domain: string | null,
  src: string | null | undefined,
  campaignId?: string | null
): string | null {
  const code = String(src || '').trim();
  if (!domain || !code) return null;
  const url = formatDomain(domain);
  const separator = url.includes('?') ? '&' : '?';
  let link = `${url}${separator}src=${encodeURIComponent(code)}`;
  const cid = String(campaignId || '').trim();
  if (cid) link += `&cid=${encodeURIComponent(cid)}`;
  return link;
}

function mediaLabel(item: MediaSourceOption) {
  return `${item.media_name} (${item.acronym})`;
}

function defaultFromDate() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function MarketingSourcesPage() {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [mediaOptions, setMediaOptions] = useState<MediaSourceOption[]>([]);
  const [rows, setRows] = useState<MarketingSource[]>([]);
  const [domain, setDomain] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [mediaSourceId, setMediaSourceId] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [fromDate, setFromDate] = useState(defaultFromDate());
  const [toDate, setToDate] = useState(todayDate());
  const [summary, setSummary] = useState<AnalyticsSummary[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const apiHeaders = (resolvedCompanyId?: number | null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const id = resolvedCompanyId ?? companyId;
    if (id) headers['x-company-id'] = id.toString();
    return headers;
  };

  const applyCompanyMeta = (domainValue?: string | null, nameValue?: string | null) => {
    if (domainValue) setDomain(domainValue);
    if (nameValue) setCompanyName(nameValue);
  };

  const fetchCompanyDomain = async (resolvedCompanyId?: number | null) => {
    try {
      const res = await fetch(backendProxyPath('/api/marketing-sources/booking-base-url'), {
        cache: 'no-store',
        credentials: 'include',
        headers: apiHeaders(resolvedCompanyId),
      });
      if (!res.ok) return;
      const data = await res.json();
      applyCompanyMeta(data.domain, data.company_name);
    } catch {
      // ignore
    }
  };

  const fetchMediaOptions = async () => {
    try {
      const res = await fetch(backendProxyPath('/api/media-sources'), {
        cache: 'no-store',
        credentials: 'include',
        headers: apiHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setMediaOptions(data.data || []);
    } catch {
      setMediaOptions([]);
    }
  };

  const showPageMessage = (message: PageMessage) => {
    setPageMessage(message);
    window.setTimeout(() => setPageMessage(null), 5000);
  };

  const fetchSources = async (resolvedCompanyId?: number | null) => {
    setLoading(true);
    setErrMsg('');
    try {
      const res = await fetch(backendProxyPath('/api/marketing-sources'), {
        cache: 'no-store',
        credentials: 'include',
        headers: apiHeaders(resolvedCompanyId),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load marketing sources.');
      }
      setRows(data.data || []);
      applyCompanyMeta(data.domain, data.company_name);
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to load marketing sources.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (resolvedCompanyId?: number | null) => {
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      const res = await fetch(backendProxyPath(`/api/marketing-sources/analytics?${params}`), {
        cache: 'no-store',
        credentials: 'include',
        headers: apiHeaders(resolvedCompanyId),
      });
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

  useEffect(() => {
    (async () => {
      const ctx = await resolveCompanyContext();
      if (ctx?.companyId) {
        setCompanyId(ctx.companyId);
        if (ctx.domain) setDomain(ctx.domain);
        if (ctx.companyName) setCompanyName(ctx.companyName);
        await Promise.all([
          fetchMediaOptions(),
          fetchSources(ctx.companyId),
          fetchAnalytics(ctx.companyId),
        ]);
        if (!ctx.domain) await fetchCompanyDomain(ctx.companyId);
      } else {
        setErrMsg('Could not determine your company. Please log in again.');
      }
    })();
  }, []);

  const selectedMedia = useMemo(
    () => mediaOptions.find((m) => String(m.id) === mediaSourceId) || null,
    [mediaOptions, mediaSourceId]
  );

  const activeSources = useMemo(
    () => rows.filter(
      (r) => r.is_active === 1 && buildCampaignLink(domain, r.acronym || r.slug, r.tracking_code)
    ),
    [rows, domain]
  );

  const resetFormFields = () => {
    setMediaSourceId('');
    setTrackingCode('');
    setDescription('');
    setIsActive(true);
    setEditingId(null);
    setFormError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    resetFormFields();
  };

  const openCreate = async () => {
    resetFormFields();
    if (!domain) await fetchCompanyDomain();
    if (mediaOptions.length === 0) await fetchMediaOptions();
    setModalOpen(true);
  };

  const openEdit = async (row: MarketingSource) => {
    setEditingId(row.id);
    setTrackingCode(row.tracking_code || '');
    setDescription(row.description || '');
    setIsActive(row.is_active === 1);
    setFormError('');

    let mediaId = row.media_source_id;
    if (!mediaId) {
      const match = mediaOptions.find(
        (m) => m.acronym === row.acronym || m.acronym === row.slug
      );
      mediaId = match?.id ?? null;
    }
    setMediaSourceId(mediaId ? String(mediaId) : '');

    if (!domain) await fetchCompanyDomain();
    if (mediaOptions.length === 0) await fetchMediaOptions();
    setModalOpen(true);
  };

  const saveSource = async () => {
    if (!mediaSourceId) {
      setFormError('Please select a media source.');
      return;
    }

    const payload = {
      media_source_id: Number(mediaSourceId),
      tracking_code: trackingCode.trim() || null,
      description: description.trim() || null,
      is_active: isActive ? 1 : 0,
    };

    setSaving(true);
    setFormError('');

    try {
      const url = editingId
        ? backendProxyPath(`/api/marketing-sources/${editingId}`)
        : backendProxyPath('/api/marketing-sources');
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Save failed');

      closeModal();
      showPageMessage({
        type: 'success',
        text: editingId ? 'Marketing source updated successfully.' : 'Marketing source created successfully.',
      });
      await fetchSources();
      fetchAnalytics();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setFormError(message);
      showPageMessage({ type: 'error', text: message });
    } finally {
      setSaving(false);
    }
  };

  const deleteSource = async (id: number) => {
    if (!window.confirm('Delete this marketing source?')) return;
    try {
      const res = await fetch(backendProxyPath(`/api/marketing-sources/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: apiHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      showPageMessage({ type: 'success', text: 'Marketing source deleted successfully.' });
      fetchSources();
      fetchAnalytics();
    } catch (err: unknown) {
      showPageMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Delete failed',
      });
    }
  };

  const copyLink = async (link: string | null, code: string) => {
    if (!link) {
      showPageMessage({
        type: 'error',
        text: 'Company domain is not set. Contact Super Admin to add your domain.',
      });
      return;
    }
    await navigator.clipboard.writeText(link);
    setCopiedSlug(code);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const copyAllLinks = async () => {
    const links = activeSources
      .map((r) => {
        const link = buildCampaignLink(domain, r.acronym || r.slug, r.tracking_code);
        return `${r.media_name || r.name}: ${link}`;
      })
      .join('\n');
    if (!links) {
      showPageMessage({ type: 'error', text: 'No active links to copy.' });
      return;
    }
    await navigator.clipboard.writeText(links);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const previewLink = useMemo(() => {
    if (!selectedMedia?.acronym || !domain) return '';
    return buildCampaignLink(domain, selectedMedia.acronym, trackingCode) || '';
  }, [selectedMedia, domain, trackingCode]);

  const chartData = useMemo(() => {
    const dates = [...new Set(trend.map((t) => String(t.date).slice(0, 10)))].sort();
    const slugs = [...new Set(trend.map((t) => t.slug))];
    const series = slugs.map((sourceSlug) => ({
      name: rows.find((r) => (r.acronym || r.slug) === sourceSlug)?.media_name
        || rows.find((r) => r.slug === sourceSlug)?.name
        || sourceSlug,
      data: dates.map((date) => {
        const match = trend.find(
          (t) => String(t.date).slice(0, 10) === date && t.slug === sourceSlug
        );
        return Number(match?.bookings || 0);
      }),
    }));

    return { categories: dates, series };
  }, [trend, rows]);

  const chartOptions: ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, height: 320 },
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, labels: { rotate: -45 } },
    yaxis: { title: { text: 'Bookings' }, min: 0, forceNiceScale: true },
    legend: { position: 'top' },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
  };

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
              Settings
            </h6>
            <h3 className="text-xl font-black tracking-tight text-foreground leading-none">
              Marketing Links
            </h3>
          </div>
          <Button
            className="h-11 rounded-xl px-6 font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg bg-primary text-white shadow-primary/20"
            onClick={openCreate}
          >
            <Plus size={18} />
            Add Source
          </Button>
        </div>

        {pageMessage && (
          <div
            className={cn(
              'rounded-xl px-4 py-3 text-sm font-medium border',
              pageMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
            )}
          >
            {pageMessage.text}
          </div>
        )}

        <div className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-black tracking-tight text-base">Your Campaign Links</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Links use your company domain
                  {companyName ? ` (${companyName})` : ''} with the media acronym as <code className="text-xs">?src=</code>.
                </p>
                {domain ? (
                  <p className="text-sm font-semibold text-foreground mt-2">
                    <span className="text-muted-foreground font-medium">Domain:</span>{' '}
                    {formatDomain(domain)}
                  </p>
                ) : (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    No domain set. Contact Super Admin to add your company domain.
                  </p>
                )}
              </div>
            </div>
            {activeSources.length > 0 && (
              <Button variant="outline" className="rounded-xl shrink-0" onClick={copyAllLinks}>
                {copiedAll ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                {copiedAll ? 'Copied all' : 'Copy all links'}
              </Button>
            )}
          </div>

          {errMsg && <p className="px-6 py-3 text-sm text-red-500">{errMsg}</p>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Media Name</TableHead>
                <TableHead>Media Source</TableHead>
                <TableHead>Campaign ID</TableHead>
                <TableHead>Tracking Link</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No campaign links yet. Click Add Source to create one.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const code = row.acronym || row.slug;
                  const label = row.media_name || row.name;
                  const campaignLink = buildCampaignLink(domain, code, row.tracking_code);
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">{label}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{code}</code>
                      </TableCell>
                      <TableCell>
                        {row.tracking_code ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">{row.tracking_code}</code>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs font-mono text-muted-foreground">
                        {campaignLink || (domain ? '—' : 'Set company domain')}
                      </TableCell>
                      <TableCell>{row.booking_count || 0}</TableCell>
                      <TableCell>{row.is_active ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => copyLink(campaignLink, code)}
                            title="Copy link"
                          >
                            {copiedSlug === code ? <Check size={14} /> : <Copy size={14} />}
                          </Button>
                          {campaignLink && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                              onClick={() => window.open(campaignLink, '_blank')}
                              title="Open link"
                            >
                              <ExternalLink size={14} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => openEdit(row)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-red-500"
                            onClick={() => deleteSource(row.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-black">
                <Megaphone size={18} className="text-primary" />
                {editingId ? 'Edit Marketing Source' : 'Add Marketing Source'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Company Domain
                </label>
                <Input
                  readOnly
                  value={domain ? formatDomain(domain) : 'No domain set for this company'}
                  className="h-10 rounded-xl bg-muted/40 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Media Source
                </label>
                <Select value={mediaSourceId} onValueChange={setMediaSourceId}>
                  <SelectTrigger className="w-full h-10 rounded-xl">
                    <SelectValue placeholder="Select media source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaOptions.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        No media sources available
                      </SelectItem>
                    ) : (
                      mediaOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {mediaLabel(item)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {mediaSourceId && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Campaign ID
                  </label>
                  <Input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.slice(0, 50))}
                    placeholder="Optional campaign identifier"
                    className="h-10 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    When set, the link includes <code className="text-xs">?src=…&amp;cid=…</code>
                  </p>
                </div>
              )}

              {previewLink && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Link Preview
                  </label>
                  <Input readOnly value={previewLink} className="h-10 rounded-xl text-xs font-mono bg-muted/40" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes"
                  className="h-10 rounded-xl"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active
              </label>

              {formError && (
                <p className="text-sm text-red-500 font-medium">{formError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" className="rounded-xl" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button className="rounded-xl font-bold" onClick={saveSource} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Source' : 'Create Source'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="glass border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="font-black tracking-tight text-base">Bookings by Source</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">To</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 rounded-xl" />
              </div>
              <Button onClick={() => fetchAnalytics()} disabled={analyticsLoading} className="rounded-xl h-10">
                {analyticsLoading ? 'Loading...' : 'Apply'}
              </Button>
            </div>
          </div>

          {summary.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.map((item) => (
                <div key={item.slug} className="rounded-xl border border-border/50 p-4 bg-background/40">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.name}</p>
                  <p className="text-2xl font-black mt-1">{item.bookings} bookings</p>
                  <p className="text-sm text-muted-foreground mt-1">£{Number(item.revenue || 0).toFixed(2)} revenue</p>
                </div>
              ))}
            </div>
          )}

          {chartData.series.length > 0 ? (
            <Chart options={chartOptions} series={chartData.series} type="bar" height={320} />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No attributed bookings in this date range.</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
