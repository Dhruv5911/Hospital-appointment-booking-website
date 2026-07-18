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

const ambulanceService = {
  request: (data) => request('POST', API_URLS.ambulance.request, data),
  getStatus: (id) => request('GET', API_URLS.ambulance.status(id)),
  getMyRequests: () => request('GET', API_URLS.ambulance.myRequests),
};

export default ambulanceService;
