import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Pill, AlertTriangle, FileText, Heart, Activity, Clock,
  Building2, Brain, ArrowRight, Droplets, Footprints, Flame, TrendingUp,
  Stethoscope, Upload, MessageSquare, Star, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import hospitalService from '../../services/hospitalService';
import medicineService from '../../services/medicineService';
import './DashboardHome.css';

const DUMMY_DOCTORS = [];

const DUMMY_REPORTS = [];

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ upcomingAppts: [], recentOrders: [], nearbyHospitals: [], loading: true });

  useEffect(() => {
    async function loadSummary() {
      try {
        const [aData, hData, mData] = await Promise.all([
          appointmentService.getMyAppointments().catch(() => ({ appointments: [] })),
          hospitalService.search({ limit: 4 }).catch(() => ({ hospitals: [] })),
          medicineService.getOrders().catch(() => ({ orders: [] })),
        ]);
        setData({
          upcomingAppts: (aData?.appointments || []).filter(a => a.status === 'booked' || a.status === 'confirmed').slice(0, 3),
          recentOrders: (mData?.orders || []).slice(0, 2),
          nearbyHospitals: (hData?.hospitals || []).slice(0, 4),
          loading: false,
        });
      } catch {
        setData(prev => ({ ...prev, loading: false }));
      }
    }
    loadSummary();
  }, []);

  const quickActions = [
    { label: 'Book Appointment', icon: <Calendar size={20} />, color: '#00E5A8', bg: 'var(--accent-muted)', path: '/patient/appointments' },
    { label: 'Emergency', icon: <AlertTriangle size={20} />, color: '#EF4444', bg: 'var(--danger-muted)', path: '/patient/emergency' },
    { label: 'Order Medicine', icon: <Pill size={20} />, color: '#38BDF8', bg: 'var(--secondary-muted)', path: '/patient/pharmacy' },
    { label: 'Find Hospital', icon: <Building2 size={20} />, color: '#8b5cf6', bg: 'var(--purple-muted)', path: '/patient/hospitals' },
    { label: 'Upload Report', icon: <Upload size={20} />, color: '#F59E0B', bg: 'var(--warning-muted)', path: '/patient/reports' },
    { label: 'Talk with AI', icon: <MessageSquare size={20} />, color: '#ec4899', bg: 'var(--pink-muted)', path: '/patient/symptoms' },
  ];

  const healthMetrics = [
    { label: 'Health Score', value: '87', unit: '/100', icon: <Heart size={18} />, color: '#00E5A8' },
    { label: 'Water Intake', value: '6', unit: '/8 glasses', icon: <Droplets size={18} />, color: '#38BDF8' },
    { label: 'Steps Today', value: '7,234', unit: 'steps', icon: <Footprints size={18} />, color: '#8b5cf6' },
    { label: 'BMI', value: '22.4', unit: 'normal', icon: <Flame size={18} />, color: '#F59E0B' },
  ];

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="dashboard">
      {/* Welcome Hero */}
      <div className="dash-hero animate-fade-in">
        <div className="dash-hero-content">
          <p className="dash-hero-greeting">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</p>
          <h1 className="dash-hero-name">{firstName} 👋</h1>
          <p className="dash-hero-text">Your smart health dashboard is ready. Book appointments, track medicines, or use AI health tools.</p>
          <div className="dash-hero-actions">
            <Link to="/patient/appointments" className="btn btn-primary">Book Appointment</Link>
            <Link to="/patient/symptoms" className="btn btn-secondary">AI Health Chat</Link>
          </div>
        </div>
        <div className="dash-hero-visual">
          <Activity size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Health Metrics */}
      <div className="dash-metrics animate-fade-in-up stagger-1">
        {healthMetrics.map((m, i) => (
          <div key={i} className="dash-metric-card glass-card-static">
            <div className="dash-metric-icon" style={{ color: m.color, background: `${m.color}18` }}>
              {m.icon}
            </div>
            <div className="dash-metric-info">
              <span className="dash-metric-value">{m.value}<small>{m.unit}</small></span>
              <span className="dash-metric-label">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Health Suggestion */}
      <div className="dash-ai-card glass-card-static animate-fade-in-up stagger-2">
        <div className="dash-ai-icon"><Brain size={20} /></div>
        <div className="dash-ai-content">
          <h4>AI Health Suggestion</h4>
          <p>Based on your recent activity, consider increasing your daily water intake and scheduling a routine blood test. Your health score has improved by 5% this week.</p>
        </div>
        <Link to="/patient/symptoms" className="btn btn-sm btn-outline">Ask AI</Link>
      </div>

      {/* Quick Actions */}
      <section className="dash-section animate-fade-in-up stagger-3">
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
        </div>
        <div className="dash-actions-grid">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.path} className="dash-action-card glass-card glass-card-accent">
              <div className="dash-action-icon" style={{ color: a.color, background: a.bg }}>
                {a.icon}
              </div>
              <span className="dash-action-label">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <div className="dash-grid">
        {/* Upcoming Appointments */}
        <section className="dash-card glass-card-static animate-fade-in-up stagger-4">
          <div className="section-header">
            <h3 className="section-title"><Calendar size={18} style={{ color: 'var(--secondary)' }} /> Upcoming</h3>
            <Link to="/patient/appointments" className="section-link">View All</Link>
          </div>
          {data.upcomingAppts.length > 0 ? (
            <div className="dash-list">
              {data.upcomingAppts.map(a => (
                <div key={a.id} className="dash-appt-item">
                  <div className="dash-appt-date">
                    <span className="dash-appt-month">{a.slot_date?.split('-')[1]}</span>
                    <span className="dash-appt-day">{a.slot_date?.split('-')[2]}</span>
                  </div>
                  <div className="dash-appt-info">
                    <p className="dash-appt-doctor">{a.doctor_name}</p>
                    <p className="dash-appt-hospital">{a.hospital_name}</p>
                  </div>
                  <span className="badge badge-info">{a.slot_time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <Clock size={28} />
              <p>No upcoming appointments</p>
              <Link to="/patient/appointments" className="btn btn-sm btn-primary">Book Now</Link>
            </div>
          )}
        </section>

        {/* Recommended Doctors */}
        <section className="dash-card glass-card-static animate-fade-in-up stagger-5">
          <div className="section-header">
            <h3 className="section-title"><Stethoscope size={18} style={{ color: 'var(--accent)' }} /> Top Doctors</h3>
            <Link to="/patient/hospitals" className="section-link">View All</Link>
          </div>
          {DUMMY_DOCTORS.length > 0 ? (
            <div className="dash-list">
              {DUMMY_DOCTORS.map(d => (
                <div key={d.id} className="dash-doctor-item">
                  <div className="avatar avatar-md" style={{ background: d.online ? 'linear-gradient(135deg,#00E5A8,#38BDF8)' : 'linear-gradient(135deg,#64748b,#475569)' }}>
                    {d.name.charAt(4)}
                  </div>
                  <div className="dash-doctor-info">
                    <p className="dash-doctor-name">{d.name}</p>
                    <p className="dash-doctor-spec">{d.specialty} · {d.exp}</p>
                  </div>
                  <div className="dash-doctor-rating">
                    <Star size={12} fill="var(--warning)" color="var(--warning)" />
                    <span>{d.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <Stethoscope size={28} />
              <p>No saved doctors</p>
              <Link to="/patient/hospitals" className="btn btn-sm btn-outline" style={{ marginTop: 'var(--space-2)' }}>Find Doctors</Link>
            </div>
          )}
        </section>

        {/* Nearby Hospitals */}
        <section className="dash-card glass-card-static animate-fade-in-up stagger-6">
          <div className="section-header">
            <h3 className="section-title"><Building2 size={18} style={{ color: 'var(--purple)' }} /> Nearby Hospitals</h3>
            <Link to="/patient/hospitals" className="section-link">View All</Link>
          </div>
          {data.nearbyHospitals.length > 0 ? (
            <div className="dash-list">
              {data.nearbyHospitals.map(h => (
                <div key={h.id} className="dash-hospital-item">
                  <div>
                    <p className="dash-hospital-name">{h.name}</p>
                    <p className="dash-hospital-city"><MapPin size={11} /> {h.city} · ⭐ {h.rating}</p>
                  </div>
                  <Link to="/patient/hospitals" className="dash-hospital-arrow"><ArrowRight size={14} /></Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <Building2 size={28} />
              <p>No hospitals found</p>
            </div>
          )}
        </section>

        {/* Recent Reports */}
        <section className="dash-card glass-card-static animate-fade-in-up stagger-7">
          <div className="section-header">
            <h3 className="section-title"><FileText size={18} style={{ color: 'var(--warning)' }} /> Recent Reports</h3>
            <Link to="/patient/reports" className="section-link">View All</Link>
          </div>
          {DUMMY_REPORTS.length > 0 ? (
            <div className="dash-list">
              {DUMMY_REPORTS.map(r => (
                <div key={r.id} className="dash-report-item">
                  <div className="dash-report-icon"><FileText size={16} /></div>
                  <div className="dash-report-info">
                    <p className="dash-report-name">{r.name}</p>
                    <p className="dash-report-date">{r.type} · {r.date}</p>
                  </div>
                  <button className="btn btn-sm btn-ghost">View</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <FileText size={28} />
              <p>No reports uploaded</p>
              <Link to="/patient/reports" className="btn btn-sm btn-outline" style={{ marginTop: 'var(--space-2)' }}>Upload Report</Link>
            </div>
          )}
        </section>
      </div>

      {/* Emergency Card */}
      <div className="dash-emergency animate-fade-in-up stagger-8">
        <div className="dash-emergency-content">
          <h3><AlertTriangle size={20} /> Emergency Ready</h3>
          <p>Run an AI prediction if you feel unwell, or call emergency services instantly.</p>
          <Link to="/patient/emergency" className="btn btn-danger">
            <AlertTriangle size={16} /> Emergency SOS
          </Link>
        </div>
        <Heart size={80} strokeWidth={1} className="dash-emergency-icon" />
      </div>
    </div>
  );
}
