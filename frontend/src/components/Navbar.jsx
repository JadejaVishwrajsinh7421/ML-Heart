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
  Zap,
} from "lucide-react";
import { checkBackendHealth } from "../utils/predictionModel";

const navItems = [
  { to: "/", label: "Heart Assessment", icon: Activity },
  { to: "/insights", label: "Data Summary", icon: BarChart3 },
  { to: "/model", label: "Model Info", icon: Cpu },
  { to: "/disclaimer", label: "Clinical Info", icon: Shield },
];

export const Navbar = ({ scrollToForm }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    checkBackendHealth().then((res) => {
      if (mounted) {
        setApiOnline(Boolean(res?.online));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

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
    <header className="sticky top-0 z-50 h-16 border-b border-rose-950/40 bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Brand Heart Logo ── */}
        <NavLink
          to="/"
          className="group flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          {/* Pulsing Medical Heart Icon */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-red-500 to-rose-700 shadow-md shadow-rose-900/40 border border-rose-400/40">
            <span className="absolute inset-0 rounded-xl bg-rose-500/20 blur-sm animate-pulse" />
            <Heart className="relative h-5 w-5 text-white fill-white transition-transform duration-300 group-hover:scale-110 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold leading-tight tracking-tight text-white">
                Heart<span className="bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent font-extrabold">Attack</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-950/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping inline-block" />
                Portal
              </span>
            </div>
            <span className="hidden text-[11px] leading-tight text-slate-400 sm:block">
              Clinical Cardiovascular Risk Management
            </span>
          </div>
        </NavLink>

        {/* ── Desktop Nav Items ── */}
        <nav className="hidden items-center md:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/90 p-1 shadow-inner">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border border-rose-500/40 bg-rose-950/60 text-rose-200 shadow-sm shadow-rose-950/50"
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

        {/* ── Right Section (API Status & Heart Action Button) ── */}
        <div className="flex items-center gap-3">
          {/* Backend Connection Pulse */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
            <span
              className={`h-2 w-2 rounded-full ${
                apiOnline === true
                  ? "bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse"
                  : apiOnline === false
                  ? "bg-amber-400"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-[11px]">
              {apiOnline === true
                ? "Backend Live"
                : apiOnline === false
                ? "Offline Mode"
                : "Connecting..."}
            </span>
          </div>

          <button
            onClick={handlePredictClick}
            className="hidden items-center gap-2 sm:inline-flex rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-950/50 hover:from-rose-500 hover:to-red-500 transition-all hover:scale-[1.02] border border-rose-400/30"
          >
            <Heart className="h-4 w-4 fill-white" />
            <span>Check Risk</span>
            <span className="text-xs">↗</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-rose-400" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      <div
        className={`overflow-hidden border-b border-rose-950/40 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 border-b-0 opacity-0"
        }`}
      >
        <div className="space-y-1.5 px-4 pb-4 pt-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-rose-500/40 bg-rose-950/60 text-rose-200 shadow-sm shadow-rose-950/40"
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-950/50 hover:from-rose-500 hover:to-red-500 border border-rose-400/30"
          >
            <Heart className="h-4 w-4 fill-white" />
            <span>Check Risk</span>
            <span className="text-xs">↗</span>
          </button>
        </div>
      </div>
    </header>
  );
};
