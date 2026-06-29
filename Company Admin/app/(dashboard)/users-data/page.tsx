'use client';

import { Fragment, useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus, Shield, Mail, User, Search, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ProtectedRoute from '@/components/ProtectedRoute';

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  password?: string;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<AdminUser>>({});
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [dbRoles, setDbRoles] = useState<{ id: number; name: string }[]>([]);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/backend/api/access-control/roles`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const list = data.data || [];
      setDbRoles(list);
      if (list.length > 0 && !role) setRole(list[0].name);
    } catch (err) {
      console.error("Failed to load roles", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await fetch(`/api/backend/api/getdata/users`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setErrMsg("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const createUser = async () => {
    if (!name || !email || !password) {
      alert("All fields required");
      return;
    }
    try {
      const res = await fetch(`/api/backend/api/insertdata/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!res.ok) throw new Error(await res.text());
      setName("");
      setEmail("");
      setPassword("");
      setRole(dbRoles.length > 0 ? dbRoles[0].name : "");
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setEditData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const updateUser = async (id: number) => {
    try {
      const res = await fetch(`/api/backend/api/updatedata/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error(await res.text());
      closeEdit();
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this User?")) return;
    try {
      const res = await fetch(`/api/backend/api/deletedata/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredRows = rows.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="w-full space-y-8 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Admin Settings</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Manage portal administrators and their access permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search admins..."
                className="pl-10 h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setShowForm(v => !v)} 
              className={`glass-primary rounded-xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${showForm ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : ''}`}
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showForm ? 'Cancel' : 'Add Admin'}</span>
            </Button>
          </div>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <div className="glass p-6 rounded-3xl border border-primary/20 shadow-xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Create New Administrator</h2>
                <p className="text-xs text-muted-foreground font-medium">Define credentials and assign an operational role.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input 
                    className='pl-10 h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold' 
                    placeholder="Enter full name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input 
                    className='pl-10 h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold' 
                    placeholder="admin@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <div className="relative group">
                  <Input
                    className="pr-10 h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Role</label>
                <select
                  className="w-full h-11 glass-input rounded-xl border-transparent focus:border-primary/30 transition-all font-bold text-sm px-4 outline-none bg-background/50"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  {dbRoles.map(r => (
                    <option key={r.id} value={r.name} className="bg-background">{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowForm(false)}>Discard</Button>
              <Button className='glass-primary rounded-xl px-8 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20' onClick={createUser}>Create User Account</Button>
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
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Administrator</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</TableHead>
                  <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">System Role</TableHead>
                  <TableHead className="h-14 text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <p className="text-sm font-bold text-muted-foreground/50 italic tracking-widest">LOADING DIRECTORY...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground/50">No administrators found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRows.map((u, i) => (
                  <Fragment key={u.id}>
                    <TableRow className={`group hover:bg-muted/30 transition-all border-border/40 ${editingId === u.id ? 'bg-primary/5' : ''}`}>
                      <TableCell className="py-5 text-center font-bold text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{u.name}</span>
                            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">Active User</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 font-bold text-sm text-muted-foreground/80">{u.email}</TableCell>
                      <TableCell className="py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.role.toLowerCase() === 'superadmin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`h-9 w-9 rounded-xl transition-all ${editingId === u.id ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10 hover:text-primary text-muted-foreground/50'}`}
                                onClick={() => editingId === u.id ? closeEdit() : openEdit(u)}
                              >
                                {editingId === u.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{editingId === u.id ? 'Close Edit' : 'Edit Admin'}</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-600 text-muted-foreground/50 transition-all"
                                onClick={() => deleteUser(u.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Admin</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>

                    {editingId === u.id && (
                      <TableRow className="bg-primary/[0.02] border-border/40">
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-6 border-x-4 border-x-primary/30 animate-in slide-in-from-left-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-primary/60 ml-1">Edit Name</label>
                                <Input className='h-10 glass-input rounded-lg font-bold' value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-primary/60 ml-1">Edit Email</label>
                                <Input className='h-10 glass-input rounded-lg font-bold' value={editData.email || ""} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-primary/60 ml-1">New Password (Optional)</label>
                                <div className="relative">
                                  <Input
                                    className="pr-10 h-10 glass-input rounded-lg font-bold"
                                    placeholder="Keep empty to stay same"
                                    type={showEditPassword ? "text" : "password"}
                                    value={(editData as any).password || ""}
                                    onChange={e => setEditData({ ...editData, password: e.target.value })}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowEditPassword(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                                  >
                                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-primary/60 ml-1">Change Role</label>
                                <select
                                  className="w-full h-10 glass-input rounded-lg font-bold text-sm px-3 outline-none bg-background/50"
                                  value={editData.role || ""}
                                  onChange={e => setEditData({ ...editData, role: e.target.value })}
                                >
                                  {dbRoles.map(r => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-6">
                              <Button variant="ghost" size="sm" className="rounded-lg font-bold h-9" onClick={closeEdit}>Discard</Button>
                              <Button className='glass-primary rounded-lg px-6 font-bold text-xs h-9 tracking-widest' onClick={() => updateUser(u.id)}>Apply Changes</Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {errMsg && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-in slide-in-from-bottom-4">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-black tracking-tight">{errMsg}</p>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}