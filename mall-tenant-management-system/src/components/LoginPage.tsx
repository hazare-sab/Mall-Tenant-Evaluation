"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Sun,
  Moon,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  Mail,
  X,
  Zap,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function LoginPage({
  onLogin,
  darkMode,
  toggleDarkMode,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    seedData();
  }, []);

  const seedData = async () => {
    setSeeding(true);
    try {
      await fetch("/api/auth/seed", { method: "POST" });
    } catch {
      // ignore
    }
    setSeeding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(email || "admin@mallmgmt.com", password || "admin123");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }

    setLoading(false);
  };

  const handleQuickLogin = async (role: "admin" | "tenant") => {
    setLoading(true);
    if (role === "admin") {
      await onLogin("admin@mallmgmt.com", "admin123");
    } else {
      await onLogin("rahul@fashion.com", "tenant123");
    }
    setLoading(false);
  };

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label="Toggle color theme"
          className="fixed top-4 right-4 p-2.5 rounded-xl border cursor-pointer transition-all hover:scale-105 shadow-sm"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <main
          className="w-full max-w-md rounded-2xl shadow-2xl p-8 animate-fade-in border"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <div className="text-center mb-6">
            <img
              src="/logo.png"
              alt="Mall Tenant Management System Logo"
              className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover shadow-xl shadow-blue-500/20 border border-blue-500/20"
            />

            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Mall Tenant Management
            </h1>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign in or enter instantly using demo mode
            </p>
          </div>

          {/* Quick One-Click Login Options */}
          <div className="mb-6 space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-center" style={{ color: "var(--text-secondary)" }}>
              ⚡ Instant One-Click Demo Access
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                disabled={loading}
                className="py-2.5 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <ShieldCheck size={16} />
                Admin Dashboard
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("tenant")}
                disabled={loading}
                className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <UserCheck size={16} />
                Tenant Dashboard
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t w-full" style={{ borderColor: "var(--border)" }} />
            <span className="bg-transparent px-3 text-xs font-medium uppercase tracking-wider text-slate-400 absolute">
              or sign in with password
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/60 font-medium">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="admin@mallmgmt.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="admin123"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-lg hover:opacity-80 transition"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {seeding && (
            <p
              className="text-center text-xs mt-4 animate-pulse"
              style={{ color: "var(--text-secondary)" }}
            >
              Initializing demo system...
            </p>
          )}
        </main>
      </div>

      {showForgotPassword && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl shadow-2xl border"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Password Reset
              </h2>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                aria-label="Close dialog"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X
                  size={18}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
            </div>

            <div className="p-6">
              <p
                className="leading-relaxed mb-6 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                For security reasons, tenant passwords can only be reset by the
                mall administrator.
              </p>

              <p
                className="font-semibold text-sm mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Please contact the administrator:
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="text-blue-500" size={18} />
                  <span style={{ color: "var(--text-primary)" }}>
                    +91 98765 43210
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="text-blue-500" size={18} />
                  <span style={{ color: "var(--text-primary)" }}>
                    admin@mallmgmt.com
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="mt-8 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}