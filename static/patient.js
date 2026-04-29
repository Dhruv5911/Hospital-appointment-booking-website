// ===== PATIENT DASHBOARD SECTIONS =====

function renderPatientSection(section) {
  State.currentPatientSection = section;
  const content = document.getElementById('patient-content');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
  switch (section) {
    case 'search':      renderSearch(content); break;
    case 'appointments': renderMyAppointments(content); break;
    case 'pharmacy':    renderPharmacy(content); break;
    case 'orders':      renderMyOrders(content); break;
    case 'emergency':   renderEmergency(content); break;
    default:            renderSearch(content);
  }
}

// ---- SEARCH ----
async function renderSearch(el) {
  el.innerHTML = `
    <div class="page-header">
      <h2>🔍 Find Hospitals & Clinics</h2>
      <p>Search from government and private hospitals near you</p>
    </div>
    <div class="search-bar">
      <input id="s-query" class="form-control" placeholder="Hospital name..." />
      <select id="s-type" class="form-control" style="max-width:160px">
        <option value="">All Types</option>
        <option value="government">Government</option>
        <option value="private">Private</option>
      </select>
      <select id="s-emergency" class="form-control" style="max-width:180px">
        <option value="">Any</option>
        <option value="true">Emergency Available</option>
      </select>
      <input id="s-city" class="form-control" placeholder="City..." style="max-width:150px" />
      <button id="s-btn" class="btn btn-primary">Search</button>
    </div>
    <div id="hospital-results"><div class="loading-overlay"><div class="spinner"></div></div></div>
  `;
  document.getElementById('s-btn').addEventListener('click', doSearch);
  document.getElementById('s-query').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  doSearch();
}

async function doSearch() {
  const q = document.getElementById('s-query').value;
  const type = document.getElementById('s-type').value;
  const emergency = document.getElementById('s-emergency').value;
  const city = document.getElementById('s-city').value;
  const params = new URLSearchParams({ q, type, emergency, city }).toString();
  const resultsEl = document.getElementById('hospital-results');
  resultsEl.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
  try {
    const data = await API.get(`/patient/hospitals/search?${params}`, false);
    const hospitals = data.hospitals;
    if (!hospitals.length) {
      resultsEl.innerHTML = '<div class="empty-state"><div class="icon">🏥</div><p>No hospitals found. Try different filters.</p></div>';
      return;
    }
    resultsEl.innerHTML = `<div class="hospital-grid">${hospitals.map(hospitalCard).join('')}</div>`;
    resultsEl.querySelectorAll('.view-hospital-btn').forEach(btn => {
      btn.addEventListener('click', () => openHospitalDetail(parseInt(btn.dataset.id)));
    });
  } catch (err) {
    resultsEl.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">${err.message}</p></div>`;
  }
}

function hospitalCard(h) {
  const typeLabel = h.hospital_type === 'government' ? 'Government' : 'Private';
  const typeClass = h.hospital_type === 'government' ? 'badge-info' : 'badge-primary';
  const stars = '★'.repeat(Math.round(h.rating)) + '☆'.repeat(5 - Math.round(h.rating));
  return `
    <div class="hospital-card">
      <div class="hospital-card-header">
        <div class="hospital-icon-title">
          <div class="hospital-icon">🏥</div>
          <div class="hospital-card-info">
            <h3>${h.name}</h3>
            <p>${h.city || 'N/A'}</p>
          </div>
        </div>
        <span class="badge ${typeClass}"><div class="badge-dot"></div> ${typeLabel}</span>
      </div>
      <div class="hospital-card-body">
        <div class="hospital-meta">
          <div class="hospital-meta-item">
            <span class="hospital-meta-label">Doctors</span>
            <span class="hospital-meta-value">${h.doctor_count}</span>
          </div>
          <div class="hospital-meta-item">
            <span class="hospital-meta-label">Emergency</span>
            <span class="hospital-meta-value" style="color: ${h.has_emergency ? 'var(--danger)' : 'var(--text-muted)'}">${h.has_emergency ? 'Available' : 'No'}</span>
          </div>
          <div class="hospital-meta-item">
            <span class="hospital-meta-label">Rating</span>
            <span class="hospital-meta-value" style="color:var(--warning)">${stars}</span>
          </div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">${h.description ? h.description.substring(0, 70) + '...' : ''}</p>
        <div class="hospital-actions">
          <button class="btn btn-primary btn-sm view-hospital-btn" style="flex:1" data-id="${h.id}">View & Book</button>
          ${h.lat ? `<a class="btn btn-secondary btn-sm" href="https://maps.google.com/?q=${h.lat},${h.lng}" target="_blank">📍</a>` : ''}
        </div>
      </div>
    </div>`;
}

async function openHospitalDetail(id) {
  const content = document.getElementById('patient-content');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
  try {
    const data = await API.get(`/patient/hospitals/${id}`, false);
    const h = data.hospital;
    const typeLabel = h.hospital_type === 'government' ? '🏛️ Government' : '🏢 Private';
    const stars = '★'.repeat(Math.round(h.rating));
    content.innerHTML = `
      <button class="btn btn-secondary btn-sm mb-2" id="back-to-search">← Back to Search</button>
      <div class="card mb-2">
        <div class="flex items-center gap-2 mb-2" style="flex-wrap:wrap">
          <div style="font-size:3rem">🏥</div>
          <div>
            <h2 style="font-size:1.5rem;font-weight:800">${h.name}</h2>
            <div class="flex gap-1 mt-1" style="flex-wrap:wrap">
              <span class="badge badge-info">${typeLabel}</span>
              ${h.has_emergency ? '<span class="badge badge-danger">🚨 Emergency</span>' : ''}
              <span style="color:var(--warning)">${stars}</span>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div><p class="form-label">📍 Address</p><p>${h.address || 'N/A'}, ${h.city || ''}</p></div>
          <div><p class="form-label">📞 Phone</p><p>${h.phone || 'N/A'}</p></div>
        </div>
        ${h.description ? `<p style="margin-top:1rem;color:var(--text-muted);font-size:0.9rem">${h.description}</p>` : ''}
      </div>
      <div class="page-header mt-2"><h3>👨‍⚕️ Doctors</h3></div>
      <div class="doctor-grid" id="doctor-grid">
        ${h.doctors.length ? h.doctors.map(doctorCard).join('') : '<div class="empty-state"><p>No doctors listed.</p></div>'}
      </div>
    `;
    document.getElementById('back-to-search').addEventListener('click', () => renderPatientSection('search'));
    content.querySelectorAll('.book-doctor-btn').forEach(btn => {
      btn.addEventListener('click', () => openBookingModal(parseInt(btn.dataset.id), btn.dataset.name));
    });
  } catch (err) {
    content.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

function doctorCard(d) {
  const initials = d.name.split(' ').map(n => n[0]).slice(0, 2).join('');
  return `
    <div class="doctor-card">
      <div class="doctor-header">
        <div class="doctor-avatar">${initials}</div>
        <div>
          <h4 style="font-size:0.95rem;font-weight:700">${d.name}</h4>
          <p style="font-size:0.8rem;color:var(--primary-light)">${d.specialty}</p>
        </div>
      </div>
      <p style="font-size:0.8rem;color:var(--text-muted)">${d.qualification}</p>
      <div class="flex gap-1" style="flex-wrap:wrap;margin-top:0.5rem">
        <span class="badge badge-secondary">⏱ ${d.experience_years} yrs exp</span>
        <span class="badge badge-success">₹${d.fee}</span>
      </div>
      <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem">📅 ${d.available_days}</p>
      <button class="btn btn-primary btn-sm w-full mt-2 book-doctor-btn" data-id="${d.id}" data-name="${d.name}">Book Appointment</button>
    </div>`;
}

async function openBookingModal(doctorId, doctorName) {
  const body = document.getElementById('modal-book-body');
  body.innerHTML = `
    <p style="color:var(--text-muted);margin-bottom:1rem">Doctor: <strong>${doctorName}</strong></p>
    <div class="form-group">
      <label class="form-label">Select Date</label>
      <input type="date" id="book-date" class="form-control" min="${new Date().toISOString().split('T')[0]}" />
    </div>
    <div id="slots-area" style="margin:1rem 0"></div>
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <input type="text" id="book-notes" class="form-control" placeholder="e.g. Follow-up visit" />
    </div>
    <button class="btn btn-primary btn-block" id="confirm-book-btn" disabled>Confirm Booking</button>
  `;
  openModal('modal-book');
  let selectedSlotId = null;

  document.getElementById('book-date').addEventListener('change', async (e) => {
    const date = e.target.value;
    const slotsArea = document.getElementById('slots-area');
    slotsArea.innerHTML = '<div class="spinner"></div>';
    try {
      const data = await API.get(`/patient/doctors/${doctorId}/slots?date=${date}`, false);
      if (!data.slots.length) {
        slotsArea.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">No available slots for this date.</p>';
        return;
      }
      slotsArea.innerHTML = `<label class="form-label">Available Slots</label><div class="slots-grid">${data.slots.map(s =>
        `<button class="slot-btn" data-slot-id="${s.id}">${s.slot_time}</button>`
      ).join('')}</div>`;
      slotsArea.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          slotsArea.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlotId = parseInt(btn.dataset.slotId);
          document.getElementById('confirm-book-btn').disabled = false;
        });
      });
    } catch (err) {
      slotsArea.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
    }
  });

  document.getElementById('confirm-book-btn').addEventListener('click', async () => {
    if (!selectedSlotId) return;
    const notes = document.getElementById('book-notes').value;
    try {
      await API.post('/patient/appointments/book', { slot_id: selectedSlotId, notes });
      toast('Appointment booked successfully!', 'success');
      closeModal('modal-book');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

// ---- MY APPOINTMENTS ----
async function renderMyAppointments(el) {
  el.innerHTML = `
    <div class="page-header">
      <h2>📅 My Appointments</h2>
      <p>View, cancel, or reschedule your bookings</p>
    </div>
    <div id="appointments-list"><div class="spinner"></div></div>
  `;
  try {
    const data = await API.get('/patient/appointments');
    const appts = data.appointments;
    const listEl = document.getElementById('appointments-list');
    if (!appts.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="icon">📅</div><p>No appointments yet. Book one now!</p></div>';
      return;
    }
    const statusBadge = (s) => {
      const m = { booked: 'badge-primary', cancelled: 'badge-danger', rescheduled: 'badge-warning', completed: 'badge-success' };
      return `<span class="badge ${m[s] || 'badge-secondary'}">${s}</span>`;
    };
    listEl.innerHTML = `<div class="appointment-list">${appts.map(a => `
      <div class="appointment-row">
        <div class="appt-info">
          <h4>${a.doctor_name} <small style="color:var(--text-muted);font-weight:400">(${a.doctor_specialty})</small></h4>
          <p>🏥 ${a.hospital_name} &nbsp;|&nbsp; 📅 ${a.slot_date} &nbsp;|&nbsp; 🕐 ${a.slot_time}</p>
          <p style="margin-top:4px">${statusBadge(a.status)} ${a.notes ? `<span style="color:var(--text-muted);font-size:0.8rem"> — ${a.notes}</span>` : ''}</p>
        </div>
        <div class="appt-actions">
          ${a.status === 'booked' || a.status === 'rescheduled' ? `
            <button class="btn btn-warning btn-sm reschedule-btn" data-id="${a.id}" data-doctor="${a.slot_id}">🔄 Reschedule</button>
            <button class="btn btn-danger btn-sm cancel-btn" data-id="${a.id}">✕ Cancel</button>
          ` : ''}
        </div>
      </div>`).join('')}</div>`;

    listEl.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Cancel this appointment?')) return;
        try {
          await API.put(`/patient/appointments/${btn.dataset.id}/cancel`, {});
          toast('Appointment cancelled.', 'info');
          renderMyAppointments(el);
        } catch (err) { toast(err.message, 'error'); }
      });
    });

    listEl.querySelectorAll('.reschedule-btn').forEach(btn => {
      btn.addEventListener('click', () => openRescheduleModal(parseInt(btn.dataset.id), el));
    });
  } catch (err) {
    document.getElementById('appointments-list').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

async function openRescheduleModal(apptId, parentEl) {
  const body = document.getElementById('modal-reschedule-body');
  const apptData = await API.get('/patient/appointments');
  const appt = apptData.appointments.find(a => a.id === apptId);
  if (!appt) return;

  body.innerHTML = `
    <p style="color:var(--text-muted);margin-bottom:1rem">Rescheduling appointment with <strong>${appt.doctor_name}</strong></p>
    <div class="form-group">
      <label class="form-label">New Date</label>
      <input type="date" id="rs-date" class="form-control" min="${new Date().toISOString().split('T')[0]}" />
    </div>
    <div id="rs-slots-area" style="margin:1rem 0"></div>
    <button class="btn btn-primary btn-block" id="confirm-rs-btn" disabled>Confirm Reschedule</button>
  `;
  openModal('modal-reschedule');
  let selectedSlotId = null;

  const slot = (await API.get(`/patient/doctors/${appt.slot_id}/slots`, false)).slots || [];
  const doctorId = appt.slot_id;

  document.getElementById('rs-date').addEventListener('change', async (e) => {
    const slotsArea = document.getElementById('rs-slots-area');
    slotsArea.innerHTML = '<div class="spinner"></div>';
    try {
      // We need doctor_id from slot — stored in appt implicitly. Use the slot endpoint carefully.
      // Actually we need the doctor's id. Let's get it from the hospital detail.
      // For simplicity, store doctor id in data attribute when opening.
      const data = await API.get(`/patient/hospitals/search?q=`, false);
      // get doctor id from slot
      const doctorRes = await fetch(`/api/patient/doctors/${doctorId}/slots?date=${e.target.value}`);
      const doctorData = await doctorRes.json();
      const slots = doctorData.slots || [];
      if (!slots.length) { slotsArea.innerHTML = '<p style="color:var(--text-muted)">No slots available.</p>'; return; }
      slotsArea.innerHTML = `<label class="form-label">Available Slots</label><div class="slots-grid">${slots.map(s =>
        `<button class="slot-btn" data-slot-id="${s.id}">${s.slot_time}</button>`).join('')}</div>`;
      slotsArea.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          slotsArea.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlotId = parseInt(btn.dataset.slotId);
          document.getElementById('confirm-rs-btn').disabled = false;
        });
      });
    } catch (err) { slotsArea.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
  });

  document.getElementById('confirm-rs-btn').addEventListener('click', async () => {
    if (!selectedSlotId) return;
    try {
      await API.put(`/patient/appointments/${apptId}/reschedule`, { new_slot_id: selectedSlotId });
      toast('Appointment rescheduled!', 'success');
      closeModal('modal-reschedule');
      renderMyAppointments(parentEl);
    } catch (err) { toast(err.message, 'error'); }
  });
}
