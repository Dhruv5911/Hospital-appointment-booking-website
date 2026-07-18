import { Bed } from 'lucide-react';

const BEDS = [
  { type: 'ICU Beds', total: 50, available: 12, color: '#ef4444' },
  { type: 'General Beds', total: 200, available: 45, color: '#3b82f6' },
  { type: 'Ventilator', total: 20, available: 5, color: '#f59e0b' },
  { type: 'Oxygen Beds', total: 30, available: 8, color: '#10b981' },
];

export default function BedAvailability({ isAdmin }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center"><Bed size={24}/></div>
          <div><h2 className="text-xl font-bold">Bed Availability</h2><p className="text-sm text-slate-500">{isAdmin ? 'Manage bed allocation' : 'View real-time availability'}</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {BEDS.map(b => {
            const pct = Math.round((b.available / b.total) * 100);
            return (
              <div key={b.type} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm">{b.type}</span>
                  <span className="text-lg font-bold" style={{color: b.color}}>{b.available}<span className="text-slate-400 text-sm font-normal">/{b.total}</span></span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background: b.color}}/>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">{pct}% available</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
