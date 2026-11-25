// Tech Deutsch Pro — Frontend API Client
// Automatically uses the same origin when served from Express (http://localhost:3000),
// and falls back to http://localhost:3000 when opened directly via file:// or Live Server.
(function (global) {
  const isHttpSameOrigin =
    global.location &&
    global.location.protocol.startsWith("http") &&
    global.location.port === "3000";

  const API_BASE =
    global.TDP_API_BASE ||
    (isHttpSameOrigin ? "/api" : "http://localhost:3000/api");

  const TOKEN_KEY = "tdp_auth_token";
  const USER_KEY = "tdp_auth_user";

  const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  };

  const setSession = (userObj) => {
    if (userObj && userObj.token) {
      localStorage.setItem(TOKEN_KEY, userObj.token);
    }
    if (userObj) {
      const { token, ...profile } = userObj;
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  async function request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
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

  global.TDP_API = {
    baseUrl: API_BASE,
    getToken,
    getUser,
    setSession,
    clearSession,
    request,

    // Auth
    register: (payload) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
    login: (payload) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
    getMe: () => request("/auth/me"),
    getMyCourses: () => request("/auth/my-courses"),

    // Courses
    getCourses: (params = "") => request(`/courses${params ? `?${params}` : ""}`),
    getCourse: (idOrSlug) => request(`/courses/${encodeURIComponent(idOrSlug)}`),

    // Orders & Coupons
    validateCoupon: (code, subtotal) =>
      request("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, subtotal }),
      }),
    createOrder: (payload) =>
      request("/orders", { method: "POST", body: JSON.stringify(payload) }),
    payOrder: (orderId, payload = {}) =>
      request(`/orders/${encodeURIComponent(orderId)}/pay`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getMyOrders: () => request("/orders/my"),

    // Contact & Newsletter
    sendContact: (payload) =>
      request("/contact", { method: "POST", body: JSON.stringify(payload) }),
    subscribeNewsletter: (email) =>
      request("/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    // Blog, Resources, Testimonials
    getPosts: (params = "") => request(`/posts${params ? `?${params}` : ""}`),
    getResources: () => request("/resources"),
    trackResourceDownload: (id) =>
      request(`/resources/${encodeURIComponent(id)}/download`, { method: "POST" }),
    getTestimonials: () => request("/testimonials"),
    createTestimonial: (payload) =>
      request("/testimonials", { method: "POST", body: JSON.stringify(payload) }),

    // Search, Chat, Notifications
    search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
    sendChat: (message, sessionId) =>
      request("/chat", {
        method: "POST",
        body: JSON.stringify({ message, sessionId }),
      }),
    getNotifications: () => request("/notifications"),
    clearNotifications: () => request("/notifications/clear", { method: "PUT" }),
  };
})(window);
