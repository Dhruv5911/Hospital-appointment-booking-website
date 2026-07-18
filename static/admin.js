// ===== HOSPITAL ADMIN DASHBOARD SECTIONS =====

let adminDoctorCache = [];

function setAdminSection(section) {
  renderAdminSection(section);
  document.getElementById('hospital-page-title').textContent = sectionTitles[section] || 'Overview';
  activateNav('hospital-nav', section);
}

async function renderAdminSection(section) {
  State.currentAdminSection = section;
  const content = document.getElementById('hospital-content');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
  switch (section) {
    case 'overview': await renderAdminOverview(content); break;
    case 'profile': await renderAdminProfile(content); break;
    case 'doctors': await renderAdminDoctors(content); break;
    case 'slots': await renderAdminSlots(content); break;
    case 'appointments': await renderAdminAppointments(content); break;
    default: await renderAdminOverview(content);
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
    const appts = apptData.appointments || [];
    const active = appts.filter(a => a.status === 'booked' || a.status === 'rescheduled').length;
    const cancelled = appts.filter(a => a.status === 'cancelled').length;
    const completed = appts.filter(a => a.status === 'completed').length;

    if (!h) {
      el.innerHTML = `
        <div class="dashboard-hero">
          <div>
            <p class="eyebrow">Setup required</p>
            <h2>Create your hospital workspace.</h2>
            <p>Add your hospital profile first. After that, you can add doctors, create slots, and receive patient bookings.</p>
            <button class="btn btn-primary mt-2" id="setup-hospital-btn">Setup Hospital</button>
          </div>
          <div class="hero-metric-panel">
            <div class="mini-metric"><strong>1</strong><span>Profile</span></div>
            <div class="mini-metric"><strong>2</strong><span>Doctors</span></div>
            <div class="mini-metric"><strong>3</strong><span>Slots</span></div>
            <div class="mini-metric"><strong>4</strong><span>Bookings</span></div>
          </div>
        </div>`;
      document.getElementById('setup-hospital-btn').addEventListener('click', () => setAdminSection('profile'));
      return;
    }

    el.innerHTML = `
      <div class="page-header">
        <h2>Dashboard overview</h2>
        <p>Welcome back, ${escapeHtml(State.user.name)}.</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">DR</div><div class="stat-value">${h.doctor_count}</div><div class="stat-label">Doctors</div></div>
        <div class="stat-card"><div class="stat-icon">AP</div><div class="stat-value">${appts.length}</div><div class="stat-label">Total Appointments</div></div>
        <div class="stat-card"><div class="stat-icon">ON</div><div class="stat-value">${active}</div><div class="stat-label">Active Bookings</div></div>
        <div class="stat-card"><div class="stat-icon">CX</div><div class="stat-value">${cancelled}</div><div class="stat-label">Cancelled</div></div>
      </div>
      <div class="admin-summary-grid">
        <div class="admin-profile-card">
          <p class="eyebrow">${escapeHtml(h.hospital_type || 'Hospital')}</p>
          <h3 style="font-family:var(--font-display);letter-spacing:0">${escapeHtml(h.name)}</h3>
          <p style="color:var(--text-muted);line-height:1.6;margin-top:.5rem">${escapeHtml(h.address || 'Address not listed')}, ${escapeHtml(h.city || '')}</p>
          <div class="appointment-card-meta">
            ${h.has_emergency ? '<span class="badge badge-danger">Emergency services</span>' : '<span class="badge badge-secondary">No emergency flag</span>'}
            <span class="badge badge-info">${Number(h.rating || 0).toFixed(1)}/5 rating</span>
            <span class="badge badge-success">${completed} completed</span>
          </div>
          <button class="btn btn-secondary btn-sm mt-2" id="edit-profile-shortcut">Edit profile</button>
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 style="font-family:var(--font-display);letter-spacing:0">Recent appointments</h3>
            <button class="btn btn-secondary btn-sm" id="view-all-appts">View all</button>
          </div>
          <div class="appointment-list">
            ${appts.slice(0, 5).map(adminAppointmentCard).join('') || '<div class="empty-state"><p>No appointments yet.</p></div>'}
          </div>
        </div>
      </div>`;
    document.getElementById('edit-profile-shortcut').addEventListener('click', () => setAdminSection('profile'));
    document.getElementById('view-all-appts').addEventListener('click', () => setAdminSection('appointments'));
  } catch (err) {
    el.innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
  }
}

// ---- HOSPITAL PROFILE ----
async function renderAdminProfile(el) {
  const hData = await API.get('/hospital/profile');
  const h = hData.hospital || {};
  el.innerHTML = `
    <div class="page-header">
      <h2>Hospital profile</h2>
      <p>Add or update the hospital information patients see.</p>
    </div>
    <div class="guide-panel" style="max-width:760px">
      <form id="hospital-profile-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Hospital Name *</label>
            <input id="hp-name" class="form-control" required value="${escapeHtml(h.name || '')}" />
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
            <input id="hp-phone" class="form-control" value="${escapeHtml(h.phone || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">City</label>
            <input id="hp-city" class="form-control" value="${escapeHtml(h.city || '')}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input id="hp-address" class="form-control" value="${escapeHtml(h.address || '')}" />
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
          <textarea id="hp-desc" class="form-control" rows="3">${escapeHtml(h.description || '')}</textarea>
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
        <button type="submit" class="btn btn-primary">Save Hospital Profile</button>
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
      setAdminSection('overview');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

// ---- DOCTORS ----
async function renderAdminDoctors(el) {
  el.innerHTML = `
    <div class="page-header flex justify-between items-center">
      <div><h2>Manage doctors</h2><p>Add and update doctor information.</p></div>
      <button id="add-doctor-btn" class="btn btn-primary">Add Doctor</button>
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
    adminDoctorCache = data.hospital?.doctors || [];
    if (!adminDoctorCache.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="icon">DR</div><p>No doctors added yet.</p></div>';
      return;
    }
    listEl.innerHTML = `<div class="doctor-grid">${adminDoctorCache.map(d => {
      const initials = d.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      return `<div class="doctor-card">
        <div class="doctor-header">
          <div class="doctor-avatar">${escapeHtml(initials)}</div>
          <div><h4>${escapeHtml(d.name)}</h4><p style="font-size:0.8rem;color:var(--primary-dark);font-weight:700">${escapeHtml(d.specialty || 'General care')}</p></div>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.45">${escapeHtml(d.qualification || 'Qualification not listed')}</p>
        <div class="flex gap-1 mt-1"><span class="badge badge-secondary">${d.experience_years || 0} yrs</span><span class="badge badge-success">Rs ${Number(d.fee || 0).toFixed(0)}</span></div>
        <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem">Available: ${escapeHtml(d.available_days || 'Not listed')}</p>
        <div class="flex gap-1 mt-2">
          <button class="btn btn-secondary btn-sm edit-doctor-btn" data-id="${d.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-doctor-btn" data-id="${d.id}">Delete</button>
        </div>
      </div>`;
    }).join('')}</div>`;
    listEl.querySelectorAll('.edit-doctor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const doctor = adminDoctorCache.find(d => d.id === parseInt(btn.dataset.id, 10));
        openDoctorModal(doctor);
      });
    });
    listEl.querySelectorAll('.delete-doctor-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this doctor?')) return;
        try {
          await API.delete(`/hospital/doctors/${btn.dataset.id}`);
          toast('Doctor deleted.', 'info');
          await loadAdminDoctors();
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
  }
}

function openDoctorModal(doctor) {
  const title = document.getElementById('modal-doctor-title');
  title.textContent = doctor ? 'Edit Doctor' : 'Add Doctor';
  document.getElementById('modal-doctor-body').innerHTML = `
    <form id="doctor-form">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name *</label><input id="d-name" class="form-control" required value="${escapeHtml(doctor?.name || '')}" /></div>
        <div class="form-group"><label class="form-label">Specialty *</label><input id="d-spec" class="form-control" value="${escapeHtml(doctor?.specialty || '')}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Qualification</label><input id="d-qual" class="form-control" value="${escapeHtml(doctor?.qualification || '')}" /></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Experience (Years)</label><input id="d-exp" class="form-control" type="number" value="${doctor?.experience_years || 0}" /></div>
        <div class="form-group"><label class="form-label">Consultation Fee (Rs)</label><input id="d-fee" class="form-control" type="number" value="${doctor?.fee || 500}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Available Days (e.g. Mon,Tue,Wed)</label><input id="d-days" class="form-control" value="${escapeHtml(doctor?.available_days || 'Mon,Tue,Wed,Thu,Fri')}" /></div>
      <button type="submit" class="btn btn-primary btn-block">Save Doctor</button>
    </form>
  `;
  openModal('modal-doctor');
  document.getElementById('doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('d-name').value,
      specialty: document.getElementById('d-spec').value,
      qualification: document.getElementById('d-qual').value,
      experience_years: parseInt(document.getElementById('d-exp').value, 10),
      fee: parseFloat(document.getElementById('d-fee').value),
      available_days: document.getElementById('d-days').value,
    };
    try {
      if (doctor) {
        await API.put(`/hospital/doctors/${doctor.id}`, payload);
        toast('Doctor updated!', 'success');
      } else {
        await API.post('/hospital/doctors', payload);
        toast('Doctor added!', 'success');
      }
      closeModal('modal-doctor');
      await loadAdminDoctors();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

// ---- SLOTS ----
async function renderAdminSlots(el) {
  const hData = await API.get('/hospital/profile');
  const doctors = hData.hospital?.doctors || [];
  el.innerHTML = `
    <div class="page-header"><h2>Manage time slots</h2><p>Add free appointment slots for doctors. Patients will see and book these.</p></div>
    ${!doctors.length ? '<div class="empty-state"><div class="icon">DR</div><p>Add doctors first before creating slots.</p></div>' : `
    <div class="responsive-two-col">
      <div class="guide-panel">
        <h3 style="font-weight:700;margin-bottom:1rem">Add free slots</h3>
        <div class="form-group">
          <label class="form-label">Select Doctor</label>
          <select id="slot-doctor" class="form-control">
            ${doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} - ${escapeHtml(d.specialty || 'General care')}</option>`).join('')}
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
        <button id="add-slots-btn" class="btn btn-primary btn-block">Add Selected Slots</button>
      </div>

      <div class="guide-panel">
        <h3 style="font-weight:700;margin-bottom:1rem">Existing slots</h3>
        <div class="form-group">
          <label class="form-label">Filter by Doctor</label>
          <select id="view-slot-doctor" class="form-control">
            ${doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} - ${escapeHtml(d.specialty || 'General care')}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Filter by Date (optional)</label>
          <input type="date" id="view-slot-date" class="form-control" />
        </div>
        <button id="load-slots-btn" class="btn btn-secondary btn-block" style="margin-bottom:1rem">Load Slots</button>
        <div id="existing-slots-list"></div>
      </div>
    </div>`}
  `;
  if (!doctors.length) return;

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
    if (!slotDate) {
      toast('Please select a date', 'error');
      return;
    }
    if (!selectedTimes.size) {
      toast('Please select at least one time slot', 'error');
      return;
    }
    try {
      const data = await API.post(`/hospital/doctors/${doctorId}/slots`, { slot_date: slotDate, slot_times: [...selectedTimes] });
      toast(data.message, 'success');
      el.querySelectorAll('.time-select-btn').forEach(b => b.classList.remove('selected'));
      selectedTimes.clear();
      loadExistingSlots();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  document.getElementById('load-slots-btn').addEventListener('click', loadExistingSlots);
  loadExistingSlots();

  async function loadExistingSlots() {
    const doctorId = document.getElementById('view-slot-doctor').value;
    const date = document.getElementById('view-slot-date').value;
    const listEl = document.getElementById('existing-slots-list');
    listEl.innerHTML = '<div class="spinner"></div>';
    try {
      let url = `/hospital/doctors/${doctorId}/slots`;
      if (date) url += `?date=${date}`;
      const data = await API.get(url);
      const slots = data.slots || [];
      if (!slots.length) {
        listEl.innerHTML = '<div class="empty-state" style="padding:1rem"><p style="font-size:0.9rem;color:var(--text-muted)">No slots found.</p></div>';
        return;
      }

      const grouped = {};
      slots.forEach(s => {
        if (!grouped[s.slot_date]) grouped[s.slot_date] = [];
        grouped[s.slot_date].push(s);
      });

      listEl.innerHTML = Object.entries(grouped).map(([slotDate, dateSlots]) => {
        const freeCount = dateSlots.filter(s => !s.is_booked).length;
        const bookedCount = dateSlots.filter(s => s.is_booked).length;
        return `
          <div style="margin-bottom:1.25rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;gap:.5rem;flex-wrap:wrap">
              <h4 style="font-weight:700;font-size:0.95rem">${escapeHtml(slotDate)}</h4>
              <div style="display:flex;gap:0.5rem">
                <span class="badge badge-success">${freeCount} Free</span>
                <span class="badge badge-danger">${bookedCount} Booked</span>
              </div>
            </div>
            <div class="slots-grid">
              ${dateSlots.map(s => `
                <div class="slot-btn ${s.is_booked ? 'booked' : 'free'}" style="position:relative;cursor:default">
                  ${escapeHtml(s.slot_time)}
                  <span style="font-size:0.65rem;display:block;margin-top:2px;color:${s.is_booked ? 'var(--danger)' : 'var(--success)'}">${s.is_booked ? 'Booked' : 'Free'}</span>
                  ${!s.is_booked ? `<button class="delete-slot-btn" data-slot-id="${s.id}" title="Delete this slot" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:var(--danger);color:#fff;border:none;font-size:0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">x</button>` : ''}
                </div>
              `).join('')}
            </div>
          </div>`;
      }).join('');

      listEl.querySelectorAll('.delete-slot-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Delete this free slot?')) return;
          try {
            await API.delete(`/hospital/slots/${btn.dataset.slotId}`);
            toast('Slot deleted', 'info');
            loadExistingSlots();
          } catch (err) {
            toast(err.message, 'error');
          }
        });
      });
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
    }
  }
}

// ---- APPOINTMENTS ----
async function renderAdminAppointments(el) {
  el.innerHTML = `
    <div class="page-header"><h2>Hospital appointments</h2><p>View patient bookings without a database table.</p></div>
    <div id="admin-appt-list"><div class="spinner"></div></div>
  `;
  try {
    const data = await API.get('/hospital/appointments');
    const appts = data.appointments || [];
    const listEl = document.getElementById('admin-appt-list');
    if (!appts.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="icon">AP</div><p>No appointments booked yet.</p></div>';
      return;
    }

    const counts = {
      booked: appts.filter(a => a.status === 'booked').length,
      rescheduled: appts.filter(a => a.status === 'rescheduled').length,
      cancelled: appts.filter(a => a.status === 'cancelled').length,
      completed: appts.filter(a => a.status === 'completed').length,
    };

    listEl.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${counts.booked}</div><div class="stat-label">Booked</div></div>
        <div class="stat-card"><div class="stat-value">${counts.rescheduled}</div><div class="stat-label">Rescheduled</div></div>
        <div class="stat-card"><div class="stat-value">${counts.cancelled}</div><div class="stat-label">Cancelled</div></div>
        <div class="stat-card"><div class="stat-value">${counts.completed}</div><div class="stat-label">Completed</div></div>
      </div>
      <div class="appointment-list">
        ${appts.map(adminAppointmentCard).join('')}
      </div>`;
  } catch (err) {
    document.getElementById('admin-appt-list').innerHTML = `<p style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
  }
}

function adminAppointmentCard(a) {
  const statusColor = { booked: 'primary', cancelled: 'danger', rescheduled: 'warning', completed: 'success' };
  return `
    <div class="appointment-card">
      <div>
        <h4>${escapeHtml(a.patient_name || 'Patient')} <small style="color:var(--text-muted);font-weight:500">${escapeHtml(a.patient_email || '')}</small></h4>
        <p>${escapeHtml(a.doctor_name || 'Doctor')} - ${escapeHtml(a.doctor_specialty || 'Specialty')}</p>
        <div class="appointment-card-meta">
          <span class="badge badge-${statusColor[a.status] || 'secondary'}">${escapeHtml(a.status)}</span>
          <span class="tag-pill">${escapeHtml(a.slot_date)} at ${escapeHtml(a.slot_time)}</span>
          ${a.notes ? `<span class="tag-pill">${escapeHtml(a.notes)}</span>` : ''}
        </div>
      </div>
      <div style="color:var(--text-muted);font-size:.82rem;text-align:right">#${a.id}</div>
    </div>`;
}
