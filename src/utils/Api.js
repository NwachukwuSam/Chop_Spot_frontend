// ─── Api.js — Tasty-CART unified API layer ─────────────────────────────────────
// Single source of truth for all HTTP calls.
// Import named exports: import { vendorApi, orderApi } from "../utils/Api";
// or namespace import:  import * as API from "../utils/Api";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEYS = [
    "chopspot_token",
    "adminToken",
    "accessToken",
    "token",
    "tastycart_token",
    "authToken",
    "jwt",
];

const getToken = () => {
    for (const key of TOKEN_KEYS) {
        const val = localStorage.getItem(key);
        if (val) return val;
    }
    return "";
};

const buildHeaders = () => {
    const token = getToken();
    if (!token) {
        console.warn("[API] ⚠️ No auth token found. Checked:", TOKEN_KEYS);
    }
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

// ─── 401 handler ──────────────────────────────────────────────────────────────
function handleUnauthorized() {
    console.warn("🔐 Token expired or invalid — clearing session");
    try {
        localStorage.removeItem("chopspot_token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("chopspot_user");
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("chopspot:unauthorized"));
}

// ─── Core request helpers ─────────────────────────────────────────────────────

/**
 * Core request function - handles auth, errors, and network issues
 */
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    try {
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

        // Handle 401 Unauthorized
        if (res.status === 401 || res.status === 403) {
            handleUnauthorized();
            throw new Error("Your session has expired. Please sign in again.");
        }

        // Handle other HTTP errors (400, 403, 500, etc.)
        if (!res.ok) {
            console.error(`[API] ${options.method || "GET"} ${endpoint} → ${res.status}`, data);

            const msg = data?.message ||
                data?.error ||
                data?.detail ||
                `Request failed with status ${res.status}`;

            const err = new Error(msg);
            err.status = res.status;
            err.data = data;
            throw err;
        }

        return data;

    } catch (err) {
        // ── Network / Connectivity Error Detection ──
        const isNetworkError =
            !navigator.onLine ||
            err.name === 'TypeError' ||
            err.message?.toLowerCase().includes('fetch') ||
            err.message?.toLowerCase().includes('network') ||
            err.message?.toLowerCase().includes('failed to fetch');

        if (isNetworkError) {
            console.warn(`[API] Network error detected on ${endpoint}`);

            const currentPath = window.location.pathname + window.location.search;

            // Redirect to offline page while preserving return path
            window.location.href = `/offline?returnTo=${encodeURIComponent(currentPath)}`;

            // Still throw so the calling code can handle it if needed
            const networkErr = new Error("No internet connection. Please check your network.");
            networkErr.isNetworkError = true;
            throw networkErr;
        }

        // Re-throw other errors (like 401, 400, etc.)
        throw err;
    }
}

async function publicRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json" },
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed: ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
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
    publicRequest("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(body) });

export const verifyOtp = (body) =>
    publicRequest("/api/auth/verify-otp", { method: "POST", body: JSON.stringify(body) });

export const resetPassword = (body) =>
    publicRequest("/api/auth/reset-password", { method: "POST", body: JSON.stringify(body) });

// ─── PUBLIC STOREFRONT ────────────────────────────────────────────────────────
export const publicApi = {
    getRestaurants: () => publicRequest("/api/public/restaurants"),

    getRestaurantById: (id) =>
        publicRequest(`/api/public/restaurants/${id}`),

    getRestaurantMenu: (id) =>
        publicRequest(`/api/public/restaurants/${id}/menu`),

    searchRestaurants: (q) =>
        publicRequest(`/api/public/restaurants/search?q=${encodeURIComponent(q)}`),

    getDeliveryZones: () => publicRequest("/api/public/delivery-zones"),
};

// ─── CART ─────────────────────────────────────────────────────────────────────
export const cartApi = {
    getCart: () =>
        request("/api/cart"),

    addGroup: (group) =>
        request("/api/cart/add", { method: "POST", body: JSON.stringify(group) }),

    removeGroup: (groupIndex) =>
        request(`/api/cart/${groupIndex}`, { method: "DELETE" }),

    mergeGuestCart: (groups) =>
        request("/api/cart/merge", { method: "POST", body: JSON.stringify({ groups }) }),

    clearCart: () =>
        request("/api/cart", { method: "DELETE" }),
};

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
export const userProfileApi = {
    getProfile: () => request("/api/users/profile"),
    updateProfile: (dto) =>
        request("/api/users/profile", { method: "PUT", body: JSON.stringify(dto) }),
};

// ─── VENDOR ───────────────────────────────────────────────────────────────────
export const vendorApi = {
    register: (dto) =>
        publicRequest("/api/vendor/register", { method: "POST", body: JSON.stringify(dto) }),

    getProfile: () => request("/api/vendor/profile"),

    updateProfile: (dto) =>
        request("/api/vendor/profile", { method: "PUT", body: JSON.stringify(dto) }),

    toggleOpen: () =>
        request("/api/vendor/profile/toggle-open", { method: "PATCH" }),

    getMenu: () => request("/api/vendor/menu"),

    addMenuItem: (item) =>
        request("/api/vendor/menu", { method: "POST", body: JSON.stringify(item) }),

    updateMenuItem: (id, item) =>
        request(`/api/vendor/menu/${id}`, { method: "PUT", body: JSON.stringify(item) }),

    deleteMenuItem: (id) =>
        request(`/api/vendor/menu/${id}`, { method: "DELETE" }),
};

// ─── RIDER ────────────────────────────────────────────────────────────────────
export const riderApi = {
    register: (dto) =>
        publicRequest("/api/rider/register", { method: "POST", body: JSON.stringify(dto) }),

    getProfile: () => request("/api/rider/profile"),

    updateProfile: (dto) =>
        request("/api/rider/profile", { method: "PUT", body: JSON.stringify(dto) }),

    setAvailability: (availability) =>
        request("/api/rider/availability", {
            method: "PATCH",
            body: JSON.stringify({ availability }),
        }),

    updateAvailability: (availability) =>
        request("/api/rider/availability", {
            method: "PATCH",
            body: JSON.stringify({ availability }),
        }),
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const orderApi = {

    // Step 1: create order before payment (returns orderId)
    createOrder: (dto) =>
        request("/api/orders", { method: "POST", body: JSON.stringify(dto) }),

    setOrderReference: (orderId, paystackReference) =>
        request(`/api/orders/${orderId}/reference`, {
            method: "PATCH",
            body: JSON.stringify({ paystackReference }),
        }),

    // Step 2: confirm payment after Paystack callback
    confirmPayment: (orderId, dto) =>
        request(`/api/orders/${orderId}/confirm-payment`, {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    // Cancel an unpaid order (closed payment modal without paying)
    cancelOrder: (orderId) =>
        request(`/api/orders/${orderId}`, { method: "DELETE" }),

    getMyOrders: () => request("/api/orders/my-orders"),

    getVendorOrders: () => request("/api/orders/vendor-orders"),

    getRiderOrders: () => request("/api/orders/rider-orders"),

    updateOrderStatus: (id, status) =>
        request(`/api/orders/${id}/status?status=${status}`, { method: "PUT" }),

    // NOTE: getAllOrders on the frontend now routes through /api/admin/orders
    getAllOrders: (status = null) =>
        request(status ? `/api/admin/orders?status=${status}` : "/api/admin/orders"),

    // Fetch orders that are ready for a rider to pick up.
    getAllReadyForPickupOrders: () =>
        request("/api/orders?status=READY_FOR_PICKUP"),

    assignRider: (orderId, riderUserId) =>
        request(`/api/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`, { method: "PUT" }),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminApi = {
    getOverview: () => request("/api/admin/overview"),

    // ── Customers ──────────────────────────────────────────────────────────────
    getCustomers:     ()    => request("/api/admin/customers"),
    suspendCustomer:  (id)  => request(`/api/admin/customers/${id}/suspend`,  { method: "PATCH" }),
    activateCustomer: (id)  => request(`/api/admin/customers/${id}/activate`, { method: "PATCH" }),

    // ── Vendors ────────────────────────────────────────────────────────────────
    getVendors:    ()    => request("/api/admin/vendors"),
    approveVendor: (id)  => request(`/api/admin/vendors/${id}/approve`, { method: "PATCH" }),
    rejectVendor:  (id)  => request(`/api/admin/vendors/${id}/reject`,  { method: "PATCH" }),
    suspendVendor: (id)  => request(`/api/admin/vendors/${id}/suspend`, { method: "PATCH" }),
    deleteVendor:  (id)  => request(`/api/admin/vendors/${id}`,         { method: "DELETE" }),

    // ── Riders ─────────────────────────────────────────────────────────────────
    getRiders:    ()    => request("/api/admin/riders"),
    approveRider: (id)  => request(`/api/admin/riders/${id}/approve`, { method: "PATCH" }),
    rejectRider:  (id)  => request(`/api/admin/riders/${id}/reject`,  { method: "PATCH" }),
    suspendRider: (id)  => request(`/api/admin/riders/${id}/suspend`, { method: "PATCH" }),
    deleteRider:  (id)  => request(`/api/admin/riders/${id}`,         { method: "DELETE" }),

    // ── Orders ─────────────────────────────────────────────────────────────────
    getOrders:         (status = null) =>
        request(status ? `/api/admin/orders?status=${status}` : "/api/admin/orders"),
    updateOrderStatus: (id, status) =>
        request(`/api/admin/orders/${id}/status?status=${status}`, { method: "PUT" }),
    assignRider:       (orderId, riderUserId) =>
        request(`/api/admin/orders/${orderId}/assign-rider?riderUserId=${riderUserId}`, { method: "PUT" }),

    // ── All Users (customers + vendors + riders combined) ──────────────────────
    // FIX: Was a stub "coming soon" UI — now wired to real endpoints.
    // Fetches all three user types in parallel and merges them client-side.
    getAllUsers: async () => {
        const [customers, vendors, riders] = await Promise.all([
            request("/api/admin/customers"),
            request("/api/admin/vendors"),
            request("/api/admin/riders"),
        ]);
        const tag = (arr, type) => (arr || []).map(u => ({ ...u, _userType: type }));
        return [
            ...tag(customers, "CUSTOMER"),
            ...tag(vendors,   "VENDOR"),
            ...tag(riders,    "RIDER"),
        ];
    },

    // ── Admin management (Super Admin only) ────────────────────────────────────
    getAdmins:     ()    => request("/api/admin/admins"),
    createAdmin:   (dto) => request("/api/admin/admins", { method: "POST", body: JSON.stringify(dto) }),
    suspendAdmin:  (id)  => request(`/api/admin/admins/${id}/suspend`,  { method: "PATCH" }),
    activateAdmin: (id)  => request(`/api/admin/admins/${id}/activate`, { method: "PATCH" }),
    deleteAdmin:   (id)  => request(`/api/admin/admins/${id}`,          { method: "DELETE" }),

    // ── Manual Settlements ─────────────────────────────────────────────────────

    /**
     * Fetch DELIVERED orders grouped by vendor/rider for a given date.
     * Response includes paymentStatus, totalPaid, balance per group.
     * @param {string} date   - ISO date string yyyy-MM-dd
     * @param {string|null} type - "VENDOR" | "RIDER" | null (both)
     */
    getSettlementOrders: (date, type = null) =>
        request(
            type
                ? `/api/admin/settlements/orders?date=${date}&type=${type}`
                : `/api/admin/settlements/orders?date=${date}`
        ),

    /**
     * Create a manual settlement record after a bank transfer.
     * @param {Object} dto - ManualSettlementDTO shape
     */
    createSettlement: (dto) =>
        request("/api/admin/settlements", {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    /**
     * Retrieve settlement records with optional date and type filters.
     * @param {string|null} date - ISO date yyyy-MM-dd
     * @param {string|null} type - "VENDOR" | "RIDER"
     */
    getSettlements: (date = null, type = null) => {
        const params = new URLSearchParams();
        if (date) params.append("date", date);
        if (type) params.append("type", type);
        const qs = params.toString();
        return request(qs ? `/api/admin/settlements?${qs}` : "/api/admin/settlements");
    },

    /**
     * All settlements for a specific recipient (vendor or rider profile ID).
     * Useful for the record-payment form to check prior payments.
     */
    getSettlementsForRecipient: (recipientId) =>
        request(`/api/admin/settlements?recipientId=${recipientId}`),
};

// ─── FINANCE ──────────────────────────────────────────────────────────────────
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
        request(category
            ? `/api/finance/expenses?category=${encodeURIComponent(category)}`
            : "/api/finance/expenses"),

    logExpense: (dto) =>
        request("/api/finance/expenses", { method: "POST", body: JSON.stringify(dto) }),

    deleteExpense: (id) =>
        request(`/api/finance/expenses/${id}`, { method: "DELETE" }),
};

// ─── Default export ───────────────────────────────────────────────────────────
export default {
    login,
    register,
    getMe,
    forgotPassword,
    verifyOtp,
    resetPassword,
    publicApi,
    cartApi,
    userProfileApi,
    vendorApi,
    riderApi,
    orderApi,
    adminApi,
    financeApi,
};