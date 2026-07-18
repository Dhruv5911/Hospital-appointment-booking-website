import { useState } from 'react';
import { Bell, Plus, Trash2, Sun, Cloud, Moon as MoonIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function MedicineReminder() {
  const toast = useToast();
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ name: '', dose: '', morning: false, afternoon: false, night: false });

  const handleAdd = () => {
    if (!form.name || !form.dose) { toast.warning('Fill name and dose'); return; }
    setReminders(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: '', dose: '', morning: false, afternoon: false, night: false });
    toast.success('Reminder added');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center"><Bell size={24} /></div>
          <div><h2 className="text-xl font-bold">Medicine Reminders</h2><p className="text-sm text-slate-500">Set daily medicine schedules</p></div>
        </div>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="form-label">Medicine Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" placeholder="e.g. Paracetamol" /></div>
            <div><label className="form-label">Dose</label>
              <input type="text" value={form.dose} onChange={e => setForm({...form, dose: e.target.value})} className="form-input" placeholder="e.g. 500mg" /></div>
          </div>
          <div className="flex gap-3">
            {[{k:'morning',l:'Morning',i:<Sun size={16}/>},{k:'afternoon',l:'Afternoon',i:<Cloud size={16}/>},{k:'night',l:'Night',i:<MoonIcon size={16}/>}].map(t=>(
              <button key={t.k} onClick={()=>setForm({...form,[t.k]:!form[t.k]})}
                className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 text-sm font-medium transition ${form[t.k]?'border-emerald-500 bg-emerald-50 text-emerald-700':'border-slate-200 text-slate-400'}`}>
                {t.i}{t.l}
              </button>
            ))}
          </div>
          <button onClick={handleAdd} className="btn btn-primary w-full"><Plus size={16}/> Add Reminder</button>
        </div>
      </div>
      {reminders.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">Active Reminders</h3>
          {reminders.map(r=>(
            <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
              <div><p className="font-bold text-sm">{r.name} — {r.dose}</p>
                <div className="flex gap-2 mt-1">{r.morning&&<span className="badge badge-warning">AM</span>}{r.afternoon&&<span className="badge badge-info">PM</span>}{r.night&&<span className="badge badge-neutral">Night</span>}</div>
              </div>
              <button onClick={()=>{setReminders(p=>p.filter(x=>x.id!==r.id));toast.info('Removed');}} className="text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
