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

const inventoryService = {
  getAll: () => request('GET', API_URLS.inventory.list),
  getLowStock: () => request('GET', API_URLS.inventory.lowStock),
  getExpiryAlerts: () => request('GET', API_URLS.inventory.expiryAlerts),
  restock: (id, quantity) => request('PUT', API_URLS.inventory.restock(id), { quantity }),
  getPurchaseHistory: () => request('GET', API_URLS.inventory.history),
};

export default inventoryService;
