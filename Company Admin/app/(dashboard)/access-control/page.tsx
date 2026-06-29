"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronRight } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ──────────── Types ──────────── */
type Permission = { id: number; name: string; description: string; module: string };
type Role = {
  id: number;
  name: string;
  description: string | null;
  permissions: number[];
  is_system_default: number;
};

/* ──────────── Component ──────────── */
export default function AccessControlPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  // delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // collapsible modules
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  /* ──── data fetching ──── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const permsUrl = `/api/backend/api/access-control/permissions`;
      const rolesUrl = `/api/backend/api/access-control/roles`;

      const [permRes, roleRes] = await Promise.all([
        fetch(permsUrl, { credentials: "include" }),
        fetch(rolesUrl, { credentials: "include" }),
      ]);
      const permData = await permRes.json();
      const roleData = await roleRes.json();
      setPermissions(permData.data || []);
      setRoles(roleData.data || []);
    } catch (err) {
      console.error("fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ──── group permissions by module ──── */
  const moduleMap: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    const mod = p.module || "Other";
    if (!moduleMap[mod]) moduleMap[mod] = [];
    moduleMap[mod].push(p);
  });
  const moduleNames = Object.keys(moduleMap).sort();

  /* ──── modal open helpers ──── */
  const openCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDesc("");
    setSelectedPerms(new Set());
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description || "");
    setSelectedPerms(new Set(role.permissions));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
  };

  /* ──── toggle helpers ──── */
  const togglePerm = (id: number) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleModule = (mod: string) => {
    const ids = moduleMap[mod].map((p) => p.id);
    const allSelected = ids.every((id) => selectedPerms.has(id));
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const toggleCollapse = (mod: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      next.has(mod) ? next.delete(mod) : next.add(mod);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPerms(new Set(permissions.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedPerms(new Set());
  };

  /* ──── save ──── */
  const handleSave = async () => {
    if (!roleName.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: roleName.trim(),
        description: roleDesc.trim() || null,
        permissions: Array.from(selectedPerms),
      };

      const baseUrl = `/api/backend/api/access-control/roles`;
      const url = editingRole
        ? `${baseUrl}/${editingRole.id}`
        : baseUrl;

      await fetch(url, {
        method: editingRole ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      closeModal();
      fetchData();
    } catch (err) {
      console.error("save error", err);
    } finally {
      setSaving(false);
    }
  };

  /* ──── delete ──── */
  const handleDelete = async (id: number) => {
    try {
      const deleteUrl = `/api/backend/api/access-control/roles/${id}`;
        
      await fetch(deleteUrl, {
        method: "DELETE",
        credentials: "include",
      });
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error("delete error", err);
    }
  };

  /* ──── permission name helper ──── */
  const permName = (id: number) => permissions.find((p) => p.id === id)?.name || "";

  /* ──────────── Render ──────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Control</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage roles and permissions</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <Plus size={18} /> Create Role
        </button>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Role Name</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Description</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Permissions</th>
              <th className="text-center px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-800 dark:text-white">{role.name}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {role.description || "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {role.permissions.length === 0 && (
                      <span className="text-slate-400 italic text-xs">No permissions</span>
                    )}
                    {role.permissions.length <= 6
                      ? role.permissions.map((pid) => (
                          <span
                            key={pid}
                            className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
                          >
                            {permName(pid)}
                          </span>
                        ))
                      : (
                        <>
                          {role.permissions.slice(0, 4).map((pid) => (
                            <span
                              key={pid}
                              className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
                            >
                              {permName(pid)}
                            </span>
                          ))}
                          <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md text-xs font-medium">
                            +{role.permissions.length - 4} more
                          </span>
                        </>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(role)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(role.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No roles found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Role?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This will remove the role and all its permission assignments. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingRole ? "Edit Role" : "Create New Role"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Dispatcher, Accountant"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Optional description for this role"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Permissions ({selectedPerms.size} / {permissions.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {moduleNames.map((mod) => {
                    const perms = moduleMap[mod];
                    const allChecked = perms.every((p) => selectedPerms.has(p.id));
                    const someChecked = perms.some((p) => selectedPerms.has(p.id));
                    const isCollapsed = collapsedModules.has(mod);

                    return (
                      <div
                        key={mod}
                        className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden"
                      >
                        {/* Module header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
                          <button
                            type="button"
                            onClick={() => toggleCollapse(mod)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked; }}
                              onChange={() => toggleModule(mod)}
                              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                              {mod}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({perms.filter((p) => selectedPerms.has(p.id)).length}/{perms.length})
                            </span>
                          </label>
                        </div>

                        {/* Permissions list */}
                        {!isCollapsed && (
                          <div className="px-4 py-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {perms.map((p) => (
                              <label
                                key={p.id}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPerms.has(p.id)}
                                  onChange={() => togglePerm(p.id)}
                                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                                />
                                <div>
                                  <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                    {p.description}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!roleName.trim() || saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Save size={16} />
                {saving ? "Saving…" : editingRole ? "Update Role" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
