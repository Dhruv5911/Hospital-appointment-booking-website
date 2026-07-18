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

const feedbackService = {
  submit: (data) => request('POST', API_URLS.feedback.submit, data),
  getAll: () => request('GET', API_URLS.feedback.list),
  getDoctorRatings: (id) => request('GET', API_URLS.feedback.doctorRatings(id)),
  getHospitalRatings: (id) => request('GET', API_URLS.feedback.hospitalRatings(id)),
};

export default feedbackService;
