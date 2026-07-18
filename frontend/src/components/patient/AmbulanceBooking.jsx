import { useState } from 'react';
import { Ambulance as AmbIcon, Phone, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ambulanceService from '../../services/ambulanceService';

export default function AmbulanceBooking() {
  const toast = useToast();
  const [location, setLocation] = useState('');
  const [emergency, setEmergency] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    if (!location.trim() || !phone.trim()) { toast.warning('Please fill location and phone'); return; }
    setLoading(true);
    try {
      await ambulanceService.request({ location, emergency_type: emergency, phone });
      toast.success('Ambulance requested! Help is on the way.');
      setRequested(true);
    } catch (e) { toast.error(e.message || 'Service unavailable'); }
    finally { setLoading(false); }
  };

  if (requested) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="glass-card p-10">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse-glow"><AmbIcon size={36} /></div>
          <h2 className="text-2xl font-bold mb-2">Ambulance Requested!</h2>
          <p className="text-slate-500 mb-6">Our team has been notified. Help is on the way to your location.</p>
          <div className="flex items-center justify-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <Clock size={18} className="text-amber-600" />
            <span className="font-semibold text-amber-700">Estimated arrival: 10-15 minutes</span>
          </div>
          <button onClick={() => setRequested(false)} className="btn btn-secondary mt-6">Request Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Emergency Button */}
      <button onClick={handleRequest} disabled={loading || !location || !phone}
        className="w-full py-8 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white flex flex-col items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
        <AmbIcon size={48} />
        <span className="text-2xl font-bold">Request Ambulance</span>
        <span className="text-rose-200 text-sm">Tap after filling details below</span>
      </button>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="form-label flex items-center gap-2"><MapPin size={14} /> Your Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="form-input" placeholder="Enter your address or landmark" />
        </div>
        <div>
          <label className="form-label flex items-center gap-2"><Phone size={14} /> Contact Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" placeholder="Your phone number" />
        </div>
        <div>
          <label className="form-label flex items-center gap-2"><AlertTriangle size={14} /> Emergency Type</label>
          <select value={emergency} onChange={e => setEmergency(e.target.value)} className="form-input">
            <option value="">Select type</option>
            <option>Accident</option><option>Heart Attack</option><option>Stroke</option>
            <option>Breathing Difficulty</option><option>Unconscious</option><option>Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
