// ===== API UTILITY =====
const API = {
  base: '/api',

  async request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get: (path, auth = true) => API.request('GET', path, null, auth),
  post: (path, body, auth = true) => API.request('POST', path, body, auth),
  put: (path, body, auth = true) => API.request('PUT', path, body, auth),
  delete: (path, auth = true) => API.request('DELETE', path, null, auth),
};

// ===== STATE =====
const State = {
  user: null,
  token: null,
  cart: [],
  currentHospital: null,
  currentPatientSection: 'search',
  currentAdminSection: 'overview',

  init() {
    this.token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (u) this.user = JSON.parse(u);
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
  },

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  },

  addToCart(medicine) {
    const existing = this.cart.find(i => i.medicine_id === medicine.id);
    if (existing) { existing.qty += 1; }
    else { this.cart.push({ medicine_id: medicine.id, name: medicine.name, price: medicine.price, qty: 1 }); }
    this.saveCart();
  },

  removeFromCart(medicineId) {
    this.cart = this.cart.filter(i => i.medicine_id !== medicineId);
    this.saveCart();
  },

  cartTotal() {
    return this.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }
};

// ===== TOAST =====
function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ===== ROUTER =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
}

function navigate() {
  State.init();
  if (!State.token || !State.user) {
    showPage('page-landing');
    return;
  }
  if (State.user.role === 'hospital_admin') {
    document.getElementById('hospital-user-name').textContent = State.user.name;
    showPage('page-hospital');
    renderAdminSection('overview');
    initAdminNav();
  } else {
    document.getElementById('patient-user-name').textContent = State.user.name;
    showPage('page-patient');
    renderPatientSection('search');
    initPatientNav();
  }
}

// ===== EVENT LISTENERS =====
document.getElementById('btn-get-started-nav')?.addEventListener('click', () => showPage('page-login'));
document.getElementById('btn-get-started-hero')?.addEventListener('click', () => showPage('page-login'));
document.getElementById('btn-demo')?.addEventListener('click', () => { toast('Demo video coming soon!', 'info'); });

// ===== NAVIGATION =====
const sectionTitles = {
  search: 'Dashboard', appointments: 'Appointments', pharmacy: 'Pharmacy',
  orders: 'Orders', emergency: 'Emergency Check',
  overview: 'Overview', profile: 'Hospital Profile', doctors: 'Doctors',
  slots: 'Manage Slots'
};

function initPatientNav() {
  const container = document.getElementById('patient-nav');
  container.querySelectorAll('.nav-link').forEach(link => {
    // Clone to remove old listeners
    const clone = link.cloneNode(true);
    link.parentNode.replaceChild(clone, link);
    clone.addEventListener('click', () => {
      container.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      clone.classList.add('active');
      const section = clone.dataset.section;
      renderPatientSection(section);
      document.getElementById('patient-page-title').textContent = sectionTitles[section] || 'Dashboard';
    });
  });
}

function initAdminNav() {
  const container = document.getElementById('hospital-nav');
  container.querySelectorAll('.nav-link').forEach(link => {
    const clone = link.cloneNode(true);
    link.parentNode.replaceChild(clone, link);
    clone.addEventListener('click', () => {
      container.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      clone.classList.add('active');
      const section = clone.dataset.section;
      renderAdminSection(section);
      document.getElementById('hospital-page-title').textContent = sectionTitles[section] || 'Overview';
    });
  });
}

// ===== AUTH EVENTS =====
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  try {
    const data = await API.post('/auth/login', { email, password }, false);
    State.setAuth(data.token, data.user);
    toast('Welcome back, ' + data.user.name + '!', 'success');
    navigate();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'inline-block';
  }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const role = document.getElementById('signup-role').value;
  const errEl = document.getElementById('signup-error');
  errEl.style.display = 'none';
  try {
    const data = await API.post('/auth/signup', { name, email, password, role }, false);
    State.setAuth(data.token, data.user);
    toast('Account created! Welcome, ' + data.user.name, 'success');
    navigate();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'inline-block';
  }
});

document.getElementById('go-signup').addEventListener('click', (e) => { e.preventDefault(); showPage('page-signup'); });
document.getElementById('go-login').addEventListener('click', (e) => { e.preventDefault(); showPage('page-login'); });

document.getElementById('patient-logout-btn').addEventListener('click', () => { State.clearAuth(); navigate(); });
document.getElementById('hospital-logout-btn').addEventListener('click', () => { State.clearAuth(); navigate(); });

// ===== MODAL HELPERS =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.getElementById('modal-book-close').addEventListener('click', () => closeModal('modal-book'));
document.getElementById('modal-reschedule-close').addEventListener('click', () => closeModal('modal-reschedule'));
document.getElementById('modal-doctor-close').addEventListener('click', () => closeModal('modal-doctor'));
document.getElementById('modal-slots-close').addEventListener('click', () => closeModal('modal-slots'));

// Close on overlay click
['modal-book', 'modal-reschedule', 'modal-doctor', 'modal-slots'].forEach(id => {
  document.getElementById(id).addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal(id);
  });
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  navigate();
});
