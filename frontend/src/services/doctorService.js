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

const doctorService = {
  getAll: () => request('GET', API_URLS.doctors.list),

  add: (data) => request('POST', API_URLS.doctors.add, data),

  update: (id, data) => request('PUT', API_URLS.doctors.update(id), data),

  delete: (id) => request('DELETE', API_URLS.doctors.delete(id)),

  getSlots: (doctorId, date = '') => {
    const qs = date ? `?date=${date}` : '';
    return request('GET', `${API_URLS.doctors.slots(doctorId)}${qs}`);
  },

  getPatientSlots: (doctorId, date = '') => {
    const qs = date ? `?date=${date}` : '';
    return request('GET', `${API_URLS.doctors.patientSlots(doctorId)}${qs}`);
  },

  addSlots: (doctorId, slotDate, slotTimes) =>
    request('POST', API_URLS.doctors.slots(doctorId), { slot_date: slotDate, slot_times: slotTimes }),

  deleteSlot: (slotId) =>
    request('DELETE', `${API_URLS.hospitals.profile.replace('/profile', '')}/slots/${slotId}`),

  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `${API_URLS.doctors.search}?${qs}`);
  },
};

export default doctorService;
