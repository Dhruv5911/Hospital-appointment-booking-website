/**
 * Application Constants
 */

export const APP_NAME = 'MediBook';
export const APP_TAGLINE = 'Smart Hospital Management Platform';

export const ROLES = {
  PATIENT: 'patient',
  ADMIN: 'hospital_admin',
};

export const APPOINTMENT_STATUS = {
  BOOKED: 'booked',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  RESCHEDULED: 'rescheduled',
  REJECTED: 'rejected',
};

export const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const EMERGENCY_LEVELS = {
  CRITICAL: { label: 'Emergency', color: '#ef4444', bg: '#fef2f2' },
  MODERATE: { label: 'Moderate', color: '#f59e0b', bg: '#fffbeb' },
  NORMAL: { label: 'Normal', color: '#22c55e', bg: '#f0fdf4' },
};

export const DEPARTMENTS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Gynecology',
  'Pediatrics', 'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry',
  'Urology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Endocrinology',
  'General Medicine', 'General Surgery', 'Radiology', 'Pathology', 'Emergency Medicine',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const LAB_TESTS = [
  { id: 'blood', name: 'Blood Test', icon: '🩸', price: 500, duration: '2 hours' },
  { id: 'xray', name: 'X-Ray', icon: '📷', price: 800, duration: '30 mins' },
  { id: 'mri', name: 'MRI', icon: '🧲', price: 5000, duration: '1 hour' },
  { id: 'ecg', name: 'ECG', icon: '💓', price: 600, duration: '15 mins' },
  { id: 'urine', name: 'Urine Test', icon: '🧪', price: 300, duration: '1 hour' },
];

export const MEDICINE_CATEGORIES = [
  'Pain Relief', 'Antibiotic', 'Antihistamine', 'Antacid', 'Diabetes',
  'Cholesterol', 'Blood Pressure', 'Supplement', 'Respiratory',
  'Cardiac', 'Anti-inflammatory', 'Antifungal', 'Vitamins',
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard', appointments: 'Appointments', hospitals: 'Hospitals',
    pharmacy: 'Pharmacy', emergency: 'Emergency', doctors: 'Doctors',
    reports: 'Reports', settings: 'Settings', notifications: 'Notifications',
    logout: 'Logout', profile: 'Profile', search: 'Search',
    bookAppointment: 'Book Appointment', viewAll: 'View All',
    welcome: 'Welcome', loading: 'Loading...', noData: 'No data available',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    submit: 'Submit', confirm: 'Confirm', back: 'Back', next: 'Next',
  },
  hi: {
    dashboard: 'डैशबोर्ड', appointments: 'अपॉइंटमेंट', hospitals: 'अस्पताल',
    pharmacy: 'फार्मेसी', emergency: 'आपातकाल', doctors: 'डॉक्टर',
    reports: 'रिपोर्ट', settings: 'सेटिंग्स', notifications: 'सूचनाएं',
    logout: 'लॉगआउट', profile: 'प्रोफाइल', search: 'खोजें',
    bookAppointment: 'अपॉइंटमेंट बुक करें', viewAll: 'सभी देखें',
    welcome: 'स्वागत है', loading: 'लोड हो रहा है...', noData: 'कोई डेटा नहीं',
    save: 'सेव करें', cancel: 'रद्द करें', delete: 'हटाएं', edit: 'संपादित करें',
    submit: 'जमा करें', confirm: 'पुष्टि करें', back: 'वापस', next: 'अगला',
  },
  pa: {
    dashboard: 'ਡੈਸ਼ਬੋਰਡ', appointments: 'ਅਪੌਇੰਟਮੈਂਟ', hospitals: 'ਹਸਪਤਾਲ',
    pharmacy: 'ਫਾਰਮੇਸੀ', emergency: 'ਐਮਰਜੈਂਸੀ', doctors: 'ਡਾਕਟਰ',
    reports: 'ਰਿਪੋਰਟ', settings: 'ਸੈਟਿੰਗ', notifications: 'ਸੂਚਨਾਵਾਂ',
    logout: 'ਲੌਗਆਊਟ', profile: 'ਪ੍ਰੋਫਾਈਲ', search: 'ਖੋਜ',
    bookAppointment: 'ਅਪੌਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ', viewAll: 'ਸਭ ਦੇਖੋ',
    welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ', loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', noData: 'ਕੋਈ ਡੇਟਾ ਨਹੀਂ',
    save: 'ਸੰਭਾਲੋ', cancel: 'ਰੱਦ ਕਰੋ', delete: 'ਮਿਟਾਓ', edit: 'ਸੰਪਾਦਿਤ ਕਰੋ',
    submit: 'ਜਮ੍ਹਾ ਕਰੋ', confirm: 'ਪੁਸ਼ਟੀ ਕਰੋ', back: 'ਪਿੱਛੇ', next: 'ਅੱਗੇ',
  },
};
