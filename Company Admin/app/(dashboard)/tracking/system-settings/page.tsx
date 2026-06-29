"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrackingPageHeader from "@/components/tracking/TrackingPageHeader";
import FormSection from "@/components/tracking/FormSection";
import { backendProxyPath } from "@/app/lib/backendProxy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { Settings, Plus, Pencil, Trash2, Save, X, Gauge } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

type CompSetting = {
  id: number;
  grace_time: string;
  extra_charge_type: string;
  charge_value: number;
  status: string;
};

export default function SystemSettingsPage() {
  const [items, setItems] = useState<CompSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Partial<CompSetting>>({ status: "Y" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(backendProxyPath("/api/tracking/settings"), {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing({ grace_time: "", extra_charge_type: "", charge_value: 0, status: "Y" });
    setView("form");
  };

  const openEdit = (row: CompSetting) => {
    setEditing({ ...row });
    setView("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isEdit = Boolean(editing.id);
      const url = isEdit
        ? backendProxyPath(`/api/tracking/settings/${editing.id}`)
        : backendProxyPath("/api/tracking/settings");
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Settings updated" : "Settings created");
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
    if (!confirm("Delete this settings record?")) return;
    try {
      const res = await fetch(backendProxyPath(`/api/tracking/settings/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Deleted");
        load();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
        <TrackingPageHeader
          title="System Settings"
          subtitle="Company billing rules — grace time and extra charges"
          icon={Settings}
          actions={
            view === "list" ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus size={16} /> Add Settings
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setView("list")} className="gap-2">
                  <X size={16} /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save size={16} /> {saving ? "Saving…" : "Save"}
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
                    <TableHead>Grace Time</TableHead>
                    <TableHead>Charge Type</TableHead>
                    <TableHead>Charge Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No settings yet. Click Add Settings to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.grace_time || "—"}</TableCell>
                        <TableCell>{row.extra_charge_type || "—"}</TableCell>
                        <TableCell>{row.charge_value ?? "—"}</TableCell>
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
          <div className="max-w-2xl">
            <FormSection title="Billing Configuration" icon={Gauge}>
              <div className="space-y-4">
                <div>
                  <Label>Grace Time</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g. 15 minutes"
                    value={editing.grace_time || ""}
                    onChange={(e) => setEditing({ ...editing, grace_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Extra Charge Type</Label>
                  <Select
                    value={editing.extra_charge_type || ""}
                    onValueChange={(v) => setEditing({ ...editing, extra_charge_type: v })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fix">Fix</SelectItem>
                      <SelectItem value="Percent">Percent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Charge Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="mt-1.5"
                    value={editing.charge_value ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, charge_value: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.status === "Y"}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.checked ? "Y" : "N" })
                    }
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium">Active Status</span>
                </label>
              </div>
            </FormSection>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
