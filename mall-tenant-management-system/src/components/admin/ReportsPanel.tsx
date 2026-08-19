"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, Building, Calendar } from "lucide-react";
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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  const reports: { key: ReportType; label: string; desc: string; icon: typeof CheckCircle2 }[] = [
    { key: "rent_collection", label: "Rent Collection", desc: "Approved payments & revenue", icon: CheckCircle2 },
    { key: "pending", label: "Pending Payments", desc: "Awaiting admin verification", icon: Clock },
    { key: "overdue", label: "Overdue Payments", desc: "Unpaid past due date", icon: AlertTriangle },
    { key: "occupancy", label: "Occupancy", desc: "Shop allocation & status", icon: Building },
    { key: "lease_expiry", label: "Lease Expiry", desc: "Expiring within 90 days", icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Financial & Operational Reports
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Export comprehensive analytics, tenant audit trails, and revenue breakdowns
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <Download size={14} /> Download CSV
        </button>
      </div>

      {/* Segmented Control Tab Bar */}
      <div className="p-1 rounded-2xl border flex flex-wrap sm:flex-nowrap gap-1" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        {reports.map((r) => {
          const Icon = r.icon;
          const active = reportType === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setReportType(r.key)}
              className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                active
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={14} className={active ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400"} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Data Table Surface */}
      <div className="warm-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div>
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {reports.find((r) => r.key === reportType)?.label} Data Log
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {reports.find((r) => r.key === reportType)?.desc}
            </p>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 rounded-lg border bg-slate-50 dark:bg-slate-800/60" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            {reportType === "occupancy" ? `${shops.length} Shops` : reportType === "lease_expiry" ? `${tenants.length} Tenants` : `${payments.length} Records`}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : reportType === "occupancy" ? (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-slate-50/60 dark:bg-slate-900/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Shop Number</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Floor</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Shop Size</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Category</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Occupancy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold" style={{ color: "var(--text-primary)" }}>{s.shopNumber}</td>
                    <td className="py-4 px-6" style={{ color: "var(--text-secondary)" }}>Floor {s.floor}</td>
                    <td className="py-4 px-6 font-medium" style={{ color: "var(--text-primary)" }}>{s.shopSize || "-"}</td>
                    <td className="py-4 px-6" style={{ color: "var(--text-secondary)" }}>{s.category || "-"}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        s.status === "occupied" ? "badge-sage" : "badge-amber"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === "occupied" ? "bg-emerald-600" : "bg-amber-600"}`} />
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === "lease_expiry" ? (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-slate-50/60 dark:bg-slate-900/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Tenant Name</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Brand Name</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Shop #</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Monthly Rent</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Lease Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No leases expiring within the next 90 days.
                    </td>
                  </tr>
                ) : tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold" style={{ color: "var(--text-primary)" }}>{t.userName}</td>
                    <td className="py-4 px-6 font-medium" style={{ color: "var(--text-secondary)" }}>{t.brandName || "-"}</td>
                    <td className="py-4 px-6" style={{ color: "var(--text-secondary)" }}>{t.shopNumber || "-"}</td>
                    <td className="py-4 px-6 font-bold" style={{ color: "var(--text-primary)" }}>
                      {t.monthlyRent ? `₹${parseFloat(t.monthlyRent).toLocaleString()}` : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="badge-red px-3 py-1 rounded-full font-semibold">
                        {t.leaseEndDate || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-slate-50/60 dark:bg-slate-900/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Tenant / Brand</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Shop #</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Amount</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Due Date</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Billing Period</th>
                  <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No payment records found for this view.
                    </td>
                  </tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{p.tenantName}</p>
                      <p className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{p.brandName || "Individual Tenant"}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold" style={{ color: "var(--text-secondary)" }}>{p.shopNumber || "-"}</td>
                    <td className="py-4 px-6 font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>
                      ₹{parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-medium" style={{ color: "var(--text-secondary)" }}>{p.dueDate}</td>
                    <td className="py-4 px-6" style={{ color: "var(--text-secondary)" }}>
                      {monthNames[p.month - 1]} {p.year}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === "approved"
                          ? "badge-sage"
                          : p.status === "rejected"
                          ? "badge-red"
                          : "badge-amber"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === "approved" ? "bg-emerald-600" : p.status === "rejected" ? "bg-red-600" : "bg-amber-600"
                        }`} />
                        {p.status.toUpperCase()}
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
