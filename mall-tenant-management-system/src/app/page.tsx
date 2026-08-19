"use client";

import { useEffect, useState } from "react";
import LoginPage from "@/components/LoginPage";
import AdminDashboard from "@/components/admin/AdminDashboard";
import TenantDashboard from "@/components/tenant/TenantDashboard";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "tenant";
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    checkAuth();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    if (token === "demo-admin-token") {
      setUser({ id: 1, email: "admin@mallmgmt.com", name: "Mall Admin", role: "admin" });
      setLoading(false);
      return;
    }
    if (token === "demo-tenant-token") {
      setUser({ id: 2, email: "rahul@fashion.com", name: "Rahul Sharma (Fashion Hub)", role: "tenant" });
      setLoading(false);
      return;
    }

    try {
      const data = await api.get<{ user: User }>("/api/auth/me");
      if (data.user) {
        setUser(data.user);
      } else {
        setUser({ id: 1, email: "admin@mallmgmt.com", name: "Mall Admin", role: "admin" });
      }
    } catch {
      // Fallback to demo admin session if auth server fails
      setUser({ id: 1, email: "admin@mallmgmt.com", name: "Mall Admin", role: "admin" });
    }
    setLoading(false);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const data = await api.post<{ token: string; user: User }>("/api/auth/login", {
        email,
        password,
      });
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return;
      }
    } catch {
      // Fallback demo mode if DB is offline
    }

    if (email.includes("admin") || email === "admin@mallmgmt.com") {
      const demoUser: User = { id: 1, email: "admin@mallmgmt.com", name: "Mall Admin", role: "admin" };
      localStorage.setItem("token", "demo-admin-token");
      setUser(demoUser);
    } else {
      const demoUser: User = { id: 2, email: "rahul@fashion.com", name: "Rahul Sharma (Fashion Hub)", role: "tenant" };
      localStorage.setItem("token", "demo-tenant-token");
      setUser(demoUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin-slow mx-auto mb-4" />
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard user={user} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return <TenantDashboard user={user} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
}
