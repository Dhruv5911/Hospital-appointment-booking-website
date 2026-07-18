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

const queueService = {
  getCurrent: () => request('GET', API_URLS.queue.current),
  getMyToken: () => request('GET', API_URLS.queue.myToken),
  generateToken: (appointmentId) => request('POST', API_URLS.queue.generate, { appointment_id: appointmentId }),
};

export default queueService;
