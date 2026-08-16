"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Tenant {
  id: number;
  userId: number;
  brandName: string | null;
  shopId: number | null;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  monthlyRent: string | null;
  securityDeposit: string | null;
  agreementDocument: string | null;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  shopNumber: string | null;
  shopFloor: number | null;
}

interface Shop {
  id: number;
  shopNumber: string;
  floor: number;
  status: "vacant" | "occupied";
}

export default function TenantsManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    brandName: "", shopId: "" as string,
    leaseStartDate: "", leaseEndDate: "",
    monthlyRent: "", securityDeposit: "",
  });

  useEffect(() => {
    loadTenants();
    loadShops();
  }, [search]);

  const loadTenants = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const data = await api.get<Tenant[]>(`/api/tenants?${params}`);
      setTenants(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const loadShops = async () => {
    try {
      const data = await api.get<Shop[]>("/api/shops");
      setShops(data);
    } catch {
      // ignore
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "", email: "", phone: "", password: "tenant123",
      brandName: "", shopId: "",
      leaseStartDate: "", leaseEndDate: "",
      monthlyRent: "", securityDeposit: "",
    });
    setShowModal(true);
  };

  const openEdit = (t: Tenant) => {
    setEditing(t);
    setForm({
      name: t.userName,
      email: t.userEmail,
      phone: t.userPhone || "",
      password: "",
      brandName: t.brandName || "",
      shopId: t.shopId ? String(t.shopId) : "",
      leaseStartDate: t.leaseStartDate || "",
      leaseEndDate: t.leaseEndDate || "",
      monthlyRent: t.monthlyRent || "",
      securityDeposit: t.securityDeposit || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/tenants/${editing.id}`, {
          ...form,
          shopId: form.shopId ? parseInt(form.shopId) : null,
        });
      } else {
        await api.post("/api/tenants", {
          ...form,
          shopId: form.shopId ? parseInt(form.shopId) : null,
        });
      }
      setShowModal(false);
      loadTenants();
      loadShops();
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tenant? This action cannot be undone.")) return;
    await api.delete(`/api/tenants/${id}`);
    loadTenants();
    loadShops();
  };

  const availableShops = shops.filter(
    (s) => s.status === "vacant" || (editing && s.id === editing.shopId)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search by name, brand, shop, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition flex items-center gap-2 cursor-pointer shadow"
        >
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor: "var(--border)" }} className="border-b">
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Name</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>Brand</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Shop</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>Phone</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>Rent</th>
                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell" style={{ color: "var(--text-secondary)" }}>Lease End</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <Loader2 size={24} className="animate-spin-slow mx-auto" style={{ color: "var(--text-secondary)" }} />
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10" style={{ color: "var(--text-secondary)" }}>
                    No tenants found.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-black/5 dark:hover:bg-white/5 transition" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{t.userName}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>{t.brandName || "-"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{t.shopNumber || "Unassigned"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>{t.userPhone || "-"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell font-medium" style={{ color: "var(--text-primary)" }}>
                      {t.monthlyRent ? `₹${parseFloat(t.monthlyRent).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell" style={{ color: "var(--text-secondary)" }}>{t.leaseEndDate || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 cursor-pointer mr-1" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 cursor-pointer" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-lg rounded-xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {editing ? "Edit Tenant" : "Add New Tenant"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    {editing ? "New Password" : "Password"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder={editing ? "Leave blank to keep" : "tenant123"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Brand Name</label>
                  <input
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Assign Shop</label>
                  <select
                    value={form.shopId}
                    onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="">Unassigned</option>
                    {availableShops.map((s) => (
                      <option key={s.id} value={s.id}>{s.shopNumber} (Floor {s.floor})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Lease Start</label>
                  <input
                    type="date"
                    value={form.leaseStartDate}
                    onChange={(e) => setForm({ ...form, leaseStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Lease End</label>
                  <input
                    type="date"
                    value={form.leaseEndDate}
                    onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={form.monthlyRent}
                    onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={form.securityDeposit}
                    onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition hover:bg-gray-50 dark:hover:bg-slate-700"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.email}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin-slow" />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
