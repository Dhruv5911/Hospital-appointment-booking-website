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

const notificationService = {
  getAll: () => request('GET', API_URLS.notifications.list),
  markRead: (id) => request('PUT', API_URLS.notifications.read(id)),
  markAllRead: () => request('PUT', API_URLS.notifications.readAll),
  getUnreadCount: () => request('GET', API_URLS.notifications.count),
};

export default notificationService;
