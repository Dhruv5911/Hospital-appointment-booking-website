import { useState, useEffect } from 'react';
import { Building2, Search, MapPin, Star, Clock, Phone, ChevronRight, Filter } from 'lucide-react';
import hospitalService from '../../services/hospitalService';
import EmptyState from '../ui/EmptyState';

export default function HospitalSearch({ onSelectHospital }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', emergency: '', city: '' });
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => { loadHospitals(); }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const params = { q: search };
      if (filters.type) params.type = filters.type;
      if (filters.emergency) params.emergency = filters.emergency;
      if (filters.city) params.city = filters.city;
      const data = await hospitalService.search(params);
      setHospitals(data.hospitals || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); loadHospitals(); };

  const sorted = [...hospitals].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="glass-card p-5">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search hospitals..." className="form-input pl-10" />
          </div>
          <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="form-input w-auto min-w-[150px]">
            <option value="">All Types</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
          </select>
          <select value={filters.emergency} onChange={e => setFilters({...filters, emergency: e.target.value})} className="form-input w-auto min-w-[150px]">
            <option value="">Emergency</option>
            <option value="true">Has Emergency</option>
          </select>
          <input type="text" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})}
            placeholder="City" className="form-input w-auto min-w-[120px]" />
          <button type="submit" className="btn btn-primary"><Search size={16} /> Search</button>
        </form>
        <div className="flex items-center gap-3 mt-3">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort:</span>
          {['rating', 'name'].map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition ${sortBy === s ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {s === 'rating' ? 'Top Rated' : 'Name'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map(h => (
            <div key={h.id} onClick={() => onSelectHospital?.(h)}
              className="glass-card p-5 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition">{h.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={13} /> {h.city || 'N/A'}</p>
                </div>
                <span className={`badge ${h.hospital_type === 'government' ? 'badge-info' : 'badge-neutral'}`}>{h.hospital_type}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /> {h.rating || 'N/A'}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {h.phone || 'N/A'}</span>
                {h.has_emergency && <span className="badge badge-danger">Emergency</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{h.doctor_count || 0} doctors</span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Building2 size={48} />} title="No hospitals found" description="Try adjusting your search filters." />
      )}
    </div>
  );
}
