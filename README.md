# CardioRisk AI — Heart Disease Risk Assessment System

A production-grade Cardiovascular Disease (CVD) Risk Assessment web application powered by **Bagging**, **Boosting**, and **Soft-Voting Ensemble** Machine Learning models trained on 68,000+ patient records.

---

## 📁 Repository & Folder Structure

```text
ML-Heart/
├── render.yaml                   # 🚀 Render Blueprint file (1-click cloud deployment)
├── .gitignore                    # Git rules (excludes node_modules, caches; keeps models & datasets)
├── README.md                     # Root project documentation & deployment guide
├── start_backend.bat             # Windows local backend quick-launch script
├── archive/
│   ├── cleaned_cardio.csv        # Preprocessed training dataset (tracked in Git)
│   ├── cardio_train.csv          # Raw benchmark dataset
│   └── *.ipynb                   # Jupyter research notebooks (benchmarking & exploration)
│
├── backend/                      # 🐍 Python Flask + Gunicorn ML REST API
│   ├── app.py                    # Flask server with REST endpoints & inference pipeline
│   ├── trainer.py                # Model training, benchmarking & serialization pipeline
│   ├── requirements.txt          # Python dependencies (Flask, Gunicorn, XGBoost, Scikit-learn)
│   ├── runtime.txt               # Pinned Python version (python-3.11.9 for Render)
│   ├── README.md                 # Backend-specific architecture & benchmarks documentation
│   └── saved_models/             # Pre-trained compressed ML artifacts & metrics
│       ├── best_ensemble.joblib  # Hybrid Voting Ensemble (Random Forest + XGBoost + HistGB)
│       ├── xgboost_model.joblib  # Tuned XGBoost Classifier (0.0018ms latency)
│       ├── random_forest_model.joblib # Tuned Random Forest Classifier
│       ├── hist_gb_model.joblib  # Tuned Histogram Gradient Boosting Classifier
│       └── metadata.json         # Scaling params, feature importances & holdout metrics
│
└── frontend/                     # ⚛️ React 19 + Vite + TailwindCSS Modern UI
    ├── package.json              # Node.js dependencies & build scripts
    ├── vite.config.js            # Vite bundler & local reverse-proxy configuration
    ├── index.html                # HTML entrypoint with metadata & responsive viewport
    ├── .env.example              # Example environment variables for production
    └── src/                      # Source code
        ├── App.jsx               # Main React dashboard & application layout
        ├── main.jsx              # Application DOM mounting
        ├── index.css             # TailwindCSS & custom UI styling
        ├── components/           # UI widgets & interactive modules
        │   ├── Header.jsx        # Navigation bar & backend status indicator
        │   ├── PatientForm.jsx   # Clinical input questionnaire with live validation
        │   ├── ResultsDisplay.jsx# Risk meter, category badges & corrective advice
        │   ├── FeatureImportance.jsx # Interactive horizontal bar charts
        │   ├── ModelBenchmarks.jsx # Algorithm comparison table (AUC, F1, latency)
        │   ├── BatchPrediction.jsx # Multi-patient CSV / JSON batch upload
        │   └── Footer.jsx        # Medical disclaimers & reference info
        └── utils/
            └── predictionModel.js# Dynamic API client with fallback & advice engine
```

---

## 🌐 Deploying to Render via GitHub (Recommended: Render Blueprint)

This repository includes a `render.yaml` blueprint file configured to deploy both the **Python ML Backend Web Service** and the **React Vite Static Site** simultaneously.

### Step 1: Push Your Code to GitHub
Ensure all code and the `render.yaml` file are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Render blueprint and folder structure"
git push origin main
```

### Step 2: Deploy on Render
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub account and select your **`ML-Heart`** repository.
4. Render will automatically read `render.yaml` and discover two services:
   - **`ml-heart-backend`** (Web Service, Python, Gunicorn)
   - **`ml-heart-frontend`** (Static Site, React / Vite)
5. Click **Apply**. Render will automatically:
   - Build and start the Python Flask backend with Gunicorn.
   - Build the React frontend with Vite.
   - Automatically inject the backend's URL into the frontend via `VITE_API_URL`.

---

## 🛠️ Manual Deployment on Render (Alternative)

If you prefer to configure services manually without Blueprints:

### 1. Deploy the Backend (Web Service)
- **Environment**: `Python`
- **Root Directory**: `backend`
- **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `PYTHON_VERSION`: `3.11.9`
  - `FLASK_ENV`: `production`
- Once deployed, copy your backend URL (e.g., `https://ml-heart-backend.onrender.com`).

### 2. Deploy the Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite Rule**:
  - Source: `/*`
  - Destination: `/index.html`
- **Environment Variables**:
  - `VITE_API_URL`: Your backend URL (e.g., `https://ml-heart-backend.onrender.com`)

---

## 💻 Local Development

### 1. Start Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*Backend runs on `http://127.0.0.1:5000`.*

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` (requests to `/api` proxy automatically to the backend).*

---

## 🧪 Model Ensembles & Metrics

| Model | Paradigm | Accuracy | Precision | Recall | F1 Score | ROC AUC | Latency |
|---|---|---|---|---|---|---|---|
| **Hybrid Ensemble** | Hybrid Soft-Voting | 73.97% | 75.91% | 69.45% | 72.54% | **80.54%** | 0.0217 ms |
| **XGBoost** | Boosting | 74.09% | 75.82% | 69.95% | 72.77% | **80.54%** | **0.0018 ms** |
| **Gradient Boosting** | Boosting | **74.21%** | 76.02% | 69.96% | **72.87%** | 80.46% | 0.0044 ms |
| **Random Forest** | Bagging | 73.75% | 75.95% | 68.72% | 72.16% | 80.38% | 0.0107 ms |
