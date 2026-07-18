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

const aiService = {
  checkSymptoms: (symptoms) =>
    request('POST', API_URLS.ai.symptoms, { symptoms }),

  summarizeReport: (reportData) =>
    request('POST', API_URLS.ai.reportSummary, reportData),
};

export default aiService;
