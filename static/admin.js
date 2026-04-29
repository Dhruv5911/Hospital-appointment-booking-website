// ===== HOSPITAL ADMIN DASHBOARD SECTIONS =====

async function renderAdminSection(section) {
  State.currentAdminSection = section;
  const content = document.getElementById('hospital-content');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
  switch (section) {
    case 'overview':     await renderAdminOverview(content); break;
    case 'profile':      await renderAdminProfile(content); break;
    case 'doctors':      await renderAdminDoctors(content); break;
    case 'slots':        await renderAdminSlots(content); break;
    case 'appointments': await renderAdminAppointments(content); break;
  }
}

// ---- OVERVIEW ----
async function renderAdminOverview(el) {
  try {
    const [hData, apptData] = await Promise.all([
      API.get('/hospital/profile'),
      API.get('/hospital/appointments')
    ]);
    const h = hData.hospital;
    const appts = apptData.appointments;
    const booked = appts.filter(a => a.status === 'booked' || a.status === 'rescheduled').length;
    const cancelled = appts.filter(a => a.status === 'cancelled').length;

    el.innerHTML = `
      <div class="page-header">
        <h2>📊 Dashboard Overview</h2>
        <p>Welcome back, ${State.user.name}</p>
      </div>
      ${!h ? `<div class="card" style="text-align:center;padding:2rem">
        <div style="font-size:3rem">🏥</div>
        <h3 style="margin-top:1rem">Setup Your Hospital</h3>
        <p style="color:var(--text-muted);margin:0.5rem 0 1.5rem">You haven't set up your hospital profile yet.</p>
        <button class="btn btn-primary" onclick="document.querySelector('[data-section=profile]').click()">Setup Hospital →</button>
      </div>` : `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👨‍⚕️</div><div class="stat-value">${h.doctor_count}</div><div class="stat-label">Doctors</div></div>
        <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-value">${appts.length}</div><div class="stat-label">Total Appointments</div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value">${booked}</div><div class="stat-label">Active Bookings</div></div>
        <div class="stat-card"><div class="stat-icon">❌</div><div class="stat-value">${cancelled}</div><div class="stat-label">Cancelled</div></div>
      </div>
      <div class="card">
        <div class="flex justify-between items-center mb-2">
          <h3 style="font-weight:700">🏥 ${h.name}</h3>
          <span class="badge ${h.hospital_type === 'government' ? 'badge-info' : 'badge-warning'}">${h.hospital_type}</span>
        </div>
        <p style="color:var(--text-muted);font-size:0.875rem">📍 ${h.address || ''}, ${h.city || ''}</p>
        ${h.has_emergency ? '<span class="badge badge-danger mt-1">🚨 Emergency Services Available</span>' : ''}
      </div>
      <div class="page-header mt-3"><h3>Recent Appointments</h3></div>
      <div class="appointment-list">
        ${appts.slice(0, 5).map(a => `
          <div class="appointment-row">
            <div class="appt-info">
              <h4>${a.patient_name} <small style="color:var(--text-muted)">(${a.doctor_name})</small></h4>
              <p>📅 ${a.slot_date} &nbsp;|&nbsp; 🕐 ${a.slot_time} &nbsp;|&nbsp; <span class="badge badge-${a.status === 'booked' ? 'primary' : a.status === 'cancelled' ? 'danger' : 'warning'}">${a.status}</span></p>
            </div>
          </div>`).join('') || '<div class="empty-state"><p>No appointments yet.</p></div>'}
      </div>`}
    `;
  } catch (err) {
    el.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

// ---- HOSPITAL PROFILE ----
async function renderAdminProfile(el) {
  const hData = await API.get('/hospital/profile');
  const h = hData.hospital || {};
  el.innerHTML = `
    <div class="page-header">
      <h2>🏥 Hospital Profile</h2>
      <p>Add or update your hospital information</p>
    </div>
    <div class="card" style="max-width:700px">
      <form id="hospital-profile-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Hospital Name *</label>
            <input id="hp-name" class="form-control" required value="${h.name || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Type *</label>
            <select id="hp-type" class="form-control">
              <option value="government" ${h.hospital_type === 'government' ? 'selected' : ''}>Government</option>
              <option value="private" ${h.hospital_type === 'private' ? 'selected' : ''}>Private</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input id="hp-phone" class="form-control" value="${h.phone || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">City</label>
            <input id="hp-city" class="form-control" value="${h.city || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input id="hp-address" class="form-control" value="${h.address || ''}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Latitude</label>
            <input id="hp-lat" class="form-control" type="number" step="0.0001" value="${h.lat || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Longitude</label>
            <input id="hp-lng" class="form-control" type="number" step="0.0001" value="${h.lng || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="hp-desc" class="form-control" rows="3">${h.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Rating (1-5)</label>
          <input id="hp-rating" class="form-control" type="number" step="0.1" min="1" max="5" value="${h.rating || 4.0}" />
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
            <input type="checkbox" id="hp-emergency" ${h.has_emergency ? 'checked' : ''} style="width:16px;height:16px" />
            <span>Emergency Services Available</span>
          </label>
        </div>
        <button type="submit" class="btn btn-primary">💾 Save Hospital Profile</button>
      </form>
    </div>
  `;
  document.getElementById('hospital-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await API.post('/hospital/profile', {
        name: document.getElementById('hp-name').value,
        hospital_type: document.getElementById('hp-type').value,
        phone: document.getElementById('hp-phone').value,
        city: document.getElementById('hp-city').value,
        address: document.getElementById('hp-address').value,
        lat: parseFloat(document.getElementById('hp-lat').value) || null,
        lng: parseFloat(document.getElementById('hp-lng').value) || null,
        description: document.getElementById('hp-desc').value,
        rating: parseFloat(document.getElementById('hp-rating').value),
        has_emergency: document.getElementById('hp-emergency').checked,
      });
      toast('Hospital profile saved!', 'success');
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ---- DOCTORS ----
async function renderAdminDoctors(el) {
  el.innerHTML = `
    <div class="page-header flex justify-between items-center">
      <div><h2>👨‍⚕️ Manage Doctors</h2><p>Add and update doctor information</p></div>
      <button id="add-doctor-btn" class="btn btn-primary">+ Add Doctor</button>
    </div>
    <div id="admin-doctor-list"><div class="spinner"></div></div>
  `;
  document.getElementById('add-doctor-btn').addEventListener('click', () => openDoctorModal(null));
  await loadAdminDoctors();
}

async function loadAdminDoctors() {
  const listEl = document.getElementById('admin-doctor-list');
  if (!listEl) return;
  try {
    const data = await API.get('/hospital/profile');
    const doctors = data.hospital?.doctors || [];
    if (!doctors.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="icon">👨‍⚕️</div><p>No doctors added yet.</p></div>';
      return;
    }
    listEl.innerHTML = `<div class="doctor-grid">${doctors.map(d => {
      const initials = d.name.split(' ').map(n => n[0]).slice(0, 2).join('');
      return `<div class="doctor-card">
        <div class="doctor-header">
          <div class="doctor-avatar">${initials}</div>
          <div><h4>${d.name}</h4><p style="font-size:0.8rem;color:var(--primary-light)">${d.specialty}</p></div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-muted)">${d.qualification}</p>
        <div class="flex gap-1 mt-1"><span class="badge badge-secondary">${d.experience_years} yrs</span><span class="badge badge-success">₹${d.fee}</span></div>
        <div class="flex gap-1 mt-2">
          <button class="btn btn-secondary btn-sm" onclick="openDoctorModal(${JSON.stringify(d).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn btn-danger btn-sm delete-doctor-btn" data-id="${d.id}">Delete</button>
        </div>
      </div>`;
    }).join('')}</div>`;
    listEl.querySelectorAll('.delete-doctor-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this doctor?')) return;
        try {
          await API.delete(`/hospital/doctors/${btn.dataset.id}`);
          toast('Doctor deleted.', 'info');
          await loadAdminDoctors();
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  } catch (err) { listEl.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
}

function openDoctorModal(doctor) {
  const title = document.getElementById('modal-doctor-title');
  title.textContent = doctor ? '✏️ Edit Doctor' : '👨‍⚕️ Add Doctor';
  document.getElementById('modal-doctor-body').innerHTML = `
    <form id="doctor-form">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name *</label><input id="d-name" class="form-control" required value="${doctor?.name || ''}" /></div>
        <div class="form-group"><label class="form-label">Specialty *</label><input id="d-spec" class="form-control" value="${doctor?.specialty || ''}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Qualification</label><input id="d-qual" class="form-control" value="${doctor?.qualification || ''}" /></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Experience (Years)</label><input id="d-exp" class="form-control" type="number" value="${doctor?.experience_years || 0}" /></div>
        <div class="form-group"><label class="form-label">Consultation Fee (₹)</label><input id="d-fee" class="form-control" type="number" value="${doctor?.fee || 500}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Available Days (e.g. Mon,Tue,Wed)</label><input id="d-days" class="form-control" value="${doctor?.available_days || 'Mon,Tue,Wed,Thu,Fri'}" /></div>
      <button type="submit" class="btn btn-primary btn-block">💾 Save Doctor</button>
    </form>
  `;
  openModal('modal-doctor');
  document.getElementById('doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('d-name').value,
      specialty: document.getElementById('d-spec').value,
      qualification: document.getElementById('d-qual').value,
      experience_years: parseInt(document.getElementById('d-exp').value),
      fee: parseFloat(document.getElementById('d-fee').value),
      available_days: document.getElementById('d-days').value,
    };
    try {
      if (doctor) { await API.put(`/hospital/doctors/${doctor.id}`, payload); toast('Doctor updated!', 'success'); }
      else { await API.post('/hospital/doctors', payload); toast('Doctor added!', 'success'); }
      closeModal('modal-doctor');
      await loadAdminDoctors();
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ---- SLOTS ----
async function renderAdminSlots(el) {
  const hData = await API.get('/hospital/profile');
  const doctors = hData.hospital?.doctors || [];
  el.innerHTML = `
    <div class="page-header"><h2>🕐 Manage Time Slots</h2><p>Add free appointment slots for your doctors. Patients will see and book these.</p></div>
    ${!doctors.length ? '<div class="empty-state"><div class="icon">👨‍⚕️</div><p>Add doctors first before creating slots.</p></div>' : `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
      <!-- ADD SLOTS PANEL -->
      <div class="card">
        <h3 style="font-weight:700;margin-bottom:1rem">➕ Add Free Slots</h3>
        <div class="form-group">
          <label class="form-label">Select Doctor</label>
          <select id="slot-doctor" class="form-control">
            ${doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialty}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" id="slot-date" class="form-control" min="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div class="form-group">
          <label class="form-label">Select Time Slots</label>
          <div class="slots-grid">
            ${['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
               '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
               '04:00 PM','04:30 PM','05:00 PM','05:30 PM']
              .map(t => `<button type="button" class="slot-btn time-select-btn" data-time="${t}">${t}</button>`).join('')}
          </div>
        </div>
        <button id="add-slots-btn" class="btn btn-primary btn-block">+ Add Selected Slots</button>
      </div>

      <!-- EXISTING SLOTS PANEL -->
      <div class="card">
        <h3 style="font-weight:700;margin-bottom:1rem">📋 Existing Slots</h3>
        <div class="form-group">
          <label class="form-label">Filter by Doctor</label>
          <select id="view-slot-doctor" class="form-control">
            ${doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialty}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Filter by Date (optional)</label>
          <input type="date" id="view-slot-date" class="form-control" />
        </div>
        <button id="load-slots-btn" class="btn btn-secondary btn-block" style="margin-bottom:1rem">🔍 Load Slots</button>
        <div id="existing-slots-list"></div>
      </div>
    </div>`}
  `;
  if (!doctors.length) return;

  // --- Add slots logic ---
  const selectedTimes = new Set();
  el.querySelectorAll('.time-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      if (btn.classList.contains('selected')) selectedTimes.add(btn.dataset.time);
      else selectedTimes.delete(btn.dataset.time);
    });
  });

  document.getElementById('add-slots-btn').addEventListener('click', async () => {
    const doctorId = document.getElementById('slot-doctor').value;
    const slotDate = document.getElementById('slot-date').value;
    if (!slotDate) { toast('Please select a date', 'error'); return; }
    if (!selectedTimes.size) { toast('Please select at least one time slot', 'error'); return; }
    try {
      const data = await API.post(`/hospital/doctors/${doctorId}/slots`, { slot_date: slotDate, slot_times: [...selectedTimes] });
      toast(data.message, 'success');
      el.querySelectorAll('.time-select-btn').forEach(b => b.classList.remove('selected'));
      selectedTimes.clear();
      // Auto-refresh the existing slots view
      loadExistingSlots();
    } catch (err) { toast(err.message, 'error'); }
  });

  // --- View existing slots logic ---
  document.getElementById('load-slots-btn').addEventListener('click', loadExistingSlots);

  async function loadExistingSlots() {
    const doctorId = document.getElementById('view-slot-doctor').value;
    const date = document.getElementById('view-slot-date').value;
    const listEl = document.getElementById('existing-slots-list');
    listEl.innerHTML = '<div class="spinner"></div>';
    try {
      let url = `/hospital/doctors/${doctorId}/slots`;
      if (date) url += `?date=${date}`;
      const data = await API.get(url);
      const slots = data.slots;
      if (!slots.length) {
        listEl.innerHTML = '<div class="empty-state" style="padding:1rem"><p style="font-size:0.9rem;color:var(--text-muted)">No slots found. Add some on the left!</p></div>';
        return;
      }

      // Group slots by date
      const grouped = {};
      slots.forEach(s => {
        if (!grouped[s.slot_date]) grouped[s.slot_date] = [];
        grouped[s.slot_date].push(s);
      });

      let html = '';
      for (const [date, dateSlots] of Object.entries(grouped)) {
        const freeCount = dateSlots.filter(s => !s.is_booked).length;
        const bookedCount = dateSlots.filter(s => s.is_booked).length;
        html += `
          <div style="margin-bottom:1.25rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
              <h4 style="font-weight:600;font-size:0.95rem">📅 ${date}</h4>
              <div style="display:flex;gap:0.5rem">
                <span class="badge badge-success"><div class="badge-dot"></div> ${freeCount} Free</span>
                <span class="badge badge-danger"><div class="badge-dot"></div> ${bookedCount} Booked</span>
              </div>
            </div>
            <div class="slots-grid">
              ${dateSlots.map(s => `
                <div class="slot-btn ${s.is_booked ? 'booked' : 'free'}" style="position:relative;cursor:default">
                  ${s.slot_time}
                  <span style="font-size:0.65rem;display:block;margin-top:2px;color:${s.is_booked ? 'var(--danger)' : 'var(--success)'}">${s.is_booked ? 'Booked' : 'Free'}</span>
                  ${!s.is_booked ? `<button class="delete-slot-btn" data-slot-id="${s.id}" title="Delete this slot" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:var(--danger);color:#fff;border:none;font-size:0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">✕</button>` : ''}
                </div>
              `).join('')}
            </div>
          </div>`;
      }
      listEl.innerHTML = html;

      // Attach delete handlers
      listEl.querySelectorAll('.delete-slot-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Delete this free slot?')) return;
          try {
            await API.delete(`/hospital/slots/${btn.dataset.slotId}`);
            toast('Slot deleted', 'info');
            loadExistingSlots();
          } catch (err) { toast(err.message, 'error'); }
        });
      });
    } catch (err) { listEl.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
  }
}

// ---- APPOINTMENTS ----
async function renderAdminAppointments(el) {
  el.innerHTML = `
    <div class="page-header"><h2>📅 Hospital Appointments</h2><p>View all patient bookings</p></div>
    <div id="admin-appt-list"><div class="spinner"></div></div>
  `;
  try {
    const data = await API.get('/hospital/appointments');
    const appts = data.appointments;
    const listEl = document.getElementById('admin-appt-list');
    if (!appts.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="icon">📅</div><p>No appointments booked yet.</p></div>';
      return;
    }
    const statusColor = { booked: 'primary', cancelled: 'danger', rescheduled: 'warning', completed: 'success' };
    listEl.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            ${appts.map(a => `
              <tr>
                <td>${a.id}</td>
                <td><strong>${a.patient_name}</strong><br/><small style="color:var(--text-muted)">${a.patient_email}</small></td>
                <td>${a.doctor_name}<br/><small style="color:var(--text-muted)">${a.doctor_specialty}</small></td>
                <td>${a.slot_date}</td>
                <td>${a.slot_time}</td>
                <td><span class="badge badge-${statusColor[a.status] || 'secondary'}">${a.status}</span></td>
                <td style="color:var(--text-muted);font-size:0.82rem">${a.notes || '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    document.getElementById('admin-appt-list').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}
