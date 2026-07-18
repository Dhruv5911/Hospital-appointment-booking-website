import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Droplets, Activity, Clock, 
  Edit, Lock, LogOut, ChevronRight, ShoppingBag, Pill, FileText, 
  AlertTriangle, Building2, Stethoscope, Star, Bell 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/ui/Avatar';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [profileData, setProfileData] = useState({
    phone: 'Not Available',
    address: 'Not Available',
    age: 'Not Available',
    gender: 'Not Available',
    bloodGroup: 'Not Available',
    joinedDate: 'Not Available'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { API } = await import('../../api');
        const data = await API.get('/profile');
        setProfileData({
          phone: data?.phone || 'Not Available',
          address: data?.address || 'Not Available',
          age: data?.age ? `${data.age} Years` : 'Not Available',
          gender: data?.gender || 'Not Available',
          bloodGroup: data?.bloodGroup || 'Not Available',
          joinedDate: data?.joinedDate || 'Not Available'
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const sections = [
    { title: 'My Appointments', icon: <Calendar size={18} className="text-sky-500"/>, path: '/patient/appointments', count: 0 },
    { title: 'My Orders', icon: <ShoppingBag size={18} className="text-emerald-500"/>, path: '/patient/orders', count: 0 },
    { title: 'Medicine Reminders', icon: <Pill size={18} className="text-rose-500"/>, path: '/patient/reminders', count: 0 },
    { title: 'Uploaded Reports', icon: <FileText size={18} className="text-purple-500"/>, path: '/patient/reports', count: 0 },
    { title: 'Emergency History', icon: <AlertTriangle size={18} className="text-amber-500"/>, path: '/patient/emergency', count: 0 },
    { title: 'Saved Hospitals', icon: <Building2 size={18} className="text-indigo-500"/>, path: '/patient/hospitals', count: 0 },
    { title: 'Saved Doctors', icon: <Stethoscope size={18} className="text-teal-500"/>, path: '/patient/hospitals', count: 0 },
    { title: 'Feedback History', icon: <Star size={18} className="text-yellow-500"/>, path: '/patient/feedback', count: 0 },
    { title: 'Notification History', icon: <Bell size={18} className="text-slate-500"/>, path: '/patient/notifications', count: 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="glass-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-sky-500"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
            <div className="p-1 bg-white dark:bg-slate-900 rounded-full inline-block">
              <Avatar name={user?.name} size="lg" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold">{user?.name}</h2>
              <p className="text-slate-500 flex items-center gap-2"><Mail size={14}/> {user?.email} • {profileData.joinedDate}</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Link to="/patient/settings" className="btn btn-secondary btn-sm flex-1 md:flex-none"><Edit size={14}/> Edit Profile</Link>
              <Link to="/patient/settings" className="btn btn-secondary btn-sm flex-1 md:flex-none"><Lock size={14}/> Change Password</Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm flex-1 md:flex-none"><LogOut size={14}/> Logout</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center"><Phone size={18}/></div>
              <div><p className="text-xs text-slate-500">Phone</p><p className="font-semibold text-sm">{profileData.phone}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Activity size={18}/></div>
              <div><p className="text-xs text-slate-500">Age & Gender</p><p className="font-semibold text-sm">{profileData.age} • {profileData.gender}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><Droplets size={18}/></div>
              <div><p className="text-xs text-slate-500">Blood Group</p><p className="font-semibold text-sm text-rose-600">{profileData.bloodGroup}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><MapPin size={18}/></div>
              <div className="min-w-0"><p className="text-xs text-slate-500">Address</p><p className="font-semibold text-sm truncate" title={profileData.address}>{profileData.address}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Sections */}
      <h3 className="text-xl font-bold pt-4">Your Activity</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sec, i) => (
          <div key={i} className="glass-card p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {sec.icon}
              </div>
              <h4 className="font-bold flex-1">{sec.title}</h4>
              <span className="text-xl font-black text-slate-300 dark:text-slate-700">{sec.count}</span>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to={sec.path} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-between group">
                View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
