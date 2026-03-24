// ─── Api.js — ChopSpot unified API layer ─────────────────────────────────────
// Single source of truth for all HTTP calls.
// Import named exports: import { vendorApi, orderApi } from "../utils/Api";
// or namespace import:  import * as API from "../utils/Api";

const BASE_URL = "https://delichops-backend-akuq.onrender.com";

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken = () =>
    localStorage.getItem("chopspot_token") ||
    localStorage.getItem("adminToken") ||
    "";

const buildHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// ─── Core request helpers ─────────────────────────────────────────────────────

// Authenticated request (requires a JWT in localStorage)
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
        ...options,
        headers: buildHeaders(),
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
// POST /api/auth/login          → { accessToken, tokenType, role, ... }
// POST /api/auth/register       → creates a CUSTOMER account
// GET  /api/auth/me             → returns logged-in user's UserInfo
// POST /api/auth/forgot-password
// POST /api/auth/verify-otp
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
export const login = (body) =>
    publicRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const register = (body) =>
    publicRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const getMe = () => request("/api/auth/me");

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
// GET /api/public/restaurants           → all approved + open vendors
// GET /api/public/restaurants/{id}      → single vendor public profile
// GET /api/public/restaurants/{id}/menu → vendor's available menu items
// GET /api/public/restaurants/search?q= → search by name or category
// ─────────────────────────────────────────────────────────────────────────────
export const publicApi = {
    getRestaurants: () => publicRequest("/api/public/restaurants"),

    getRestaurantById: (id) =>
        publicRequest(`/api/public/restaurants/${id}`),

    getRestaurantMenu: (id) =>
        publicRequest(`/api/public/restaurants/${id}/menu`),

    searchRestaurants: (q) =>
        publicRequest(`/api/public/restaurants/search?q=${encodeURIComponent(q)}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR  (requires VENDOR role JWT)
//
// POST  /api/vendor/register            → PUBLIC: creates UserProfile + VendorProfile,
//                                          returns { accessToken, role, vendorProfile }
// GET   /api/vendor/profile             → vendor's own profile
// PUT   /api/vendor/profile             → update own profile
// PATCH /api/vendor/profile/toggle-open → flip isOpen flag
// GET   /api/vendor/menu                → all menu items for this vendor
// POST  /api/vendor/menu                → add a menu item
// PUT   /api/vendor/menu/{id}           → update a menu item
// DELETE/api/vendor/menu/{id}           → delete a menu item
// ─────────────────────────────────────────────────────────────────────────────
export const vendorApi = {
    // Registration — public, no token needed
    register: (dto) =>
        publicRequest("/api/vendor/register", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    // Profile
    getProfile: () => request("/api/vendor/profile"),

    updateProfile: (dto) =>
        request("/api/vendor/profile", {
            method: "PUT",
            body: JSON.stringify(dto),
        }),

    toggleOpen: () =>
        request("/api/vendor/profile/toggle-open", { method: "PATCH" }),

    // Menu management
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

    deleteMenuItem: (id) =>
        request(`/api/vendor/menu/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// RIDER  (requires RIDER role JWT)
//
// POST  /api/rider/register             → PUBLIC: creates UserProfile + RiderProfile,
//                                          returns { accessToken, role, riderProfile }
// GET   /api/rider/profile              → rider's own profile
// PUT   /api/rider/profile              → update own profile
// PATCH /api/rider/availability         → toggle ONLINE / OFFLINE
// ─────────────────────────────────────────────────────────────────────────────
export const riderApi = {
    // Registration — public, no token needed
    register: (dto) =>
        publicRequest("/api/rider/register", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    // Profile
    getProfile: () => request("/api/rider/profile"),

    updateProfile: (dto) =>
        request("/api/rider/profile", {
            method: "PUT",
            body: JSON.stringify(dto),
        }),

    // availability: "ONLINE" | "OFFLINE"
    updateAvailability: (availability) =>
        request("/api/rider/availability", {
            method: "PATCH",
            body: JSON.stringify({ availability }),
        }),
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
//
// POST /api/orders                        → CUSTOMER: place order
// GET  /api/orders/my-orders              → CUSTOMER: own order history
// GET  /api/orders/vendor-orders          → VENDOR: incoming orders
// GET  /api/orders/rider-orders           → RIDER: assigned orders
// PUT  /api/orders/{id}/status?status=    → VENDOR/RIDER/ADMIN: update status
// PUT  /api/orders/{id}/assign-rider      → ADMIN: assign rider
// GET  /api/orders?status=                → ADMIN: all orders
// ─────────────────────────────────────────────────────────────────────────────
export const orderApi = {
    // Customer
    createOrder: (dto) =>
        request("/api/orders", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    getMyOrders: () => request("/api/orders/my-orders"),

    // Vendor
    getVendorOrders: () => request("/api/orders/vendor-orders"),

    // Rider
    getRiderOrders: () => request("/api/orders/rider-orders"),

    // Shared — status values: PENDING | PREPARING | PICKED_UP | DELIVERED | CANCELLED
    updateOrderStatus: (id, status) =>
        request(`/api/orders/${id}/status?status=${status}`, { method: "PUT" }),

    // Admin
    getAllOrders: (status = null) =>
        request(status ? `/api/orders?status=${status}` : "/api/orders"),

    assignRider: (orderId, riderUserId) =>
        request(
            `/api/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`,
            { method: "PUT" }
        ),
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  (requires ADMIN or SUPER_ADMIN role JWT)
//
// GET   /api/admin/overview
// GET   /api/admin/customers
// PATCH /api/admin/customers/{id}/suspend
// PATCH /api/admin/customers/{id}/activate
// GET   /api/admin/vendors
// PATCH /api/admin/vendors/{id}/approve
// PATCH /api/admin/vendors/{id}/reject
// PATCH /api/admin/vendors/{id}/suspend
// DELETE/api/admin/vendors/{id}
// GET   /api/admin/riders
// PATCH /api/admin/riders/{id}/approve
// PATCH /api/admin/riders/{id}/reject
// PATCH /api/admin/riders/{id}/suspend
// DELETE/api/admin/riders/{id}
// GET   /api/admin/orders?status=
// PUT   /api/admin/orders/{id}/status?status=
// PUT   /api/admin/orders/{id}/assign-rider?riderUserId=
// --- Super Admin only ---
// GET   /api/admin/admins
// POST  /api/admin/admins
// PATCH /api/admin/admins/{id}/suspend
// PATCH /api/admin/admins/{id}/activate
// DELETE/api/admin/admins/{id}
// ─────────────────────────────────────────────────────────────────────────────
export const adminApi = {
    // Overview
    getOverview: () => request("/api/admin/overview"),

    // Customers
    getCustomers: () => request("/api/admin/customers"),
    suspendCustomer:  (id) => request(`/api/admin/customers/${id}/suspend`,  { method: "PATCH" }),
    activateCustomer: (id) => request(`/api/admin/customers/${id}/activate`, { method: "PATCH" }),

    // Vendors
    getVendors:    () => request("/api/admin/vendors"),
    approveVendor: (id) => request(`/api/admin/vendors/${id}/approve`, { method: "PATCH" }),
    rejectVendor:  (id) => request(`/api/admin/vendors/${id}/reject`,  { method: "PATCH" }),
    suspendVendor: (id) => request(`/api/admin/vendors/${id}/suspend`, { method: "PATCH" }),
    deleteVendor:  (id) => request(`/api/admin/vendors/${id}`,         { method: "DELETE" }),

    // Riders
    getRiders:    () => request("/api/admin/riders"),
    approveRider: (id) => request(`/api/admin/riders/${id}/approve`, { method: "PATCH" }),
    rejectRider:  (id) => request(`/api/admin/riders/${id}/reject`,  { method: "PATCH" }),
    suspendRider: (id) => request(`/api/admin/riders/${id}/suspend`, { method: "PATCH" }),
    deleteRider:  (id) => request(`/api/admin/riders/${id}`,         { method: "DELETE" }),

    // Orders (admin view — separate from OrderController's /api/orders)
    getOrders:         (status = null) =>
        request(status ? `/api/admin/orders?status=${status}` : "/api/admin/orders"),
    updateOrderStatus: (id, status) =>
        request(`/api/admin/orders/${id}/status?status=${status}`, { method: "PUT" }),
    assignRider:       (orderId, riderUserId) =>
        request(`/api/admin/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`, { method: "PUT" }),

    // Super Admin — admin user management
    getAdmins:     ()    => request("/api/admin/admins"),
    createAdmin:   (dto) => request("/api/admin/admins", { method: "POST", body: JSON.stringify(dto) }),
    suspendAdmin:  (id)  => request(`/api/admin/admins/${id}/suspend`,  { method: "PATCH" }),
    activateAdmin: (id)  => request(`/api/admin/admins/${id}/activate`, { method: "PATCH" }),
    deleteAdmin:   (id)  => request(`/api/admin/admins/${id}`,          { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE  (requires ADMIN or SUPER_ADMIN role JWT)
//
// GET   /api/finance/overview
// GET   /api/finance/sales?status=
// GET   /api/finance/vendor-payouts?status=
// POST  /api/finance/vendor-payouts
// PATCH /api/finance/vendor-payouts/{id}/mark-paid
// DELETE/api/finance/vendor-payouts/{id}
// GET   /api/finance/rider-payouts?status=
// POST  /api/finance/rider-payouts
// PATCH /api/finance/rider-payouts/{id}/mark-paid
// DELETE/api/finance/rider-payouts/{id}
// GET   /api/finance/expenses?category=
// POST  /api/finance/expenses
// DELETE/api/finance/expenses/{id}
// ─────────────────────────────────────────────────────────────────────────────
export const financeApi = {
    getOverview: () => request("/api/finance/overview"),

    getSales: (status = null) =>
        request(status ? `/api/finance/sales?status=${status}` : "/api/finance/sales"),

    // Vendor payouts
    getVendorPayouts: (status = null) =>
        request(
            status
                ? `/api/finance/vendor-payouts?status=${status}`
                : "/api/finance/vendor-payouts"
        ),

    createVendorPayout: (dto) =>
        request("/api/finance/vendor-payouts", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    markVendorPaid: (id, paymentReference = "") =>
        request(`/api/finance/vendor-payouts/${id}/mark-paid`, {
            method: "PATCH",
            body: JSON.stringify({ paymentReference }),
        }),

    deleteVendorPayout: (id) =>
        request(`/api/finance/vendor-payouts/${id}`, { method: "DELETE" }),

    // Rider payouts
    getRiderPayouts: (status = null) =>
        request(
            status
                ? `/api/finance/rider-payouts?status=${status}`
                : "/api/finance/rider-payouts"
        ),

    createRiderPayout: (dto) =>
        request("/api/finance/rider-payouts", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    markRiderPaid: (id, paymentReference = "") =>
        request(`/api/finance/rider-payouts/${id}/mark-paid`, {
            method: "PATCH",
            body: JSON.stringify({ paymentReference }),
        }),

    deleteRiderPayout: (id) =>
        request(`/api/finance/rider-payouts/${id}`, { method: "DELETE" }),

    // Expenses
    getExpenses: (category = null) =>
        request(
            category
                ? `/api/finance/expenses?category=${encodeURIComponent(category)}`
                : "/api/finance/expenses"
        ),

    logExpense: (dto) =>
        request("/api/finance/expenses", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    deleteExpense: (id) =>
        request(`/api/finance/expenses/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Default export — lets files do: import * as API from "../utils/Api"
// and call API.login(), API.vendorApi.register(), etc.
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