import React, { useState } from 'react';
import {
  CheckCircle2, User, Activity, Heart, RefreshCw,
  AlertTriangle, Cpu, Zap, TrendingDown, ClipboardList,
  Stethoscope, ChevronDown, ChevronUp, Info,
} from 'lucide-react';

// ─── Collapsible advice section ───────────────────────────────────────────────
const AdviceSection = ({ icon: Icon, title, items, colorClass }) => {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-800/60 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
          <span className={`text-[11px] font-bold uppercase tracking-wider ${colorClass}`}>{title}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px] font-bold text-slate-300 border border-slate-700/50">
            {items.length}
          </span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </button>
      {open && (
        <ul className="px-4 py-3 space-y-1.5 bg-slate-950/60">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Feature contribution mini-bar ───────────────────────────────────────────
const MiniContrib = ({ feat }) => {
  const maxImpact = 42;
  const widthPct  = Math.min((feat.impact / maxImpact) * 100, 100);
  return (
    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-semibold truncate">{feat.name}</span>
          {feat.is_risk && (
            <span className="px-1 py-0.5 rounded bg-rose-950/80 text-[8px] font-bold text-rose-400 border border-rose-800/50 uppercase shrink-0">
              Risk
            </span>
          )}
        </div>
        <span className="font-mono font-bold text-cyan-400 shrink-0 ml-2">{feat.impact}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all duration-700 ${feat.is_risk ? 'bg-rose-500' : 'bg-emerald-500'}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      {feat.advice && (
        <div className="flex items-start gap-1">
          <Info className="w-2.5 h-2.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-500 leading-relaxed">{feat.advice}</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const SubmittedDataView = ({ data, predictionResult, onReset }) => {
  if (!data) return null;

  const heightM = (parseFloat(data.height) || 165) / 100;
  const weightKg = parseFloat(data.weight) || 70;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  const formatGender  = (val) => (parseInt(val) === 2 ? 'Male' : 'Female');
  const formatLevel   = (val) => {
    const lvl = parseInt(val);
    if (lvl === 3) return '3: Well Above Normal';
    if (lvl === 2) return '2: Above Normal';
    return '1: Normal';
  };
  const formatYesNo   = (val) => (parseInt(val) === 1 ? 'Yes' : 'No');
  const formatActive  = (val) => (parseInt(val) === 1 ? 'Active (≥ 150 min/wk)' : 'Inactive / Sedentary');

  const riskCategory    = predictionResult?.riskCategory    || 'Moderate';
  const riskPercent     = predictionResult?.riskPercent     ?? 50;
  const badgeColor      = predictionResult?.badgeColor      || 'amber';
  const paradigm        = predictionResult?.paradigm        || 'Hybrid Ensemble';
  const confidenceScore = predictionResult?.confidenceScore || '80.54% ROC-AUC';
  const contributions   = predictionResult?.contributions   || [];
  const correctiveAdvice = predictionResult?.correctiveAdvice || {};
  const isBackend       = predictionResult?.isBackend       ?? false;
  const latencyMs       = predictionResult?.latencyMs       ?? null;
  const inputWarnings   = predictionResult?.inputWarnings   || [];

  const borderMap = {
    rose:    'border-rose-500/40',
    amber:   'border-amber-500/40',
    emerald: 'border-emerald-500/40',
  };
  const badgeBg = {
    rose:    'bg-rose-950/80 text-rose-300 border-rose-800/60',
    amber:   'bg-amber-950/80 text-amber-300 border-amber-800/60',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  };

  // SVG gauge
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset  = circumference - (circumference * riskPercent) / 100;
  const strokeColorMap = { rose: '#f43f5e', amber: '#f59e0b', emerald: '#10b981' };
  const strokeColor = strokeColorMap[badgeColor] || '#10b981';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800/60 shadow-2xl space-y-8 bg-slate-950/90">

        {/* Success Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Data Status: Processed by ML Ensemble
              </span>
              <h2 className="text-2xl font-black text-white">Patient Assessment Summary</h2>
            </div>
          </div>
          <button
            onClick={onReset}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            New Data Entry
          </button>
        </div>

        {/* Input warnings */}
        {inputWarnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-300 space-y-1">
            <strong className="block text-amber-400 mb-1">⚠ Input Adjustments Applied:</strong>
            {inputWarnings.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}

        {/* ML Risk Assessment Panel */}
        {predictionResult && (
          <div className={`p-6 sm:p-8 rounded-2xl border ${borderMap[badgeColor]} bg-slate-900/80 space-y-6 shadow-xl`}>

            {/* Panel header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-extrabold text-white">Ensemble Diagnostic Result</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  {paradigm}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AUC: <strong className="text-white">{confidenceScore}</strong></span>
                </div>
                {isBackend && latencyMs !== null && (
                  <span className="text-slate-500">· {latencyMs}ms</span>
                )}
                {!isBackend && (
                  <span className="text-amber-400 text-[10px] font-bold uppercase">Offline Mode</span>
                )}
              </div>
            </div>

            {/* Gauge + Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

              {/* Gauge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800/60 text-center space-y-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                    <circle cx="72" cy="72" r={radius} stroke="#1e293b" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="72" cy="72" r={radius}
                      stroke={strokeColor}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{riskPercent}%</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Probability</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeBg[badgeColor]}`}>
                  {riskCategory} Cardiovascular Risk
                </div>
              </div>

              {/* Assessment message + contributions */}
              <div className="md:col-span-8 space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                  {riskCategory === 'High' ? (
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-300 block mb-0.5">High Cardiovascular Probability Detected</strong>
                        {correctiveAdvice.summary || 'Clinical variables indicate elevated risk factors. Medical consultation is advised.'}
                      </div>
                    </div>
                  ) : riskCategory === 'Moderate' ? (
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 block mb-0.5">Moderate Cardiovascular Risk Profile</strong>
                        {correctiveAdvice.summary || 'Several modifiable risk factors identified. Proactive lifestyle changes can significantly reduce your risk.'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-300 block mb-0.5">Low Cardiovascular Risk Profile</strong>
                        {correctiveAdvice.summary || 'Patient physiological indicators fall within healthy parameters. Maintain regular physical activity and balanced nutrition.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Feature contributions mini-grid */}
                {contributions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Primary Risk Drivers
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {contributions.slice(0, 6).map((feat, idx) => (
                        <MiniContrib key={idx} feat={feat} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Corrective Advice Accordion */}
            {(correctiveAdvice.immediateActions?.length > 0 ||
              correctiveAdvice.lifestyleChanges?.length > 0 ||
              correctiveAdvice.monitoringPlan?.length > 0 ||
              correctiveAdvice.medicalReferrals?.length > 0) && (
              <div className="space-y-3 pt-4 border-t border-slate-800/60">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Corrective Medical Recommendations
                </h4>
                <AdviceSection icon={AlertTriangle}   title="Immediate Actions"  items={correctiveAdvice.immediateActions}  colorClass="text-rose-400"   />
                <AdviceSection icon={TrendingDown}    title="Lifestyle Changes"  items={correctiveAdvice.lifestyleChanges}  colorClass="text-amber-400"  />
                <AdviceSection icon={ClipboardList}   title="Monitoring Plan"    items={correctiveAdvice.monitoringPlan}    colorClass="text-cyan-400"   />
                <AdviceSection icon={Stethoscope}     title="Medical Referrals"  items={correctiveAdvice.medicalReferrals}  colorClass="text-violet-400" />
                <p className="text-[9px] text-slate-500 italic">
                  ⚕ This assessment is generated by an ML model. It is not a substitute for professional medical diagnosis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Data Grid: Demographics, Clinical, Lifestyle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              1. Demographics
            </h3>
            <div className="space-y-2 text-xs">
              {[
                ['Age',            `${data.age} years`],
                ['Gender',         formatGender(data.gender)],
                ['Height',         `${data.height} cm`],
                ['Weight',         `${data.weight} kg`],
                ['Calculated BMI', `${bmi} kg/m²`],
              ].map(([label, value], i, arr) => (
                <div key={label} className={`flex justify-between ${i < arr.length - 1 ? 'border-b border-slate-800 pb-1.5' : 'pt-0.5'}`}>
                  <span className="text-slate-400">{label}:</span>
                  <span className={`font-bold ${label === 'Calculated BMI' ? 'text-cyan-400 font-mono' : 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              2. Clinical Readings
            </h3>
            <div className="space-y-2 text-xs">
              {[
                ['Systolic BP (ap_hi)',  `${data.ap_hi} mmHg`],
                ['Diastolic BP (ap_lo)', `${data.ap_lo} mmHg`],
                ['Cholesterol',          formatLevel(data.cholesterol)],
                ['Fasting Glucose',      formatLevel(data.gluc)],
              ].map(([label, value], i, arr) => (
                <div key={label} className={`flex justify-between ${i < arr.length - 1 ? 'border-b border-slate-800 pb-1.5' : 'pt-0.5'}`}>
                  <span className="text-slate-400">{label}:</span>
                  <span className="text-white font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              3. Lifestyle
            </h3>
            <div className="space-y-2 text-xs">
              {[
                ['Smoking',           formatYesNo(data.smoke)],
                ['Alcohol Intake',    formatYesNo(data.alco)],
                ['Physical Activity', formatActive(data.active)],
              ].map(([label, value], i, arr) => (
                <div key={label} className={`flex justify-between ${i < arr.length - 1 ? 'border-b border-slate-800 pb-1.5' : 'pt-0.5'}`}>
                  <span className="text-slate-400">{label}:</span>
                  <span className="text-white font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        

      </div>
    </div>
  );
};
