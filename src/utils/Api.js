
const BASE_URL = 'https://delichops-backend-akuq.onrender.com';

const getToken = () =>
  localStorage.getItem('chopspot_token') ||
  localStorage.getItem('adminToken') || '';

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, { ...options, headers: buildHeaders() });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) {
    const msg = data?.message || data?.error || data?.msg || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status; err.data = data;
    throw err;
  }
  return data;
}

// ── Public request (no auth token — for registration endpoints) ──────────────
async function publicRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json' },  // no Authorization header
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) {
    const msg = data?.message || data?.error || data?.msg || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status; err.data = data;
    throw err;
  }
  return data;
}

// ── List / object normalisation ─────────────────────────────────────────────
export const extractList = (res) => {
  if (Array.isArray(res)) return res;
  for (const key of ['data', 'results', 'items', 'content', 'users', 'list']) {
    if (Array.isArray(res?.[key])) return res[key];
  }
  const k = Object.keys(res || {}).find(k => Array.isArray(res[k]));
  return k ? res[k] : null;
};

export const extractObject = (res) => {
  if (res && typeof res === 'object' && !Array.isArray(res)) {
    if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
    return res;
  }
  return null;
};

// ── Transforms: both UserProfile AND Vendor/Rider profile objects ─────────────
// The API returns two different shapes depending on the endpoint:
//   /api/admin/vendors → Vendor objects with restaurantName, restaurantPhone, etc.
//   /api/admin/users   → UserProfile objects with firstName, lastName, userType, etc.
// Both shapes are handled here.

const fmt_date = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

const capitalise = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

// Vendor: could be a Vendor profile OR a UserProfile with userType=VENDOR
const transformToVendor = (u) => ({
  _id:      u._id    || u.id    || u.userId || '—',
  id:       u._id    || u.id    || u.userId || '—',
  // Name: prefer restaurantName (vendor profile), fall back to fullName/username
  name:         u.restaurantName  || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown Vendor',
  businessName: u.restaurantName  || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
  owner:        u.ownerName       || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '—',
  email:        u.restaurantEmail || u.email || '—',
  phone:        u.restaurantPhone || u.phone || u.phoneNumber || '—',
  category:     u.category        || u.cuisine || 'Nigerian',
  address:      u.restaurantAddress || u.address || '—',
  landmark:     u.landmark        || '—',
  openDays:     u.openDays        || [],
  openTime:     u.openTime        || '—',
  closeTime:    u.closeTime       || '—',
  deliveryFrom: u.deliveryFromPrice ?? u.deliveryFrom ?? 0,
  orders:       u.totalOrders     ?? u.orders   ?? 0,
  revenue:      u.totalRevenue    ?? u.revenue  ?? 0,
  rating:       u.rating          ?? 0,
  // Status: API returns "PENDING", "APPROVED", "SUSPENDED" — normalise to title case
  status: (() => {
    const s = (u.status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACTIVE') return 'Active';
    if (s === 'SUSPENDED') return 'Suspended';
    if (s === 'REJECTED')  return 'Rejected';
    if (s === 'PENDING')   return 'Pending';
    if (u.suspended)       return 'Suspended';
    if (u.approved)        return 'Active';
    return 'Pending';
  })(),
  joined:   fmt_date(u.createdAt),
  userId:   u.userId  || '—',
  userType: u.userType,
  approved: u.approved  || false,
  suspended: u.suspended || false,
  isOpen:   u.open      ?? true,
  packages: u.packages  || [],
});

// Rider: could be a Rider profile OR a UserProfile with userType=RIDER
const transformToRider = (u) => ({
  _id:      u._id  || u.id    || u.userId || '—',
  id:       u._id  || u.id    || u.userId || '—',
  name:     u.riderName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown Rider',
  fullName: u.riderName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
  email:    u.email    || '—',
  phone:    u.phone    || u.phoneNumber || '—',
  vehicle:     u.vehicle     || u.vehicleType || 'Motorcycle',
  vehicleType: u.vehicle     || u.vehicleType || 'Motorcycle',
  zone:        u.zone        || u.deliveryZone || '—',
  deliveries:  u.totalDeliveries ?? u.deliveries ?? 0,
  rating:      u.rating  ?? 0,
  earnings:    u.totalEarnings   ?? u.earnings   ?? 0,
  plateNo:     u.plateNo  || '—',
  bank:        u.bank     || '—',
  accountNo:   u.accountNo || '—',
  status: (() => {
    const s = (u.status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACTIVE' || s === 'ONLINE') return 'Online';
    if (s === 'SUSPENDED') return 'Suspended';
    if (s === 'REJECTED')  return 'Rejected';
    if (s === 'OFFLINE')   return 'Offline';
    if (s === 'PENDING')   return 'Pending';
    if (u.suspended) return 'Suspended';
    if (u.approved)  return 'Online';
    return 'Pending';
  })(),
  joined: fmt_date(u.createdAt),
  userId:   u.userId  || '—',
  userType: u.userType,
  approved: u.approved  || false,
  suspended: u.suspended || false,
});

// Customer: UserProfile with userType=CUSTOMER
const transformToCustomer = (u) => ({
  _id:   u._id  || u.id    || '—',
  id:    u._id  || u.id    || '—',
  name:  `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown Customer',
  email: u.email || '—',
  phone: u.phone || u.phoneNumber || '—',
  orders:     u.orders     ?? u.totalOrders ?? 0,
  totalSpent: u.totalSpent ?? 0,
  status: (() => {
    const s = (u.status || '').toUpperCase();
    if (s === 'ACTIVE')    return 'Active';
    if (s === 'SUSPENDED') return 'Suspended';
    return u.suspended ? 'Suspended' : 'Active';
  })(),
  joined: fmt_date(u.createdAt),
  userType: u.userType,
});

// Admin: UserProfile with userType=ADMIN
const transformToAdmin = (u) => ({
  _id:   u._id  || u.id    || '—',
  id:    u._id  || u.id    || '—',
  name:  `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown Admin',
  email: u.email || '—',
  role:  u.role  || 'Admin Manager',
  status: (() => {
    const s = (u.status || '').toUpperCase();
    if (s === 'ACTIVE')    return 'Active';
    if (s === 'SUSPENDED' || s === 'INACTIVE') return 'Inactive';
    return u.suspended ? 'Inactive' : 'Active';
  })(),
  joined: fmt_date(u.createdAt),
  avatar: [(u.firstName?.[0] || 'A').toUpperCase(), (u.lastName?.[0] || 'D').toUpperCase()].join(''),
  userType: u.userType, approved: u.approved || false, suspended: u.suspended || false,
});

// Fallback: fetch /api/admin/users and filter by userType
async function getUsersByType(type, transform) {
  const allRes = await request('/api/admin/users').catch(() => null);
  if (allRes) {
    const list = extractList(allRes) || [];
    const filtered = list.filter(u => (u.userType || '').toUpperCase() === type.toUpperCase());
    if (filtered.length > 0) return filtered.map(transform);
  }
  return [];
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
// NOTE: /api/auth/me is intentionally not called from the dashboard because
// the Spring Security filter crashes when userDetails is null (token not loaded).
// Admin profile is read from localStorage.chopspot_user (set by LoginPage on login).

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
export const getOverview = () => request('/api/admin/overview');

// ── CUSTOMERS ────────────────────────────────────────────────────────────────
export const getCustomers = async () => {
  const direct = await request('/api/admin/customers').catch(() => null);
  if (direct) {
    const list = extractList(direct);
    if (list && list.length > 0) {
      return list.map(transformToCustomer);
    }
  }
  return getUsersByType('CUSTOMER', transformToCustomer);
};
export const getCustomer      = (id) => request(`/api/admin/customers/${id}`);
export const suspendCustomer  = (id) => request(`/api/admin/customers/${id}/suspend`,  { method: 'PATCH' });
export const activateCustomer = (id) => request(`/api/admin/customers/${id}/activate`, { method: 'PATCH' });

// ── VENDORS ──────────────────────────────────────────────────────────────────
export const getVendors = async () => {
  const direct = await request('/api/admin/vendors').catch(() => null);
  if (direct) {
    const list = extractList(direct);
    if (list && list.length > 0) {
      // Always transform — handles both Vendor profile shape and UserProfile shape
      return list.map(transformToVendor);
    }
  }
  // Fallback: filter all users by userType=VENDOR
  return getUsersByType('VENDOR', transformToVendor);
};
export const getVendor     = (id) => request(`/api/admin/vendors/${id}`);
export const approveVendor = (id) => request(`/api/admin/vendors/${id}/approve`, { method: 'PATCH' });
export const rejectVendor  = (id) => request(`/api/admin/vendors/${id}/reject`,  { method: 'PATCH' });
export const suspendVendor = (id) => request(`/api/admin/vendors/${id}/suspend`, { method: 'PATCH' });
export const deleteVendor  = (id) => request(`/api/admin/vendors/${id}`,         { method: 'DELETE' });

// ── RIDERS ───────────────────────────────────────────────────────────────────
export const getRiders = async () => {
  const direct = await request('/api/admin/riders').catch(() => null);
  if (direct) {
    const list = extractList(direct);
    if (list && list.length > 0) {
      return list.map(transformToRider);
    }
  }
  return getUsersByType('RIDER', transformToRider);
};
export const getRider     = (id) => request(`/api/admin/riders/${id}`);
export const getAvailableRiders = async () => {
  const all = await getRiders();
  return all.filter(r => ['online', 'available'].includes((r.status || '').toLowerCase()));
};
export const approveRider = (id) => request(`/api/admin/riders/${id}/approve`, { method: 'PATCH' });
export const rejectRider  = (id) => request(`/api/admin/riders/${id}/reject`,  { method: 'PATCH' });
export const suspendRider = (id) => request(`/api/admin/riders/${id}/suspend`, { method: 'PATCH' });
export const deleteRider  = (id) => request(`/api/admin/riders/${id}`,         { method: 'DELETE' });

// ── ORDERS ───────────────────────────────────────────────────────────────────
export const getOrders         = ()                 => request('/api/admin/orders');
export const updateOrderStatus = (id, status)       => request(`/api/admin/orders/${id}/status`,           { method: 'PUT', body: JSON.stringify({ status }) });
export const assignOrderRider  = (orderId, riderId) => request(`/api/admin/orders/${orderId}/assign-rider`, { method: 'PUT', body: JSON.stringify({ riderId }) });

// ── ADMINS (Super Admin only) ─────────────────────────────────────────────────
export const getAdmins = async () => {
  const direct = await request('/api/admin/admins').catch(() => null);
  if (direct) {
    const list = extractList(direct);
    if (list && list.length > 0) {
      return list.map(transformToAdmin);
    }
  }
  return getUsersByType('ADMIN', transformToAdmin);
};
export const createAdmin   = (body) => request('/api/admin/admins',              { method: 'POST',   body: JSON.stringify(body) });
export const suspendAdmin  = (id)   => request(`/api/admin/admins/${id}/suspend`,  { method: 'PATCH' });
export const activateAdmin = (id)   => request(`/api/admin/admins/${id}/activate`, { method: 'PATCH' });
export const deleteAdmin   = (id)   => request(`/api/admin/admins/${id}`,          { method: 'DELETE' });

// ── GENERIC USERS ─────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  const res = await request('/api/admin/users').catch(() => null);
  return extractList(res) || [];
};

// ── PUBLIC REGISTRATION (no auth token required) ─────────────────────────────
// Called from VendorRegister and RiderRegister forms

// These endpoints do NOT send an auth token — they create new profiles
// and the backend uses the request body (not the JWT) to identify the user.
export const registerVendor = (body) =>
  publicRequest('/api/vendor/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const registerRider = (body) =>
  publicRequest('/api/rider/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });