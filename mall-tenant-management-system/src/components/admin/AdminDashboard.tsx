"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Store, Users, CreditCard, Bell, FileText,
  LogOut, Menu, X, Sun, Moon, Building2, ChevronDown, Search,
  Send
} from "lucide-react";
import DashboardOverview from "./DashboardOverview";
import ShopsManager from "./ShopsManager";
import TenantsManager from "./TenantsManager";
import PaymentsManager from "./PaymentsManager";
import NotificationsPanel from "../shared/NotificationsPanel";
import ReportsPanel from "./ReportsPanel";
import NoticesPanel from "./NoticesPanel";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "tenant";
}

interface Props {
  user: User;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

type Page = "dashboard" | "shops" | "tenants" | "payments" | "notifications" | "reports" | "notices";

const navItems: { key: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "shops", label: "Shops", icon: Store },
  { key: "tenants", label: "Tenants", icon: Users },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "notices", label: "Notices", icon: Send },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "notifications", label: "Notifications", icon: Bell },
];

export default function AdminDashboard({ user, onLogout, darkMode, toggleDarkMode }: Props) {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.get<{ id: number; isRead: boolean }[]>("/api/notifications");
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // ignore
    }
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardOverview />;
      case "shops": return <ShopsManager />;
      case "tenants": return <TenantsManager />;
      case "payments": return <PaymentsManager />;
      case "notifications": return <NotificationsPanel onRead={() => setUnreadCount((c) => Math.max(0, c - 1))} />;
      case "reports": return <ReportsPanel />;
      case "notices": return <NoticesPanel />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--bg-sidebar)" }}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Mall Management</h2>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setPage(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                  {item.key === "notifications" && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleDarkMode}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 transition cursor-pointer"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                {darkMode ? "Light" : "Dark"}
              </button>
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header
          className="sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-8 py-4 border-b"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
            style={{ color: "var(--text-primary)" }}
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg lg:text-xl font-bold capitalize" style={{ color: "var(--text-primary)" }}>
            {page === "dashboard" ? "Dashboard" : navItems.find((n) => n.key === page)?.label}
          </h1>
        </header>

        <div className="p-4 lg:p-8 animate-fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
