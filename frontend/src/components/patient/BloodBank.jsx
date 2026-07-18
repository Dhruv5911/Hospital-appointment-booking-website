import { useState } from 'react';
import { Droplets, Search, Send } from 'lucide-react';
import { BLOOD_GROUPS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import bloodBankService from '../../services/bloodBankService';

export default function BloodBank() {
  const toast = useToast();
  const [searchGroup, setSearchGroup] = useState('');
  const [requestGroup, setRequestGroup] = useState('');
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState('');
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    if (!requestGroup || !hospital) { toast.warning('Fill all fields'); return; }
    setRequesting(true);
    try {
      await bloodBankService.requestBlood({ blood_group: requestGroup, units, hospital });
      toast.success('Blood request submitted');
      setRequestGroup(''); setUnits(1); setHospital('');
    } catch (e) { toast.error(e.message || 'Service unavailable'); }
    finally { setRequesting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Blood Group Display */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center"><Droplets size={24} /></div>
          <div><h2 className="text-xl font-bold">Blood Bank</h2><p className="text-sm text-slate-500">Check availability and request blood</p></div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
          {BLOOD_GROUPS.map(g => (
            <button key={g} onClick={() => setSearchGroup(g)}
              className={`p-3 rounded-xl text-center font-bold border-2 transition ${searchGroup === g ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-200 dark:border-slate-700 hover:border-rose-300'}`}>
              {g}
            </button>
          ))}
        </div>
        {searchGroup && <p className="text-sm text-slate-500">Showing availability for <strong className="text-rose-600">{searchGroup}</strong> — Contact blood bank for real-time status.</p>}
      </div>

      {/* Request Blood */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4">Request Blood</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="form-label">Blood Group</label>
            <select value={requestGroup} onChange={e => setRequestGroup(e.target.value)} className="form-input">
              <option value="">Select</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Units Required</label>
            <input type="number" min="1" max="10" value={units} onChange={e => setUnits(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Hospital Name</label>
            <input type="text" value={hospital} onChange={e => setHospital(e.target.value)} className="form-input" placeholder="For which hospital?" />
          </div>
        </div>
        <button onClick={handleRequest} disabled={requesting} className="btn btn-danger w-full">
          {requesting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
          Submit Blood Request
        </button>
      </div>
    </div>
  );
}
