import { useState } from 'react';
import { TestTube, Calendar, Clock, Check } from 'lucide-react';
import { LAB_TESTS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import labService from '../../services/labService';

export default function LabTestBooking() {
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState([]);

  const handleBook = async () => {
    if (!selected || !date) { toast.warning('Select a test and date'); return; }
    setBooking(true);
    try {
      await labService.book({ test_type: selected.id, test_name: selected.name, date, price: selected.price });
      toast.success(`${selected.name} booked for ${date}`);
      setBooked(prev => [...prev, { ...selected, date }]);
      setSelected(null); setDate('');
    } catch (e) { toast.error(e.message || 'Booking service unavailable'); }
    finally { setBooking(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center"><TestTube size={24} /></div>
          <div><h2 className="text-xl font-bold">Book Lab Test</h2><p className="text-sm text-slate-500">Select a test and preferred date</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {LAB_TESTS.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              className={`p-4 rounded-xl border-2 text-left transition ${selected?.id === t.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'}`}>
              <span className="text-2xl mb-2 block">{t.icon}</span>
              <p className="font-bold text-sm">{t.name}</p>
              <p className="text-xs text-slate-500">₹{t.price} • {t.duration}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="space-y-4">
            <div>
              <label className="form-label flex items-center gap-2"><Calendar size={14} /> Select Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="form-input" />
            </div>
            <button onClick={handleBook} disabled={booking} className="btn btn-primary w-full">
              {booking ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
              {booking ? 'Booking...' : `Book ${selected.name} — ₹${selected.price}`}
            </button>
          </div>
        )}
      </div>

      {booked.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">Booked Tests</h3>
          <div className="space-y-2">
            {booked.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <span className="font-medium text-sm">{b.icon} {b.name}</span>
                <span className="text-sm text-slate-500">{b.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
