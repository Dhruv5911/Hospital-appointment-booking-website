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

const medicineService = {
  getAll: (search = '', category = '') => {
    const qs = new URLSearchParams({ q: search, category }).toString();
    return request('GET', `${API_URLS.medicines.list}?${qs}`);
  },

  add: (data) => request('POST', API_URLS.medicines.add, data),

  update: (id, data) => request('PUT', API_URLS.medicines.update(id), data),

  delete: (id) => request('DELETE', API_URLS.medicines.delete(id)),

  placeOrder: (items, address) =>
    request('POST', API_URLS.medicines.orders, { items, address }),

  getOrders: () => request('GET', API_URLS.medicines.orders),

  getOrder: (id) => request('GET', API_URLS.medicines.orderDetail(id)),

  getWishlist: () => request('GET', API_URLS.medicines.wishlist),

  toggleWishlist: (medicineId) =>
    request('POST', API_URLS.medicines.wishlist, { medicine_id: medicineId }),
};

export default medicineService;
