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

const bloodBankService = {
  getInventory: () => request('GET', API_URLS.bloodBank.inventory),
  search: (bloodGroup) => request('GET', `${API_URLS.bloodBank.search}?group=${bloodGroup}`),
  requestBlood: (data) => request('POST', API_URLS.bloodBank.request, data),
  getMyRequests: () => request('GET', API_URLS.bloodBank.myRequests),
};

export default bloodBankService;
