import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PredictionForm } from './components/PredictionForm';
import { SubmittedDataView } from './components/SubmittedDataView';
import { ModelInfo } from './components/ModelInfo';
import { DataInsights } from './components/DataInsights';
import { Footer } from './components/Footer';
import { predictCardioRiskApi, checkBackendHealth } from './utils/predictionModel';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

// ─── Backend Status Banner ────────────────────────────────────────────────────
const BackendStatusBanner = ({ status }) => {
  if (status === 'checking') return null;
  if (status === 'online') return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/90 border border-emerald-700/50 text-emerald-300 text-xs font-semibold shadow-xl backdrop-blur-sm">
      <Wifi className="w-3.5 h-3.5" />
      ML Backend Online
    </div>
  );
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/90 border border-amber-700/50 text-amber-300 text-xs font-semibold shadow-xl backdrop-blur-sm">
      <WifiOff className="w-3.5 h-3.5" />
      Offline — Using Fallback Model
    </div>
  );
};

// ─── Error Toast ──────────────────────────────────────────────────────────────
const ErrorToast = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-rose-950/95 border border-rose-700/50 text-rose-200 text-sm font-semibold shadow-2xl backdrop-blur-sm max-w-md">
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-rose-400 hover:text-white transition-colors ml-2 text-lg leading-none">×</button>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export function App() {
  const [submittedData, setSubmittedData]       = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [backendStatus, setBackendStatus]       = useState('checking');
  const [errorMessage, setErrorMessage]         = useState(null);
  const navigate = useNavigate();

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then(({ online }) => {
      setBackendStatus(online ? 'online' : 'offline');
    });
  }, []);

  const scrollToForm = () => {
    const formElem = document.getElementById('prediction-form-section');
    if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await predictCardioRiskApi(formData);
      setPredictionResult(result);
      setSubmittedData(formData);
      // Update backend status based on whether we got a real backend response
      if (result.isBackend) setBackendStatus('online');
      else if (backendStatus === 'checking') setBackendStatus('offline');
    } catch (err) {
      setErrorMessage('Prediction failed unexpectedly. Please try again.');
      setSubmittedData(formData);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        const formElem = document.getElementById('prediction-form-section');
        if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setPredictionResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-900 selection:text-white">

      <Navbar scrollToForm={scrollToForm} />

      <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      <BackendStatusBanner status={backendStatus} />

      <main className="pb-12">
        <Routes>

          <Route
            path="/"
            element={
              <div className="space-y-8">
                <Hero
                  onStartAssessment={scrollToForm}
                  onExploreInsights={() => navigate('/insights')}
                />

                {submittedData ? (
                  <SubmittedDataView
                    data={submittedData}
                    predictionResult={predictionResult}
                    onReset={handleReset}
                  />
                ) : (
                  <PredictionForm
                    onPredict={handleFormSubmit}
                    onBack={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    isSubmitting={isSubmitting}
                    backendStatus={backendStatus}
                  />
                )}
              </div>
            }
          />

          <Route path="/insights" element={<DataInsights />} />
          <Route path="/model"    element={<ModelInfo />} />

          <Route
            path="/disclaimer"
            element={
              <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center mx-auto text-cyan-400 font-bold text-2xl">!</div>
                <h2 className="text-3xl font-black text-white">Data Entry Information</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  This application provides a user interface for entering and recording clinical cardiovascular dataset variables.
                  Predictions are generated by ensemble ML models (XGBoost, Random Forest, HistGB) trained on the Cardiovascular Disease dataset.
                  Results are for educational and research purposes only and do not constitute medical advice.
                </p>
              </div>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
