import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Stethoscope, TrendingUp, Pill, AlertTriangle, FileText, DollarSign, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import dashboardService from '../services/dashboardService';
import appointmentService from '../services/appointmentService';
import hospitalService from '../services/hospitalService';
import NotificationCenter from '../components/shared/NotificationCenter';
import Settings from '../components/shared/Settings';
import BedAvailability from '../components/shared/BedAvailability';

function SimpleBarChart({ data, labels, color = '#10b981' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500">{v}</span>
          <div className="w-full rounded-t-lg transition-all" style={{ height: `${(v / max) * 100}%`, background: color, minHeight: 4 }} />
          <span className="text-[10px] text-slate-400">{labels?.[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [hospitalForm, setHospitalForm] = useState({});
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: '', qualification: '', experience_years: 0, fee: 500, available_days: 'Mon,Tue,Wed,Thu,Fri' });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, a, h] = await Promise.all([
        dashboardService.getStats().catch(() => ({})),
        appointmentService.getHospitalAppointments().catch(() => ({ appointments: [] })),
        hospitalService.getProfile().catch(() => ({ hospital: null })),
      ]);
      setStats(s);
      setAppointments(a.appointments || []);
      if (h.hospital) {
        setHospital(h.hospital);
        setHospitalForm(h.hospital);
        setDoctors(h.hospital.doctors || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const saveHospital = async () => {
    setSaving(true);
    try {
      const res = await hospitalService.createOrUpdate(hospitalForm);
      setHospital(res.hospital);
      toast.success('Hospital profile saved');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const saveDoctor = async () => {
    setSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
      if (editingDoctor) {
        const res = await fetch(`/api/hospital/doctors/${editingDoctor.id}`, { method: 'PUT', headers, body: JSON.stringify(doctorForm) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success('Doctor updated');
      } else {
        const res = await fetch('/api/hospital/doctors', { method: 'POST', headers, body: JSON.stringify(doctorForm) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success('Doctor added');
      }
      setShowDoctorForm(false); setEditingDoctor(null);
      setDoctorForm({ name: '', specialty: '', qualification: '', experience_years: 0, fee: 500, available_days: 'Mon,Tue,Wed,Thu,Fri' });
      loadData();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteDoctor = async (id) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await fetch(`/api/hospital/doctors/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Doctor deleted');
      loadData();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'analytics': return renderAnalytics();
      case 'hospital': return renderHospitalProfile();
      case 'doctors': return renderDoctors();
      case 'appointments': return renderAppointments();
      case 'medicines': case 'inventory': case 'queue': case 'lab': case 'reports':
        return <div className="glass-card p-10 text-center"><Activity size={48} className="mx-auto text-slate-300 mb-4"/><h2 className="text-xl font-bold mb-2">{activeTab.charAt(0).toUpperCase()+activeTab.slice(1)} Module</h2><p className="text-slate-500">Connect your backend API to enable this module.</p></div>;
      case 'beds': case 'bloodbank': return <BedAvailability isAdmin />;
      case 'notifications': return <NotificationCenter />;
      case 'settings': return <Settings />;
      default: return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={stats?.total_patients || 0} icon={<Users size={20}/>} color="sky"/>
        <StatCard label="Today's Appts" value={stats?.todays_appts || 0} icon={<Calendar size={20}/>} color="emerald"/>
        <StatCard label="Active Doctors" value={stats?.doctors_active || doctors.length} icon={<Stethoscope size={20}/>} color="purple"/>
        <StatCard label="Revenue" value="₹0" icon={<DollarSign size={20}/>} color="amber" trend="+12%" trendUp/>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card p-5">
          <h3 className="font-bold mb-4">Recent Appointments</h3>
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead><tr><th>Patient</th><th>Doctor</th><th>Date/Time</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.slice(0,5).map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.patient_name || 'Patient'}</td>
                    <td className="text-slate-500">{a.doctor_name}</td>
                    <td className="text-slate-500">{a.slot_date} {a.slot_time}</td>
                    <td><Badge variant={a.status==='booked'?'info':a.status==='confirmed'?'success':'neutral'} dot>{a.status}</Badge></td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan="4" className="text-center text-slate-400 py-8">No appointments yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-bold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            {[{n:'Emergency Cases',v:'0',c:'bg-rose-100 text-rose-600'},{n:'Medicines Sold',v:'0',c:'bg-amber-100 text-amber-600'},{n:'Pending Reports',v:'0',c:'bg-purple-100 text-purple-600'}].map(s=>(
              <div key={s.n} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-sm font-medium text-slate-600">{s.n}</span>
                <span className={`badge ${s.c} font-bold`}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-5"><h3 className="font-bold mb-4">Appointments (Last 7 Days)</h3><SimpleBarChart data={[5,8,12,7,15,10,9]} labels={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']}/></div>
        <div className="glass-card p-5"><h3 className="font-bold mb-4">Revenue (Last 7 Days)</h3><SimpleBarChart data={[3000,5000,4500,7000,6500,8000,5500]} labels={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']} color="#3b82f6"/></div>
      </div>
    </div>
  );

  const renderHospitalProfile = () => (
    <div className="max-w-2xl mx-auto glass-card p-6 space-y-4">
      <h3 className="font-bold text-lg mb-2">Hospital Profile</h3>
      {[{k:'name',l:'Hospital Name'},{k:'hospital_type',l:'Type',t:'select',o:['government','private']},{k:'address',l:'Address'},{k:'city',l:'City'},{k:'phone',l:'Phone'},{k:'description',l:'Description',t:'textarea'}].map(f=>(
        <div key={f.k}><label className="form-label">{f.l}</label>
          {f.t==='select'?<select value={hospitalForm[f.k]||''} onChange={e=>setHospitalForm({...hospitalForm,[f.k]:e.target.value})} className="form-input">{f.o.map(o=><option key={o} value={o}>{o}</option>)}</select>
          :f.t==='textarea'?<textarea value={hospitalForm[f.k]||''} onChange={e=>setHospitalForm({...hospitalForm,[f.k]:e.target.value})} className="form-input" rows="3"/>
          :<input type="text" value={hospitalForm[f.k]||''} onChange={e=>setHospitalForm({...hospitalForm,[f.k]:e.target.value})} className="form-input"/>}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hospitalForm.has_emergency||false} onChange={e=>setHospitalForm({...hospitalForm,has_emergency:e.target.checked})} className="rounded"/> Has Emergency</label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Latitude</label><input type="number" step="any" value={hospitalForm.lat||''} onChange={e=>setHospitalForm({...hospitalForm,lat:parseFloat(e.target.value)})} className="form-input"/></div>
        <div><label className="form-label">Longitude</label><input type="number" step="any" value={hospitalForm.lng||''} onChange={e=>setHospitalForm({...hospitalForm,lng:parseFloat(e.target.value)})} className="form-input"/></div>
      </div>
      <div><label className="form-label">Rating</label><input type="number" min="0" max="5" step="0.1" value={hospitalForm.rating||''} onChange={e=>setHospitalForm({...hospitalForm,rating:parseFloat(e.target.value)})} className="form-input"/></div>
      <button onClick={saveHospital} disabled={saving} className="btn btn-primary w-full">{saving?'Saving...':'Save Hospital Profile'}</button>
    </div>
  );

  const renderDoctors = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Doctors ({doctors.length})</h3>
        <button onClick={()=>{setShowDoctorForm(true);setEditingDoctor(null);setDoctorForm({name:'',specialty:'',qualification:'',experience_years:0,fee:500,available_days:'Mon,Tue,Wed,Thu,Fri'});}} className="btn btn-primary btn-sm">+ Add Doctor</button>
      </div>
      {showDoctorForm && (
        <div className="glass-card p-5 space-y-3">
          <h4 className="font-bold">{editingDoctor?'Edit':'Add'} Doctor</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="form-label">Name</label><input type="text" value={doctorForm.name} onChange={e=>setDoctorForm({...doctorForm,name:e.target.value})} className="form-input"/></div>
            <div><label className="form-label">Specialty</label><input type="text" value={doctorForm.specialty} onChange={e=>setDoctorForm({...doctorForm,specialty:e.target.value})} className="form-input"/></div>
            <div><label className="form-label">Qualification</label><input type="text" value={doctorForm.qualification} onChange={e=>setDoctorForm({...doctorForm,qualification:e.target.value})} className="form-input"/></div>
            <div><label className="form-label">Experience (years)</label><input type="number" value={doctorForm.experience_years} onChange={e=>setDoctorForm({...doctorForm,experience_years:parseInt(e.target.value)})} className="form-input"/></div>
            <div><label className="form-label">Fee (₹)</label><input type="number" value={doctorForm.fee} onChange={e=>setDoctorForm({...doctorForm,fee:parseFloat(e.target.value)})} className="form-input"/></div>
            <div><label className="form-label">Available Days</label><input type="text" value={doctorForm.available_days} onChange={e=>setDoctorForm({...doctorForm,available_days:e.target.value})} className="form-input" placeholder="Mon,Tue,Wed"/></div>
          </div>
          <div className="flex gap-2"><button onClick={saveDoctor} disabled={saving} className="btn btn-primary">{saving?'Saving...':'Save'}</button><button onClick={()=>setShowDoctorForm(false)} className="btn btn-secondary">Cancel</button></div>
        </div>
      )}
      <div className="space-y-3">
        {doctors.map(d=>(
          <div key={d.id} className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">{d.name}</p>
              <p className="text-sm text-slate-500">{d.specialty} • {d.qualification} • {d.experience_years}y • ₹{d.fee}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>{setEditingDoctor(d);setDoctorForm(d);setShowDoctorForm(true);}} className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={()=>deleteDoctor(d.id)} className="btn btn-ghost btn-sm text-rose-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="glass-card p-5">
      <h3 className="font-bold mb-4">All Appointments</h3>
      <div className="overflow-x-auto">
        <table className="modern-table">
          <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>
            {appointments.map(a=>(
              <tr key={a.id}><td className="font-medium">{a.patient_name}</td><td>{a.doctor_name}</td><td>{a.slot_date}</td><td>{a.slot_time}</td>
                <td><Badge variant={a.status==='booked'?'info':'success'} dot>{a.status}</Badge></td></tr>
            ))}
            {appointments.length===0&&<tr><td colSpan="5" className="text-center py-8 text-slate-400">No appointments</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <DashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} role="hospital_admin">
      {renderTab()}
    </DashboardLayout>
  );
}
