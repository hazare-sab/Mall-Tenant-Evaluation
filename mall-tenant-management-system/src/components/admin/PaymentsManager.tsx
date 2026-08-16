"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle, Eye, Loader2, X } from "lucide-react";
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

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || ""}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor: "var(--border)" }} className="border-b">
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Tenant</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>Shop</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Period</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Amount</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>Due Date</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <Loader2 size={24} className="animate-spin-slow mx-auto" style={{ color: "var(--text-secondary)" }} />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10" style={{ color: "var(--text-secondary)" }}>
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-black/5 dark:hover:bg-white/5 transition" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{p.tenantName}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.brandName}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                      {p.shopNumber || "-"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {monthNames[p.month - 1]} {p.year}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      ₹{parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                      {p.dueDate}
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.proofUrl && (
                          <button
                            onClick={() => setShowProof(p)}
                            className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 cursor-pointer"
                            title="View Proof"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={processing}
                              className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-500 cursor-pointer"
                              title="Approve"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() => { setRejectId(p.id); setRejectReason(""); }}
                              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 cursor-pointer"
                              title="Reject"
                            >
                              <XCircle size={15} />
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProof(null)}>
          <div
            className="w-full max-w-lg rounded-xl p-6 shadow-2xl animate-fade-in"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Payment Proof</h3>
              <button onClick={() => setShowProof(null)} className="p-1 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>
            {showProof.proofType === "pdf" ? (
              <div className="text-center py-10">
                <a
                  href={showProof.proofUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg inline-block"
                >
                  Open PDF
                </a>
              </div>
            ) : (
              <img
                src={showProof.proofUrl || ""}
                alt="Payment proof"
                className="w-full rounded-lg max-h-96 object-contain"
              />
            )}
            <div className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p>Tenant: {showProof.tenantName}</p>
              <p>Amount: ₹{parseFloat(showProof.amount).toLocaleString()}</p>
              <p>Period: {monthNames[showProof.month - 1]} {showProof.year}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRejectId(null)}>
          <div
            className="w-full max-w-md rounded-xl p-6 shadow-2xl animate-fade-in"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Reject Payment</h3>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectId(null)}
                className="flex-1 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing && <Loader2 size={16} className="animate-spin-slow" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
