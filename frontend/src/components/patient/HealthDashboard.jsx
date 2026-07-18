import { useState } from 'react';
import { Heart, Activity, TrendingUp } from 'lucide-react';
import { useEffect, useRef } from 'react';

function MiniChart({ data, color = '#10b981', height = 60 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = height * 2;
    ctx.scale(2, 2);
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = canvas.offsetWidth / (data.length - 1 || 1);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 10) - 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, color, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} />;
}

export default function HealthDashboard() {
  const [records] = useState({
    weight: [72, 71.5, 71, 70.8, 71.2, 70.5, 70],
    bp: [120, 118, 122, 119, 121, 117, 120],
    sugar: [95, 100, 98, 102, 97, 99, 96],
    heartRate: [72, 75, 70, 73, 71, 74, 72],
  });

  const cards = [
    { label: 'Weight (kg)', data: records.weight, value: records.weight[records.weight.length-1], color: '#3b82f6', icon: <TrendingUp size={18}/> },
    { label: 'Blood Pressure', data: records.bp, value: records.bp[records.bp.length-1] + '/80', color: '#ef4444', icon: <Activity size={18}/> },
    { label: 'Blood Sugar', data: records.sugar, value: records.sugar[records.sugar.length-1] + ' mg/dL', color: '#f59e0b', icon: <Heart size={18}/> },
    { label: 'Heart Rate', data: records.heartRate, value: records.heartRate[records.heartRate.length-1] + ' bpm', color: '#10b981', icon: <Heart size={18}/> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: c.color+'20', color: c.color}}>{c.icon}</div>
                <span className="text-sm font-semibold text-slate-600">{c.label}</span>
              </div>
              <span className="text-lg font-bold">{c.value}</span>
            </div>
            <MiniChart data={c.data} color={c.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
