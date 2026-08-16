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
      await onLogin(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }

    setLoading(false);
  };

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-2 rounded-lg border cursor-pointer transition"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div
          className="w-full max-w-md rounded-2xl shadow-2xl p-8 animate-fade-in"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 size={32} className="text-white" />
            </div>

            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Mall Tenant Management
            </h1>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
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
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin-slow" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {seeding && (
            <p
              className="text-center text-xs mt-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Setting up demo data...
            </p>
          )}
        </div>
      </div>

      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl shadow-2xl border animate-fade-in"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Password Reset
              </h2>

              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                <X
                  size={18}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
            </div>

            <div className="p-6">
              <p
                className="leading-7 mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                For security reasons, tenant passwords can only be reset by the
                mall administrator.
              </p>

              <p
                className="font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Please contact the administrator:
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="text-blue-500" size={20} />
                  <span style={{ color: "var(--text-primary)" }}>
                    +91 98765 43210
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="text-blue-500" size={20} />
                  <span style={{ color: "var(--text-primary)" }}>
                    admin@mallmgmt.com
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowForgotPassword(false)}
                className="mt-8 w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-lg cursor-pointer"
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