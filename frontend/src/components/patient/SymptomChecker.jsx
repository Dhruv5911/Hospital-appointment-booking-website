import { useState } from 'react';
import { Brain, AlertTriangle, Stethoscope, Building2, Shield } from 'lucide-react';
import aiService from '../../services/aiService';
import { useToast } from '../../context/ToastContext';

export default function SymptomChecker() {
  const toast = useToast();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const quickSymptoms = ['headache', 'fever', 'cough', 'chest pain', 'fatigue', 'nausea', 'dizziness', 'joint pain', 'skin rash', 'sore throat'];

  const handleCheck = async () => {
    if (!symptoms.trim()) { toast.warning('Please describe your symptoms'); return; }
    setLoading(true);
    try {
      const data = await aiService.checkSymptoms(symptoms);
      setResult(data);
    } catch (e) { toast.error(e.message || 'AI service unavailable. Please try again later.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center"><Brain size={24} /></div>
          <div>
            <h2 className="text-xl font-bold">AI Symptom Checker</h2>
            <p className="text-sm text-slate-500">Describe your symptoms for AI-powered analysis</p>
          </div>
        </div>

        <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows="4"
          className="form-input mb-4" placeholder="I have been experiencing headache, mild fever, and fatigue for 3 days..." />

        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {quickSymptoms.map(s => (
              <button key={s} onClick={() => setSymptoms(p => p ? `${p}, ${s}` : s)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium transition">{s}</button>
            ))}
          </div>
        </div>

        <button onClick={handleCheck} disabled={loading} className="btn btn-primary w-full">
          {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Brain size={18} />}
          {loading ? 'Analyzing...' : 'Check Symptoms'}
        </button>
      </div>

      {result && (
        <div className="glass-card p-6 space-y-5 animate-fade-in-up">
          <h3 className="text-lg font-bold">Analysis Results</h3>
          {result.possible_diseases?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2"><Stethoscope size={16} /> Possible Conditions</p>
              <div className="space-y-2">
                {(result.possible_diseases || []).map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="font-medium text-sm">{d.name || d}</span>
                    {d.confidence && <span className="badge badge-info">{d.confidence}%</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.recommended_department && (
            <div className="flex items-center gap-3 p-4 bg-sky-50 dark:bg-sky-900/30 rounded-xl">
              <Building2 size={20} className="text-sky-600" />
              <div>
                <p className="text-xs text-slate-500">Recommended Department</p>
                <p className="font-bold text-sky-700">{result.recommended_department}</p>
              </div>
            </div>
          )}
          {result.emergency_warning && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/30 rounded-xl">
              <AlertTriangle size={20} className="text-rose-600" />
              <p className="font-semibold text-rose-700">{result.emergency_warning}</p>
            </div>
          )}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div className="flex items-center gap-2 mb-1"><Shield size={16} className="text-amber-600" /><span className="font-bold text-amber-700 text-sm">Medical Disclaimer</span></div>
            <p className="text-xs text-amber-700">This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult a doctor for accurate diagnosis.</p>
          </div>
        </div>
      )}
    </div>
  );
}
