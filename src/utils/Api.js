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

// ─── 401 handler ──────────────────────────────────────────────────────────────
// Called whenever any authenticated request gets a 401 (expired/invalid token).
// Clears all auth keys from localStorage and fires a custom event so the app
// can redirect to /login without this file needing to know about React Router.
function handleUnauthorized() {
    console.warn("🔐 Token expired or invalid — clearing session");
    try {
        localStorage.removeItem("chopspot_token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("chopspot_user");
    } catch (_) {}
    // App.jsx listens for this event and calls navigate("/login")
    window.dispatchEvent(new CustomEvent("chopspot:unauthorized"));
}

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

    // Token expired or invalid — clear session and redirect to login
    if (res.status === 401) {
        handleUnauthorized();
        throw new Error("Your session has expired. Please sign in again.");
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
export const login = async (body) => {
    const response = await publicRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
    });
    console.log("🔐 Login API response:", response);
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
        console.log("👤 getMe response:", response);
        return response;
    } catch (err) {
        console.error("Failed to fetch user data:", err);
        const storedUser = localStorage.getItem("chopspot_user");
        if (storedUser) {
            console.log("Using stored user data as fallback");
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
// CART  (requires CUSTOMER JWT for all except mergeGuestCart which also needs it)
//
// GET    /api/cart              → fetch logged-in user's server cart
//                                 returns { groups: [...] }  (same shape as local cart)
//
// POST   /api/cart/add          → add a group to server cart
//                                 body: { vendor, pack, items }
//                                 returns updated { groups: [...] }
//
// DELETE /api/cart/:groupIndex  → remove one group from server cart by index
//                                 returns updated { groups: [...] }
//
// POST   /api/cart/merge        → called ONCE on login; sends guest cart to server
//                                 body: { groups: [...] }
//                                 server merges with existing cart & returns { groups: [...] }
//
// DELETE /api/cart              → wipe the entire server cart (called after order placed)
//                                 returns { groups: [] }
// ─────────────────────────────────────────────────────────────────────────────
export const cartApi = {
    /** Fetch the logged-in user's cart from the server */
    getCart: () =>
        request("/api/cart"),

    /** Add a cart group (vendor + pack + items) to the server cart */
    addGroup: (group) =>
        request("/api/cart/add", {
            method: "POST",
            body: JSON.stringify(group),
        }),

    /** Remove a group from the server cart by its index position */
    removeGroup: (groupIndex) =>
        request(`/api/cart/${groupIndex}`, { method: "DELETE" }),

    /**
     * Merge a guest cart into the server cart.
     * Call this once immediately after login, passing the guest's localStorage cart.
     * The server should union/append guest groups into the user's existing cart.
     */
    mergeGuestCart: (groups) =>
        request("/api/cart/merge", {
            method: "POST",
            body: JSON.stringify({ groups }),
        }),

    /** Wipe the server cart entirely — call after a successful order */
    clearCart: () =>
        request("/api/cart", { method: "DELETE" }),
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

    toggleOpen: () =>
        request("/api/vendor/profile/toggle-open", { method: "PATCH" }),

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

    toggleAvailability: () =>
        request("/api/rider/availability", { method: "PATCH" }),
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
        request(
            `/api/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`,
            { method: "PUT" }
        ),
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  (requires ADMIN or SUPER_ADMIN role JWT)
// ─────────────────────────────────────────────────────────────────────────────
export const adminApi = {
    getOverview: () => request("/api/admin/overview"),

    getCustomers: () => request("/api/admin/customers"),
    suspendCustomer:  (id) => request(`/api/admin/customers/${id}/suspend`,  { method: "PATCH" }),
    activateCustomer: (id) => request(`/api/admin/customers/${id}/activate`, { method: "PATCH" }),

    getVendors:    () => request("/api/admin/vendors"),
    approveVendor: (id) => request(`/api/admin/vendors/${id}/approve`, { method: "PATCH" }),
    rejectVendor:  (id) => request(`/api/admin/vendors/${id}/reject`,  { method: "PATCH" }),
    suspendVendor: (id) => request(`/api/admin/vendors/${id}/suspend`, { method: "PATCH" }),
    deleteVendor:  (id) => request(`/api/admin/vendors/${id}`,         { method: "DELETE" }),

    getRiders:    () => request("/api/admin/riders"),
    approveRider: (id) => request(`/api/admin/riders/${id}/approve`, { method: "PATCH" }),
    rejectRider:  (id) => request(`/api/admin/riders/${id}/reject`,  { method: "PATCH" }),
    suspendRider: (id) => request(`/api/admin/riders/${id}/suspend`, { method: "PATCH" }),
    deleteRider:  (id) => request(`/api/admin/riders/${id}`,         { method: "DELETE" }),

    getOrders:         (status = null) =>
        request(status ? `/api/admin/orders?status=${status}` : "/api/admin/orders"),
    updateOrderStatus: (id, status) =>
        request(`/api/admin/orders/${id}/status?status=${status}`, { method: "PUT" }),
    assignRider:       (orderId, riderUserId) =>
        request(`/api/admin/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`, { method: "PUT" }),

    getAdmins:     ()    => request("/api/admin/admins"),
    createAdmin:   (dto) => request("/api/admin/admins", { method: "POST", body: JSON.stringify(dto) }),
    suspendAdmin:  (id)  => request(`/api/admin/admins/${id}/suspend`,  { method: "PATCH" }),
    activateAdmin: (id)  => request(`/api/admin/admins/${id}/activate`, { method: "PATCH" }),
    deleteAdmin:   (id)  => request(`/api/admin/admins/${id}`,          { method: "DELETE" }),
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

    deleteVendorPayout: (id) =>
        request(`/api/finance/vendor-payouts/${id}`, { method: "DELETE" }),

    getRiderPayouts: (status = null) =>
        request(status ? `/api/finance/rider-payouts?status=${status}` : "/api/finance/rider-payouts"),

    createRiderPayout: (dto) =>
        request("/api/finance/rider-payouts", { method: "POST", body: JSON.stringify(dto) }),

    markRiderPaid: (id, paymentReference = "") =>
        request(`/api/finance/rider-payouts/${id}/mark-paid`, {
            method: "PATCH",
            body: JSON.stringify({ paymentReference }),
        }),

    deleteRiderPayout: (id) =>
        request(`/api/finance/rider-payouts/${id}`, { method: "DELETE" }),

    getExpenses: (category = null) =>
        request(category ? `/api/finance/expenses?category=${encodeURIComponent(category)}` : "/api/finance/expenses"),

    logExpense: (dto) =>
        request("/api/finance/expenses", { method: "POST", body: JSON.stringify(dto) }),

    deleteExpense: (id) =>
        request(`/api/finance/expenses/${id}`, { method: "DELETE" }),
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
    cartApi,
    vendorApi,
    riderApi,
    orderApi,
    adminApi,
    financeApi,
};