"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  onRead?: () => void;
}

export default function NotificationsPanel({ onRead }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.get<Notification[]>("/api/notifications");
      setNotifications(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const markRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      onRead?.();
    } catch {
      // ignore
    }
  };

  const typeIcon = (type: string) => {
    const colors: Record<string, string> = {
      rent_due: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      payment_approved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      payment_rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      lease_expiry: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      general: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[type] || colors.general;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin-slow" style={{ color: "var(--text-secondary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {notifications.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl p-4 border transition ${!n.isRead ? "ring-2 ring-blue-500/20" : ""}`}
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeIcon(n.type)}`}>
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{n.title}</h4>
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={14} /> Mark read
                    </button>
                  )}
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
                <p className="text-xs mt-2 opacity-60" style={{ color: "var(--text-secondary)" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
