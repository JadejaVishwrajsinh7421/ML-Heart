import React, { useState, useMemo } from 'react';
import { Activity, ArrowLeft, Cpu, Wifi, WifiOff, Info } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBmiCategory = (bmi) => {
  const b = parseFloat(bmi);
  if (isNaN(b)) return null;
  if (b < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (b < 25)   return { label: 'Normal',       color: 'text-emerald-400' };
  if (b < 30)   return { label: 'Overweight',   color: 'text-amber-400' };
  if (b < 35)   return { label: 'Obese',        color: 'text-orange-400' };
  return              { label: 'Obese Class II+', color: 'text-rose-400' };
};

const getBpCategory = (apHi, apLo) => {
  const hi = parseFloat(apHi);
  const lo = parseFloat(apLo);
  if (isNaN(hi) || isNaN(lo)) return null;
  if (hi >= 180 || lo >= 120) return { label: 'Hypertensive Crisis',    color: 'text-rose-500',    ring: 'focus:border-rose-500 focus:ring-rose-500' };
  if (hi >= 140 || lo >= 90)  return { label: 'Stage 2 Hypertension',   color: 'text-rose-400',    ring: 'focus:border-rose-500 focus:ring-rose-500' };
  if (hi >= 130 || lo >= 80)  return { label: 'Stage 1 Hypertension',   color: 'text-orange-400',  ring: 'focus:border-orange-500 focus:ring-orange-500' };
  if (hi >= 120)              return { label: 'Elevated BP',             color: 'text-amber-400',   ring: 'focus:border-amber-500 focus:ring-amber-500' };
  return                             { label: 'Normal BP',               color: 'text-emerald-400', ring: 'focus:border-cyan-500 focus:ring-cyan-500' };
};

const InputField = ({ label, hint, children, badge }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="block text-sm font-bold text-slate-200">{label}</label>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/50 ${badge.color}`}>
          {badge.label}
        </span>
      )}
    </div>
    {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    {children}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const PredictionForm = ({ onPredict, onBack, isSubmitting, backendStatus }) => {
  const [formData, setFormData] = useState({
    age:         52,
    gender:      1,
    height:      165,
    weight:      72,
    ap_hi:       130,
    ap_lo:       85,
    cholesterol: 2,
    gluc:        1,
    smoke:       0,
    alco:        0,
    active:      1,
    model:       'ensemble',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || value }));
  };

  const bmi = useMemo(() => {
    const h = parseFloat(formData.height) / 100;
    const w = parseFloat(formData.weight);
    if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
    return '24.2';
  }, [formData.height, formData.weight]);

  const bmiCategory = useMemo(() => getBmiCategory(bmi), [bmi]);
  const bpCategory  = useMemo(() => getBpCategory(formData.ap_hi, formData.ap_lo), [formData.ap_hi, formData.ap_lo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/60 text-white font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all";
  const selectClass = inputClass + " cursor-pointer";

  return (
    <div id="prediction-form-section" className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800/60 shadow-2xl bg-slate-950/90 relative">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-6 mb-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back To Home
          </button>

          <div className="flex items-center gap-3">
            {/* Backend status pill */}
            {backendStatus === 'online' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[10px] font-semibold">
                <Wifi className="w-3 h-3" />
                ML Backend Online
              </div>
            ) : backendStatus === 'offline' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-[10px] font-semibold">
                <WifiOff className="w-3 h-3" />
                Offline Fallback
              </div>
            ) : null}

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              Standard SOP Form
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Clinical Data Entry Form</h2>
          <p className="text-sm text-slate-400">
            Enter patient health details to generate a cardiovascular risk assessment with corrective recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Personal Demographics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              1. Personal Demographics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <InputField label="Age" hint="Patient age in years (18–100).">
                <input
                  type="number" name="age" min="18" max="100"
                  value={formData.age} onChange={handleChange} required
                  className={inputClass}
                />
              </InputField>

              <InputField label="Gender" hint="Biological sex at birth.">
                <select name="gender" value={formData.gender} onChange={handleChange} className={selectClass}>
                  <option value={1}>Female</option>
                  <option value={2}>Male</option>
                </select>
              </InputField>

              <InputField label={<>Height <span className="text-slate-400 font-normal">(cm)</span></>} hint="Measured in centimeters without shoes.">
                <input
                  type="number" name="height" min="100" max="230"
                  value={formData.height} onChange={handleChange} required
                  className={inputClass}
                />
              </InputField>

              <InputField
                label={<>Weight <span className="text-slate-400 font-normal">(kg)</span></>}
                hint="Measured in kilograms."
                badge={bmiCategory}
              >
                <div className="relative">
                  <input
                    type="number" name="weight" min="30" max="200"
                    value={formData.weight} onChange={handleChange} required
                    className={inputClass}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-md bg-cyan-950/80 text-[11px] font-bold text-cyan-300 border border-cyan-700/50 pointer-events-none">
                    BMI: {bmi}
                  </div>
                </div>
                {bmiCategory && (
                  <p className={`text-[10px] font-semibold mt-1 ${bmiCategory.color}`}>
                    ↳ {bmiCategory.label}
                    {parseFloat(bmi) >= 25 && ' — elevated cardiovascular risk factor'}
                  </p>
                )}
              </InputField>

            </div>
          </div>

          {/* Section 2: Clinical Measurements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              2. Clinical Measurements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <InputField
                label={<>Systolic BP <span className="text-slate-400 font-normal">(ap_hi, mmHg)</span></>}
                hint="Upper blood pressure reading."
                badge={bpCategory}
              >
                <input
                  type="number" name="ap_hi" min="70" max="240"
                  value={formData.ap_hi} onChange={handleChange} required
                  className={`${inputClass} ${bpCategory?.ring || ''}`}
                />
                {bpCategory && (
                  <p className={`text-[10px] font-semibold mt-1 ${bpCategory.color}`}>
                    ↳ {bpCategory.label}
                  </p>
                )}
              </InputField>

              <InputField label={<>Diastolic BP <span className="text-slate-400 font-normal">(ap_lo, mmHg)</span></>} hint="Lower blood pressure reading.">
                <input
                  type="number" name="ap_lo" min="40" max="160"
                  value={formData.ap_lo} onChange={handleChange} required
                  className={inputClass}
                />
                {parseFloat(formData.ap_lo) >= 90 && (
                  <p className="text-[10px] font-semibold mt-1 text-rose-400">↳ High diastolic — consult a physician</p>
                )}
              </InputField>

              <InputField label="Cholesterol Level" hint="Serum cholesterol category.">
                <select name="cholesterol" value={formData.cholesterol} onChange={handleChange} className={selectClass}>
                  <option value={1}>1: Normal (&lt; 200 mg/dL)</option>
                  <option value={2}>2: Above Normal (200–239 mg/dL)</option>
                  <option value={3}>3: Well Above Normal (≥ 240 mg/dL)</option>
                </select>
                {parseInt(formData.cholesterol) === 3 && (
                  <p className="text-[10px] font-semibold mt-1 text-rose-400">↳ High cholesterol — major cardiovascular risk factor</p>
                )}
                {parseInt(formData.cholesterol) === 2 && (
                  <p className="text-[10px] font-semibold mt-1 text-amber-400">↳ Above normal — dietary changes recommended</p>
                )}
              </InputField>

              <InputField label="Glucose Level" hint="Fasting blood sugar level.">
                <select name="gluc" value={formData.gluc} onChange={handleChange} className={selectClass}>
                  <option value={1}>1: Normal (&lt; 100 mg/dL)</option>
                  <option value={2}>2: Above Normal (100–125 mg/dL)</option>
                  <option value={3}>3: Well Above Normal (≥ 126 mg/dL)</option>
                </select>
                {parseInt(formData.gluc) === 3 && (
                  <p className="text-[10px] font-semibold mt-1 text-rose-400">↳ Diabetic range — endocrinologist consultation advised</p>
                )}
                {parseInt(formData.gluc) === 2 && (
                  <p className="text-[10px] font-semibold mt-1 text-amber-400">↳ Pre-diabetic — monitor fasting glucose regularly</p>
                )}
              </InputField>

            </div>
          </div>

          {/* Section 3: Lifestyle */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              3. Lifestyle &amp; Habits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Smoking Habit</label>
                <select name="smoke" value={formData.smoke} onChange={handleChange} className={selectClass.replace('px-4 py-3', 'px-3.5 py-2.5 text-sm')}>
                  <option value={0}>No (Non-smoker)</option>
                  <option value={1}>Yes (Smoker)</option>
                </select>
                {parseInt(formData.smoke) === 1 && (
                  <p className="text-[10px] text-rose-400 font-semibold">↳ Doubles cardiovascular risk</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Alcohol Consumption</label>
                <select name="alco" value={formData.alco} onChange={handleChange} className={selectClass.replace('px-4 py-3', 'px-3.5 py-2.5 text-sm')}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Physical Activity</label>
                <select name="active" value={formData.active} onChange={handleChange} className={selectClass.replace('px-4 py-3', 'px-3.5 py-2.5 text-sm')}>
                  <option value={1}>Active (≥ 150 min/wk)</option>
                  <option value={0}>Sedentary / Inactive</option>
                </select>
                {parseInt(formData.active) === 0 && (
                  <p className="text-[10px] text-amber-400 font-semibold">↳ Increases risk by ~35%</p>
                )}
              </div>

            </div>
          </div>

          {/* Section 4: Model Selection */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              4. Backend Model Architecture (Bagging &amp; Boosting)
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-200">Inference Classifier Algorithm</label>
              <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                Choose between parallel Bagging (variance reduction), sequential Boosting (gradient optimization), or Hybrid Voting Ensemble.
              </p>
              <select
                name="model" value={formData.model} onChange={handleChange}
                className={selectClass}
              >
                <option value="ensemble">Hybrid Ensemble (Voting: RF + XGBoost + HistGB — 80.54% AUC) ★ Recommended</option>
                <option value="xgboost">XGBoost (Extreme Gradient Boosting — 74.09% Acc, 80.54% AUC, 0.0018ms)</option>
                <option value="random_forest">Random Forest (Bagging — 73.75% Acc, 80.38% AUC)</option>
                <option value="hist_gb">Hist Gradient Boosting (LightGBM-style — 73.89% Acc, 80.47% AUC)</option>
              </select>
            </div>
          </div>

          {/* Risk factor summary bar */}
          {(() => {
            const riskFactors = [];
            if (parseFloat(formData.ap_hi) >= 130) riskFactors.push('High BP');
            if (parseFloat(bmi) >= 25) riskFactors.push('BMI');
            if (parseInt(formData.cholesterol) > 1) riskFactors.push('Cholesterol');
            if (parseInt(formData.gluc) > 1) riskFactors.push('Glucose');
            if (parseInt(formData.smoke)) riskFactors.push('Smoking');
            if (!parseInt(formData.active)) riskFactors.push('Sedentary');
            if (parseFloat(formData.age) >= 50) riskFactors.push('Age 50+');
            if (riskFactors.length === 0) return null;
            return (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-700/30 text-xs">
                <p className="text-amber-400 font-bold mb-1.5">⚠ Detected Risk Factors ({riskFactors.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {riskFactors.map(f => (
                    <span key={f} className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-[10px] font-semibold">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-4 rounded-2xl text-lg font-extrabold flex items-center justify-center gap-3 cursor-pointer shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Clinical Data...
                </>
              ) : (
                <>
                  <Activity className="w-6 h-6 text-cyan-100" />
                  Run Cardiovascular Risk Assessment
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-3">
              Results include feature-level risk attribution and personalized corrective medical recommendations.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
