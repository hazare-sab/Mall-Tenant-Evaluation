"use client";

import { useEffect, useState } from "react";
import { Upload, Loader2, FileText, CheckCircle, XCircle, Clock, Download, X } from "lucide-react";
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

export default function TenantPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await api.get<Payment[]>("/api/payments");
      setPayments(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleUpload = async (paymentId: number, file: File) => {
    setUploading(paymentId);
    try {
      const uploadResult = await api.upload(file);
      const today = new Date().toISOString().split("T")[0];
      await api.put(`/api/payments/${paymentId}`, {
        proofUrl: uploadResult.url,
        proofType: uploadResult.type,
        paymentDate: today,
      });
      loadPayments();
    } catch {
      // ignore
    }
    setUploading(null);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle size={16} className="text-emerald-500" />;
      case "rejected": return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${styles[status] || ""}`}>
        {statusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin-slow" style={{ color: "var(--text-secondary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-xl p-4 border shadow-sm"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Total Payments</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{payments.length}</p>
        </div>
        <div
          className="rounded-xl p-4 border shadow-sm"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Approved</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{payments.filter((p) => p.status === "approved").length}</p>
        </div>
        <div
          className="rounded-xl p-4 border shadow-sm"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Pending</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">{payments.filter((p) => p.status === "pending").length}</p>
        </div>
      </div>

      {/* Payment list */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>No payment records found.</p>
          </div>
        ) : (
          payments.map((p) => (
            <div
              key={p.id}
              className="rounded-xl p-5 border shadow-sm"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {monthNames[p.month - 1]} {p.year}
                    </h4>
                    {statusBadge(p.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span>Amount: <span className="font-medium" style={{ color: "var(--text-primary)" }}>₹{parseFloat(p.amount).toLocaleString()}</span></span>
                    <span>Due: {p.dueDate}</span>
                    {p.paymentDate && <span>Paid: {p.paymentDate}</span>}
                  </div>
                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                      Rejection reason: {p.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {p.status === "pending" && !p.proofUrl && (
                    <label className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 shadow hover:from-blue-600 hover:to-indigo-700 transition">
                      {uploading === p.id ? (
                        <Loader2 size={16} className="animate-spin-slow" />
                      ) : (
                        <Upload size={16} />
                      )}
                      Upload Proof
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(p.id, file);
                        }}
                        disabled={uploading === p.id}
                      />
                    </label>
                  )}

                  {p.status === "pending" && p.proofUrl && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      Proof uploaded - Awaiting approval
                    </span>
                  )}

                  {p.status === "rejected" && (
                    <label className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 shadow">
                      {uploading === p.id ? (
                        <Loader2 size={16} className="animate-spin-slow" />
                      ) : (
                        <Upload size={16} />
                      )}
                      Re-upload
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(p.id, file);
                        }}
                        disabled={uploading === p.id}
                      />
                    </label>
                  )}

                  {p.status === "approved" && (
                    <button
                      onClick={() => setShowReceipt(p)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 shadow"
                    >
                      <Download size={16} /> Receipt
                    </button>
                  )}

                  {p.proofUrl && (
                    <button
                      onClick={() => window.open(p.proofUrl || "", "_blank")}
                      className="px-3 py-2 border rounded-lg text-sm cursor-pointer flex items-center gap-1"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      <FileText size={14} /> View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReceipt(null)}>
          <div
            className="w-full max-w-md rounded-xl p-8 shadow-2xl animate-fade-in text-center"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReceipt(null)}
              className="absolute top-4 right-4 cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Payment Receipt</h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Rent payment confirmed</p>

            <div className="space-y-3 text-left border-t border-b py-4 mb-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Period</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{monthNames[showReceipt.month - 1]} {showReceipt.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Amount</span>
                <span className="font-bold text-emerald-500">₹{parseFloat(showReceipt.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Payment Date</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{showReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Status</span>
                <span className="font-medium text-emerald-500">Approved ✓</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Shop</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{showReceipt.shopNumber || "-"}</span>
              </div>
            </div>

            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Receipt ID: PAY-{showReceipt.id.toString().padStart(6, "0")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
