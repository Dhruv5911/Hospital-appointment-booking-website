// ===== PATIENT DASHBOARD SECTIONS =====

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setPatientSection(section) {
  renderPatientSection(section);
  document.getElementById('patient-page-title').textContent = sectionTitles[section] || 'Dashboard';
  activateNav('patient-nav', section);
}

function renderPatientSection(section) {
  State.currentPatientSection = section;
  const content = document.getElementById('patient-content');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
  switch (section) {
    case 'search': renderSearch(content); break;
    case 'appointments': renderMyAppointments(content); break;
    case 'pharmacy': renderPharmacy(content); break;
    case 'orders': renderMyOrders(content); break;
    case 'emergency': renderEmergency(content); break;
    default: renderSearch(content);
  }
}

// ---- SEARCH / DASHBOARD ----
async function renderSearch(el) {
  el.innerHTML = `
    <div class="patient-home">
      <section class="dashboard-hero">
        <div>
          <p class="eyebrow">Welcome, ${escapeHtml(State.user?.name || 'Patient')}</p>
          <h2>Book care without feeling lost.</h2>
          <p>Search hospitals, compare services, choose a doctor, and book a slot from one guided workspace.</p>
          <div class="hero-actions mt-2">
            <button class="btn btn-primary" id="hero-find-care">Find care</button>
            <button class="btn btn-secondary" id="hero-emergency">Emergency check</button>
          </div>
        </div>
        <div class="hero-metric-panel">
          <div class="mini-metric"><strong id="home-total-hospitals">--</strong><span>Hospitals listed</span></div>
          <div class="mini-metric"><strong id="home-total-doctors">--</strong><span>Doctors available</span></div>
          <div class="mini-metric"><strong id="home-total-appts">--</strong><span>Your bookings</span></div>
          <div class="mini-metric"><strong>${State.cart.length}</strong><span>Items in cart</span></div>
        </div>
      </section>

      <div class="quick-actions-grid">
        <button class="action-card" data-section="search">
          <span>01</span>
          <strong>Find hospitals</strong>
          <small>Filter by city, type, emergency care, and rating.</small>
        </button>
        <button class="action-card" data-section="appointments">
          <span>02</span>
          <strong>Appointments</strong>
          <small>Review, cancel, and reschedule bookings.</small>
        </button>
        <button class="action-card" data-section="pharmacy">
          <span>03</span>
          <strong>Pharmacy</strong>
          <small>Order medicines and track delivery.</small>
        </button>
        <button class="action-card" data-section="emergency">
          <span>04</span>
          <strong>Emergency check</strong>
          <small>Get a quick risk guide from symptoms.</small>
        </button>
      </div>

      <section class="section-grid" id="find-care-panel">
        <div>
          <div class="page-header">
            <h2>Find hospitals & clinics</h2>
            <p>Start with simple filters. Open a hospital card to choose a doctor and book a time.</p>
          </div>
          <div class="search-bar">
            <input id="s-query" class="form-control" placeholder="Hospital name..." />
            <select id="s-type" class="form-control" style="max-width:170px">
              <option value="">All Types</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
            </select>
            <select id="s-emergency" class="form-control" style="max-width:190px">
              <option value="">Any emergency status</option>
              <option value="true">Emergency Available</option>
            </select>
            <input id="s-city" class="form-control" placeholder="City..." style="max-width:160px" />
            <button id="s-btn" class="btn btn-primary">Search</button>
          </div>
          <div id="hospital-results"><div class="loading-overlay"><div class="spinner"></div></div></div>
        </div>

        <aside class="guide-panel">
          <h3>How booking works</h3>
          <ul class="guide-list">
            <li><strong>1. Search:</strong> Find a hospital that matches your location and care needs.</li>
            <li><strong>2. Choose:</strong> Open the hospital card and pick a doctor by specialty.</li>
            <li><strong>3. Book:</strong> Select a date, choose a free time slot, and confirm.</li>
            <li><strong>4. Manage:</strong> Use Appointments to cancel or reschedule later.</li>
          </ul>
        </aside>
      </section>
    </div>
  `;

  document.getElementById('s-btn').addEventListener('click', doSearch);
  document.getElementById('s-query').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  document.getElementById('hero-find-care').addEventListener('click', () => {
    document.getElementById('find-care-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('hero-emergency').addEventListener('click', () => setPatientSection('emergency'));
  el.querySelectorAll('.action-card').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.section === 'search') {
        document.getElementById('find-care-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        setPatientSection(btn.dataset.section);
      }
    });
  });

  await hydratePatientHomeMetrics();
  doSearch();
}

async function hydratePatientHomeMetrics() {
  try {
    const [hospitalData, appointmentData] = await Promise.all([
      API.get('/patient/hospitals/search?', false),
      API.get('/patient/appointments')
    ]);
    const hospitals = hospitalData.hospitals || [];
    const doctorTotal = hospitals.reduce((sum, h) => sum + (h.doctor_count || 0), 0);
    document.getElementById('home-total-hospitals').textContent = hospitals.length;
    document.getElementById('home-total-doctors').textContent = doctorTotal;
    document.getElementById('home-total-appts').textContent = (appointmentData.appointments || []).length;
  } catch (err) {
    document.getElementById('home-total-hospitals').textContent = '--';
    document.getElementById('home-total-doctors').textContent = '--';
    document.getElementById('home-total-appts').textContent = '--';
  }
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
    const hospitals = data.hospitals || [];
    if (!hospitals.length) {
      resultsEl.innerHTML = '<div class="empty-state"><div class="icon">H</div><p>No hospitals found. Try different filters.</p></div>';
      return;
    }
    resultsEl.innerHTML = `<div class="hospital-grid">${hospitals.map(hospitalCard).join('')}</div>`;
    resultsEl.querySelectorAll('.view-hospital-btn').forEach(btn => {
      btn.addEventListener('click', () => openHospitalDetail(parseInt(btn.dataset.id, 10)));
    });
  } catch (err) {
    resultsEl.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">${escapeHtml(err.message)}</p></div>`;
  }
}

function hospitalCard(h) {
  const typeLabel = h.hospital_type === 'government' ? 'Government' : 'Private';
  const typeClass = h.hospital_type === 'government' ? 'badge-info' : 'badge-primary';
  const rating = Number(h.rating || 0).toFixed(1);
  return `
    <div class="hospital-card">
      <div class="hospital-card-header">
        <div class="hospital-icon-title">
          <div class="hospital-icon">H</div>
          <div class="hospital-card-info">
            <h3>${escapeHtml(h.name)}</h3>
            <p>${escapeHtml(h.city || 'City not listed')}</p>
          </div>
        </div>
        <span class="badge ${typeClass}"><span class="badge-dot"></span> ${typeLabel}</span>
      </div>
      <div class="hospital-card-body">
        <p style="font-size:0.84rem;color:var(--text-muted);line-height:1.5">${escapeHtml(h.description ? h.description.substring(0, 100) + '...' : 'Open this hospital to view doctors, specialties, and appointment slots.')}</p>
        <div class="hospital-meta">
          <div class="hospital-meta-item">
            <span class="hospital-meta-label">Doctors</span>
            <span class="hospital-meta-value">${h.doctor_count || 0}</span>
          </div>
          <div class="hospital-meta-item">
            <span class="hospital-meta-label">Emergency</span>
            <span class="hospital-meta-value" style="color:${h.has_emergency ? 'var(--danger)' : 'var(--text-muted)'}">${h.has_emergency ? 'Available' : 'No'}</span>
          </div>
          <div class="hospital-meta-item">
            <span class="hospital-meta-label">Rating</span>
            <span class="hospital-meta-value">${rating}/5</span>
          </div>
        </div>
        <div class="hospital-actions">
          <button class="btn btn-primary btn-sm view-hospital-btn" data-id="${h.id}">View & Book</button>
          ${h.lat ? `<a class="btn btn-secondary btn-sm hospital-map-link" href="https://maps.google.com/?q=${h.lat},${h.lng}" target="_blank" aria-label="Open map">Map</a>` : ''}
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
    const typeLabel = h.hospital_type === 'government' ? 'Government' : 'Private';
    content.innerHTML = `
      <button class="btn btn-secondary btn-sm mb-2" id="back-to-search">Back to dashboard</button>
      <div class="detail-hero mb-2">
        <div class="flex justify-between gap-2" style="align-items:flex-start;flex-wrap:wrap">
          <div>
            <p class="eyebrow">${typeLabel} hospital</p>
            <h2>${escapeHtml(h.name)}</h2>
            <p style="color:var(--text-muted);margin-top:.45rem">${escapeHtml(h.address || 'Address not listed')}, ${escapeHtml(h.city || '')}</p>
          </div>
          <div class="flex gap-1" style="flex-wrap:wrap">
            <span class="badge ${h.hospital_type === 'government' ? 'badge-info' : 'badge-primary'}">${typeLabel}</span>
            ${h.has_emergency ? '<span class="badge badge-danger">Emergency</span>' : ''}
            <span class="badge badge-secondary">${Number(h.rating || 0).toFixed(1)}/5 rating</span>
          </div>
        </div>
        <div class="form-row mt-2">
          <div><p class="form-label">Phone</p><p>${escapeHtml(h.phone || 'Not listed')}</p></div>
          <div><p class="form-label">Doctors</p><p>${h.doctors.length} listed</p></div>
        </div>
        ${h.description ? `<p style="margin-top:1rem;color:var(--text-muted);font-size:0.92rem;line-height:1.6">${escapeHtml(h.description)}</p>` : ''}
      </div>
      <div class="page-header mt-2"><h3>Choose a doctor</h3><p>Pick a doctor to see available dates and time slots.</p></div>
      <div class="doctor-grid" id="doctor-grid">
        ${h.doctors.length ? h.doctors.map(doctorCard).join('') : '<div class="empty-state"><p>No doctors listed.</p></div>'}
      </div>
    `;
    document.getElementById('back-to-search').addEventListener('click', () => setPatientSection('search'));
    content.querySelectorAll('.book-doctor-btn').forEach(btn => {
      btn.addEventListener('click', () => openBookingModal(parseInt(btn.dataset.id, 10), btn.dataset.name));
    });
  } catch (err) {
    content.innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
  }
}

function doctorCard(d) {
  const initials = d.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return `
    <div class="doctor-card">
      <div class="doctor-header">
        <div class="doctor-avatar">${escapeHtml(initials)}</div>
        <div>
          <h4 style="font-size:0.95rem;font-weight:700">${escapeHtml(d.name)}</h4>
          <p style="font-size:0.8rem;color:var(--primary-dark);font-weight:700">${escapeHtml(d.specialty || 'General care')}</p>
        </div>
      </div>
      <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.45">${escapeHtml(d.qualification || 'Qualification not listed')}</p>
      <div class="flex gap-1" style="flex-wrap:wrap;margin-top:0.5rem">
        <span class="badge badge-secondary">${d.experience_years || 0} yrs exp</span>
        <span class="badge badge-success">Rs ${Number(d.fee || 0).toFixed(0)}</span>
      </div>
      <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem">Available: ${escapeHtml(d.available_days || 'Ask hospital')}</p>
      <button class="btn btn-primary btn-sm w-full mt-2 book-doctor-btn" data-id="${d.id}" data-name="${escapeHtml(d.name)}">Book Appointment</button>
    </div>`;
}

async function openBookingModal(doctorId, doctorName) {
  const body = document.getElementById('modal-book-body');
  body.innerHTML = `
    <p style="color:var(--text-muted);margin-bottom:1rem">Doctor: <strong>${escapeHtml(doctorName)}</strong></p>
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
        `<button class="slot-btn" data-slot-id="${s.id}">${escapeHtml(s.slot_time)}</button>`
      ).join('')}</div>`;
      slotsArea.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          slotsArea.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlotId = parseInt(btn.dataset.slotId, 10);
          document.getElementById('confirm-book-btn').disabled = false;
        });
      });
    } catch (err) {
      slotsArea.innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
    }
  });

  document.getElementById('confirm-book-btn').addEventListener('click', async () => {
    if (!selectedSlotId) return;
    const notes = document.getElementById('book-notes').value;
    try {
      await API.post('/patient/appointments/book', { slot_id: selectedSlotId, notes });
      toast('Appointment booked successfully!', 'success');
      closeModal('modal-book');
      setPatientSection('appointments');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

// ---- MY APPOINTMENTS ----
async function renderMyAppointments(el) {
  el.innerHTML = `
    <div class="page-header">
      <h2>My appointments</h2>
      <p>View, cancel, or reschedule your bookings.</p>
    </div>
    <div id="appointments-list"><div class="spinner"></div></div>
  `;
  try {
    const data = await API.get('/patient/appointments');
    const appts = data.appointments || [];
    const listEl = document.getElementById('appointments-list');
    if (!appts.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="icon">A</div>
          <p>No appointments yet.</p>
          <button class="btn btn-primary mt-2" id="empty-book-now">Find a hospital</button>
        </div>`;
      document.getElementById('empty-book-now').addEventListener('click', () => setPatientSection('search'));
      return;
    }

    listEl.innerHTML = `<div class="appointment-list">${appts.map(patientAppointmentCard).join('')}</div>`;
    listEl.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Cancel this appointment?')) return;
        try {
          await API.put(`/patient/appointments/${btn.dataset.id}/cancel`, {});
          toast('Appointment cancelled.', 'info');
          renderMyAppointments(el);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });

    listEl.querySelectorAll('.reschedule-btn').forEach(btn => {
      btn.addEventListener('click', () => openRescheduleModal(parseInt(btn.dataset.id, 10), el));
    });
  } catch (err) {
    document.getElementById('appointments-list').innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
  }
}

function statusBadge(status) {
  const m = { booked: 'badge-primary', cancelled: 'badge-danger', rescheduled: 'badge-warning', completed: 'badge-success' };
  return `<span class="badge ${m[status] || 'badge-secondary'}">${escapeHtml(status)}</span>`;
}

function patientAppointmentCard(a) {
  const canChange = a.status === 'booked' || a.status === 'rescheduled';
  return `
    <div class="appointment-card">
      <div>
        <h4>${escapeHtml(a.doctor_name)} <small style="color:var(--text-muted);font-weight:500">(${escapeHtml(a.doctor_specialty)})</small></h4>
        <p>${escapeHtml(a.hospital_name)} - ${escapeHtml(a.slot_date)} at ${escapeHtml(a.slot_time)}</p>
        <div class="appointment-card-meta">
          ${statusBadge(a.status)}
          ${a.notes ? `<span class="tag-pill">${escapeHtml(a.notes)}</span>` : ''}
        </div>
      </div>
      <div class="appt-actions">
        ${canChange ? `
          <button class="btn btn-warning btn-sm reschedule-btn" data-id="${a.id}">Reschedule</button>
          <button class="btn btn-danger btn-sm cancel-btn" data-id="${a.id}">Cancel</button>
        ` : ''}
      </div>
    </div>`;
}

async function openRescheduleModal(apptId, parentEl) {
  const body = document.getElementById('modal-reschedule-body');
  const apptData = await API.get('/patient/appointments');
  const appt = (apptData.appointments || []).find(a => a.id === apptId);
  if (!appt) return;
  if (!appt.doctor_id) {
    toast('Doctor information is missing for this booking.', 'error');
    return;
  }

  body.innerHTML = `
    <p style="color:var(--text-muted);margin-bottom:1rem">Rescheduling appointment with <strong>${escapeHtml(appt.doctor_name)}</strong></p>
    <div class="form-group">
      <label class="form-label">New Date</label>
      <input type="date" id="rs-date" class="form-control" min="${new Date().toISOString().split('T')[0]}" />
    </div>
    <div id="rs-slots-area" style="margin:1rem 0"></div>
    <button class="btn btn-primary btn-block" id="confirm-rs-btn" disabled>Confirm Reschedule</button>
  `;
  openModal('modal-reschedule');
  let selectedSlotId = null;

  document.getElementById('rs-date').addEventListener('change', async (e) => {
    const slotsArea = document.getElementById('rs-slots-area');
    slotsArea.innerHTML = '<div class="spinner"></div>';
    try {
      const data = await API.get(`/patient/doctors/${appt.doctor_id}/slots?date=${e.target.value}`, false);
      const slots = data.slots || [];
      if (!slots.length) {
        slotsArea.innerHTML = '<p style="color:var(--text-muted)">No slots available.</p>';
        return;
      }
      slotsArea.innerHTML = `<label class="form-label">Available Slots</label><div class="slots-grid">${slots.map(s =>
        `<button class="slot-btn" data-slot-id="${s.id}">${escapeHtml(s.slot_time)}</button>`).join('')}</div>`;
      slotsArea.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          slotsArea.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlotId = parseInt(btn.dataset.slotId, 10);
          document.getElementById('confirm-rs-btn').disabled = false;
        });
      });
    } catch (err) {
      slotsArea.innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
    }
  });

  document.getElementById('confirm-rs-btn').addEventListener('click', async () => {
    if (!selectedSlotId) return;
    try {
      await API.put(`/patient/appointments/${apptId}/reschedule`, { new_slot_id: selectedSlotId });
      toast('Appointment rescheduled!', 'success');
      closeModal('modal-reschedule');
      renderMyAppointments(parentEl);
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}
