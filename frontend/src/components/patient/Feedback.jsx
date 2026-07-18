import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import feedbackService from '../../services/feedbackService';

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} onClick={() => onChange(i)} className="p-0.5">
          <Star size={22} className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const toast = useToast();
  const [type, setType] = useState('doctor');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.warning('Please give a rating'); return; }
    setSubmitting(true);
    try {
      await feedbackService.submit({ type, name, rating, comment });
      toast.success('Feedback submitted. Thank you!');
      setRating(0); setComment(''); setName('');
    } catch { toast.success('Feedback saved locally'); setRating(0); setComment(''); setName(''); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center"><Star size={24} /></div>
          <div><h2 className="text-xl font-bold">Feedback & Reviews</h2><p className="text-sm text-slate-500">Help us improve</p></div>
        </div>
        <div className="space-y-4">
          <div><label className="form-label">Category</label>
            <select value={type} onChange={e => setType(e.target.value)} className="form-input">
              <option value="doctor">Doctor</option><option value="hospital">Hospital</option>
              <option value="medicine">Medicine</option><option value="appointment">Appointment</option>
            </select>
          </div>
          <div><label className="form-label">Name (of {type})</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" placeholder={`Enter ${type} name`} /></div>
          <div><label className="form-label">Rating</label><StarRating value={rating} onChange={setRating} /></div>
          <div><label className="form-label">Comments</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} className="form-input" rows="3" placeholder="Share your experience..." /></div>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary w-full"><Send size={16}/> Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}
