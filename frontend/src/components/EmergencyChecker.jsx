import { useState } from 'react';
import { AlertTriangle, Activity, Heart, Thermometer, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import emergencyService from '../services/emergencyService';

export default function EmergencyChecker() {
  const toast = useToast();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    if (!symptoms.trim()) { toast.warning('Please enter your symptoms'); return; }
    if (!age) { toast.warning('Please enter your age'); return; }
    setLoading(true);
    try {
      const data = await emergencyService.predict(
        symptoms, parseInt(age), gender,
        heartRate ? parseInt(heartRate) : null,
        bloodPressure || null,
        temperature ? parseFloat(temperature) : null
      );
      setResult(data);
    } catch (e) {
      toast.error(e.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    'CRITICAL': 'bg-rose-100 text-rose-700 border-rose-300',
    'MODERATE': 'bg-amber-100 text-amber-700 border-amber-300',
    'NORMAL': 'bg-emerald-100 text-emerald-700 border-emerald-300'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner"><AlertTriangle size={28}/></div>
          <div>
            <h2 className="text-2xl font-bold">Emergency Risk Predictor</h2>
            <p className="text-slate-500 text-sm mt-1">Get an instant risk assessment based on your symptoms and vitals.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <h3 className="font-bold text-lg border-b pb-2">Basic Info & Symptoms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">Age</label><input type="number" value={age} onChange={e=>setAge(e.target.value)} className="form-input"/></div>
              <div><label className="form-label">Gender</label>
                <select value={gender} onChange={e=>setGender(e.target.value)} className="form-input">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select></div>
            </div>
            <div>
              <label className="form-label">Describe Symptoms</label>
              <textarea value={symptoms} onChange={e=>setSymptoms(e.target.value)} className="form-input" rows="4" placeholder="e.g. Severe chest pain, shortness of breath, sweating"/>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="font-bold text-lg border-b pb-2">Vitals (Optional)</h3>
            <div>
              <label className="form-label flex items-center gap-2"><Heart size={14} className="text-rose-500"/> Heart Rate (bpm)</label>
              <input type="number" value={heartRate} onChange={e=>setHeartRate(e.target.value)} className="form-input" placeholder="e.g. 85"/>
            </div>
            <div>
              <label className="form-label flex items-center gap-2"><Activity size={14} className="text-sky-500"/> Blood Pressure</label>
              <input type="text" value={bloodPressure} onChange={e=>setBloodPressure(e.target.value)} className="form-input" placeholder="e.g. 120/80"/>
            </div>
            <div>
              <label className="form-label flex items-center gap-2"><Thermometer size={14} className="text-amber-500"/> Temperature (°F)</label>
              <input type="number" step="0.1" value={temperature} onChange={e=>setTemperature(e.target.value)} className="form-input" placeholder="e.g. 98.6"/>
            </div>
          </div>
        </div>

        <button onClick={handlePredict} disabled={loading} className="btn btn-danger w-full btn-lg mt-8 text-lg shadow-xl">
          {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <AlertTriangle size={20}/>}
          {loading ? 'Analyzing...' : 'Predict Emergency Risk'}
        </button>
      </div>

      {result && (
        <div className={`p-6 rounded-2xl border-2 animate-fade-in-up ${severityColors[result.severity] || 'bg-slate-50 border-slate-200'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Risk Level: {result.severity}</h3>
              <p className="font-medium opacity-90">{result.recommendation}</p>
            </div>
            <div className="text-right bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-xs uppercase font-bold tracking-wider opacity-70">Severity Score</p>
              <p className="text-3xl font-black">{result.severity_score}</p>
            </div>
          </div>
          {result.severity === 'CRITICAL' && (
            <div className="mt-6 pt-4 border-t border-rose-200 flex gap-4">
              <button className="btn btn-danger flex-1 shadow-lg shadow-rose-500/30 text-lg py-3">Call Ambulance</button>
              <button className="bg-white text-rose-600 font-bold px-6 rounded-xl hover:bg-rose-50 transition">Find ER</button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 justify-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl max-w-2xl mx-auto">
        <Shield size={14}/>
        <p>This tool is for preliminary assessment only. Always seek professional medical help in an emergency.</p>
      </div>
    </div>
  );
}
