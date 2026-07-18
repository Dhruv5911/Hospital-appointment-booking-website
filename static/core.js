// ===== API UTILITY =====
const API = {
  base: '/api',

  async request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('token');
      if (token) headers.Authorization = `Bearer ${token}`;
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
    if (existing) existing.qty += 1;
    else this.cart.push({ medicine_id: medicine.id, name: medicine.name, price: medicine.price, qty: 1 });
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
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: 'OK', error: '!', info: 'i' };
  el.innerHTML = `<span>${icons[type] || 'i'}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ===== ROUTER =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
}

function activateNav(containerId, section) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === section);
  });
}

function navigate() {
  State.init();
  if (!State.token || !State.user) {
    const path = window.location.pathname;
    if (path.includes('/signup')) showPage('page-signup');
    else if (path.includes('/login')) showPage('page-login');
    else showPage('page-landing');
    return;
  }

  if (State.user.role === 'hospital_admin') {
    document.getElementById('hospital-user-name').textContent = State.user.name;
    document.getElementById('hospital-user-avatar').textContent = State.user.name.charAt(0);
    const section = localStorage.getItem('pendingAdminSection') || 'overview';
    localStorage.removeItem('pendingAdminSection');
    showPage('page-hospital');
    initAdminNav();
    renderAdminSection(section);
    document.getElementById('hospital-page-title').textContent = sectionTitles[section] || 'Overview';
    activateNav('hospital-nav', section);
  } else {
    document.getElementById('patient-user-name').textContent = State.user.name;
    document.getElementById('patient-user-avatar').textContent = State.user.name.charAt(0);
    const section = localStorage.getItem('pendingPatientSection') || 'search';
    localStorage.removeItem('pendingPatientSection');
    showPage('page-patient');
    initPatientNav();
    renderPatientSection(section);
    document.getElementById('patient-page-title').textContent = sectionTitles[section] || 'Dashboard';
    activateNav('patient-nav', section);
  }
}

// ===== BEGINNER SCREEN =====
const CONDITIONS = [
  'Asthma', 'Allergy', 'Anemia', 'Anxiety', 'Bronchitis', 'Blood pressure',
  'Common cold', 'COVID-19', 'Chest pain', 'Diabetes', 'Dengue fever', 'Dehydration',
  'Ear infection', 'Eye irritation', 'Fever', 'Flu', 'Gastritis', 'Headache',
  'Hypertension', 'Insomnia', 'Joint pain', 'Kidney stones', 'Migraine', 'Nausea',
  'Obesity', 'Pneumonia', 'Sinus infection', 'Thyroid disorder', 'Urinary infection',
  'Vitamin deficiency', 'Wound care'
];

function renderConditionResults(items) {
  const results = document.getElementById('condition-results');
  if (!results) return;
  if (!items.length) {
    results.innerHTML = '<span class="condition-chip">No match yet</span>';
    return;
  }
  results.innerHTML = items.slice(0, 8).map(item => `<span class="condition-chip">${item}</span>`).join('');
}

function filterConditions({ letter = '', query = '' }) {
  const q = query.trim().toLowerCase();
  const filtered = CONDITIONS.filter(item => {
    const byLetter = letter ? item.toUpperCase().startsWith(letter) : true;
    const byQuery = q ? item.toLowerCase().includes(q) : true;
    return byLetter && byQuery;
  });
  renderConditionResults(filtered);
}

function goToLoginWithPatientSection(section = 'search') {
  const bookingSection = section === 'appointments' ? 'search' : section;
  localStorage.setItem('pendingPatientSection', bookingSection);
  showPage('page-login');
}

function initBeginnerScreen() {
  document.getElementById('btn-login-nav')?.addEventListener('click', () => showPage('page-login'));
  document.getElementById('btn-create-nav')?.addEventListener('click', () => showPage('page-signup'));
  document.getElementById('btn-beginner-book')?.addEventListener('click', () => goToLoginWithPatientSection('search'));
  document.getElementById('btn-beginner-home')?.addEventListener('click', () => showPage('page-landing'));

  document.querySelectorAll('.beginner-action').forEach(btn => {
    btn.addEventListener('click', () => goToLoginWithPatientSection(btn.dataset.targetSection || 'search'));
  });

  document.querySelectorAll('#letter-grid button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#letter-grid button').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('condition-search-input').value = '';
      filterConditions({ letter: btn.dataset.letter });
    });
  });

  document.getElementById('condition-search-form')?.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelectorAll('#letter-grid button').forEach(item => item.classList.remove('active'));
    filterConditions({ query: document.getElementById('condition-search-input').value });
  });

  renderConditionResults(CONDITIONS.slice(0, 5));
}

// ===== NAVIGATION =====
const sectionTitles = {
  search: 'Dashboard',
  appointments: 'Appointments',
  pharmacy: 'Pharmacy',
  orders: 'Medicine Orders',
  emergency: 'Emergency Check',
  overview: 'Overview',
  profile: 'Hospital Profile',
  doctors: 'Doctors',
  slots: 'Manage Slots'
};

function initPatientNav() {
  const container = document.getElementById('patient-nav');
  container.querySelectorAll('.nav-link').forEach(link => {
    const clone = link.cloneNode(true);
    link.parentNode.replaceChild(clone, link);
    clone.addEventListener('click', () => {
      const section = clone.dataset.section;
      renderPatientSection(section);
      document.getElementById('patient-page-title').textContent = sectionTitles[section] || 'Dashboard';
      activateNav('patient-nav', section);
    });
  });
}

function initAdminNav() {
  const container = document.getElementById('hospital-nav');
  container.querySelectorAll('.nav-link').forEach(link => {
    const clone = link.cloneNode(true);
    link.parentNode.replaceChild(clone, link);
    clone.addEventListener('click', () => {
      const section = clone.dataset.section;
      renderAdminSection(section);
      document.getElementById('hospital-page-title').textContent = sectionTitles[section] || 'Overview';
      activateNav('hospital-nav', section);
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

document.getElementById('patient-logout-btn').addEventListener('click', () => { State.clearAuth(); showPage('page-landing'); });
document.getElementById('hospital-logout-btn').addEventListener('click', () => { State.clearAuth(); showPage('page-landing'); });

// ===== MODAL HELPERS =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.getElementById('modal-book-close').addEventListener('click', () => closeModal('modal-book'));
document.getElementById('modal-reschedule-close').addEventListener('click', () => closeModal('modal-reschedule'));
document.getElementById('modal-doctor-close').addEventListener('click', () => closeModal('modal-doctor'));
document.getElementById('modal-slots-close').addEventListener('click', () => closeModal('modal-slots'));

['modal-book', 'modal-reschedule', 'modal-doctor', 'modal-slots'].forEach(id => {
  document.getElementById(id).addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal(id);
  });
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initBeginnerScreen();
  navigate();
});
