import API_URLS from '../config/api.config';

const request = async (method, url, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const prescriptionService = {
  getAll: () => request('GET', API_URLS.prescriptions.list),
  getById: (id) => request('GET', API_URLS.prescriptions.detail(id)),
  create: (data) => request('POST', API_URLS.prescriptions.create, data),
  download: (id) => API_URLS.prescriptions.download(id),
};

export default prescriptionService;
