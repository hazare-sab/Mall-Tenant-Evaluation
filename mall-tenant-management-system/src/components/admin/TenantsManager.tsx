"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2, Store, Calendar, CreditCard, Mail, Phone } from "lucide-react";
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
    <div className="space-y-5">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant name, brand, shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-slate-700 transition"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
        >
          <Plus size={15} /> Add New Tenant
        </button>
      </div>

      {/* Main Table */}
      <div className="warm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-slate-50/60 dark:bg-slate-900/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Tenant & Contact</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider hidden md:table-cell">Brand Name</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Allocated Shop</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider hidden lg:table-cell">Monthly Rent</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider hidden xl:table-cell">Lease Period</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Loader2 size={22} className="animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No active tenants found.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{t.userName}</p>
                      <p className="text-[11px] font-medium text-slate-500">{t.userEmail}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                      {t.brandName || "Individual"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        {t.shopNumber ? `Shop ${t.shopNumber}` : "Unassigned"}
                      </span>
                    </td>
                    <td className="py-4 px-6 hidden lg:table-cell font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>
                      {t.monthlyRent ? `₹${parseFloat(t.monthlyRent).toLocaleString()}` : "-"}
                    </td>
                    <td className="py-4 px-6 hidden xl:table-cell font-medium" style={{ color: "var(--text-secondary)" }}>
                      {t.leaseEndDate || "-"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          style={{ borderColor: "var(--border)" }}
                          title="Edit tenant"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg border hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition cursor-pointer"
                          style={{ borderColor: "var(--border)" }}
                          title="Delete tenant"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tenant Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-lg warm-card p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {editing ? "Edit Tenant Profile" : "Register New Tenant"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="rahul@fashion.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="9812345678"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    {editing ? "New Password" : "Password"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder={editing ? "Leave blank to preserve" : "tenant123"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Brand Name</label>
                  <input
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="Fashion Hub"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Assigned Shop</label>
                  <select
                    value={form.shopId}
                    onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="">Unassigned</option>
                    {availableShops.map((s) => (
                      <option key={s.id} value={s.id}>{s.shopNumber} (Floor {s.floor})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={form.monthlyRent}
                    onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700 appearance-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Lease Expiration</label>
                  <input
                    type="date"
                    value={form.leaseEndDate}
                    onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.email}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Save Changes" : "Register Tenant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
