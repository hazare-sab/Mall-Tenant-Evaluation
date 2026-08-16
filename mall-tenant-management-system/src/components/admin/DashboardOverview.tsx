"use client";

import { useEffect, useState } from "react";
import {
  Store, Users, CreditCard, AlertTriangle,
  TrendingUp, Clock, CheckCircle, Building2
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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin-slow" />
      </div>
    );
  }

  if (!data) return <p>Failed to load dashboard data.</p>;

  const cards = [
    { title: "Total Shops", value: data.totalShops, icon: Store, color: "from-blue-500 to-blue-600", change: "" },
    { title: "Occupied Shops", value: data.occupiedShops, icon: Building2, color: "from-emerald-500 to-emerald-600", change: `${data.totalShops ? Math.round((data.occupiedShops / data.totalShops) * 100) : 0}% occupancy` },
    { title: "Vacant Shops", value: data.vacantShops, icon: Store, color: "from-amber-500 to-amber-600", change: "" },
    { title: "Total Tenants", value: data.totalTenants, icon: Users, color: "from-purple-500 to-purple-600", change: "" },
    { title: "Pending Approvals", value: data.pendingPayments, icon: Clock, color: "from-orange-500 to-orange-600", change: "" },
    { title: "Rent Collected", value: `₹${data.rentCollected.toLocaleString()}`, icon: CreditCard, color: "from-green-500 to-green-600", change: "This month" },
    { title: "Overdue Payments", value: data.overduePayments, icon: AlertTriangle, color: "from-red-500 to-red-600", change: "" },
    { title: "Lease Expiring", value: data.leaseExpiring, icon: TrendingUp, color: "from-indigo-500 to-indigo-600", change: "Next 90 days" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-xl p-5 border shadow-sm hover:shadow-md transition"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {card.title}
                </p>
                <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {card.value}
              </p>
              {card.change && (
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {card.change}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div
        className="rounded-xl p-6 border shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Monthly Rent Collection
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                }}
                formatter={(value: unknown) => [`₹${Number(value || 0).toLocaleString()}`, "Collection"]}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
