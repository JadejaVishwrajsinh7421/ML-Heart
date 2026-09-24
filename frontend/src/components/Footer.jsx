import { Heart, Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/60 bg-slate-950 py-10">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Logo */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="rounded-lg border border-cyan-700/50 bg-cyan-950/80 p-2">
            <Heart className="h-5 w-5 fill-cyan-400 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold tracking-wide text-slate-200">
            Heart <span className="text-cyan-400">Attack</span> Portal
          </h2>
        </div>

        {/* Description */}
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400">
          Built as part of SOP — Department of Computer Engineering. Powered by
          React &amp; Tailwind CSS for a modern, responsive clinical data entry
          experience.
        </p>

        {/* Bottom line */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-cyan-400" />
          <span className="text-xs text-slate-500">
            Educational &amp; Clinical Data Entry System
          </span>
        </div>
      </div>
    </footer>
  );
};
