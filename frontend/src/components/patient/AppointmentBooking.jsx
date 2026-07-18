import { useState, useEffect } from 'react';
import { Building2, Stethoscope, Calendar, Clock, Check, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import hospitalService from '../../services/hospitalService';
import appointmentService from '../../services/appointmentService';
import { useToast } from '../../context/ToastContext';

const STEPS = ['Hospital', 'Doctor', 'Date & Time', 'Review'];

export default function AppointmentBooking() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    hospitalService.search({}).then(d => setHospitals(d.hospitals || [])).catch(console.error);
  }, []);

  const selectHospital = async (h) => {
    setSelectedHospital(h);
    setLoading(true);
    try {
      const data = await hospitalService.getById(h.id);
      setDoctors(data.hospital?.doctors || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
    setStep(1);
  };

  const selectDoctor = (d) => { setSelectedDoctor(d); setStep(2); };

  const loadSlots = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/patient/doctors/${selectedDoctor.id}/slots?date=${date}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (e) { console.error(e); }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await appointmentService.book(selectedSlot.id, reason);
      toast.success('Appointment booked successfully!');
      setStep(0); setSelectedHospital(null); setSelectedDoctor(null);
      setSelectedSlot(null); setReason(''); setSlots([]);
    } catch (e) { toast.error(e.message); }
    finally { setBooking(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Stepper */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i <= step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden md:block ${i <= step ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Hospital Selection */}
      {step === 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {hospitals.map(h => (
            <div key={h.id} onClick={() => selectHospital(h)} className="glass-card p-5 cursor-pointer group hover:border-emerald-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Building2 size={18} /></div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{h.name}</h3>
                  <p className="text-xs text-slate-500">{h.city}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">{h.doctor_count || 0} doctors • Rating: {h.rating || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Doctor Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <button onClick={() => setStep(0)} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</button>
          {loading ? <div className="skeleton h-32 rounded-2xl" /> : (
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map(d => (
                <div key={d.id} onClick={() => selectDoctor(d)} className="glass-card p-5 cursor-pointer group hover:border-emerald-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center"><Stethoscope size={18} /></div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{d.name}</h3>
                      <p className="text-xs text-slate-500">{d.specialty}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{d.qualification} • {d.experience_years}y exp • ₹{d.fee}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</button>
          <div className="glass-card p-6">
            <label className="form-label flex items-center gap-2"><Calendar size={16} /> Select Date</label>
            <input type="date" value={selectedDate} onChange={e => loadSlots(e.target.value)}
              min={new Date().toISOString().split('T')[0]} className="form-input mb-6" />

            {selectedDate && (
              <>
                <label className="form-label flex items-center gap-2"><Clock size={16} /> Available Slots</label>
                {slots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {slots.map(s => (
                      <button key={s.id} onClick={() => setSelectedSlot(s)}
                        className={`py-2 px-3 rounded-xl text-sm font-medium border transition ${
                          selectedSlot?.id === s.id
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white dark:bg-slate-800 border-slate-200 hover:border-emerald-300'
                        }`}>
                        {s.slot_time}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">No slots available for this date.</p>}
              </>
            )}

            <div className="mt-6">
              <label className="form-label flex items-center gap-2"><FileText size={16} /> Reason (optional)</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                className="form-input" rows="2" placeholder="Describe your reason..." />
            </div>

            {selectedSlot && (
              <button onClick={() => setStep(3)} className="btn btn-primary mt-4 w-full">
                Continue <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <button onClick={() => setStep(2)} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</button>
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold">Review Your Appointment</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Hospital</span><p className="font-semibold">{selectedHospital?.name}</p></div>
              <div><span className="text-slate-500">Doctor</span><p className="font-semibold">{selectedDoctor?.name}</p></div>
              <div><span className="text-slate-500">Date</span><p className="font-semibold">{selectedDate}</p></div>
              <div><span className="text-slate-500">Time</span><p className="font-semibold">{selectedSlot?.slot_time}</p></div>
              <div><span className="text-slate-500">Fee</span><p className="font-semibold">₹{selectedDoctor?.fee}</p></div>
              {reason && <div className="col-span-2"><span className="text-slate-500">Reason</span><p className="font-semibold">{reason}</p></div>}
            </div>
            <button onClick={handleBook} disabled={booking} className="btn btn-primary w-full btn-lg">
              {booking ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={18} />}
              {booking ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
