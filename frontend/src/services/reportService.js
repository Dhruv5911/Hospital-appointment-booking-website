import API_URLS from '../config/api.config';

const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const request = async (method, url, body = null, isFormData = false) => {
  const opts = { method, headers: getHeaders(isFormData) };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const reportService = {
  upload: (formData) =>
    request('POST', API_URLS.reports.upload, formData, true),

  getAll: () => request('GET', API_URLS.reports.list),

  getById: (id) => request('GET', API_URLS.reports.detail(id)),

  download: (id) => API_URLS.reports.download(id),

  summarize: (id) => request('POST', API_URLS.reports.summarize(id)),

  aiSummarize: (formData) =>
    request('POST', API_URLS.ai.reportSummary, formData, true),
};

export default reportService;
