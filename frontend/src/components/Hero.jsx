import React from 'react';
import { Activity, ShieldCheck, Zap, Database, ArrowRight, Heart } from 'lucide-react';

export const Hero = ({ onStartAssessment, onExploreInsights }) => {
  const statCards = [
    {
      icon: Database,
      title: 'Structured Form',
      desc: '11 standardized clinical metrics matching the official SOP dataset format.',
    },
    {
      icon: Zap,
      title: 'Instant Capture',
      desc: 'Real-time form validation and instant patient record summary.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      desc: 'Local browser data processing with anonymous inputs.',
    },
    {
      icon: Activity,
      title: 'BMI Calculation',
      desc: 'Automatic real-time calculation of Body Mass Index from height & weight.',
    }
  ];

  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Top Center Spotlight — blue/cyan glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-gradient-to-b from-cyan-400/15 via-blue-500/5 to-transparent blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-cyan-950/20 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-bold tracking-wide uppercase">
              <Heart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
              Heart Attack Clinical Portal
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Heart Attack <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                Data Entry Form
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              Enter clinical patient measurements, blood pressure readings, and lifestyle metrics into the standardized data form.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onStartAssessment}
                className="btn-primary px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-3 cursor-pointer shadow-2xl"
              >
                <Activity className="w-5 h-5 text-cyan-100" />
                Fill Data Form
              </button>

              <button
                onClick={onExploreInsights}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700/60 hover:border-slate-600 transition-all duration-200"
              >
                Data Summary
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
                  className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-800/50 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">
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
