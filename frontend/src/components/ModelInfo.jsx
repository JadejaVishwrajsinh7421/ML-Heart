import React, { useState, useEffect } from 'react';
import { Cpu, Award, Sliders, CheckCircle2, Zap, Layers, RefreshCw } from 'lucide-react';
import { fetchModelBenchmarks } from '../utils/predictionModel';

export const ModelInfo = () => {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchModelBenchmarks().then((data) => {
      if (isMounted) {
        setBenchmarks(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const ensembleHyperparameters = [
    { label: 'XGBoost Trees / Learning Rate', value: '150 / 0.05' },
    { label: 'Random Forest Trees / Max Depth', value: '150 / 12' },
    { label: 'Hist Gradient Boosting Max Iter', value: '150' },
    { label: 'Ensemble Voting Scheme', value: 'Soft Probability Voting' },
    { label: 'Validation Strategy', value: 'Stratified 80/20 Train-Test' }
  ];

  const modelMetrics = [
    { label: 'Peak Accuracy (GB / XGBoost)', value: '74.21%' },
    { label: 'Peak F1 Score (Gradient Boosting)', value: '72.87%' },
    { label: 'Peak ROC AUC (Hybrid / XGBoost)', value: '80.54%' },
    { label: 'Lowest Inference Latency (XGBoost)', value: '0.0018 ms' }
  ];

  const featureImportances = [
    { feature: 'ap_hi (Systolic Blood Pressure)', importance: '62.4%' },
    { feature: 'age (Age in Years)', importance: '14.8%' },
    { feature: 'weight / bmi (Body Mass Index)', importance: '9.6%' },
    { feature: 'cholesterol (Level 2 & 3)', importance: '5.4%' },
    { feature: 'ap_lo (Diastolic Blood Pressure)', importance: '4.8%' },
    { feature: 'active (Physical Activity)', importance: '1.8%' },
    { feature: 'smoke / alco (Lifestyle)', importance: '1.2%' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-bold uppercase">
          <Cpu className="w-3.5 h-3.5" />
          Ensemble Architecture &amp; Benchmarks
        </div>
        <h2 className="text-3xl font-black text-white">Bagging &amp; Boosting Paradigms</h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          High-efficiency machine learning backend comparing parallel bootstrap aggregation (Bagging) against sequential gradient descent (Boosting) and soft-voting hybrid ensembles.
        </p>
      </div>

      {/* 2 Paradigm Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bagging Paradigm */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 space-y-3 bg-slate-950/80">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="w-5 h-5" />
            <h3 className="text-base font-extrabold text-white">Bagging (Bootstrap Aggregating)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Trains independent parallel base estimators (Random Forest, Extra Trees, Bagging Decision Trees) on random bootstrap sub-samples of 54,754 records. Focuses on <strong>variance reduction</strong> and prevents overfitting.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-slate-200">
              Random Forest: <strong>73.75% Acc</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-slate-200">
              Extra Trees: <strong>80.08% AUC</strong>
            </span>
          </div>
        </div>

        {/* Boosting Paradigm */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 space-y-3 bg-slate-950/80">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className="w-5 h-5" />
            <h3 className="text-base font-extrabold text-white">Boosting (Gradient Optimization)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sequentially builds shallow trees (XGBoost, HistGradientBoosting, AdaBoost) where each consecutive tree minimizes the residual loss of preceding models. Focuses on <strong>bias reduction</strong> with ultra-fast latency.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-slate-200">
              XGBoost: <strong>80.54% AUC</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-slate-200">
              Latency: <strong>0.0018 ms/sample</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Grid: Specs, Hyperparameters, Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Model Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 space-y-4 bg-slate-950/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Backend Specifications
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Inference Engine</span>
              <span className="text-white font-bold">Flask REST API + Joblib</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Libraries</span>
              <span className="text-white font-bold">XGBoost &amp; scikit-learn</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Training Records</span>
              <span className="text-white font-bold font-mono">54,754 samples</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Feature Dimensions</span>
              <span className="text-white font-bold font-mono">14 features</span>
            </div>
          </div>
        </div>

        {/* Hyperparameters Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 space-y-4 bg-slate-950/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Ensemble Parameters
          </h3>
          <div className="space-y-3 text-xs">
            {ensembleHyperparameters.map((param, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                <span className="text-slate-400">{param.label}</span>
                <span className="text-white font-mono font-bold text-right ml-2">{param.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 space-y-4 bg-slate-950/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Efficiency &amp; Benchmark Metrics
          </h3>
          <div className="space-y-3">
            {modelMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">{metric.label}</span>
                  <span className="text-white font-bold font-mono">{metric.value}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-600 to-teal-400 h-1.5 rounded-full"
                    style={{ width: metric.value.includes('%') ? metric.value : '95%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Feature Importance Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/60 space-y-6 bg-slate-950/80">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Ensemble Feature Importance (XGBoost + Random Forest)</h3>
          <p className="text-xs text-slate-400">Relative impact weights normalized across both Bagging and Boosting models</p>
        </div>

        <div className="space-y-4">
          {featureImportances.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{item.feature}</span>
                <span className="font-bold text-cyan-400 font-mono">{item.importance}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-700 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: item.importance }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagging vs Boosting Benchmark Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/60 space-y-6 bg-slate-950/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Bagging vs. Boosting Performance &amp; Efficiency Matrix
            </h3>
            <p className="text-xs text-slate-400">Evaluated on holdout test split (13,689 records)</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching live metrics...</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Model Algorithm</th>
                <th className="p-3">Paradigm</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1 Score</th>
                <th className="p-3">ROC AUC</th>
                <th className="p-3">Train Time</th>
                <th className="p-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {benchmarks.map((row, idx) => {
                const isHybrid = row.paradigm === 'Hybrid';
                return (
                  <tr
                    key={idx}
                    className={
                      row.is_best || isHybrid
                        ? 'bg-cyan-950/40 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }
                  >
                    <td className="p-3 flex items-center gap-2">
                      {(row.is_best || isHybrid) && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      {row.model}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.paradigm === 'Boosting'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : row.paradigm === 'Bagging'
                            ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60'
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                        }`}
                      >
                        {row.paradigm}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{row.accuracy}</td>
                    <td className="p-3 font-mono">{row.precision}</td>
                    <td className="p-3 font-mono">{row.recall}</td>
                    <td className="p-3 font-mono">{row.f1}</td>
                    <td className="p-3 font-mono text-cyan-400">{row.roc_auc}</td>
                    <td className="p-3 font-mono">{row.training_time_sec}s</td>
                    <td className="p-3 font-mono text-emerald-400">
                      {row.inference_latency_ms}ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
