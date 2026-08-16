"use client";

import { useEffect, useState } from "react";
import { Store, Calendar, CreditCard, Shield, MapPin, Ruler, Tag, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface TenantInfo {
  id: number;
  userId: number;
  brandName: string | null;
  shopId: number | null;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  monthlyRent: string | null;
  securityDeposit: string | null;
}

interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string | null;
}

interface Shop {
  id: number;
  shopNumber: string;
  floor: number;
  shopSize: string | null;
  category: string | null;
  status: string;
}

export default function TenantOverview() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await api.get<{ user: UserInfo; tenantInfo: TenantInfo | null }>("/api/auth/me");
      setUserInfo(me.user);
      setTenantInfo(me.tenantInfo);

      if (me.tenantInfo?.shopId) {
        const shops = await api.get<Shop[]>("/api/shops");
        const s = shops.find((sh) => sh.id === me.tenantInfo?.shopId);
        if (s) setShop(s);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin-slow" style={{ color: "var(--text-secondary)" }} />
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="text-center py-20" style={{ color: "var(--text-secondary)" }}>
        <Store size={48} className="mx-auto mb-4 opacity-30" />
        <p>No tenant information found.</p>
      </div>
    );
  }

  const daysUntilExpiry = tenantInfo.leaseEndDate
    ? Math.ceil((new Date(tenantInfo.leaseEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Shop Info */}
      <div
        className="rounded-xl p-6 border shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Store size={20} className="text-emerald-500" />
          Shop Information
        </h3>
        {shop ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Shop Number</p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{shop.shopNumber}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <MapPin size={12} /> Floor
              </p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {shop.floor === 0 ? "Ground" : `Floor ${shop.floor}`}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Ruler size={12} /> Size
              </p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{shop.shopSize || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Tag size={12} /> Category
              </p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{shop.category || "-"}</p>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>No shop assigned yet.</p>
        )}
      </div>

      {/* Lease & Rent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-6 border shadow-sm"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Calendar size={20} className="text-blue-500" />
            Lease Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Start Date</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {tenantInfo.leaseStartDate || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>End Date</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {tenantInfo.leaseEndDate || "Not set"}
              </span>
            </div>
            {daysUntilExpiry !== null && (
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Days Remaining</span>
                <span className={`text-sm font-bold ${daysUntilExpiry < 30 ? "text-red-500" : daysUntilExpiry < 90 ? "text-amber-500" : "text-emerald-500"}`}>
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : "Expired"}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Brand</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {tenantInfo.brandName || "-"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6 border shadow-sm"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <CreditCard size={20} className="text-purple-500" />
            Rent Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Monthly Rent</span>
              <span className="text-xl font-bold text-emerald-500">
                {tenantInfo.monthlyRent ? `₹${parseFloat(tenantInfo.monthlyRent).toLocaleString()}` : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Security Deposit</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {tenantInfo.securityDeposit ? `₹${parseFloat(tenantInfo.securityDeposit).toLocaleString()}` : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Due Date</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>5th of every month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Profile */}
      <div
        className="rounded-xl p-6 border shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Shield size={20} className="text-indigo-500" />
          My Profile
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name</p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{userInfo?.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{userInfo?.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone</p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{userInfo?.phone || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
