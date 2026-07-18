import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Building2, Pill, AlertTriangle,
  Stethoscope, TestTube, FileText, Brain, Search, ShoppingBag,
  Settings, LogOut, X, User, Heart
} from 'lucide-react';
import './Sidebar.css';

const patientNav = [
  { type: 'label', text: 'Main' },
  { id: 'dashboard', path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', path: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { id: 'hospitals', path: '/patient/hospitals', label: 'Find Hospitals', icon: Building2 },
  { id: 'doctors', path: '/patient/doctors', label: 'Doctors', icon: Stethoscope },
  { type: 'label', text: 'Pharmacy' },
  { id: 'pharmacy', path: '/patient/pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'orders', path: '/patient/orders', label: 'Orders', icon: ShoppingBag },
  { type: 'label', text: 'AI & Emergency' },
  { id: 'emergency', path: '/patient/emergency', label: 'Emergency', icon: AlertTriangle },
  { id: 'symptoms', path: '/patient/symptoms', label: 'AI Symptom Checker', icon: Brain },
  { id: 'search', path: '/patient/search', label: 'Global Search', icon: Search },
  { type: 'label', text: 'Health' },
  { id: 'lab', path: '/patient/lab', label: 'Lab Tests', icon: TestTube },
  { id: 'reports', path: '/patient/reports', label: 'Medical Reports', icon: FileText },
  { id: 'health', path: '/patient/health', label: 'Health Dashboard', icon: Heart },
  { type: 'label', text: 'Account' },
  { id: 'profile', path: '/patient/profile', label: 'Profile', icon: User },
  { id: 'settings', path: '/patient/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ user, onLogout, role = 'patient', isOpen, onClose }) {
  const sidebarRef = useRef(null);
  const navItems = role === 'patient' ? patientNav : patientNav; // admin can be different

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      setTimeout(() => document.addEventListener('click', onClick), 10);
    }
    return () => document.removeEventListener('click', onClick);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'sidebar-overlay-visible' : ''}`} onClick={onClose} />

      {/* Sidebar Panel */}
      <aside ref={sidebarRef} className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{ background: 'linear-gradient(135deg, #00E5A8, #38BDF8)' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name || 'User'}</p>
              <p className="sidebar-user-role">{user?.role === 'hospital_admin' ? 'Administrator' : 'Patient'}</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.type === 'label') {
              return (
                <div key={i} className="sidebar-label">
                  {item.text}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-item sidebar-logout" onClick={() => { onLogout(); onClose(); }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
