"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Tenant {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  brandName: string | null;
}

export default function NoticesPanel() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    sendToAll: true,
    userId: "",
    title: "",
    message: "",
    type: "general" as string,
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await api.get<Tenant[]>("/api/tenants");
      setTenants(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleSend = async () => {
    setSending(true);
    setSent(false);
    try {
      await api.post("/api/notifications", {
        sendToAll: form.sendToAll,
        userId: form.sendToAll ? undefined : parseInt(form.userId),
        title: form.title,
        message: form.message,
        type: form.type,
      });
      setSent(true);
      setForm({ ...form, title: "", message: "" });
      setTimeout(() => setSent(false), 3000);
    } catch {
      // ignore
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div
        className="rounded-xl p-6 border shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="text-lg font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
          Send Notice to Tenants
        </h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={form.sendToAll}
                onChange={() => setForm({ ...form, sendToAll: true })}
                className="accent-blue-500"
              />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>All Tenants</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!form.sendToAll}
                onChange={() => setForm({ ...form, sendToAll: false })}
                className="accent-blue-500"
              />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>Specific Tenant</span>
            </label>
          </div>

          {!form.sendToAll && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Select Tenant</label>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="">Choose a tenant...</option>
                {tenants.map((t) => (
                  <option key={t.userId} value={t.userId}>{t.userName} - {t.brandName || t.userEmail}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notice Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <option value="general">General Notice</option>
              <option value="rent_due">Rent Reminder</option>
              <option value="lease_expiry">Lease Expiry Notice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              placeholder="Enter notice title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              placeholder="Enter your notice message..."
            />
          </div>

          {sent && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> Notice sent successfully!
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !form.title || !form.message || (!form.sendToAll && !form.userId)}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 size={16} className="animate-spin-slow" /> : <Send size={16} />}
            {sending ? "Sending..." : "Send Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}
