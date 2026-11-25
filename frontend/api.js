// ============================================================
// Tech Deutsch Pro — Frontend API Client (Unified)
// Exposes both `window.TDP_API` and global helper functions.
// ============================================================

const API_BASE =
  window.TDP_API_BASE ||
  (window.location &&
  window.location.protocol.startsWith("http") &&
  window.location.port === "3000"
    ? "/api"
    : "http://localhost:3000/api");

const TDP_TOKEN_KEY = "tdpToken";
const TDP_USER_KEY = "tdpUser";

function getToken() {
  return localStorage.getItem(TDP_TOKEN_KEY) || "";
}

function getCurrentUser() {
  const raw = localStorage.getItem(TDP_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(getToken());
}

function saveAuth(data) {
  if (data && data.token) {
    localStorage.setItem(TDP_TOKEN_KEY, data.token);
  }
  if (data) {
    localStorage.setItem(
      TDP_USER_KEY,
      JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role || "user",
      })
    );
  }
}

function logoutUser() {
  localStorage.removeItem(TDP_TOKEN_KEY);
  localStorage.removeItem(TDP_USER_KEY);
}

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `خطا در ارتباط با سرور (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ---------- Auth ----------
async function registerUser({ name, identifier, password }) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: { name, identifier, password },
    auth: false,
  });
  saveAuth(data);
  return data;
}

async function loginUser({ identifier, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: { identifier, password },
    auth: false,
  });
  saveAuth(data);
  return data;
}

// ---------- Courses ----------
async function fetchCourses(options = {}) {
  const params = new URLSearchParams();
  if (options.level) params.set("level", options.level);
  if (options.free) params.set("free", "true");
  if (options.q) params.set("q", options.q);
  const qs = params.toString();
  return apiRequest(`/courses${qs ? `?${qs}` : ""}`);
}

async function fetchCourse(idOrSlug) {
  return apiRequest(`/courses/${encodeURIComponent(idOrSlug)}`);
}

// ---------- Contact ----------
async function sendContactMessage({ name, contact, message, subject }) {
  return apiRequest("/contact", {
    method: "POST",
    body: { name, contact, message, subject },
    auth: false,
  });
}

// ---------- Orders & Coupons ----------
async function validateCoupon(code, subtotal) {
  return apiRequest("/coupons/validate", {
    method: "POST",
    body: { code, subtotal },
    auth: false,
  });
}

async function submitOrder({
  items,
  fullName,
  phone,
  email,
  note,
  paymentMethod,
  couponCode,
}) {
  return apiRequest("/orders", {
    method: "POST",
    body: {
      items,
      payer: { fullName, phone, email },
      note: note || "",
      paymentMethod: paymentMethod || "online",
      couponCode: couponCode || undefined,
    },
    auth: isLoggedIn(),
  });
}

async function payOrder(orderId, payload = {}) {
  return apiRequest(`/orders/${encodeURIComponent(orderId)}/pay`, {
    method: "POST",
    body: payload,
    auth: isLoggedIn(),
  });
}

async function fetchMyOrders() {
  return apiRequest("/orders/my", { auth: true });
}

// Namespaced API object
window.TDP_API = {
  baseUrl: API_BASE,
  getToken,
  getUser: getCurrentUser,
  setSession: saveAuth,
  clearSession: logoutUser,
  request: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      method: options.method || "GET",
      body: options.body ? JSON.parse(options.body) : undefined,
      auth: true,
    }),

  register: registerUser,
  login: loginUser,
  logout: logoutUser,
  getMe: () => apiRequest("/auth/me", { auth: true }),
  getMyCourses: () => apiRequest("/auth/my-courses", { auth: true }),

  getCourses: (qs = "") => apiRequest(`/courses${qs ? `?${qs}` : ""}`),
  getCourse: fetchCourse,

  validateCoupon,
  createOrder: (payload) =>
    apiRequest("/orders", { method: "POST", body: payload, auth: isLoggedIn() }),
  payOrder,
  getMyOrders: fetchMyOrders,

  sendContact: sendContactMessage,
  subscribeNewsletter: (email) =>
    apiRequest("/newsletter/subscribe", {
      method: "POST",
      body: { email },
      auth: false,
    }),

  getPosts: (qs = "") => apiRequest(`/posts${qs ? `?${qs}` : ""}`),
  getResources: () => apiRequest("/resources"),
  trackResourceDownload: (id) =>
    apiRequest(`/resources/${encodeURIComponent(id)}/download`, {
      method: "POST",
      auth: false,
    }),
  getTestimonials: () => apiRequest("/testimonials"),
  createTestimonial: (payload) =>
    apiRequest("/testimonials", { method: "POST", body: payload }),

  search: (q) => apiRequest(`/search?q=${encodeURIComponent(q)}`),
  sendChat: (message, sessionId) =>
    apiRequest("/chat", {
      method: "POST",
      body: { message, sessionId },
      auth: isLoggedIn(),
    }),
  getNotifications: () => apiRequest("/notifications", { auth: isLoggedIn() }),
  clearNotifications: () =>
    apiRequest("/notifications/clear", { method: "PUT", auth: true }),
};
