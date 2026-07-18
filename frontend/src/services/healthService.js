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

const healthService = {
  getRecords: () => request('GET', API_URLS.health.records),
  addRecord: (data) => request('POST', API_URLS.health.addRecord, data),
  getVitals: () => request('GET', API_URLS.health.vitals),
  getBMI: () => request('GET', API_URLS.health.bmi),
};

export default healthService;
