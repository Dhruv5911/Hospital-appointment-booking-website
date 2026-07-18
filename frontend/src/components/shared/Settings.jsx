import { Moon, Sun, Globe, User, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { LANGUAGES } from '../../utils/constants';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function Settings() {
  const { isDark, toggleTheme, language, setLanguage } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const saveProfile = () => { toast.success('Profile updated'); };
  const changePassword = () => {
    if (!passwords.current || !passwords.new) { toast.warning('Fill all fields'); return; }
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    toast.success('Password changed');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Appearance */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">{isDark ? <Moon size={18}/> : <Sun size={18}/>} Appearance</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div><p className="font-medium text-sm">Dark Mode</p><p className="text-xs text-slate-500">Toggle dark/light theme</p></div>
          <button onClick={toggleTheme} className={`w-12 h-7 rounded-full p-1 transition ${isDark ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-5' : ''}`}/>
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Globe size={18}/> Language</h3>
        <div className="grid grid-cols-3 gap-3">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLanguage(l.code)}
              className={`p-3 rounded-xl border-2 text-center transition ${language === l.code ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <p className="font-bold text-sm">{l.nativeName}</p>
              <p className="text-xs text-slate-500">{l.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><User size={18}/> Edit Profile</h3>
        <div className="space-y-3">
          <div><label className="form-label">Name</label><input type="text" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} className="form-input"/></div>
          <div><label className="form-label">Email</label><input type="email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})} className="form-input"/></div>
          <div><label className="form-label">Phone</label><input type="tel" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} className="form-input" placeholder="Phone number"/></div>
          <button onClick={saveProfile} className="btn btn-primary">Save Changes</button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={18}/> Change Password</h3>
        <div className="space-y-3">
          <input type="password" value={passwords.current} onChange={e=>setPasswords({...passwords,current:e.target.value})} className="form-input" placeholder="Current password"/>
          <input type="password" value={passwords.new} onChange={e=>setPasswords({...passwords,new:e.target.value})} className="form-input" placeholder="New password"/>
          <input type="password" value={passwords.confirm} onChange={e=>setPasswords({...passwords,confirm:e.target.value})} className="form-input" placeholder="Confirm new password"/>
          <button onClick={changePassword} className="btn btn-primary">Change Password</button>
        </div>
      </div>
    </div>
  );
}
