// ===== PHARMACY + EMERGENCY SECTIONS =====

// ---- PHARMACY ----
async function renderPharmacy(el) {
  el.innerHTML = `
    <div class="page-header">
      <h2>💊 Pharmacy</h2>
      <p>Order medicines and healthcare products online</p>
    </div>
    <div style="display:flex;gap:1.5rem;align-items:flex-start">
      <div style="flex:1">
        <div class="search-bar" style="margin-bottom:1rem">
          <input id="med-q" class="form-control" placeholder="Search medicine..." />
          <select id="med-cat" class="form-control" style="max-width:200px">
            <option value="">All Categories</option>
            <option>Pain Relief</option><option>Antibiotic</option><option>Antihistamine</option>
            <option>Antacid</option><option>Diabetes</option><option>Cholesterol</option>
            <option>Blood Pressure</option><option>Supplement</option><option>Respiratory</option>
          </select>
          <button id="med-search-btn" class="btn btn-primary">Search</button>
        </div>
        <div id="medicine-grid-container"><div class="spinner"></div></div>
      </div>
      <div class="cart-sidebar" id="cart-panel">
        <h3 style="font-weight:700;margin-bottom:0.5rem">🛒 Cart <span id="cart-count" class="badge badge-primary"></span></h3>
        <div id="cart-items-list"></div>
        <hr class="divider" />
        <div class="flex justify-between mb-1">
          <span style="font-weight:600">Total:</span>
          <span id="cart-total" style="color:var(--success);font-weight:700">₹0.00</span>
        </div>
        <div class="form-group">
          <label class="form-label">Delivery Address</label>
          <input type="text" id="delivery-address" class="form-control" placeholder="Your address..." />
        </div>
        <button id="place-order-btn" class="btn btn-success btn-block">Place Order</button>
      </div>
    </div>
  `;
  document.getElementById('med-search-btn').addEventListener('click', loadMedicines);
  document.getElementById('med-q').addEventListener('keydown', e => { if (e.key === 'Enter') loadMedicines(); });
  document.getElementById('place-order-btn').addEventListener('click', placeOrder);
  renderCart();
  loadMedicines();
}

async function loadMedicines() {
  const q = document.getElementById('med-q').value;
  const cat = document.getElementById('med-cat').value;
  const container = document.getElementById('medicine-grid-container');
  container.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await API.get(`/pharmacy/medicines?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`, false);
    const meds = data.medicines;
    if (!meds.length) {
      container.innerHTML = '<div class="empty-state"><div class="icon">💊</div><p>No medicines found.</p></div>';
      return;
    }
    container.innerHTML = `<div class="medicine-grid">${meds.map(m => `
      <div class="medicine-card">
        <div class="badge badge-secondary" style="margin-bottom:0.5rem">${m.category}</div>
        <h4>${m.name}</h4>
        <p style="font-size:0.78rem;color:var(--text-muted)">${m.unit}</p>
        <div class="price">₹${m.price.toFixed(2)}</div>
        <button class="btn btn-primary btn-sm w-full add-cart-btn" data-med='${JSON.stringify(m)}'>+ Add to Cart</button>
      </div>`).join('')}</div>`;
    container.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const med = JSON.parse(btn.dataset.med);
        State.addToCart(med);
        renderCart();
        toast(med.name + ' added to cart!', 'success');
      });
    });
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count');
  if (!itemsEl) return;
  const cart = State.cart;
  countEl.textContent = cart.length;
  if (!cart.length) {
    itemsEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:1rem">Your cart is empty</p>';
    totalEl.textContent = '₹0.00';
    return;
  }
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <div style="font-weight:600;font-size:0.85rem">${item.name}</div>
        <div style="color:var(--text-muted);font-size:0.78rem">₹${item.price} × ${item.qty}</div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem">
        <span style="color:var(--success);font-weight:600">₹${(item.price * item.qty).toFixed(2)}</span>
        <button class="btn btn-danger btn-sm" style="padding:2px 8px" onclick="State.removeFromCart(${item.medicine_id});renderCart();">✕</button>
      </div>
    </div>`).join('');
  totalEl.textContent = '₹' + State.cartTotal().toFixed(2);
}

async function placeOrder() {
  if (!State.cart.length) { toast('Your cart is empty!', 'error'); return; }
  const address = document.getElementById('delivery-address').value.trim();
  if (!address) { toast('Please enter delivery address', 'error'); return; }
  try {
    const data = await API.post('/pharmacy/orders', { items: State.cart, address });
    State.cart = [];
    State.saveCart();
    renderCart();
    toast(`Order placed! Tracking ID: ${data.order.tracking_id}`, 'success');
  } catch (err) { toast(err.message, 'error'); }
}

// ---- MY ORDERS ----
async function renderMyOrders(el) {
  el.innerHTML = `
    <div class="page-header">
      <h2>📦 My Medicine Orders</h2>
      <p>Track your medicine deliveries</p>
    </div>
    <div id="orders-list"><div class="spinner"></div></div>
  `;
  try {
    const data = await API.get('/pharmacy/orders');
    const orders = data.orders;
    const listEl = document.getElementById('orders-list');
    if (!orders.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="icon">📦</div><p>No orders yet. Visit the Pharmacy!</p></div>';
      return;
    }
    const statusBadge = s => {
      const m = { processing: 'badge-warning', shipped: 'badge-info', delivered: 'badge-success' };
      const icons = { processing: '⚙️', shipped: '🚚', delivered: '✅' };
      return `<span class="badge ${m[s]}">${icons[s]} ${s}</span>`;
    };
    listEl.innerHTML = `<div class="appointment-list">${orders.map(o => `
      <div class="appointment-row" style="flex-direction:column;align-items:flex-start;gap:0.5rem">
        <div class="flex justify-between w-full" style="align-items:center;flex-wrap:wrap;gap:0.5rem">
          <h4>Order #${o.id} &nbsp; <small style="font-weight:400;color:var(--text-muted)">${new Date(o.created_at).toLocaleDateString()}</small></h4>
          ${statusBadge(o.status)}
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted)">🔖 Tracking: <strong>${o.tracking_id}</strong></p>
        <div style="font-size:0.82rem">
          ${o.items.map(i => `<span class="tag-pill" style="margin:2px">${i.name} ×${i.qty}</span>`).join('')}
        </div>
        <div class="flex justify-between w-full">
          <span style="font-size:0.82rem;color:var(--text-muted)">📍 ${o.address}</span>
          <span style="font-weight:700;color:var(--success)">₹${o.total_price.toFixed(2)}</span>
        </div>
        <div style="width:100%;background:var(--border);border-radius:4px;height:6px;overflow:hidden">
          <div style="height:100%;background:linear-gradient(90deg,var(--primary),var(--secondary));width:${o.status==='delivered'?'100%':o.status==='shipped'?'60%':'20%'};transition:width 0.5s"></div>
        </div>
      </div>`).join('')}</div>`;
  } catch (err) {
    document.getElementById('orders-list').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

// ---- EMERGENCY CHECKER ----
function renderEmergency(el) {
  el.innerHTML = `
    <div class="page-header">
      <h2>🚨 Emergency Symptom Checker</h2>
      <p>Describe your symptoms and our AI will assess if it's an emergency</p>
    </div>
    <div class="card" style="max-width:600px">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Your Age</label>
          <input type="number" id="em-age" class="form-control" value="30" min="1" max="120" />
        </div>
        <div class="form-group">
          <label class="form-label">Gender</label>
          <select id="em-gender" class="form-control">
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Describe your symptoms in detail</label>
        <textarea id="em-symptoms" class="form-control" rows="4" placeholder="e.g. I have chest pain, difficulty breathing, and feel dizzy..."></textarea>
      </div>
      <div style="margin-bottom:1rem">
        <p class="form-label">Quick symptom tags:</p>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
          ${['chest pain','shortness of breath','high fever','severe headache','nausea','cough','back pain','fatigue','seizure','unconscious']
            .map(s => `<button class="slot-btn symptom-tag" style="font-size:0.75rem">${s}</button>`).join('')}
        </div>
      </div>
      <button id="em-check-btn" class="btn btn-danger btn-block">🔍 Check Emergency</button>
      <div id="em-result"></div>
    </div>
  `;
  el.querySelectorAll('.symptom-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const ta = document.getElementById('em-symptoms');
      ta.value = ta.value ? ta.value + ', ' + tag.textContent : tag.textContent;
      tag.classList.toggle('selected');
    });
  });
  document.getElementById('em-check-btn').addEventListener('click', checkEmergency);
}

async function checkEmergency() {
  const symptoms = document.getElementById('em-symptoms').value.trim();
  const age = parseInt(document.getElementById('em-age').value);
  const gender = document.getElementById('em-gender').value;
  if (!symptoms) { toast('Please describe your symptoms.', 'error'); return; }
  const resultEl = document.getElementById('em-result');
  resultEl.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await API.post('/ml/predict', { symptoms, age, gender }, false);
    const cls = data.is_emergency ? 'danger' : 'safe';
    const icon = data.is_emergency ? '🚨' : '✅';
    resultEl.innerHTML = `
      <div class="emergency-result ${cls}">
        <div style="font-size:2.5rem">${icon}</div>
        <div class="result-big" style="color:${data.is_emergency ? 'var(--danger)' : 'var(--success)'}">${data.severity} Risk</div>
        <p>${data.recommendation}</p>
        <div style="margin-top:1rem">
          <div class="flex justify-between mb-1">
            <span style="font-size:0.85rem">Emergency Confidence</span>
            <span style="font-size:0.85rem;font-weight:700">${data.confidence}%</span>
          </div>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width:${data.confidence}%;background:${data.is_emergency ? 'var(--danger)' : 'var(--success)'}"></div>
          </div>
        </div>
        ${data.matched_emergency.length ? `<div style="margin-top:1rem"><p class="form-label" style="color:var(--danger)">⚠️ Emergency Symptoms Detected:</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem">${data.matched_emergency.map(k => `<span class="badge badge-danger">${k}</span>`).join('')}</div></div>` : ''}
        ${data.matched_non_emergency.length ? `<div style="margin-top:0.75rem"><p class="form-label" style="color:var(--success)">ℹ️ Non-Emergency Symptoms:</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem">${data.matched_non_emergency.map(k => `<span class="badge badge-success">${k}</span>`).join('')}</div></div>` : ''}
        ${data.is_emergency ? '<a href="tel:102" class="btn btn-danger btn-block mt-2">📞 Call Emergency (102)</a>' : ''}
      </div>`;
  } catch (err) {
    resultEl.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}
