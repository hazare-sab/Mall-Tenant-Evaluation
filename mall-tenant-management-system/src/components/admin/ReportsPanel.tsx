"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Payment {
  id: number;
  tenantId: number;
  amount: string;
  dueDate: string;
  paymentDate: string | null;
  status: string;
  month: number;
  year: number;
  tenantName: string;
  brandName: string | null;
  shopNumber: string | null;
}

interface Tenant {
  id: number;
  userName: string;
  brandName: string | null;
  shopNumber: string | null;
  monthlyRent: string | null;
  leaseEndDate: string | null;
}

interface Shop {
  id: number;
  shopNumber: string;
  floor: number;
  shopSize: string | null;
  category: string | null;
  status: string;
}

type ReportType = "rent_collection" | "pending" | "overdue" | "occupancy" | "lease_expiry";

export default function ReportsPanel() {
  const [reportType, setReportType] = useState<ReportType>("rent_collection");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const loadReport = async () => {
    setLoading(true);
    try {
      if (reportType === "rent_collection") {
        const data = await api.get<Payment[]>("/api/payments?status=approved");
        setPayments(data);
      } else if (reportType === "pending") {
        const data = await api.get<Payment[]>("/api/payments?status=pending");
        setPayments(data);
      } else if (reportType === "overdue") {
        const data = await api.get<Payment[]>("/api/payments?status=pending");
        const today = new Date().toISOString().split("T")[0];
        setPayments(data.filter((p) => p.dueDate < today));
      } else if (reportType === "occupancy") {
        const data = await api.get<Shop[]>("/api/shops");
        setShops(data);
      } else if (reportType === "lease_expiry") {
        const data = await api.get<Tenant[]>("/api/tenants");
        const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const today = new Date().toISOString().split("T")[0];
        setTenants(data.filter((t) => t.leaseEndDate && t.leaseEndDate >= today && t.leaseEndDate <= futureDate));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    let csv = "";
    if (reportType === "occupancy") {
      csv = "Shop Number,Floor,Size,Category,Status\n";
      shops.forEach((s) => {
        csv += `${s.shopNumber},Floor ${s.floor},${s.shopSize || ""},${s.category || ""},${s.status}\n`;
      });
    } else if (reportType === "lease_expiry") {
      csv = "Tenant,Brand,Shop,Monthly Rent,Lease End\n";
      tenants.forEach((t) => {
        csv += `${t.userName},${t.brandName || ""},${t.shopNumber || ""},${t.monthlyRent || ""},${t.leaseEndDate || ""}\n`;
      });
    } else {
      csv = "Tenant,Brand,Shop,Amount,Due Date,Payment Date,Status,Period\n";
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      payments.forEach((p) => {
        csv += `${p.tenantName},${p.brandName || ""},${p.shopNumber || ""},${p.amount},${p.dueDate},${p.paymentDate || ""},${p.status},${monthNames[p.month - 1]} ${p.year}\n`;
      });
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reports: { key: ReportType; label: string; desc: string }[] = [
    { key: "rent_collection", label: "Rent Collection", desc: "All approved rent payments" },
    { key: "pending", label: "Pending Payments", desc: "Payments awaiting approval" },
    { key: "overdue", label: "Overdue Payments", desc: "Past due date and unpaid" },
    { key: "occupancy", label: "Occupancy Report", desc: "Shop occupancy status" },
    { key: "lease_expiry", label: "Lease Expiry", desc: "Leases expiring in 90 days" },
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {reports.map((r) => (
          <button
            key={r.key}
            onClick={() => setReportType(r.key)}
            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
              reportType === r.key ? "ring-2 ring-blue-500 border-blue-500" : ""
            }`}
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: reportType === r.key ? undefined : "var(--border)" }}
          >
            <FileText size={18} className={reportType === r.key ? "text-blue-500" : ""} style={{ color: reportType === r.key ? undefined : "var(--text-secondary)" }} />
            <p className="font-medium text-sm mt-2" style={{ color: "var(--text-primary)" }}>{r.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{r.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {reports.find((r) => r.key === reportType)?.label}
        </h3>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer shadow"
        >
          <Download size={16} /> Download CSV
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin-slow" style={{ color: "var(--text-secondary)" }} />
            </div>
          ) : reportType === "occupancy" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Shop #</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Floor</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Size</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Category</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((s) => (
                  <tr key={s.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{s.shopNumber}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>Floor {s.floor}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{s.shopSize || "-"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{s.category || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        s.status === "occupied"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === "lease_expiry" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Tenant</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Brand</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Shop</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Monthly Rent</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Lease End</th>
                </tr>
              </thead>
              <tbody>
                {tenants.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10" style={{ color: "var(--text-secondary)" }}>No expiring leases</td></tr>
                ) : tenants.map((t) => (
                  <tr key={t.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{t.userName}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{t.brandName || "-"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{t.shopNumber || "-"}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      {t.monthlyRent ? `₹${parseFloat(t.monthlyRent).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-red-500 font-medium">{t.leaseEndDate || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Tenant</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Shop</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Amount</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Due Date</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Period</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10" style={{ color: "var(--text-secondary)" }}>No data</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{p.tenantName}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.brandName}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.shopNumber || "-"}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      ₹{parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.dueDate}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {monthNames[p.month - 1]} {p.year}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : p.status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
