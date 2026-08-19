"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2, XCircle, Eye, Loader2, X, Filter } from "lucide-react";
import { api } from "@/lib/api";

interface Payment {
  id: number;
  tenantId: number;
  amount: string;
  dueDate: string;
  paymentDate: string | null;
  status: "pending" | "approved" | "rejected";
  proofUrl: string | null;
  proofType: string | null;
  rejectionReason: string | null;
  month: number;
  year: number;
  tenantName: string;
  brandName: string | null;
  shopNumber: string | null;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function PaymentsManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showProof, setShowProof] = useState<Payment | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      const data = await api.get<Payment[]>(`/api/payments?${params}`);
      setPayments(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleApprove = async (id: number) => {
    setProcessing(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.put(`/api/payments/${id}`, { status: "approved", paymentDate: today });
      loadPayments();
    } catch {
      // ignore
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setProcessing(true);
    try {
      await api.put(`/api/payments/${rejectId}`, { status: "rejected", rejectionReason: rejectReason });
      setRejectId(null);
      setRejectReason("");
      loadPayments();
    } catch {
      // ignore
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Rent Payment Approvals
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Verify tenant payment receipts and update transaction logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="warm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-slate-50/60 dark:bg-slate-900/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Tenant / Brand</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider hidden md:table-cell">Shop #</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Billing Period</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Amount</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider hidden md:table-cell">Due Date</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-6 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Loader2 size={22} className="animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{p.tenantName}</p>
                      <p className="text-[11px] font-medium text-slate-500">{p.brandName || "Individual Tenant"}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                      {p.shopNumber || "-"}
                    </td>
                    <td className="py-4 px-6 font-medium" style={{ color: "var(--text-secondary)" }}>
                      {monthNames[p.month - 1]} {p.year}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>
                      ₹{parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell font-medium" style={{ color: "var(--text-secondary)" }}>
                      {p.dueDate}
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
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.proofUrl && (
                          <button
                            onClick={() => setShowProof(p)}
                            className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            style={{ borderColor: "var(--border)" }}
                            title="View proof receipt"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={processing}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              onClick={() => { setRejectId(p.id); setRejectReason(""); }}
                              className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Viewer */}
      {showProof && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setShowProof(null)}>
          <div
            className="w-full max-w-lg warm-card p-6 shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Payment Proof Receipt</h3>
              <button onClick={() => setShowProof(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            {showProof.proofType === "pdf" ? (
              <div className="text-center py-10">
                <a
                  href={showProof.proofUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl inline-block"
                >
                  Open PDF Document
                </a>
              </div>
            ) : (
              <img
                src={showProof.proofUrl || ""}
                alt="Payment proof"
                className="w-full rounded-xl max-h-80 object-contain border bg-slate-50 dark:bg-slate-900"
                style={{ borderColor: "var(--border)" }}
              />
            )}
            <div className="mt-4 text-xs space-y-1 text-slate-500 dark:text-slate-400">
              <p><strong className="text-slate-800 dark:text-slate-200">Tenant:</strong> {showProof.tenantName}</p>
              <p><strong className="text-slate-800 dark:text-slate-200">Amount:</strong> ₹{parseFloat(showProof.amount).toLocaleString()}</p>
              <p><strong className="text-slate-800 dark:text-slate-200">Period:</strong> {monthNames[showProof.month - 1]} {showProof.year}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId !== null && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setRejectId(null)}>
          <div
            className="w-full max-w-md warm-card p-6 shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Reject Payment Request</h3>
            <div className="text-xs">
              <label className="block font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-slate-700 min-h-[90px]"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                placeholder="Specify reason for tenant..."
              />
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setRejectId(null)}
                className="flex-1 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing && <Loader2 size={14} className="animate-spin" />}
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
