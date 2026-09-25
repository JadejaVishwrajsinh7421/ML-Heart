import React from 'react';
import { Activity, ShieldCheck, Zap, Database, ArrowRight, Heart } from 'lucide-react';

export const Hero = ({ onStartAssessment, onExploreInsights }) => {
  const statCards = [
    {
      icon: Database,
      title: 'Standardized Data',
      desc: '11 validated clinical parameters matching cardiological benchmark datasets.',
    },
    {
      icon: Zap,
      title: 'Instant Ensemble AI',
      desc: 'Sub-millisecond risk prediction using soft-voting hybrid bagging & boosting.',
    },
    {
      icon: ShieldCheck,
      title: 'Clinical Privacy',
      desc: 'Anonymous in-browser analysis with zero third-party health tracking.',
    },
    {
      icon: Activity,
      title: 'Real-time BMI & BP',
      desc: 'Live calculation of physiological risk indicators and arterial pressure categories.',
    }
  ];

  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Top Center Spotlight — Warm Cardiac Rose Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[340px] bg-gradient-to-b from-rose-500/15 via-red-500/5 to-transparent blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[420px] h-[160px] bg-rose-950/25 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-bold tracking-wide uppercase shadow-sm">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              Cardiovascular Risk AI Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Heart Attack Risk <br />
              <span className="bg-gradient-to-r from-rose-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                Intelligence & Care
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              High-accuracy cardiovascular disease risk stratification powered by state-of-the-art Bagging, XGBoost, and Soft-Voting Ensembles trained on 68,000+ clinical records.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onStartAssessment}
                className="btn-primary px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-3 cursor-pointer shadow-xl shadow-rose-950/40"
              >
                <Heart className="w-5 h-5 fill-white" />
                Start Heart Assessment
              </button>

              <button
                onClick={onExploreInsights}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700/60 hover:border-rose-500/40 hover:text-white transition-all duration-200 shadow-md"
              >
                Dataset Insights
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Stat Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-rose-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
