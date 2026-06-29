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
import { Tag, Plus, Pencil, Trash2, Save, X, Tags } from "lucide-react";
import { toast } from "react-hot-toast";

type LabelSetting = {
  id: number;
  receive_label: string;
  shift_label: string;
  return_label: string;
};

export default function LabelSettingsPage() {
  const [items, setItems] = useState<LabelSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Partial<LabelSetting>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(backendProxyPath("/api/tracking/label-settings"), {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      toast.error("Failed to load label settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing({
      receive_label: "Receive",
      shift_label: "Shift",
      return_label: "Return",
    });
    setView("form");
  };

  const openEdit = (row: LabelSetting) => {
    setEditing({ ...row });
    setView("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isEdit = Boolean(editing.id);
      const url = isEdit
        ? backendProxyPath(`/api/tracking/label-settings/${editing.id}`)
        : backendProxyPath("/api/tracking/label-settings");
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Labels updated" : "Labels created");
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
    if (!confirm("Delete this label configuration?")) return;
    const res = await fetch(backendProxyPath(`/api/tracking/label-settings/${id}`), {
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
          title="Label Settings"
          subtitle="Custom labels for Receive, Shift and Return operations"
          icon={Tag}
          actions={
            view === "list" ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus size={16} /> Add Labels
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
                    <TableHead>Receive</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Return</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">Loading…</TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No label settings. Add one to customize operation names in the driver app.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.receive_label}</TableCell>
                        <TableCell>{row.shift_label}</TableCell>
                        <TableCell>{row.return_label}</TableCell>
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
            <FormSection title="Operation Labels" icon={Tags}>
              <div className="space-y-4">
                {(["receive_label", "shift_label", "return_label"] as const).map((field) => (
                  <div key={field}>
                    <Label className="capitalize">{field.replace("_label", "").replace("_", " ")} Label</Label>
                    <Input
                      className="mt-1.5"
                      value={(editing[field] as string) || ""}
                      onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </FormSection>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
