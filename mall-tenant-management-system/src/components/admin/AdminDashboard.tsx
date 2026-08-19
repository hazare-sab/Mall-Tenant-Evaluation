"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  Bell,
  FileText,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Send,
  Building2,
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

type Page = "dashboard" | "shops" | "tenants" | "payments" | "notices" | "reports" | "notifications";

const navItems: { key: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Overview", icon: LayoutDashboard },
  { key: "shops", label: "Shops", icon: Store },
  { key: "tenants", label: "Tenants", icon: Users },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "notices", label: "Notices", icon: Send },
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
      case "reports": return <ReportsPanel />;
      case "notices": return <NoticesPanel />;
      case "notifications": return <NotificationsPanel onRead={() => setUnreadCount((c) => Math.max(0, c - 1))} />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Refined Modern Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--bg-sidebar)" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-800">
            <img
              src="/favicon.png"
              alt="Logo"
              className="w-9 h-9 rounded-xl object-cover border border-slate-700/60 shadow-md"
            />
            <div>
              <h2 className="font-bold text-white text-sm tracking-tight">Mall Tenant Admin</h2>
              <p className="text-[11px] text-slate-400 font-medium">Evaluation & Operations</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setPage(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                    active
                      ? "bg-slate-800/90 text-white shadow-sm border-l-2 border-emerald-400 pl-3.5"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}
                >
                  <Icon size={17} className={active ? "text-emerald-400" : "text-slate-400"} />
                  {item.label}
                  {item.key === "notifications" && unreadCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact User Profile Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-700">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={toggleDarkMode}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
              >
                {darkMode ? <Sun size={13} /> : <Moon size={13} />}
                {darkMode ? "Light" : "Dark"}
              </button>
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-red-400 hover:bg-red-950/40 transition cursor-pointer"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              style={{ borderColor: "var(--border)" }}
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-base font-bold tracking-tight capitalize" style={{ color: "var(--text-primary)" }}>
                {page === "dashboard" ? "Dashboard Overview" : navItems.find((n) => n.key === page)?.label}
              </h1>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {page === "dashboard" && "Real-time key metrics and operational analytics"}
                {page === "shops" && "Manage shop directory, dimensions, and occupancy status"}
                {page === "tenants" && "Tenant records, lease terms, and contact details"}
                {page === "payments" && "Rent collection, pending approvals, and payment logs"}
                {page === "reports" && "Financial reporting, collections, and lease expirations"}
                {page === "notices" && "Broadcast announcements and official notices to tenants"}
                {page === "notifications" && "System notifications and status alerts"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search Bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs w-56" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <Search size={14} className="text-slate-400" />
              <span>Search tenants, shops...</span>
              <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border bg-slate-200/50 dark:bg-slate-800 dark:border-slate-700">⌘K</kbd>
            </div>

            {/* Notification Icon Button */}
            <button
              onClick={() => setPage("notifications")}
              className="p-2 rounded-lg border relative transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
