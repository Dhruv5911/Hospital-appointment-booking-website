import { useState } from 'react';
import { Building2, MapPin, Star, Phone, Clock, Search, Filter, Heart, ArrowRight, Shield } from 'lucide-react';

const HOSPITALS = [
  { id: 1, name: 'Apollo Hospital', city: 'Mumbai', rating: 4.8, departments: ['Cardiology','Neurology','Orthopedics'], emergency: true, distance: '2.3 km', beds: 450 },
  { id: 2, name: 'Fortis Healthcare', city: 'Delhi', rating: 4.7, departments: ['Oncology','Pediatrics','ENT'], emergency: true, distance: '3.1 km', beds: 320 },
  { id: 3, name: 'Max Hospital', city: 'Gurgaon', rating: 4.6, departments: ['Dermatology','Gynecology','Urology'], emergency: true, distance: '5.2 km', beds: 280 },
  { id: 4, name: 'AIIMS Delhi', city: 'Delhi', rating: 4.9, departments: ['All Specialties'], emergency: true, distance: '8.0 km', beds: 1200 },
  { id: 5, name: 'Medanta Hospital', city: 'Gurgaon', rating: 4.7, departments: ['Heart','Liver','Kidney'], emergency: true, distance: '6.5 km', beds: 600 },
  { id: 6, name: 'Columbia Asia', city: 'Bangalore', rating: 4.5, departments: ['General','Orthopedics','Dental'], emergency: false, distance: '4.8 km', beds: 150 },
];

export default function HospitalsPage() {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState([]);
  const filtered = HOSPITALS.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div><h1 className="text-2xl font-bold">Find Hospitals</h1><p className="text-secondary" style={{ marginTop: 4 }}>Discover nearby hospitals and clinics</p></div>
      </div>

      {/* Map Placeholder */}
      <div style={{ height: 200, borderRadius: 'var(--radius)', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, var(--accent-muted) 0%, transparent 60%)' }} />
        <div style={{ zIndex: 1, textAlign: 'center' }}>
          <MapPin size={32} style={{ margin: '0 auto 8px', color: 'var(--accent)' }} />
          <p style={{ fontSize: 'var(--text-sm)' }}>Map View — Add Google Maps API key for live map</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="input-wrapper" style={{ flex: 1 }}>
          <span className="form-icon"><Search size={18} /></span>
          <input className="form-input form-input-icon" placeholder="Search hospitals by name or city..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-secondary"><Filter size={16} /> Filters</button>
      </div>

      {/* Hospital Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
        {filtered.map((h, i) => (
          <div key={h.id} className="glass-card-static animate-fade-in-up" style={{ padding: 'var(--space-5)', animationDelay: `${i * 0.05}s` }}>
            {/* Image Placeholder */}
            <div style={{ height: 120, borderRadius: 'var(--radius-sm)', background: `linear-gradient(135deg, ${h.emergency ? 'rgba(0,229,168,0.1)' : 'rgba(139,92,246,0.1)'}, var(--bg-card))`, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>{h.name}</h3>
              <button onClick={() => setSaved(p => p.includes(h.id) ? p.filter(x => x !== h.id) : [...p, h.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved.includes(h.id) ? 'var(--danger)' : 'var(--text-muted)' }}>
                <Heart size={18} fill={saved.includes(h.id) ? 'var(--danger)' : 'none'} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {h.city} · {h.distance}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={13} fill="var(--warning)" color="var(--warning)" /> {h.rating}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {h.departments.slice(0, 3).map(d => <span key={d} className="badge badge-neutral">{d}</span>)}
              {h.emergency && <span className="badge badge-danger"><Shield size={10} /> Emergency</span>}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Book Appointment</button>
              <button className="btn btn-secondary btn-sm"><ArrowRight size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
