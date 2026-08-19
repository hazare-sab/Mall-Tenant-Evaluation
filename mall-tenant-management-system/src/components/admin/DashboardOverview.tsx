"use client";

import { useEffect, useState } from "react";
import {
  Store, Users, CreditCard, AlertTriangle,
  TrendingUp, Clock, CheckCircle2, Building2
} from "lucide-react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardData {
  totalShops: number;
  occupiedShops: number;
  vacantShops: number;
  totalTenants: number;
  pendingPayments: number;
  rentCollected: number;
  overduePayments: number;
  leaseExpiring: number;
  monthlyData: { month: string; year: number; amount: number }[];
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const d = await api.get<DashboardData>("/api/dashboard");
      setData(d);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-sm text-slate-500">Failed to load dashboard data.</p>;

  const cards = [
    { title: "Total Shops", value: data.totalShops, icon: Store, note: "Commercial spaces", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
    { title: "Occupied Shops", value: data.occupiedShops, icon: Building2, note: `${data.totalShops ? Math.round((data.occupiedShops / data.totalShops) * 100) : 0}% occupancy rate`, color: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
    { title: "Vacant Shops", value: data.vacantShops, icon: Store, note: "Ready for lease", color: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
    { title: "Active Tenants", value: data.totalTenants, icon: Users, note: "Registered businesses", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
    { title: "Pending Approvals", value: data.pendingPayments, icon: Clock, note: "Requires admin review", color: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
    { title: "Rent Collected", value: `₹${data.rentCollected.toLocaleString()}`, icon: CreditCard, note: "Current billing cycle", color: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
    { title: "Overdue Payments", value: data.overduePayments, icon: AlertTriangle, note: "Past due date", color: "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
    { title: "Lease Expiry", value: data.leaseExpiring, icon: TrendingUp, note: "Next 90 days", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="warm-card warm-card-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-xl ${card.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {card.value}
                </p>
              </div>
              {card.note && (
                <p className="text-[11px] font-medium mt-3 text-slate-500 dark:text-slate-400">
                  {card.note}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div className="warm-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Monthly Rent Collection Performance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical revenue breakdown over the past 6 billing months
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full badge-sage">
            Updated Today
          </span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
                formatter={(value: unknown) => [`₹${Number(value || 0).toLocaleString()}`, "Rent Revenue"]}
              />
              <Bar dataKey="amount" fill="#1E293B" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
