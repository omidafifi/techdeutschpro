// Mobile Drawer Logic
const drawerToggle = document.getElementById("drawer-toggle");
const drawerClose = document.getElementById("drawer-close");
const drawerOverlay = document.getElementById("drawer-overlay");
const mobileDrawer = document.getElementById("mobile-drawer");

function openDrawer() {
  if (drawerOverlay && mobileDrawer) {
    drawerOverlay.classList.remove("hidden");
    setTimeout(() => {
      drawerOverlay.classList.remove("opacity-0");
      mobileDrawer.classList.remove("translate-x-full");
    }, 10);
    document.body.style.overflow = "hidden";
  }
}

function closeDrawer() {
  if (drawerOverlay && mobileDrawer) {
    drawerOverlay.classList.add("opacity-0");
    mobileDrawer.classList.add("translate-x-full");
    setTimeout(() => {
      drawerOverlay.classList.add("hidden");
    }, 300);
    document.body.style.overflow = "";
  }
}

if (drawerToggle) drawerToggle.addEventListener("click", openDrawer);
if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

// Search Modal Logic
const searchBtn = document.getElementById("search-btn");
const searchClose = document.getElementById("search-close");
const searchModal = document.getElementById("search-modal");
const searchOverlay = document.getElementById("search-overlay");
const searchContent = document.getElementById("search-content");

function openSearch() {
  if (!searchModal) return;
  searchModal.classList.remove("hidden");
  searchModal.classList.add("flex");
  setTimeout(() => {
    searchOverlay.classList.remove("opacity-0");
    searchContent.classList.remove("scale-95", "opacity-0");
  }, 10);
  document.body.style.overflow = "hidden";
}

function closeSearch() {
  if (!searchModal) return;
  searchOverlay.classList.add("opacity-0");
  searchContent.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    searchModal.classList.add("hidden");
    searchModal.classList.remove("flex");
  }, 300);
  document.body.style.overflow = "";
}

if (searchBtn) searchBtn.addEventListener("click", openSearch);
if (searchClose) searchClose.addEventListener("click", closeSearch);
if (searchOverlay) searchOverlay.addEventListener("click", closeSearch);

// Cart System Logic
const cartBtn = document.getElementById("cart-btn");
const cartClose = document.getElementById("cart-close");
const cartOverlay = document.getElementById("cart-overlay");
const cartDrawer = document.getElementById("cart-drawer");
const cartItemsContainer = document.getElementById("cart-drawer-items");
const cartTotalElement = document.getElementById("cart-drawer-total");
const cartCountBadge = document.getElementById("cart-count");

// Initialize Cart State
let cart = JSON.parse(localStorage.getItem("techDeutschCart")) || [];

function saveCart() {
  localStorage.setItem("techDeutschCart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  // Update Badge
  if (cartCountBadge) {
    cartCountBadge.textContent = cart.length;
    // Animate badge
    cartCountBadge.classList.add("scale-125");
    setTimeout(() => cartCountBadge.classList.remove("scale-125"), 200);
  }

  // Update Drawer Items
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<div class="flex flex-col items-center justify-center h-48 text-gray-400 gap-4"><i class="fas fa-shopping-basket text-4xl opacity-20"></i><p class="italic font-medium">سبد خرید فعلاً خالی است.</p></div>';
    } else {
      cartItemsContainer.innerHTML = cart
        .map(
          (item, index) => `
        <div class="flex gap-4 p-3 bg-gray-50 rounded-2xl group relative overflow-hidden transition hover:bg-white hover:shadow-md border border-gray-100">
            <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
              <img src="${item.image}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <h5 class="font-bold text-sm text-gray-800 line-clamp-1">${item.title}</h5>
                <p class="text-[10px] text-gray-500 mt-1">${item.level || "دوره آموزشی"}</p>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-red-600 font-black text-sm">${Number(item.price).toLocaleString()} <span class="text-[10px] font-normal">تومان</span></span>
                <button onclick="window.removeFromCart(${index})" class="text-gray-400 hover:text-red-500 transition w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"><i class="fas fa-trash-alt text-xs"></i></button>
              </div>
            </div>
        </div>
      `,
        )
        .join("");
    }
  }

  // Update Total
  if (cartTotalElement) {
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    cartTotalElement.textContent = total.toLocaleString() + " تومان";
  }
}

function addToCart(dataset) {
  const item = {
    id: dataset.id,
    title: dataset.title,
    price: parseInt(dataset.price),
    level: dataset.level,
    image: dataset.image,
  };

  cart.push(item);
  saveCart();
  openCart();
}

// Global Remove Function
window.removeFromCart = function (index) {
  cart.splice(index, 1);
  saveCart();
};

function openCart() {
  if (!cartOverlay || !cartDrawer) return;
  updateCartUI();
  cartOverlay.classList.remove("hidden");
  setTimeout(() => {
    cartOverlay.classList.remove("opacity-0");
    cartDrawer.classList.remove("-translate-x-full");
  }, 10);
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (!cartOverlay || !cartDrawer) return;
  cartOverlay.classList.add("opacity-0");
  cartDrawer.classList.add("-translate-x-full");
  setTimeout(() => {
    cartOverlay.classList.add("hidden");
  }, 300);
  document.body.style.overflow = "";
}

if (cartBtn) cartBtn.addEventListener("click", openCart);
if (cartClose) cartClose.addEventListener("click", closeCart);
if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

// Initialize Add to Cart Buttons
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI(); // Initial check

  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Animation
      btn.innerHTML = '<i class="fas fa-check"></i> افزوده شد';
      btn.classList.add("bg-green-600", "text-white");
      setTimeout(() => {
        btn.innerHTML = "افزودن به سبد خرید"; // Or original text
        btn.classList.remove("bg-green-600", "text-white");
        // Restore original color if encoded manually, or just remove overrides
      }, 1000);

      addToCart(btn.dataset);
    });
  });
});

// Auth Modal Logic
const loginBtn = document.getElementById("login-btn");
const authClose = document.getElementById("auth-close");
const authModal = document.getElementById("auth-modal");
const authOverlay = document.getElementById("auth-overlay");
const authContent = document.getElementById("auth-content");

function openAuth() {
  if (!authModal) return;
  authModal.classList.remove("hidden");
  authModal.classList.add("flex");
  setTimeout(() => {
    authOverlay.classList.remove("opacity-0");
    authContent.classList.remove("scale-95", "opacity-0");
  }, 10);
  document.body.style.overflow = "hidden";
}

function closeAuth() {
  if (!authModal) return;
  authOverlay.classList.add("opacity-0");
  authContent.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    authModal.classList.add("hidden");
    authModal.classList.remove("flex");
  }, 300);
  document.body.style.overflow = "";
}

if (loginBtn) loginBtn.addEventListener("click", openAuth);
if (authClose) authClose.addEventListener("click", closeAuth);
if (authOverlay) authOverlay.addEventListener("click", closeAuth);

// Countdown logic
function startCountdown() {
  const hoursEl = document.getElementById("hours");
  const minsEl = document.getElementById("minutes");
  const secsEl = document.getElementById("seconds");

  if (!hoursEl || !minsEl || !secsEl) return;

  let totalSeconds = 7 * 3600 + 19 * 60 + 27;

  setInterval(() => {
    if (totalSeconds <= 0) return;
    totalSeconds--;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    hoursEl.textContent = h.toString().padStart(2, "0");
    minsEl.textContent = m.toString().padStart(2, "0");
    secsEl.textContent = s.toString().padStart(2, "0");
  }, 1000);
}

startCountdown();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href && href.startsWith("#")) {
      const targetId = href.substring(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        if (typeof closeDrawer === "function") closeDrawer();
        if (typeof closeCart === "function") closeCart();
        if (typeof closeSearch === "function") closeSearch();
        if (typeof closeAuth === "function") closeAuth();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  });
});

// Header Scroll Effect
const headerElement = document.querySelector("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    headerElement.classList.add("shadow-md", "header-scrolled");
    headerElement.classList.remove("shadow-sm");
  } else {
    headerElement.classList.remove("shadow-md", "header-scrolled");
    headerElement.classList.add("shadow-sm");
  }
});

// Back to Top Logic
const backToTopBtn = document.createElement("button");
backToTopBtn.id = "back-to-top";
backToTopBtn.setAttribute("aria-label", "بازگشت به بالا");
// Premium blue gradient with glowing shadow
// Solid dark premium background
backToTopBtn.className =
  "fixed bottom-8 right-8 w-14 h-14 bg-gray-900 text-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.5)] items-center justify-center cursor-pointer transition-all duration-500 translate-y-20 opacity-0 z-[100] hover:shadow-[0_15px_35px_rgba(220,38,38,0.4)] hover:-translate-y-2 hover:scale-110 flex group active:scale-90 border border-gray-700";
backToTopBtn.innerHTML = `
  <div class="absolute inset-0 rounded-full bg-gray-800 opacity-0 group-hover:animate-ping"></div>
  <i class="fas fa-chevron-up text-xl relative z-10 transition-transform duration-300 group-hover:-translate-y-1 text-yellow-400"></i>
  <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="german-flag-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:black;stop-opacity:1" />
        <stop offset="45%" style="stop-color:#DC2626;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#EAB308;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" stroke="#374151" stroke-width="4" fill="transparent" class="opacity-30" />
    <circle id="back-to-top-progress" cx="50" cy="50" r="46" stroke="url(#german-flag-gradient)" stroke-width="4" fill="transparent" stroke-dasharray="289" stroke-dashoffset="289" stroke-linecap="round" class="drop-shadow-md transition-all duration-100" />
  </svg>
`;
document.body.appendChild(backToTopBtn);

const progressBar = document.getElementById("scroll-progress");
const progressCircle = document.getElementById("back-to-top-progress");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (scrollY / height) * 100;

  // Back to top visibility
  if (scrollY > 400) {
    backToTopBtn.classList.remove("translate-y-20", "opacity-0");
  } else {
    backToTopBtn.classList.add("translate-y-20", "opacity-0");
  }

  // Linear Progress Bar (Top of page)
  if (progressBar) {
    progressBar.style.width = scrolled + "%";
  }

  // Circular Progress (On the button)
  if (progressCircle) {
    const totalLength = 289; // 2 * PI * r (r=46)
    const offset = totalLength - (scrolled / 100) * totalLength;
    progressCircle.style.strokeDashoffset = offset;
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
// Chatbot Logic (Connected to /api/chat with graceful fallback)
document.addEventListener("DOMContentLoaded", () => {
  const chatbotBtn = document.getElementById("chatbot-btn");
  const chatWindow = document.getElementById("chat-window");
  const chatClose = document.getElementById("chat-close");
  const chatMessages = document.getElementById("chat-messages");
  const chatForm = chatWindow ? chatWindow.querySelector("form") : null;
  const chatInput =
    document.getElementById("chat-input") ||
    (chatForm ? chatForm.querySelector('input[type="text"]') : null);
  const chatSubmitBtn = chatForm ? chatForm.querySelector("button") : null;

  // Enable chat input and submit button across all pages
  if (chatInput) chatInput.disabled = false;
  if (chatSubmitBtn) {
    chatSubmitBtn.disabled = false;
    chatSubmitBtn.type = "submit";
  }

  let chatSessionId = localStorage.getItem("tdp_chat_session") || "";

  if (chatbotBtn && chatWindow) {
    chatbotBtn.addEventListener("click", () => {
      chatWindow.classList.toggle("invisible");
      chatWindow.classList.toggle("opacity-0");
      chatWindow.classList.toggle("translate-y-10");
    });

    if (chatClose) {
      chatClose.addEventListener("click", () => {
        chatWindow.classList.add("invisible", "opacity-0", "translate-y-10");
      });
    }
  }

  function addMessage(message, isUser = false) {
    if (!chatMessages) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `flex gap-3 items-end ${isUser ? "justify-end" : ""}`;

    const avatarDiv = document.createElement("div");
    avatarDiv.className =
      "w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-300";
    if (!isUser) {
      avatarDiv.innerHTML =
        '<img src="Foto/myPic.JPG" class="w-full h-full object-cover">';
    } else {
      avatarDiv.className += " bg-blue-500 flex items-center justify-center";
      avatarDiv.innerHTML = '<i class="fas fa-user text-white text-xs"></i>';
    }

    const textDiv = document.createElement("div");
    textDiv.className = `p-3 rounded-2xl shadow-sm text-sm max-w-[80%] border whitespace-pre-line ${isUser ? "bg-blue-500 text-white rounded-br-none" : "bg-white text-gray-700 rounded-bl-none border-gray-100"}`;
    textDiv.textContent = message;

    if (isUser) {
      messageDiv.appendChild(textDiv);
      messageDiv.appendChild(avatarDiv);
    } else {
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(textDiv);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function requestBotResponse(userMessage) {
    const apiBase =
      (window.TDP_API && window.TDP_API.baseUrl) ||
      (window.location.port === "3000" ? "/api" : "http://localhost:3000/api");

    try {
      const headers = { "Content-Type": "application/json" };
      const token = localStorage.getItem("tdp_auth_token");
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage,
          sessionId: chatSessionId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        if (data.sessionId) {
          chatSessionId = data.sessionId;
          localStorage.setItem("tdp_chat_session", chatSessionId);
        }
        addMessage(data.reply);
        return;
      }
    } catch {
      // Fallback below if server is offline
    }

    let fallback = "ممنون از پیام شما! لطفاً برای مشاوره از بخش تماس با ما اقدام کنید.";
    if (userMessage.includes("سلام")) {
      fallback = "سلام! چطور می‌تونم کمکتون کنم؟";
    } else if (userMessage.includes("دوره")) {
      fallback = "برای اطلاعات بیشتر درباره دوره‌ها، به بخش دوره‌های آموزشی مراجعه کنید.";
    }
    addMessage(fallback);
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (message) {
        addMessage(message, true);
        chatInput.value = "";
        requestBotResponse(message);
      }
    });
  }
});

// Backend API Integrations: Auth Modal, Live Search, Notifications, Newsletter
document.addEventListener("DOMContentLoaded", () => {
  const apiBase =
    (window.TDP_API && window.TDP_API.baseUrl) ||
    (window.location.port === "3000" ? "/api" : "http://localhost:3000/api");

  async function apiFetch(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const token = localStorage.getItem("tdp_auth_token");
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${apiBase}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "خطا در ارتباط با سرور");
    return data;
  }

  // 1. Auth UI & Login/Register Handler
  const loginButton = document.getElementById("login-btn");
  const authModalEl = document.getElementById("auth-modal");

  function refreshAuthButton() {
    if (!loginButton) return;
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("tdp_auth_user") || "null");
    } catch {
      user = null;
    }

    if (user && user.name) {
      loginButton.innerHTML = `<i class="fas fa-user-check"></i> ${user.name} <span class="text-xs opacity-70">(خروج)</span>`;
      loginButton.dataset.loggedIn = "true";
    } else {
      loginButton.innerHTML = 'شروع کنید <i class="fas fa-user-plus"></i>';
      loginButton.dataset.loggedIn = "false";
    }
  }

  refreshAuthButton();

  if (loginButton) {
    loginButton.addEventListener(
      "click",
      (e) => {
        if (loginButton.dataset.loggedIn === "true") {
          e.stopImmediatePropagation();
          if (confirm("آیا می‌خواهید از حساب کاربری خود خارج شوید؟")) {
            localStorage.removeItem("tdp_auth_token");
            localStorage.removeItem("tdp_auth_user");
            refreshAuthButton();
          }
        }
      },
      true
    );
  }

  if (authModalEl) {
    const authForm = authModalEl.querySelector("form");
    const toggleLink = authModalEl.querySelector('a[href="#"].text-red-600');
    let isRegisterMode = false;

    if (authForm) {
      // Inject optional Name field (shown only in Register mode)
      const nameGroup = document.createElement("div");
      nameGroup.id = "auth-name-group";
      nameGroup.className = "hidden";
      nameGroup.innerHTML = `
        <label class="block text-sm font-bold text-gray-700 mb-2 mr-1 text-right">نام و نام خانوادگی</label>
        <input type="text" id="auth-name-input"
          class="w-full text-right bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-yellow-400 focus:bg-white outline-none transition-all">
      `;
      authForm.prepend(nameGroup);

      const errorBox = document.createElement("p");
      errorBox.id = "auth-error-msg";
      errorBox.className = "text-xs text-red-600 font-bold text-right hidden";
      authForm.appendChild(errorBox);

      if (toggleLink) {
        toggleLink.addEventListener("click", (e) => {
          e.preventDefault();
          isRegisterMode = !isRegisterMode;
          nameGroup.classList.toggle("hidden", !isRegisterMode);
          const submitBtn = authForm.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.textContent = isRegisterMode
              ? "ایجاد حساب کاربری"
              : "ورود به حساب کاربری";
          }
          toggleLink.textContent = isRegisterMode ? "وارد شوید" : "ثبت‌نام کنید";
          errorBox.classList.add("hidden");
        });
      }

      authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.classList.add("hidden");

        const textInputs = authForm.querySelectorAll('input[type="text"]');
        const passwordInput = authForm.querySelector('input[type="password"]');
        const nameVal = document.getElementById("auth-name-input")?.value.trim();
        const identifierVal = textInputs[textInputs.length - 1]?.value.trim();
        const passwordVal = passwordInput?.value;

        try {
          const endpoint = isRegisterMode ? "/auth/register" : "/auth/login";
          const payload = isRegisterMode
            ? { name: nameVal, identifier: identifierVal, password: passwordVal }
            : { identifier: identifierVal, password: passwordVal };

          const data = await apiFetch(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
          });

          if (data.token) localStorage.setItem("tdp_auth_token", data.token);
          const { token, ...profile } = data;
          localStorage.setItem("tdp_auth_user", JSON.stringify(profile));
          refreshAuthButton();
          if (typeof closeAuth === "function") closeAuth();
          authForm.reset();
        } catch (err) {
          errorBox.textContent = err.message;
          errorBox.classList.remove("hidden");
        }
      });
    }
  }

  // 2. Live Search Modal Handler
  const searchModalEl = document.getElementById("search-modal");
  if (searchModalEl) {
    const searchInput = searchModalEl.querySelector('input[type="text"]');
    const searchContentEl = document.getElementById("search-content");
    if (searchInput && searchContentEl) {
      let resultsBox = document.getElementById("live-search-results");
      if (!resultsBox) {
        resultsBox = document.createElement("div");
        resultsBox.id = "live-search-results";
        resultsBox.className = "mt-4 max-h-72 overflow-y-auto space-y-2 text-right hidden";
        searchContentEl.querySelector(".p-6")?.appendChild(resultsBox);
      }

      let searchTimer;
      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);
        const q = searchInput.value.trim();
        if (!q) {
          resultsBox.classList.add("hidden");
          resultsBox.innerHTML = "";
          return;
        }
        searchTimer = setTimeout(async () => {
          try {
            const data = await apiFetch(`/search?q=${encodeURIComponent(q)}`);
            if (data.totalResults === 0) {
              resultsBox.innerHTML =
                '<p class="text-sm text-gray-400 p-3 text-center">نتیجه‌ای یافت نشد.</p>';
            } else {
              const items = [];
              (data.courses || []).forEach((c) =>
                items.push(
                  `<a href="category-courses.html" class="block p-3 rounded-xl bg-gray-50 hover:bg-yellow-50 transition"><span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">دوره</span><span class="font-bold text-gray-800">${c.title}</span></a>`
                )
              );
              (data.posts || []).forEach((p) =>
                items.push(
                  `<a href="blog.html" class="block p-3 rounded-xl bg-gray-50 hover:bg-yellow-50 transition"><span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded ml-2">وبلاگ</span><span class="font-bold text-gray-800">${p.title}</span></a>`
                )
              );
              (data.resources || []).forEach((r) =>
                items.push(
                  `<a href="category-resources.html" class="block p-3 rounded-xl bg-gray-50 hover:bg-yellow-50 transition"><span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">منبع</span><span class="font-bold text-gray-800">${r.title}</span></a>`
                )
              );
              resultsBox.innerHTML = items.join("");
            }
            resultsBox.classList.remove("hidden");
          } catch {
            // Silently ignore if backend is offline
          }
        }, 300);
      });
    }
  }

  // 3. Newsletter Sidebar Box (e.g. on category-articles.html)
  document.querySelectorAll('input[placeholder*="ایمیل خود را وارد کنید"]').forEach((emailInput) => {
    const container = emailInput.parentElement;
    const submitBtn = container ? container.querySelector("button") : null;
    if (submitBtn && !submitBtn.dataset.newsletterBound) {
      submitBtn.dataset.newsletterBound = "true";
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) return alert("لطفاً ایمیل خود را وارد کنید.");
        try {
          const res = await apiFetch("/newsletter/subscribe", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
          alert(res.message || "عضویت با موفقیت انجام شد!");
          emailInput.value = "";
        } catch (err) {
          alert(err.message);
        }
      });
    }
  });
});

// Number Counter Animation
const statsSection = document.getElementById("stats-section");
let animated = false;

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerText = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

if (statsSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          const counters = document.querySelectorAll(".counter");
          counters.forEach((counter) => {
            const target = +counter.getAttribute("data-target");
            animateValue(counter, 0, target, 2500);
          });
          animated = true;
          observer.unobserve(statsSection);
        }
      });
    },
    { threshold: 0.2 },
  ); // Trigger when 20% visible

  observer.observe(statsSection);
}
