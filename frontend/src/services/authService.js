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
  if (body) {
    opts.body = isFormData ? body : JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
};

const authService = {
  login: (email, password) =>
    request('POST', API_URLS.auth.login, { email, password }),

  register: (formData) =>
    request('POST', API_URLS.auth.register, formData),

  logout: () =>
    request('POST', API_URLS.auth.logout),

  forgotPassword: (email) =>
    request('POST', API_URLS.auth.forgotPassword, { email }),

  resetPassword: (token, password) =>
    request('POST', API_URLS.auth.resetPassword, { token, password }),

  getProfile: () =>
    request('GET', API_URLS.auth.me),

  updateProfile: (data) =>
    request('PUT', API_URLS.auth.updateProfile, data),

  changePassword: (currentPassword, newPassword) =>
    request('POST', API_URLS.auth.changePassword, { currentPassword, newPassword }),

  uploadAvatar: (formData) =>
    request('POST', API_URLS.auth.uploadAvatar, formData, true),
};

export default authService;
