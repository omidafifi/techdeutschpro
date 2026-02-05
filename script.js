// Mobile Drawer Logic
const drawerToggle = document.getElementById('drawer-toggle');
const drawerClose = document.getElementById('drawer-close');
const drawerOverlay = document.getElementById('drawer-overlay');
const mobileDrawer = document.getElementById('mobile-drawer');

function openDrawer() {
  if (drawerOverlay && mobileDrawer) {
    drawerOverlay.classList.remove('hidden');
    setTimeout(() => {
      drawerOverlay.classList.remove('opacity-0');
      mobileDrawer.classList.remove('translate-x-full');
    }, 10);
    document.body.style.overflow = 'hidden';
  }
}

function closeDrawer() {
  if (drawerOverlay && mobileDrawer) {
    drawerOverlay.classList.add('opacity-0');
    mobileDrawer.classList.add('translate-x-full');
    setTimeout(() => {
      drawerOverlay.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
  }
}

if (drawerToggle) drawerToggle.addEventListener('click', openDrawer);
if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

// Search Modal Logic
const searchBtn = document.getElementById('search-btn');
const searchClose = document.getElementById('search-close');
const searchModal = document.getElementById('search-modal');
const searchOverlay = document.getElementById('search-overlay');
const searchContent = document.getElementById('search-content');

function openSearch() {
  if (!searchModal) return;
  searchModal.classList.remove('hidden');
  searchModal.classList.add('flex');
  setTimeout(() => {
    searchOverlay.classList.remove('opacity-0');
    searchContent.classList.remove('scale-95', 'opacity-0');
  }, 10);
  document.body.style.overflow = 'hidden';
}

function closeSearch() {
  if (!searchModal) return;
  searchOverlay.classList.add('opacity-0');
  searchContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    searchModal.classList.add('hidden');
    searchModal.classList.remove('flex');
  }, 300);
  document.body.style.overflow = '';
}

if (searchBtn) searchBtn.addEventListener('click', openSearch);
if (searchClose) searchClose.addEventListener('click', closeSearch);
if (searchOverlay) searchOverlay.addEventListener('click', closeSearch);

// Cart Drawer Logic
const cartBtn = document.getElementById('cart-btn');
const cartClose = document.getElementById('cart-close');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');

function openCart() {
  if (!cartOverlay || !cartDrawer) return;
  cartOverlay.classList.remove('hidden');
  setTimeout(() => {
    cartOverlay.classList.remove('opacity-0');
    cartDrawer.classList.remove('-translate-x-full'); // Slides in from left
  }, 10);
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  if (!cartOverlay || !cartDrawer) return;
  cartOverlay.classList.add('opacity-0');
  cartDrawer.classList.add('-translate-x-full');
  setTimeout(() => {
    cartOverlay.classList.add('hidden');
  }, 300);
  document.body.style.overflow = '';
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Auth Modal Logic
const loginBtn = document.getElementById('login-btn');
const authClose = document.getElementById('auth-close');
const authModal = document.getElementById('auth-modal');
const authOverlay = document.getElementById('auth-overlay');
const authContent = document.getElementById('auth-content');

function openAuth() {
  if (!authModal) return;
  authModal.classList.remove('hidden');
  authModal.classList.add('flex');
  setTimeout(() => {
    authOverlay.classList.remove('opacity-0');
    authContent.classList.remove('scale-95', 'opacity-0');
  }, 10);
  document.body.style.overflow = 'hidden';
}

function closeAuth() {
  if (!authModal) return;
  authOverlay.classList.add('opacity-0');
  authContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
  }, 300);
  document.body.style.overflow = '';
}

if (loginBtn) loginBtn.addEventListener('click', openAuth);
if (authClose) authClose.addEventListener('click', closeAuth);
if (authOverlay) authOverlay.addEventListener('click', closeAuth);

// Countdown logic
function startCountdown() {
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('minutes');
  const secsEl = document.getElementById('seconds');

  if (!hoursEl || !minsEl || !secsEl) return;

  let totalSeconds = (7 * 3600) + (19 * 60) + 27;

  setInterval(() => {
    if (totalSeconds <= 0) return;
    totalSeconds--;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    hoursEl.textContent = h.toString().padStart(2, '0');
    minsEl.textContent = m.toString().padStart(2, '0');
    secsEl.textContent = s.toString().padStart(2, '0');
  }, 1000);
}

startCountdown();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        if (typeof closeDrawer === 'function') closeDrawer();
        if (typeof closeCart === 'function') closeCart();
        if (typeof closeSearch === 'function') closeSearch();
        if (typeof closeAuth === 'function') closeAuth();

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// Header Scroll Effect
const headerElement = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    headerElement.classList.add('shadow-md', 'header-scrolled');
    headerElement.classList.remove('shadow-sm');
  } else {
    headerElement.classList.remove('shadow-md', 'header-scrolled');
    headerElement.classList.add('shadow-sm');
  }
});

// Back to Top Logic
const backToTopBtn = document.createElement('button');
backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopBtn.className = 'fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-2xl items-center justify-center cursor-pointer transition-all duration-300 translate-y-20 opacity-0 z-[100] hover:bg-blue-700 hover:-translate-y-1 flex';
document.body.appendChild(backToTopBtn);

const progressBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  // Back to top visibility
  if (window.scrollY > 500) {
    backToTopBtn.classList.remove('translate-y-20', 'opacity-0');
  } else {
    backToTopBtn.classList.add('translate-y-20', 'opacity-0');
  }

  // Progress Bar calculation
  if (progressBar) {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});