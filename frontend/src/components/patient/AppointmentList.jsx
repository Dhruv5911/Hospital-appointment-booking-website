import { useState, useEffect } from 'react';
import { Calendar, XCircle, Eye } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { useToast } from '../../context/ToastContext';

export default function AppointmentList() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Use placeholder endpoint or service. appointmentService uses the placeholder now.
      const data = await appointmentService.getMyAppointments();
      setAppointments(data.appointments || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const statusBadge = (s) => {
    const map = { booked: 'info', confirmed: 'success', completed: 'success', cancelled: 'danger', rescheduled: 'warning', rejected: 'danger' };
    return <Badge variant={map[s] || 'neutral'} dot>{s}</Badge>;
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'booked', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === f ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Appointment ID</th>
                  <th className="px-6 py-4">Hospital Name</th>
                  <th className="px-6 py-4">Doctor Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">#{a.id}</td>
                    <td className="px-6 py-4">{a.hospital_name || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium">{a.doctor_name || 'N/A'}</td>
                    <td className="px-6 py-4">{a.department || 'N/A'}</td>
                    <td className="px-6 py-4">{a.slot_date || 'N/A'}</td>
                    <td className="px-6 py-4">{a.slot_time || 'N/A'}</td>
                    <td className="px-6 py-4">{statusBadge(a.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="btn btn-secondary btn-sm p-2" title="View Details">
                          <Eye size={16} />
                        </button>
                        {(a.status === 'booked' || a.status === 'confirmed') && (
                          <button onClick={() => handleCancel(a.id)} className="btn btn-danger btn-sm p-2" title="Cancel Appointment">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={<Calendar size={48} />} title="No appointments found." description="Book your first appointment to get started." />
      )}
    </div>
  );
}
