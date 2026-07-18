import { useState } from 'react';
import { Bell, Check, CheckCheck, Calendar, Pill, AlertTriangle, ShoppingBag, FileText } from 'lucide-react';
import { getRelativeTime } from '../../utils/formatters';

const SAMPLE_NOTIFS = [
  { id: 1, type: 'appointment', title: 'Appointment Confirmed', message: 'Your appointment with Dr. Sharma is confirmed for tomorrow.', time: new Date(Date.now()-3600000).toISOString(), read: false },
  { id: 2, type: 'medicine', title: 'Medicine Reminder', message: 'Time to take Paracetamol 500mg', time: new Date(Date.now()-7200000).toISOString(), read: false },
  { id: 3, type: 'order', title: 'Order Shipped', message: 'Your medicine order TRK1234 has been shipped.', time: new Date(Date.now()-86400000).toISOString(), read: true },
];

const icons = { appointment: <Calendar size={16}/>, medicine: <Pill size={16}/>, emergency: <AlertTriangle size={16}/>, order: <ShoppingBag size={16}/>, report: <FileText size={16}/> };
const colors = { appointment: 'bg-sky-100 text-sky-600', medicine: 'bg-amber-100 text-amber-600', emergency: 'bg-rose-100 text-rose-600', order: 'bg-emerald-100 text-emerald-600', report: 'bg-purple-100 text-purple-600' };

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFS);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Bell size={20}/><h2 className="text-xl font-bold">Notifications</h2>{unread > 0 && <span className="badge badge-danger">{unread}</span>}</div>
        {unread > 0 && <button onClick={markAllRead} className="btn btn-ghost btn-sm"><CheckCheck size={14}/> Mark all read</button>}
      </div>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markRead(n.id)} className={`glass-card p-4 flex items-start gap-3 cursor-pointer transition ${!n.read ? 'border-l-4 border-l-emerald-500' : 'opacity-70'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[n.type] || 'bg-slate-100 text-slate-500'}`}>{icons[n.type] || <Bell size={16}/>}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{n.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
            <p className="text-[10px] text-slate-400 mt-1">{getRelativeTime(n.time)}</p>
          </div>
          {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"/>}
        </div>
      ))}
    </div>
  );
}
