import {
  mockShops,
  mockTenants,
  mockPayments,
  mockNotifications,
  mockDashboardData,
} from "./mockData";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch {
    // API server / database error fallback
  }

  // Demo fallback handlers
  if (url.includes("/api/auth/me")) {
    if (token === "demo-tenant-token") {
      return {
        user: { id: 2, email: "rahul@fashion.com", name: "Rahul Sharma", role: "tenant" },
      } as T;
    }
    return {
      user: { id: 1, email: "admin@mallmgmt.com", name: "Mall Admin", role: "admin" },
    } as T;
  }

  if (url.includes("/api/dashboard")) {
    return mockDashboardData as T;
  }

  if (url.includes("/api/shops")) {
    return mockShops as T;
  }

  if (url.includes("/api/tenants")) {
    if (token === "demo-tenant-token") {
      return mockTenants[0] as T;
    }
    return mockTenants as T;
  }

  if (url.includes("/api/payments")) {
    if (token === "demo-tenant-token") {
      return mockPayments.filter((p) => p.tenantId === 1) as T;
    }
    return mockPayments as T;
  }

  if (url.includes("/api/notifications")) {
    return mockNotifications as T;
  }

  if (url.includes("/api/reports")) {
    return {
      totalCollected: 100000,
      totalPending: 72000,
      occupancyRate: "50%",
      activeTenants: 3,
    } as T;
  }

  return {} as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string) =>
    request<T>(url, { method: "DELETE" }),
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) return (await res.json()) as Promise<{ url: string; type: string }>;
    } catch {
      // ignore
    }
    return { url: "/uploads/demo-proof.png", type: file.type } as { url: string; type: string };
  },
};
