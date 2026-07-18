import { ClipboardList, Download } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export default function Prescriptions() {
  const prescriptions = [];
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center"><ClipboardList size={24}/></div>
          <div><h2 className="text-xl font-bold">Prescriptions</h2><p className="text-sm text-slate-500">View and download your prescriptions</p></div>
        </div>
        {prescriptions.length > 0 ? prescriptions.map((p,i)=>(
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
            <div><p className="font-bold text-sm">{p.doctor}</p><p className="text-xs text-slate-500">{p.date}</p></div>
            <button className="btn btn-ghost btn-sm"><Download size={14}/> PDF</button>
          </div>
        )) : <EmptyState icon={<ClipboardList size={48}/>} title="No prescriptions yet" description="Prescriptions from your doctors will appear here."/>}
      </div>
    </div>
  );
}
