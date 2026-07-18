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

const hospitalService = {
  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `${API_URLS.hospitals.search}?${qs}`);
  },

  getAll: () => request('GET', API_URLS.hospitals.search),

  getById: (id) => request('GET', API_URLS.hospitals.detail(id)),

  getProfile: () => request('GET', API_URLS.hospitals.profile),

  createOrUpdate: (data) => request('POST', API_URLS.hospitals.profile, data),

  getRecommendations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `${API_URLS.hospitals.recommend}?${qs}`);
  },

  getNearby: (lat, lng) =>
    request('GET', `${API_URLS.hospitals.nearby}?lat=${lat}&lng=${lng}`),
};

export default hospitalService;
