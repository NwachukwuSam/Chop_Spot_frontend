// Api.js — ChopSpot unified API layer
// Single source of truth for all HTTP calls.

const BASE_URL = "https://delichops-backend-akuq.onrender.com";

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => {
  const token = localStorage.getItem("chopspot_token") ||
                localStorage.getItem("adminToken") ||
                "";
  return token;
};

const buildHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// ─── Core request helpers ─────────────────────────────────────────────────────

// Authenticated request (requires a JWT in localStorage)
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getToken();
    
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    let data;
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed: ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

// Public request — no Authorization header (used for registration, login, storefront)
async function publicRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json" },
    });

    let data;
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed: ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// POST /api/auth/login          → { accessToken, refreshToken, userId, email, roles, ... }
// POST /api/auth/register       → creates a CUSTOMER account
// GET  /api/auth/me             → returns logged-in user's UserInfo
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (body) => {
    const response = await publicRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
    });
    return response;
};

export const register = (body) =>
    publicRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const getMe = async () => {
    try {
        const response = await request("/api/auth/me");
        return response;
    } catch (err) {
        console.error("Failed to fetch user data:", err);
        // Fallback: try to get user data from localStorage
        const storedUser = localStorage.getItem("chopspot_user");
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        throw err;
    }
};

export const forgotPassword = (body) =>
    publicRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const verifyOtp = (body) =>
    publicRequest("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const resetPassword = (body) =>
    publicRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(body),
    });

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC STOREFRONT  (no token required)
// ─────────────────────────────────────────────────────────────────────────────
export const publicApi = {
    getRestaurants: () => publicRequest("/api/public/restaurants"),
    getRestaurantById: (id) => publicRequest(`/api/public/restaurants/${id}`),
    getRestaurantMenu: (id) => publicRequest(`/api/public/restaurants/${id}/menu`),
    searchRestaurants: (q) => publicRequest(`/api/public/restaurants/search?q=${encodeURIComponent(q)}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR  (requires VENDOR role JWT)
// ─────────────────────────────────────────────────────────────────────────────
export const vendorApi = {
    register: (dto) =>
        publicRequest("/api/vendor/register", {
            method: "POST",
            body: JSON.stringify(dto),
        }),
    getProfile: () => request("/api/vendor/profile"),
    updateProfile: (dto) =>
        request("/api/vendor/profile", {
            method: "PUT",
            body: JSON.stringify(dto),
        }),
    toggleOpen: () => request("/api/vendor/profile/toggle-open", { method: "PATCH" }),
    getMenu: () => request("/api/vendor/menu"),
    addMenuItem: (item) =>
        request("/api/vendor/menu", {
            method: "POST",
            body: JSON.stringify(item),
        }),
    updateMenuItem: (id, item) =>
        request(`/api/vendor/menu/${id}`, {
            method: "PUT",
            body: JSON.stringify(item),
        }),
    deleteMenuItem: (id) => request(`/api/vendor/menu/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// RIDER  (requires RIDER role JWT)
// ─────────────────────────────────────────────────────────────────────────────
export const riderApi = {
    register: (dto) =>
        publicRequest("/api/rider/register", {
            method: "POST",
            body: JSON.stringify(dto),
        }),
    getProfile: () => request("/api/rider/profile"),
    updateProfile: (dto) =>
        request("/api/rider/profile", {
            method: "PUT",
            body: JSON.stringify(dto),
        }),
    updateAvailability: (availability) =>
        request("/api/rider/availability", {
            method: "PATCH",
            body: JSON.stringify({ availability }),
        }),
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────
export const orderApi = {
    createOrder: (dto) =>
        request("/api/orders", {
            method: "POST",
            body: JSON.stringify(dto),
        }),
    getMyOrders: () => request("/api/orders/my-orders"),
    getVendorOrders: () => request("/api/orders/vendor-orders"),
    getRiderOrders: () => request("/api/orders/rider-orders"),
    updateOrderStatus: (id, status) =>
        request(`/api/orders/${id}/status?status=${status}`, { method: "PUT" }),
    getAllOrders: (status = null) =>
        request(status ? `/api/orders?status=${status}` : "/api/orders"),
    assignRider: (orderId, riderUserId) =>
        request(`/api/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`, { method: "PUT" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  (requires ADMIN or SUPER_ADMIN role JWT)
// ─────────────────────────────────────────────────────────────────────────────
export const adminApi = {
    getOverview: () => request("/api/admin/overview"),
    getCustomers: () => request("/api/admin/customers"),
    suspendCustomer: (id) => request(`/api/admin/customers/${id}/suspend`, { method: "PATCH" }),
    activateCustomer: (id) => request(`/api/admin/customers/${id}/activate`, { method: "PATCH" }),
    getVendors: () => request("/api/admin/vendors"),
    approveVendor: (id) => request(`/api/admin/vendors/${id}/approve`, { method: "PATCH" }),
    rejectVendor: (id) => request(`/api/admin/vendors/${id}/reject`, { method: "PATCH" }),
    suspendVendor: (id) => request(`/api/admin/vendors/${id}/suspend`, { method: "PATCH" }),
    deleteVendor: (id) => request(`/api/admin/vendors/${id}`, { method: "DELETE" }),
    getRiders: () => request("/api/admin/riders"),
    approveRider: (id) => request(`/api/admin/riders/${id}/approve`, { method: "PATCH" }),
    rejectRider: (id) => request(`/api/admin/riders/${id}/reject`, { method: "PATCH" }),
    suspendRider: (id) => request(`/api/admin/riders/${id}/suspend`, { method: "PATCH" }),
    deleteRider: (id) => request(`/api/admin/riders/${id}`, { method: "DELETE" }),
    getOrders: (status = null) =>
        request(status ? `/api/admin/orders?status=${status}` : "/api/admin/orders"),
    updateOrderStatus: (id, status) =>
        request(`/api/admin/orders/${id}/status?status=${status}`, { method: "PUT" }),
    assignRider: (orderId, riderUserId) =>
        request(`/api/admin/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`, { method: "PUT" }),
    getAdmins: () => request("/api/admin/admins"),
    createAdmin: (dto) => request("/api/admin/admins", { method: "POST", body: JSON.stringify(dto) }),
    suspendAdmin: (id) => request(`/api/admin/admins/${id}/suspend`, { method: "PATCH" }),
    activateAdmin: (id) => request(`/api/admin/admins/${id}/activate`, { method: "PATCH" }),
    deleteAdmin: (id) => request(`/api/admin/admins/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE  (requires ADMIN or SUPER_ADMIN role JWT)
// ─────────────────────────────────────────────────────────────────────────────
export const financeApi = {
    getOverview: () => request("/api/finance/overview"),
    getSales: (status = null) =>
        request(status ? `/api/finance/sales?status=${status}` : "/api/finance/sales"),
    getVendorPayouts: (status = null) =>
        request(status ? `/api/finance/vendor-payouts?status=${status}` : "/api/finance/vendor-payouts"),
    createVendorPayout: (dto) =>
        request("/api/finance/vendor-payouts", { method: "POST", body: JSON.stringify(dto) }),
    markVendorPaid: (id, paymentReference = "") =>
        request(`/api/finance/vendor-payouts/${id}/mark-paid`, {
            method: "PATCH",
            body: JSON.stringify({ paymentReference }),
        }),
    deleteVendorPayout: (id) => request(`/api/finance/vendor-payouts/${id}`, { method: "DELETE" }),
    getRiderPayouts: (status = null) =>
        request(status ? `/api/finance/rider-payouts?status=${status}` : "/api/finance/rider-payouts"),
    createRiderPayout: (dto) =>
        request("/api/finance/rider-payouts", { method: "POST", body: JSON.stringify(dto) }),
    markRiderPaid: (id, paymentReference = "") =>
        request(`/api/finance/rider-payouts/${id}/mark-paid`, {
            method: "PATCH",
            body: JSON.stringify({ paymentReference }),
        }),
    deleteRiderPayout: (id) => request(`/api/finance/rider-payouts/${id}`, { method: "DELETE" }),
    getExpenses: (category = null) =>
        request(category ? `/api/finance/expenses?category=${encodeURIComponent(category)}` : "/api/finance/expenses"),
    logExpense: (dto) =>
        request("/api/finance/expenses", { method: "POST", body: JSON.stringify(dto) }),
    deleteExpense: (id) => request(`/api/finance/expenses/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Default export
// ─────────────────────────────────────────────────────────────────────────────
export default {
    login,
    register,
    getMe,
    forgotPassword,
    verifyOtp,
    resetPassword,
    publicApi,
    vendorApi,
    riderApi,
    orderApi,
    adminApi,
    financeApi,
};