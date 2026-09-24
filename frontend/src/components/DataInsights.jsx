import React from 'react';
import { Database } from 'lucide-react';

export const DataInsights = () => {
  const datasetStats = [
    { label: 'Raw records', value: '70,000', note: 'Before cleaning' },
    { label: 'Rows removed', value: '1,557', note: '2.22% (Outlier BP values filtered)' },
    { label: 'Final records', value: '68,443', note: 'Used for training & validation' }
  ];

  const idealRanges = [
    { label: 'Blood Pressure', value: '~120 / 80 mmHg', desc: 'Normal resting pressure' },
    { label: 'Cholesterol (Total)', value: '< 200 mg/dL', desc: 'Desirable serum level' },
    { label: 'Fasting Glucose', value: '70–99 mg/dL', desc: 'Normal fasting blood sugar' },
    { label: 'BMI', value: '18.5–24.9', desc: 'Healthy body mass index range' },
    { label: 'Resting Heart Rate', value: '60–100 bpm', desc: 'Normal resting pulse' },
    { label: 'Activity', value: '≥ 150 min/week', desc: 'Recommended moderate exercise' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-bold uppercase">
          <Database className="w-3.5 h-3.5" />
          EDA &amp; Dataset Summary
        </div>
        <h2 className="text-3xl font-black text-white">Data Source &amp; Hygiene</h2>
        <p className="text-sm text-slate-400">
          The dataset is sourced from patient clinical records with a final preprocessed dataset of 68,443 records.
        </p>
      </div>

      {/* 3 Metric Cards matching SOP Page 9 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {datasetStats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800/60 space-y-2 bg-slate-950/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {stat.label}
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {stat.value}
            </div>
            <p className="text-xs text-slate-400">
              {stat.note}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid: Understanding CVD & Ideal Ranges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Understanding CVD */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/60 space-y-6 bg-slate-950/80">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-2">Understanding CVD</h3>
            <p className="text-xs text-slate-400">What CVD is, how it affects life, and clinical risk factors.</p>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              Cardiovascular disease (CVD) is an umbrella term for conditions affecting the heart and blood vessels — including coronary artery disease, heart attack, and stroke. Lifestyle, metabolic health (blood pressure, cholesterol, glucose), and age are common key drivers.
            </p>

            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                <span><strong className="text-white">Impact:</strong> Reduces physical capacity, increases long-term care needs, and raises risk of sudden events.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                <span><strong className="text-white">Prevention:</strong> Early detection of risk factors (BP, cholesterol, BMI, glucose, activity) decreases long-term risk.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Ideal Ranges matching SOP Page 9 */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/60 space-y-6 bg-slate-950/80">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-2">Ideal Ranges</h3>
            <p className="text-xs text-slate-400">Common healthy clinical targets</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {idealRanges.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">{item.label}</span>
                <span className="text-sm font-extrabold text-white font-mono block">{item.value}</span>
                <span className="text-[10px] text-slate-400 block">{item.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center text-slate-400">
            Values outside these ranges can increase cardiovascular risk when combined.
          </p>
        </div>

      </div>

    </div>
  );
};
