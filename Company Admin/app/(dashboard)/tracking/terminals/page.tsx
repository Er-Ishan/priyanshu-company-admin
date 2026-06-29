"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrackingPageHeader from "@/components/tracking/TrackingPageHeader";
import FormSection from "@/components/tracking/FormSection";
import GooglePlacesInput from "@/components/tracking/GooglePlacesInput";
import { useCompanyAirports } from "@/components/tracking/useCompanyAirports";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Terminal, Plus, Pencil, Trash2, Save, X, MapPin, Plane } from "lucide-react";
import { toast } from "react-hot-toast";

type TerminalRow = {
  id: number;
  airport_id: number;
  terminal_id: number;
  terminal_name: string;
  display_terminal_name?: string;
  airport_name?: string;
  postcode: string;
  latitude: string;
  longitude: string;
  status: string;
};

type GlobalTerminal = { id: number; terminal_name: string };

export default function TerminalsPage() {
  const { airports } = useCompanyAirports();
  const [items, setItems] = useState<TerminalRow[]>([]);
  const [globalTerminals, setGlobalTerminals] = useState<GlobalTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Partial<TerminalRow>>({ status: "Y" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, infoRes] = await Promise.all([
        fetch(backendProxyPath("/api/tracking/terminals"), { credentials: "include" }),
        fetch(backendProxyPath("/api/tracking/terminals-info"), { credentials: "include" }),
      ]);
      const listJson = await listRes.json();
      const infoJson = await infoRes.json();
      if (listJson.success) setItems(listJson.data);
      if (infoJson.success) setGlobalTerminals(infoJson.data);
    } catch {
      toast.error("Failed to load terminals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onPlaceSelect = useCallback((place: { postcode?: string; latitude?: string; longitude?: string }) => {
    setEditing((prev) => ({
      ...prev,
      postcode: place.postcode || prev.postcode,
      latitude: place.latitude || prev.latitude,
      longitude: place.longitude || prev.longitude,
    }));
  }, []);

  const openCreate = () => {
    setEditing({ status: "Y" });
    setView("form");
  };

  const openEdit = (row: TerminalRow) => {
    setEditing({ ...row });
    setView("form");
  };

  const handleSave = async () => {
    if (!editing.airport_id || !editing.terminal_id) {
      toast.error("Airport and terminal are required");
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(editing.id);
      const url = isEdit
        ? backendProxyPath(`/api/tracking/terminals/${editing.id}`)
        : backendProxyPath("/api/tracking/terminals");
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Terminal updated" : "Terminal created");
        setView("list");
        load();
      } else {
        toast.error(json.message || "Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this terminal?")) return;
    const res = await fetch(backendProxyPath(`/api/tracking/terminals/${id}`), {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
        <TrackingPageHeader
          title="Terminals"
          subtitle="Company airport terminals with location data"
          icon={Terminal}
          actions={
            view === "list" ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus size={16} /> Add Terminal
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setView("list")} className="gap-2">
                  <X size={16} /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save size={16} /> Save
                </Button>
              </div>
            )
          }
        />

        {view === "list" ? (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Airport</TableHead>
                    <TableHead>Terminal</TableHead>
                    <TableHead>Postcode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">Loading…</TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No terminals configured yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.airport_name || row.airport_id}</TableCell>
                        <TableCell className="font-medium">
                          {row.display_terminal_name || row.terminal_name}
                        </TableCell>
                        <TableCell>{row.postcode || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={row.status === "Y" ? "default" : "secondary"}>
                            {row.status === "Y" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                            <Pencil size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-3xl space-y-4">
            <FormSection title="Airport & Terminal" icon={Plane}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Airport</Label>
                  <Select
                    value={editing.airport_id ? String(editing.airport_id) : ""}
                    onValueChange={(v) => setEditing({ ...editing, airport_id: Number(v) })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((a) => (
                        <SelectItem key={a.airport_id} value={String(a.airport_id)}>
                          {a.airport_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Global Terminal</Label>
                  <Select
                    value={editing.terminal_id ? String(editing.terminal_id) : ""}
                    onValueChange={(v) => setEditing({ ...editing, terminal_id: Number(v) })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      {globalTerminals.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.terminal_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Display Name (optional override)</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.terminal_name || ""}
                    onChange={(e) => setEditing({ ...editing, terminal_name: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Location" icon={MapPin}>
              <GooglePlacesInput onPlaceSelect={onPlaceSelect} className="mb-4" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Postcode</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.postcode || ""}
                    onChange={(e) => setEditing({ ...editing, postcode: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Latitude</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.latitude || ""}
                    onChange={(e) => setEditing({ ...editing, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.longitude || ""}
                    onChange={(e) => setEditing({ ...editing, longitude: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <label className="flex items-center gap-2 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={editing.status === "Y"}
                onChange={(e) => setEditing({ ...editing, status: e.target.checked ? "Y" : "N" })}
                className="rounded"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
