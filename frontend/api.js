// ============================================================
// Tech Deutsch Pro — Frontend API helper
// این فایل باید در همه صفحه‌ها «قبل از script.js» لود شود:
//   <script src="api.js"></script>
// ============================================================

const API_BASE = "/api";
const TDP_TOKEN_KEY = "tdpToken";
const TDP_USER_KEY = "tdpUser";

// ---------- Core helper ----------
async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem(TDP_TOKEN_KEY);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // پاسخ بدون بدنه JSON
  }

  if (!res.ok) {
    const message = (data && data.message) || `خطای سرور (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// ---------- Auth ----------
function saveAuth(data) {
  localStorage.setItem(TDP_TOKEN_KEY, data.token);
  localStorage.setItem(
    TDP_USER_KEY,
    JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    })
  );
}

// identifier می‌تواند ایمیل یا شماره موبایل باشد
async function registerUser({ name, identifier, password }) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: { name, identifier, password },
  });
  saveAuth(data);
  return data;
}

async function loginUser({ identifier, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: { identifier, password },
  });
  saveAuth(data);
  return data;
}

function logoutUser() {
  localStorage.removeItem(TDP_TOKEN_KEY);
  localStorage.removeItem(TDP_USER_KEY);
}

function getCurrentUser() {
  const raw = localStorage.getItem(TDP_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(localStorage.getItem(TDP_TOKEN_KEY));
}

// ---------- Courses ----------
// options: { level: "A1"|"A2"|"B1"|"B2"|"C1", free: true }
async function fetchCourses(options = {}) {
  const params = new URLSearchParams();
  if (options.level) params.set("level", options.level);
  if (options.free) params.set("free", "true");
  const qs = params.toString();
  return apiRequest(`/courses${qs ? `?${qs}` : ""}`);
}

async function fetchCourse(idOrSlug) {
  return apiRequest(`/courses/${encodeURIComponent(idOrSlug)}`);
}

// ---------- Contact ----------
async function sendContactMessage({ name, contact, message }) {
  return apiRequest("/contact", {
    method: "POST",
    body: { name, contact, message },
  });
}

// ---------- Orders ----------
// items: محتوای سبد خرید (localStorage با کلید techDeutschCart)
async function submitOrder({ items, fullName, phone, email, note, paymentMethod }) {
  return apiRequest("/orders", {
    method: "POST",
    body: {
      items,
      payer: { fullName, phone, email },
      note: note || "",
      paymentMethod: paymentMethod || "online",
    },
    auth: isLoggedIn(),
  });
}

async function fetchMyOrders() {
  return apiRequest("/orders/my", { auth: true });
}
