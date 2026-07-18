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

const labService = {
  getTests: () => request('GET', API_URLS.lab.tests),
  book: (testData) => request('POST', API_URLS.lab.book, testData),
  getMyTests: () => request('GET', API_URLS.lab.myTests),
  getResult: (id) => request('GET', API_URLS.lab.result(id)),
};

export default labService;
