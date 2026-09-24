import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Activity,
  BarChart3,
  Cpu,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { checkBackendHealth } from "../utils/predictionModel";

const navItems = [
  { to: "/", label: "Data Entry", icon: Activity },
  { to: "/insights", label: "Data Summary", icon: BarChart3 },
  { to: "/model", label: "Model Info", icon: Cpu },
  { to: "/disclaimer", label: "Info", icon: Shield },
];

export const Navbar = ({ scrollToForm }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handlePredictClick = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToForm?.(), 150);
    } else {
      scrollToForm?.();
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Brand Logo ── */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-teal-500 shadow-lg shadow-cyan-900/30">
            <Heart className="h-5 w-5 text-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold leading-tight tracking-tight text-white">
                Heart{" "}
                <span className="text-cyan-400">Attack</span>
              </span>
              <span className="rounded-full border border-cyan-700/50 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                Portal
              </span>
            </div>
            <span className="hidden text-[11px] leading-tight text-slate-400 sm:block">
              Clinical Cardiovascular Management
            </span>
          </div>
        </div>

        {/* ── Desktop Nav ── */}
        <nav className="hidden items-center md:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border border-cyan-700/50 bg-cyan-950/60 text-cyan-300 shadow-sm shadow-cyan-900/30"
                      : "border border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* ── Right Section ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePredictClick}
            className="btn-primary hidden items-center gap-1.5 sm:inline-flex"
          >
            Enter Data
            <span className="text-xs">↗</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`overflow-hidden border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen
            ? "max-h-80 opacity-100"
            : "max-h-0 border-b-0 opacity-0"
        }`}
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-cyan-700/50 bg-cyan-950/60 text-cyan-300 shadow-sm shadow-cyan-900/30"
                    : "border border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}

          <button
            onClick={handlePredictClick}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-1.5"
          >
            Enter Data
            <span className="text-xs">↗</span>
          </button>
        </div>
      </div>
    </header>
  );
};
