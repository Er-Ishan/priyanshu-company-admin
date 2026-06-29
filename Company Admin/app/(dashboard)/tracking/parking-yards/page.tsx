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
import { ParkingCircle, Plus, Pencil, Trash2, Save, X, MapPin, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";

type ParkingYard = {
  id: number;
  airport_id: number;
  airport_name?: string;
  yard_name: string;
  postcode: string;
  reny_per_day: number;
  under_roof_charges: number;
  capacity: number;
  latitude: string;
  longitude: string;
  status: string;
};

export default function ParkingYardsPage() {
  const { airports } = useCompanyAirports();
  const [items, setItems] = useState<ParkingYard[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Partial<ParkingYard>>({ status: "Y" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(backendProxyPath("/api/tracking/parking-yards"), {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      toast.error("Failed to load parking yards");
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
    setEditing({ status: "Y", capacity: 0, reny_per_day: 0, under_roof_charges: 0 });
    setView("form");
  };

  const openEdit = (row: ParkingYard) => {
    setEditing({ ...row });
    setView("form");
  };

  const handleSave = async () => {
    if (!editing.airport_id || !editing.yard_name) {
      toast.error("Airport and yard name are required");
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(editing.id);
      const url = isEdit
        ? backendProxyPath(`/api/tracking/parking-yards/${editing.id}`)
        : backendProxyPath("/api/tracking/parking-yards");
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Yard updated" : "Yard created");
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
    if (!confirm("Delete this parking yard?")) return;
    const res = await fetch(backendProxyPath(`/api/tracking/parking-yards/${id}`), {
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
          title="Parking Yards"
          subtitle="Physical yard locations, capacity and pricing"
          icon={ParkingCircle}
          actions={
            view === "list" ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus size={16} /> Add Yard
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
                    <TableHead>Yard</TableHead>
                    <TableHead>Airport</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Rent/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">Loading…</TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No parking yards yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.yard_name}</TableCell>
                        <TableCell>{row.airport_name || row.airport_id}</TableCell>
                        <TableCell>{row.capacity ?? "—"}</TableCell>
                        <TableCell>£{row.reny_per_day ?? 0}</TableCell>
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
            <FormSection title="Basic Information" icon={ParkingCircle}>
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
                  <Label>Yard Name</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.yard_name || ""}
                    onChange={(e) => setEditing({ ...editing, yard_name: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Pricing & Capacity" icon={DollarSign}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Rent Per Day</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="mt-1.5"
                    value={editing.reny_per_day ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, reny_per_day: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Under Roof Charges</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="mt-1.5"
                    value={editing.under_roof_charges ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        under_roof_charges: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    value={editing.capacity ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, capacity: parseInt(e.target.value, 10) || 0 })
                    }
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
