"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
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

  const floorLabel = (f: number) =>
    f === 0 ? "Ground Floor" : `Floor ${f}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-secondary)" }}
            />

            <input
              type="text"
              placeholder="Search shops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">All Status</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition flex items-center gap-2 cursor-pointer shadow"
        >
          <Plus size={16} />
          Add Shop
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <th className="text-left px-4 py-3 font-semibold">
                  Shop #
                </th>

                <th className="text-left px-4 py-3 font-semibold">
                  Floor
                </th>

                <th className="text-left px-4 py-3 font-semibold">
                  Size
                </th>

                <th className="text-left px-4 py-3 font-semibold">
                  Status
                </th>

                <th className="text-right px-4 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <Loader2
                      size={24}
                      className="animate-spin-slow mx-auto"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No shops found.
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr
                    key={shop.id}
                    className="border-b hover:bg-black/5 dark:hover:bg-white/5 transition"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3 font-medium">
                      {shop.shopNumber}
                    </td>

                    <td className="px-4 py-3">
                      {floorLabel(shop.floor)}
                    </td>

                    <td className="px-4 py-3">
                      {shop.shopSize || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          shop.status === "occupied"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {shop.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(shop)}
                        className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 cursor-pointer mr-1"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(shop.id)}
                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 cursor-pointer"
                      >
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md rounded-xl shadow-xl"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {editing ? "Edit Shop" : "Add Shop"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Shop Number
                </label>

                <input
                  value={form.shopNumber}
                  onChange={(e) =>
                    setForm({ ...form, shopNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Floor
                </label>

                <input
                  type="number"
                  value={form.floor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      floor: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Shop Size
                </label>

                <input
                  value={form.shopSize}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      shopSize: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Category field removed */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 size={16} className="animate-spin-slow" />
                  )}

                  {editing ? "Update Shop" : "Add Shop"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}