import API_URLS from '../config/api.config';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const request = async (method, url, body = null) => {
  const opts = { method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const appointmentService = {
  book: (slotId, notes = '') =>
    request('POST', API_URLS.appointments.book, { slot_id: slotId, notes }),

  getMyAppointments: () =>
    request('GET', API_URLS.appointments.list),

  cancel: (id) =>
    request('PUT', API_URLS.appointments.cancel(id)),

  reschedule: (id, newSlotId) =>
    request('PUT', API_URLS.appointments.reschedule(id), { new_slot_id: newSlotId }),

  getHospitalAppointments: () =>
    request('GET', API_URLS.appointments.hospitalList),

  approve: (id) =>
    request('PUT', API_URLS.appointments.approve(id)),

  reject: (id, reason = '') =>
    request('PUT', API_URLS.appointments.reject(id), { reason }),
};

export default appointmentService;
