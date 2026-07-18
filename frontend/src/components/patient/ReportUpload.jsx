import { useState } from 'react';
import { Upload, FileText, Brain, Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import reportService from '../../services/reportService';

export default function ReportUpload() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [type, setType] = useState('blood');
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleUpload = async () => {
    if (!file) { toast.warning('Select a file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      await reportService.upload(fd);
      toast.success('Report uploaded');
      setReports(prev => [...prev, { name: file.name, type, date: new Date().toLocaleDateString() }]);
      setFile(null);
    } catch (e) { toast.error(e.message || 'Upload service unavailable');
      setReports(prev => [...prev, { name: file.name, type, date: new Date().toLocaleDateString() }]);
      setFile(null);
    } finally { setUploading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><FileText size={24}/></div>
          <div><h2 className="text-xl font-bold">Medical Reports</h2><p className="text-sm text-slate-500">Upload and manage your reports</p></div>
        </div>
        <div className="space-y-4">
          <select value={type} onChange={e => setType(e.target.value)} className="form-input">
            <option value="blood">Blood Report</option><option value="xray">X-Ray</option>
            <option value="mri">MRI</option><option value="ecg">ECG</option>
            <option value="urine">Urine Test</option><option value="other">Other</option>
          </select>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
            <Upload size={32} className="mx-auto text-slate-400 mb-3"/>
            <p className="text-sm text-slate-500 mb-3">Drag and drop or click to upload</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.dicom" onChange={e => setFile(e.target.files[0])} className="block mx-auto text-sm"/>
            {file && <p className="mt-2 text-sm font-medium text-emerald-600">{file.name}</p>}
          </div>
          <button onClick={handleUpload} disabled={uploading || !file} className="btn btn-primary w-full">
            {uploading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Upload size={16}/>}
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>
      </div>
      {reports.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">Uploaded Reports</h3>
          {reports.map((r,i)=>(
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
              <div className="flex items-center gap-3"><FileText size={18} className="text-indigo-500"/><div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-slate-500">{r.type} • {r.date}</p></div></div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" title="AI Summary"><Brain size={14}/></button>
                <button className="btn btn-ghost btn-sm" title="Download"><Download size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
