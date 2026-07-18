import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star, X, RefreshCw, Download, Filter, ChevronRight } from 'lucide-react';
import './AppointmentsPage.css';

const DUMMY = [];

const TABS = [
  { id: 'upcoming', label: 'Upcoming', count: 0 },
  { id: 'completed', label: 'Completed', count: 0 },
  { id: 'cancelled', label: 'Cancelled', count: 0 },
];

export default function AppointmentsPage() {
  const [tab, setTab] = useState('upcoming');

  const filtered = DUMMY.filter(a => {
    if (tab === 'upcoming') return a.status === 'booked' || a.status === 'confirmed';
    if (tab === 'completed') return a.status === 'completed';
    return a.status === 'cancelled';
  });

  const statusBadge = (s) => {
    const map = { booked: 'info', confirmed: 'accent', completed: 'success', cancelled: 'danger' };
    return map[s] || 'neutral';
  };

  return (
    <div className="appts-page page-container">
      <div className="appts-header">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>Manage your medical appointments</p>
        </div>
        <Link to="/patient/hospitals" className="btn btn-primary"><Calendar size={16} /> Book New</Link>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            <span className="appts-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {filtered.length > 0 ? (
        <div className="appts-list">
          {filtered.map((a, i) => (
            <div key={a.id} className="appts-card glass-card-static animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="appts-card-left">
                <div className="appts-date-box">
                  <span className="appts-date-month">{new Date(a.date).toLocaleString('en', { month: 'short' })}</span>
                  <span className="appts-date-day">{new Date(a.date).getDate()}</span>
                </div>
                <div className="appts-info">
                  <h4 className="appts-doctor">{a.doctor_name}</h4>
                  <p className="appts-spec">{a.specialty}</p>
                  <div className="appts-meta">
                    <span><MapPin size={12} /> {a.hospital}</span>
                    <span><Clock size={12} /> {a.time}</span>
                  </div>
                </div>
              </div>
              <div className="appts-card-right">
                <span className={`badge badge-${statusBadge(a.status)}`}>{a.status}</span>
                <p className="appts-fee">₹{a.fee}</p>
                <div className="appts-actions">
                  {tab === 'upcoming' && (
                    <>
                      <button className="btn btn-sm btn-ghost"><RefreshCw size={14} /> Reschedule</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}><X size={14} /> Cancel</button>
                    </>
                  )}
                  {tab === 'completed' && (
                    <button className="btn btn-sm btn-ghost"><Download size={14} /> Prescription</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-tertiary)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius)', background: 'var(--secondary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', color: 'var(--secondary)' }}>
            <Calendar size={28} />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>No {tab} appointments</h3>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>You don't have any {tab} appointments to show.</p>
          <Link to="/patient/hospitals" className="btn btn-primary">Find a Doctor</Link>
        </div>
      )}
    </div>
  );
}
