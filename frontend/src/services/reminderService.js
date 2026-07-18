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

const reminderService = {
  getAll: () => request('GET', API_URLS.reminders.list),
  add: (data) => request('POST', API_URLS.reminders.add, data),
  update: (id, data) => request('PUT', API_URLS.reminders.update(id), data),
  delete: (id) => request('DELETE', API_URLS.reminders.delete(id)),
};

export default reminderService;
