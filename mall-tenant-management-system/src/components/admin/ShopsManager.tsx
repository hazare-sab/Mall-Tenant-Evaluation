"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2, Store, Filter } from "lucide-react";
import { api } from "@/lib/api";

interface Shop {
  id: number;
  shopNumber: string;
  floor: number;
  shopSize: string | null;
  category: string | null;
  status: "vacant" | "occupied";
}

export default function ShopsManager() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Shop | null>(null);

  const [form, setForm] = useState({
    shopNumber: "",
    floor: 0,
    shopSize: "",
    category: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadShops();
  }, [search, filter]);

  const loadShops = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter) params.set("status", filter);

      const data = await api.get<Shop[]>(`/api/shops?${params}`);
      setShops(data);
    } catch {
      // ignore
    }

    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      shopNumber: "",
      floor: 0,
      shopSize: "",
      category: "",
    });
    setShowModal(true);
  };

  const openEdit = (shop: Shop) => {
    setEditing(shop);
    setForm({
      shopNumber: shop.shopNumber,
      floor: shop.floor,
      shopSize: shop.shopSize || "",
      category: shop.category || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/shops/${editing.id}`, {
          ...form,
          status: editing.status,
        });
      } else {
        await api.post("/api/shops", form);
      }

      setShowModal(false);
      loadShops();
    } catch {
      // ignore
    }

    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this shop?")) return;

    await api.delete(`/api/shops/${id}`);
    loadShops();
  };

  const floorLabel = (f: number) => (f === 0 ? "Ground Floor" : `Floor ${f}`);

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shop number, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-slate-700 transition"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs font-semibold outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="">All Statuses</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
        >
          <Plus size={15} /> Add New Shop
        </button>
      </div>

      {/* Main Table */}
      <div className="warm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-slate-50/60 dark:bg-slate-900/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Shop Number</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Floor Level</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Shop Size</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Category</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Status</th>
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
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No shops found matching your search.
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {shop.shopNumber}
                    </td>
                    <td className="py-4 px-6 font-medium" style={{ color: "var(--text-secondary)" }}>
                      {floorLabel(shop.floor)}
                    </td>
                    <td className="py-4 px-6 font-semibold" style={{ color: "var(--text-primary)" }}>
                      {shop.shopSize || "-"}
                    </td>
                    <td className="py-4 px-6 font-medium" style={{ color: "var(--text-secondary)" }}>
                      {shop.category || "Retail"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        shop.status === "occupied" ? "badge-sage" : "badge-amber"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.status === "occupied" ? "bg-emerald-600" : "bg-amber-600"}`} />
                        {shop.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(shop)}
                          className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          style={{ borderColor: "var(--border)" }}
                          title="Edit shop details"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(shop.id)}
                          className="p-1.5 rounded-lg border hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition cursor-pointer"
                          style={{ borderColor: "var(--border)" }}
                          title="Delete shop"
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

      {/* Add / Edit Shop Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-md warm-card p-6 shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                {editing ? "Edit Shop Details" : "Add New Shop Space"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Shop Number *
                </label>
                <input
                  value={form.shopNumber}
                  onChange={(e) => setForm({ ...form, shopNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  placeholder="e.g. G-105"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Floor Level (0 = Ground Floor)
                </label>
                <input
                  type="number"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Shop Dimensions / Size
                </label>
                <input
                  value={form.shopSize}
                  onChange={(e) => setForm({ ...form, shopSize: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  placeholder="e.g. 750 sq ft"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  placeholder="e.g. Fashion, Electronics, Food Court"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-5 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.shopNumber}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Update Shop" : "Create Shop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}