/**
 * Centralized API Configuration
 * All API endpoint URLs are defined here.
 * Replace empty strings with your actual backend URLs when ready.
 */

const BASE_URL = '/api';

const API_URLS = {
  // ─── Authentication ──────────────────────────────────
  auth: {
    login: `${BASE_URL}/auth/login`,
    register: `${BASE_URL}/auth/signup`,
    logout: `${BASE_URL}/auth/logout`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
    me: `${BASE_URL}/profile`,
    updateProfile: `${BASE_URL}/auth/profile`,
    changePassword: `${BASE_URL}/auth/change-password`,
    uploadAvatar: `${BASE_URL}/auth/avatar`,
  },

  // ─── Dashboard ───────────────────────────────────────
  dashboard: {
    stats: `${BASE_URL}/stats`,
    patientStats: `${BASE_URL}/dashboard/patient`,
    adminStats: `${BASE_URL}/dashboard/admin`,
    analytics: `${BASE_URL}/dashboard/analytics`,
    revenueChart: `${BASE_URL}/dashboard/revenue`,
    appointmentChart: `${BASE_URL}/dashboard/appointments-chart`,
  },

  // ─── Hospitals ───────────────────────────────────────
  hospitals: {
    list: `${BASE_URL}/patient/hospitals`,
    search: `${BASE_URL}/patient/hospitals/search`,
    detail: (id) => `${BASE_URL}/patient/hospitals/${id}`,
    recommend: `${BASE_URL}/hospitals/recommend`,
    profile: `${BASE_URL}/hospital/profile`,
    nearby: `${BASE_URL}/hospitals/nearby`,
  },

  // ─── Doctors ─────────────────────────────────────────
  doctors: {
    list: `${BASE_URL}/hospital/doctors`,
    add: `${BASE_URL}/hospital/doctors`,
    update: (id) => `${BASE_URL}/hospital/doctors/${id}`,
    delete: (id) => `${BASE_URL}/hospital/doctors/${id}`,
    slots: (id) => `${BASE_URL}/hospital/doctors/${id}/slots`,
    patientSlots: (id) => `${BASE_URL}/patient/doctors/${id}/slots`,
    search: `${BASE_URL}/doctors/search`,
  },

  // ─── Appointments ────────────────────────────────────
  appointments: {
    book: `${BASE_URL}/patient/appointments/book`,
    list: `${BASE_URL}/appointments`,
    cancel: (id) => `${BASE_URL}/patient/appointments/${id}/cancel`,
    reschedule: (id) => `${BASE_URL}/patient/appointments/${id}/reschedule`,
    hospitalList: `${BASE_URL}/hospital/appointments`,
    approve: (id) => `${BASE_URL}/hospital/appointments/${id}/approve`,
    reject: (id) => `${BASE_URL}/hospital/appointments/${id}/reject`,
  },

  // ─── Pharmacy / Medicines ────────────────────────────
  medicines: {
    list: `${BASE_URL}/pharmacy/medicines`,
    add: `${BASE_URL}/pharmacy/medicines`,
    update: (id) => `${BASE_URL}/pharmacy/medicines/${id}`,
    delete: (id) => `${BASE_URL}/pharmacy/medicines/${id}`,
    orders: `${BASE_URL}/orders`,
    orderDetail: (id) => `${BASE_URL}/pharmacy/orders/${id}`,
    wishlist: `${BASE_URL}/pharmacy/wishlist`,
  },

  // ─── Emergency ───────────────────────────────────────
  emergency: {
    predict: `${BASE_URL}/ml/predict`,
  },

  // ─── AI Services ─────────────────────────────────────
  ai: {
    symptoms: `${BASE_URL}/ai/symptoms`,
    reportSummary: `${BASE_URL}/report/summarize`,
  },

  // ─── Reports ─────────────────────────────────────────
  reports: {
    upload: `${BASE_URL}/reports/upload`,
    list: `${BASE_URL}/reports`,
    detail: (id) => `${BASE_URL}/reports/${id}`,
    download: (id) => `${BASE_URL}/reports/${id}/download`,
    summarize: (id) => `${BASE_URL}/reports/${id}/summarize`,
  },

  // ─── Notifications ───────────────────────────────────
  notifications: {
    list: `${BASE_URL}/notifications`,
    read: (id) => `${BASE_URL}/notifications/${id}/read`,
    readAll: `${BASE_URL}/notifications/read-all`,
    count: `${BASE_URL}/notifications/unread-count`,
  },

  // ─── Inventory ───────────────────────────────────────
  inventory: {
    list: `${BASE_URL}/inventory`,
    lowStock: `${BASE_URL}/inventory/low-stock`,
    expiryAlerts: `${BASE_URL}/inventory/expiry-alerts`,
    restock: (id) => `${BASE_URL}/inventory/${id}/restock`,
    history: `${BASE_URL}/inventory/purchase-history`,
  },

  // ─── Lab Tests ───────────────────────────────────────
  lab: {
    tests: `${BASE_URL}/lab/tests`,
    book: `${BASE_URL}/lab/book`,
    myTests: `${BASE_URL}/lab/my-tests`,
    result: (id) => `${BASE_URL}/lab/tests/${id}/result`,
  },

  // ─── Ambulance ───────────────────────────────────────
  ambulance: {
    request: `${BASE_URL}/ambulance/request`,
    status: (id) => `${BASE_URL}/ambulance/${id}/status`,
    myRequests: `${BASE_URL}/ambulance/my-requests`,
  },

  // ─── Blood Bank ──────────────────────────────────────
  bloodBank: {
    inventory: `${BASE_URL}/blood-bank/inventory`,
    search: `${BASE_URL}/blood-bank/search`,
    request: `${BASE_URL}/blood-bank/request`,
    myRequests: `${BASE_URL}/blood-bank/my-requests`,
  },

  // ─── Feedback ────────────────────────────────────────
  feedback: {
    submit: `${BASE_URL}/feedback`,
    list: `${BASE_URL}/feedback`,
    doctorRatings: (id) => `${BASE_URL}/feedback/doctor/${id}`,
    hospitalRatings: (id) => `${BASE_URL}/feedback/hospital/${id}`,
  },

  // ─── Health Records ──────────────────────────────────
  health: {
    records: `${BASE_URL}/health/records`,
    addRecord: `${BASE_URL}/health/records`,
    vitals: `${BASE_URL}/health/vitals`,
    bmi: `${BASE_URL}/health/bmi`,
  },

  // ─── Prescriptions ───────────────────────────────────
  prescriptions: {
    list: `${BASE_URL}/prescriptions`,
    detail: (id) => `${BASE_URL}/prescriptions/${id}`,
    create: `${BASE_URL}/prescriptions`,
    download: (id) => `${BASE_URL}/prescriptions/${id}/download`,
  },

  // ─── Medicine Reminders ──────────────────────────────
  reminders: {
    list: `${BASE_URL}/reminders`,
    add: `${BASE_URL}/reminders`,
    update: (id) => `${BASE_URL}/reminders/${id}`,
    delete: (id) => `${BASE_URL}/reminders/${id}`,
  },

  // ─── Queue Management ────────────────────────────────
  queue: {
    current: `${BASE_URL}/queue/current`,
    myToken: `${BASE_URL}/queue/my-token`,
    generate: `${BASE_URL}/queue/generate`,
  },

  // ─── Bed Management ──────────────────────────────────
  beds: {
    list: `${BASE_URL}/beds`,
    update: (id) => `${BASE_URL}/beds/${id}`,
    availability: `${BASE_URL}/beds/availability`,
  },

  // ─── Settings ────────────────────────────────────────
  settings: {
    get: `${BASE_URL}/settings`,
    update: `${BASE_URL}/settings`,
  },

  search: {
    global: `${BASE_URL}/search`,
  },
};

export default API_URLS;
