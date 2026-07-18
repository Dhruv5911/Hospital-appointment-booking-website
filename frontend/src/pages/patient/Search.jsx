import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Building2, Stethoscope, Pill, Calendar, HeartPulse, Filter, ArrowRight } from 'lucide-react';
import searchService from '../../services/searchService';
import EmptyState from '../../components/ui/EmptyState';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const filters = [
    { id: 'all', label: 'All Results' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'doctor', label: 'Doctors' },
    { id: 'medicine', label: 'Medicines' },
    { id: 'department', label: 'Departments' },
    { id: 'appointment', label: 'Appointments' }
  ];

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchService.globalSearch(query, activeFilter);
        setResults(data.results || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, activeFilter]);

  const getIcon = (type) => {
    switch(type) {
      case 'hospital': return <Building2 size={20} className="text-purple-500"/>;
      case 'doctor': return <Stethoscope size={20} className="text-teal-500"/>;
      case 'medicine': return <Pill size={20} className="text-emerald-500"/>;
      case 'department': return <HeartPulse size={20} className="text-rose-500"/>;
      case 'appointment': return <Calendar size={20} className="text-sky-500"/>;
      default: return <SearchIcon size={20} className="text-slate-500"/>;
    }
  };

  const handleResultClick = (result) => {
    switch(result.type) {
      case 'hospital': navigate('/patient/hospitals'); break;
      case 'doctor': navigate('/patient/hospitals'); break; // Replace with actual doctor page when available
      case 'medicine': navigate('/patient/pharmacy'); break;
      case 'appointment': navigate('/patient/appointments'); break;
      default: break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Search Header */}
      <div className="glass-card p-6 text-center">
        <h2 className="text-2xl font-bold mb-6">Global Search</h2>
        
        <div className="relative max-w-2xl mx-auto mb-6">
          <SearchIcon size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, doctors, medicines, or appointments..."
            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-lg outline-none focus:border-emerald-500 transition-colors shadow-sm"
            autoFocus
          />
          {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex items-center gap-2 mr-2 text-slate-500 font-medium text-sm">
            <Filter size={16}/> Filters:
          </div>
          {filters.map(f => (
            <button 
              key={f.id} 
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeFilter === f.id 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        {query.trim().length > 0 && query.trim().length < 2 && (
          <p className="text-center text-slate-500 my-10">Type at least 2 characters to search...</p>
        )}
        
        {query.trim().length >= 2 && !loading && results.length === 0 && (
          <div className="my-10">
            <EmptyState 
              icon={<SearchIcon size={48} />} 
              title="No Results Found" 
              description={`We couldn't find anything matching "${query}" in ${filters.find(f => f.id === activeFilter)?.label.toLowerCase()}. Try adjusting your search or filters.`} 
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-500 mb-4 px-2">Showing {results.length} results</h3>
            {results.map((result) => (
              <div 
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-400 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                    {result.title}
                  </h4>
                  <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {result.type}
                  </span>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
