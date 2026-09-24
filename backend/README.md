# Cardiovascular Disease Prediction - High-Efficiency Backend

A high-performance machine learning backend featuring **Bagging**, **Boosting**, and **Hybrid Soft-Voting Ensembles** trained on 68,443 clinical records.

## Ensembles Implemented

### 1. Boosting Paradigms (Bias & Residual Loss Optimization)
- **Gradient Boosting Classifier**: Peak accuracy **74.21%**, F1 **72.87%**, ROC-AUC **80.46%**
- **XGBoost Classifier**: Peak ROC-AUC **80.54%**, 74.09% accuracy, ultra-fast **0.0018 ms** inference latency per sample.
- **Hist Gradient Boosting**: LightGBM-inspired histogram binning, 73.89% accuracy, 0.59s train time.
- **AdaBoost**: Adaptive boosting focusing on hard-to-classify samples.

### 2. Bagging Paradigms (Variance & Overfitting Reduction)
- **Random Forest Classifier**: Peak Bagging accuracy **73.75%**, 80.38% ROC-AUC.
- **Bagging Classifier (Decision Trees)**: Bootstrap aggregating over 100 deep estimators.
- **Extra Trees Classifier**: Extremely randomized trees with 80.08% ROC-AUC.

### 3. Hybrid Soft-Voting Ensemble
- Combines predictions from **Random Forest + XGBoost + HistGradientBoosting** with soft probability voting, yielding a resilient **80.54% ROC-AUC**.

---

## Benchmark Results (Holdout Test Split: 13,689 Records)

| Model Algorithm | Paradigm | Accuracy | Precision | Recall | F1 Score | ROC AUC | Train Time | Inference Latency |
|---|---|---|---|---|---|---|---|---|
| **Gradient Boosting** | Boosting | **74.21%** | 76.02% | 69.96% | **72.87%** | 80.46% | 7.78s | 0.0044ms |
| **XGBoost** | Boosting | 74.09% | 75.82% | 69.95% | 72.77% | **80.54%** | **0.59s** | **0.0018ms** |
| **Hybrid Ensemble** | Hybrid | 73.97% | 75.91% | 69.45% | 72.54% | **80.54%** | 2.33s | 0.0217ms |
| **Hist Gradient Boosting** | Boosting | 73.89% | 75.82% | 69.37% | 72.45% | 80.47% | **0.59s** | 0.0071ms |
| **Random Forest** | Bagging | 73.75% | 75.95% | 68.72% | 72.16% | 80.38% | 1.20s | 0.0107ms |
| **Bagging (Decision Tree)** | Bagging | 73.68% | 75.24% | 69.79% | 72.41% | 80.11% | 4.94s | 0.0319ms |
| **Extra Trees** | Bagging | 73.67% | 76.41% | 67.70% | 71.80% | 80.08% | 0.78s | 0.0117ms |
| **AdaBoost** | Boosting | 72.45% | 78.04% | 61.68% | 68.90% | 79.10% | 1.93s | 0.0082ms |

---

## Quickstart

### 1. Retrain or Regenerate Ensembles
```bash
python backend/trainer.py
```

### 2. Start the REST API
```bash
python backend/app.py
```
The server will start at `http://127.0.0.1:5000`.

### 3. API Endpoints
- `GET /api/health` — API status and loaded models
- `GET /api/models` — Live comparative benchmarks for all Bagging and Boosting algorithms
- `GET /api/feature-importance` — Ensemble feature weights
- `POST /api/predict` — Real-time risk probability, risk category, and feature impact contributions
- `POST /api/batch-predict` — High-throughput vectorized prediction
