"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrackingPageHeader from "@/components/tracking/TrackingPageHeader";
import FormSection from "@/components/tracking/FormSection";
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
import { Users, Plus, Pencil, Trash2, Save, X, User, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

type Driver = {
  id: number;
  airport_id: number;
  airport_name?: string;
  first_name: string;
  last_name: string;
  cell_no: string;
  email: string;
  user_name: string;
  password?: string;
  image_path: string;
  active_status: string;
  verified: string;
  blocked: string;
};

export default function DriversPage() {
  const { airports } = useCompanyAirports();
  const [items, setItems] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Partial<Driver>>({
    active_status: "Y",
    verified: "N",
    blocked: "N",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(backendProxyPath("/api/tracking/drivers?full=1"), {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing({ active_status: "Y", verified: "N", blocked: "N" });
    setView("form");
  };

  const openEdit = (row: Driver) => {
    setEditing({ ...row, password: "" });
    setView("form");
  };

  const handleSave = async () => {
    if (!editing.first_name || !editing.last_name || !editing.cell_no) {
      toast.error("First name, last name and cell number are required");
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(editing.id);
      const payload = { ...editing };
      if (isEdit && !payload.password) delete payload.password;

      const url = isEdit
        ? backendProxyPath(`/api/tracking/drivers/${editing.id}`)
        : backendProxyPath("/api/tracking/drivers");
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Driver updated" : "Driver created");
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
    if (!confirm("Delete this driver?")) return;
    const res = await fetch(backendProxyPath(`/api/tracking/drivers/${id}`), {
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
          title="Drivers"
          subtitle="Driver profiles, credentials and app access"
          icon={Users}
          actions={
            view === "list" ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus size={16} /> Add Driver
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
                    <TableHead>Name</TableHead>
                    <TableHead>Cell</TableHead>
                    <TableHead>Airport</TableHead>
                    <TableHead>Username</TableHead>
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
                        No drivers yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.first_name} {row.last_name}
                        </TableCell>
                        <TableCell>{row.cell_no}</TableCell>
                        <TableCell>{row.airport_name || "—"}</TableCell>
                        <TableCell>{row.user_name || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant={row.active_status === "Y" ? "default" : "secondary"}>
                              {row.active_status === "Y" ? "Active" : "Inactive"}
                            </Badge>
                            {row.blocked === "Y" && <Badge variant="destructive">Blocked</Badge>}
                            {row.verified === "Y" && <Badge variant="outline">Verified</Badge>}
                          </div>
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
            <FormSection title="Personal Information" icon={User}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.first_name || ""}
                    onChange={(e) => setEditing({ ...editing, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.last_name || ""}
                    onChange={(e) => setEditing({ ...editing, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cell No</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.cell_no || ""}
                    onChange={(e) => setEditing({ ...editing, cell_no: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    className="mt-1.5"
                    value={editing.email || ""}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  />
                </div>
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
                  <Label>Image Path</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.image_path || ""}
                    onChange={(e) => setEditing({ ...editing, image_path: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="App Credentials" icon={Shield}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Username</Label>
                  <Input
                    className="mt-1.5"
                    value={editing.user_name || ""}
                    onChange={(e) => setEditing({ ...editing, user_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Password {editing.id ? "(leave blank to keep)" : ""}</Label>
                  <Input
                    type="password"
                    className="mt-1.5"
                    value={editing.password || ""}
                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  />
                </div>
              </div>
            </FormSection>

            <div className="flex flex-wrap gap-6 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.active_status === "Y"}
                  onChange={(e) =>
                    setEditing({ ...editing, active_status: e.target.checked ? "Y" : "N" })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.verified === "Y"}
                  onChange={(e) =>
                    setEditing({ ...editing, verified: e.target.checked ? "Y" : "N" })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.blocked === "Y"}
                  onChange={(e) =>
                    setEditing({ ...editing, blocked: e.target.checked ? "Y" : "N" })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Blocked</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
