"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle2, Megaphone } from "lucide-react";
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
      <div className="warm-card p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <Megaphone size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Broadcast Tenant Announcement
            </h3>
            <p className="text-xs text-slate-500">
              Send circulars, maintenance notifications, or payment reminders
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ color: "var(--text-primary)" }}>
              <input
                type="radio"
                checked={form.sendToAll}
                onChange={() => setForm({ ...form, sendToAll: true })}
                className="accent-slate-900"
              />
              <span>All Active Tenants</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ color: "var(--text-primary)" }}>
              <input
                type="radio"
                checked={!form.sendToAll}
                onChange={() => setForm({ ...form, sendToAll: false })}
                className="accent-slate-900"
              />
              <span>Specific Tenant</span>
            </label>
          </div>

          {!form.sendToAll && (
            <div>
              <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Select Recipient *</label>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border outline-none cursor-pointer"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="">Choose a tenant recipient...</option>
                {tenants.map((t) => (
                  <option key={t.userId} value={t.userId}>{t.userName} - {t.brandName || t.userEmail}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Notice Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border outline-none cursor-pointer"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <option value="general">General Circular / Update</option>
              <option value="rent_due">Rent Due Reminder</option>
              <option value="lease_expiry">Lease Expiry Notice</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Notice Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              placeholder="e.g. Scheduled Elevator Maintenance Notice"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Message Body *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700 min-h-[110px]"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              placeholder="Provide full details of the notice..."
            />
          </div>

          {sent && (
            <div className="p-3 rounded-xl badge-sage font-semibold flex items-center gap-2">
              <CheckCircle2 size={15} /> Announcement dispatched to recipient(s)!
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !form.title || !form.message || (!form.sendToAll && !form.userId)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending ? "Transmitting Announcement..." : "Broadcast Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}
