import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle, RefreshCw, Activity, Heart,
  ShieldAlert, ClipboardList, Stethoscope, TrendingDown,
  ChevronDown, ChevronUp, Zap, Info
} from 'lucide-react';

const RiskGauge = ({ riskPercent, badgeColor }) => {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * riskPercent) / 100;

  const colorMap = {
    rose:    '#f43f5e',
    amber:   '#f59e0b',
    emerald: '#10b981',
  };
  const strokeColor = colorMap[badgeColor] || '#10b981';

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
        <circle cx="88" cy="88" r={radius} stroke="#1e293b" strokeWidth="14" fill="transparent" />
        <circle
          cx="88" cy="88" r={radius}
          stroke={strokeColor}
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white tracking-tight">{riskPercent}%</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Risk Score</span>
      </div>
    </div>
  );
};

const AdviceSection = ({ icon: Icon, title, items, colorClass }) => {
  const [open, setOpen] = useState(true);
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-800/60 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/80 hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colorClass}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>{title}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700/50">
            {items.length}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && (
        <ul className="px-4 py-3 space-y-2 bg-slate-950/60">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ContributionBar = ({ feat }) => {
  const maxImpact = 42;
  const widthPct  = Math.min((feat.impact / maxImpact) * 100, 100);
  const barColor  = feat.is_risk
    ? 'from-rose-500 to-pink-500'
    : 'from-emerald-500 to-teal-500';

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/60 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
        <div className="flex items-center gap-2">
          <span>{feat.name}</span>
          {feat.is_risk && (
            <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-[9px] font-bold text-rose-400 border border-rose-800/50 uppercase">
              Risk
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">{feat.raw}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-400 font-bold border border-slate-700/60">
            {feat.impact}%
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${barColor} h-1.5 rounded-full transition-all duration-700`}
          style={{ width: `${widthPct}%` }}
        />
      </div>

      <div className="flex items-start gap-1.5">
        <Info className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed">{feat.advice || feat.status}</p>
      </div>
    </div>
  );
};

export const RiskResult = ({ result, inputs, onReset }) => {
  if (!result) return null;

  const {
    riskPercent, riskCategory, badgeColor, bmi,
    contributions, confidenceScore, correctiveAdvice,
    paradigm, modelUsed, latencyMs, isBackend, inputWarnings,
  } = result;

  const borderMap = {
    rose:    'border-rose-500/40',
    amber:   'border-amber-500/40',
    emerald: 'border-emerald-500/40',
  };
  const badgeBg = {
    rose:    'bg-rose-500/10 text-rose-400 border-rose-500/30',
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const advice = correctiveAdvice || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className={`glass-panel rounded-3xl p-6 sm:p-10 border ${borderMap[badgeColor] || 'border-slate-700/40'} shadow-2xl relative space-y-8`}>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Diagnostic Output</span>
            <h2 className="text-2xl font-black text-white">Cardiovascular Risk Assessment</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              {isBackend ? (
                <span>Backend ML · <strong className="text-white">{latencyMs}ms</strong></span>
              ) : (
                <span className="text-amber-400">Offline Fallback Mode</span>
              )}
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all cursor-pointer border border-slate-700/50"
            >
              <RefreshCw className="w-4 h-4" />
              New Assessment
            </button>
          </div>
        </div>

        {/* Input warnings */}
        {inputWarnings && inputWarnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-300 space-y-1">
            <strong className="block text-amber-400 mb-1">⚠ Input Adjustments Applied:</strong>
            {inputWarnings.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}

        {/* Main Grid: Gauge + Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* Gauge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800/60 text-center space-y-3">
            <RiskGauge riskPercent={riskPercent} badgeColor={badgeColor} />

            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${badgeBg[badgeColor]}`}>
              {riskCategory} Cardiovascular Risk
            </div>

            <p className="text-xs text-slate-400">
              Model Confidence: <span className="text-white font-bold">{confidenceScore}</span>
            </p>
            <p className="text-[10px] text-slate-500">
              {paradigm} · {modelUsed}
            </p>
          </div>

          {/* Patient Summary + Assessment Note */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patient Clinical Summary</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Age',            value: `${inputs?.age ?? '—'} years` },
                { label: 'Blood Pressure', value: `${inputs?.ap_hi ?? '—'} / ${inputs?.ap_lo ?? '—'} mmHg` },
                { label: 'BMI',            value: `${bmi} kg/m²` },
                { label: 'Cholesterol',    value: inputs?.cholesterol === 3 ? 'Well Above Normal' : inputs?.cholesterol === 2 ? 'Above Normal' : 'Normal' },
                { label: 'Fasting Glucose', value: inputs?.gluc === 3 ? 'Diabetic Range' : inputs?.gluc === 2 ? 'Pre-diabetic' : 'Normal' },
                { label: 'Smoking',        value: inputs?.smoke ? 'Active Smoker' : 'Non-Smoker' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/60">
                  <span className="text-slate-400 block mb-1">{label}</span>
                  <span className="text-white font-bold text-sm">{value}</span>
                </div>
              ))}
            </div>

            {/* Assessment Note */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
              {riskCategory === 'High' ? (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-400 block mb-1">High Cardiovascular Probability Detected</strong>
                    {advice.summary || 'Multiple clinical risk factors are present. Immediate medical evaluation is strongly recommended.'}
                  </div>
                </div>
              ) : riskCategory === 'Moderate' ? (
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400 block mb-1">Moderate Cardiovascular Risk Profile</strong>
                    {advice.summary || 'Several modifiable risk factors identified. Proactive lifestyle changes can significantly reduce your risk.'}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-400 block mb-1">Low Cardiovascular Risk Profile</strong>
                    {advice.summary || 'Your physiological variables align mostly within healthy clinical parameters. Maintain an active lifestyle and balanced diet.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Contributions */}
        {contributions && contributions.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Feature Risk Contributions
              </h3>
              <span className="text-xs text-slate-400">Importance-weighted attribution</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contributions.map((feat, idx) => (
                <ContributionBar key={idx} feat={feat} />
              ))}
            </div>
          </div>
        )}

        {/* Corrective Medical Advice */}
        {(advice.immediateActions || advice.lifestyleChanges || advice.monitoringPlan || advice.medicalReferrals) && (
          <div className="space-y-4 pt-6 border-t border-slate-800/60">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Corrective Medical Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Personalized guidance based on your clinical profile. Always consult a qualified healthcare professional before making medical decisions.
            </p>

            <div className="space-y-3">
              <AdviceSection
                icon={AlertTriangle}
                title="Immediate Actions"
                items={advice.immediateActions}
                colorClass="text-rose-400"
              />
              <AdviceSection
                icon={TrendingDown}
                title="Lifestyle Changes"
                items={advice.lifestyleChanges}
                colorClass="text-amber-400"
              />
              <AdviceSection
                icon={ClipboardList}
                title="Monitoring Plan"
                items={advice.monitoringPlan}
                colorClass="text-cyan-400"
              />
              <AdviceSection
                icon={Stethoscope}
                title="Medical Referrals"
                items={advice.medicalReferrals}
                colorClass="text-violet-400"
              />
            </div>

            <p className="text-[10px] text-slate-500 italic pt-1">
              ⚕ This assessment is generated by an ML model trained on clinical cardiovascular data. It is not a substitute for professional medical diagnosis.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
