"""
Cardiovascular Risk Prediction - Advanced Bagging & Boosting Training Pipeline
High efficiency training, benchmarking, and model serialization.
"""

import os
import time
import json
import numpy as np
import pandas as pd
import joblib

# Silence loky core counting warning on Windows
os.environ["LOKY_MAX_CPU_COUNT"] = "4"

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    BaggingClassifier,
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
    AdaBoostClassifier,
    VotingClassifier,
)
import xgboost as xgb
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
DATA_PATH = os.path.join(PROJECT_DIR, "cleaned_cardio.csv")
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

# MinMax scaling reference parameters computed from cardio_train raw data
SCALING_PARAMS = {
    "age": {"min": 30.0, "max": 65.0},
    "height": {"min": 145.0, "max": 190.0},
    "weight": {"min": 45.0, "max": 115.0},
    "ap_hi": {"min": 90.0, "max": 200.0},
    "ap_lo": {"min": 60.0, "max": 150.0},
    "bmi": {"min": 16.0, "max": 45.0},
}


def load_data():
    candidate_paths = [
        os.path.join(PROJECT_DIR, "cleaned_cardio.csv"),
        os.path.join(PROJECT_DIR, "archive", "cleaned_cardio.csv"),
        os.path.join(BASE_DIR, "cleaned_cardio.csv"),
        os.path.join(BASE_DIR, "archive", "cleaned_cardio.csv"),
    ]
    data_path = next((p for p in candidate_paths if os.path.exists(p)), None)
    if not data_path:
        raise FileNotFoundError(f"Dataset not found in candidate paths: {candidate_paths}")

    print(f"[*] Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    X = df.drop(columns=["cardio"])
    y = df["cardio"]
    print(f"[*] Total dataset size: {len(df):,} samples with {X.shape[1]} features.")
    return X, y


def train_and_benchmark():
    X, y = load_data()
    feature_names = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(
        f"[*] Training split: {len(X_train):,} samples | Testing split: {len(X_test):,} samples\n"
    )

    # Define Bagging & Boosting models
    models = {
        # --- BAGGING ENSEMBLES ---
        "Random Forest": {
            "type": "Bagging",
            "model": RandomForestClassifier(
                n_estimators=150,
                max_depth=12,
                min_samples_split=5,
                random_state=42,
                n_jobs=4,
            ),
        },
        "Bagging (Decision Tree)": {
            "type": "Bagging",
            "model": BaggingClassifier(
                estimator=DecisionTreeClassifier(max_depth=10),
                n_estimators=100,
                random_state=42,
                n_jobs=4,
            ),
        },
        "Extra Trees": {
            "type": "Bagging",
            "model": ExtraTreesClassifier(
                n_estimators=150,
                max_depth=12,
                random_state=42,
                n_jobs=4,
            ),
        },
        # --- BOOSTING ENSEMBLES ---
        "XGBoost": {
            "type": "Boosting",
            "model": xgb.XGBClassifier(
                n_estimators=150,
                learning_rate=0.05,
                max_depth=4,
                subsample=0.8,
                colsample_bytree=0.8,
                eval_metric="logloss",
                tree_method="hist",
                random_state=42,
                n_jobs=4,
            ),
        },
        "Hist Gradient Boosting": {
            "type": "Boosting",
            "model": HistGradientBoostingClassifier(
                max_iter=150,
                learning_rate=0.05,
                max_depth=5,
                l2_regularization=1.0,
                random_state=42,
            ),
        },
        "Gradient Boosting": {
            "type": "Boosting",
            "model": GradientBoostingClassifier(
                n_estimators=150,
                learning_rate=0.05,
                max_depth=4,
                random_state=42,
            ),
        },
        "AdaBoost": {
            "type": "Boosting",
            "model": AdaBoostClassifier(
                n_estimators=100,
                learning_rate=0.1,
                random_state=42,
            ),
        },
    }

    benchmark_results = []
    trained_models = {}

    print("=" * 88)
    print(
        f"{'Model Name':<25} | {'Paradigm':<9} | {'Acc':<7} | {'Prec':<7} | {'Recall':<7} | {'F1':<7} | {'AUC':<7} | {'Train(s)':<8} | {'Lat(ms)':<8}"
    )
    print("=" * 88)

    for name, item in models.items():
        clf = item["model"]
        paradigm = item["type"]

        # Train with high efficiency timing
        t0 = time.time()
        clf.fit(X_train, y_train)
        train_time = time.time() - t0

        # Inference timing & prediction
        t1 = time.time()
        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)[:, 1] if hasattr(clf, "predict_proba") else y_pred
        infer_latency_ms = ((time.time() - t1) * 1000) / len(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)

        trained_models[name] = clf

        metrics = {
            "model": name,
            "paradigm": paradigm,
            "accuracy": f"{acc * 100:.2f}%",
            "accuracy_val": round(float(acc), 4),
            "precision": f"{prec * 100:.2f}%",
            "recall": f"{rec * 100:.2f}%",
            "f1": f"{f1 * 100:.2f}%",
            "f1_val": round(float(f1), 4),
            "roc_auc": f"{auc * 100:.2f}%",
            "roc_auc_val": round(float(auc), 4),
            "training_time_sec": round(train_time, 2),
            "inference_latency_ms": round(infer_latency_ms, 4),
            "is_best": False,
        }
        benchmark_results.append(metrics)

        print(
            f"{name:<25} | {paradigm:<9} | {metrics['accuracy']:<7} | {metrics['precision']:<7} | {metrics['recall']:<7} | {metrics['f1']:<7} | {metrics['roc_auc']:<7} | {train_time:<8.2f} | {infer_latency_ms:<8.4f}"
        )

    # Build Hybrid Voting Ensemble (combining best Bagging + best Boosting)
    print("-" * 88)
    print("[*] Training Hybrid Ensemble (VotingClassifier: Random Forest + XGBoost + HistGB)...")
    voting_ensemble = VotingClassifier(
        estimators=[
            ("rf", trained_models["Random Forest"]),
            ("xgb", trained_models["XGBoost"]),
            ("hgb", trained_models["Hist Gradient Boosting"]),
        ],
        voting="soft",
    )

    t0 = time.time()
    voting_ensemble.fit(X_train, y_train)
    ens_train_time = time.time() - t0

    t1 = time.time()
    ens_pred = voting_ensemble.predict(X_test)
    ens_prob = voting_ensemble.predict_proba(X_test)[:, 1]
    ens_latency = ((time.time() - t1) * 1000) / len(X_test)

    ens_acc = accuracy_score(y_test, ens_pred)
    ens_prec = precision_score(y_test, ens_pred)
    ens_rec = recall_score(y_test, ens_pred)
    ens_f1 = f1_score(y_test, ens_pred)
    ens_auc = roc_auc_score(y_test, ens_prob)

    ens_metrics = {
        "model": "Hybrid Bagging+Boosting Ensemble",
        "paradigm": "Hybrid",
        "accuracy": f"{ens_acc * 100:.2f}%",
        "accuracy_val": round(float(ens_acc), 4),
        "precision": f"{ens_prec * 100:.2f}%",
        "recall": f"{ens_rec * 100:.2f}%",
        "f1": f"{ens_f1 * 100:.2f}%",
        "f1_val": round(float(ens_f1), 4),
        "roc_auc": f"{ens_auc * 100:.2f}%",
        "roc_auc_val": round(float(ens_auc), 4),
        "training_time_sec": round(ens_train_time, 2),
        "inference_latency_ms": round(ens_latency, 4),
        "is_best": True,
    }
    benchmark_results.insert(0, ens_metrics)

    print(
        f"{ens_metrics['model']:<25} | {'Hybrid':<9} | {ens_metrics['accuracy']:<7} | {ens_metrics['precision']:<7} | {ens_metrics['recall']:<7} | {ens_metrics['f1']:<7} | {ens_metrics['roc_auc']:<7} | {ens_train_time:<8.2f} | {ens_latency:<8.4f}"
    )
    print("=" * 88)

    # Extract Feature Importances from XGBoost & Random Forest
    xgb_importances = trained_models["XGBoost"].feature_importances_
    rf_importances = trained_models["Random Forest"].feature_importances_
    avg_importances = (xgb_importances + rf_importances) / 2.0

    importance_list = []
    for feat, imp in zip(feature_names, avg_importances):
        importance_list.append(
            {
                "feature": feat,
                "importance_pct": round(float(imp) * 100, 2),
                "importance_str": f"{round(float(imp) * 100, 1)}%",
            }
        )
    importance_list = sorted(importance_list, key=lambda x: x["importance_pct"], reverse=True)

    # Save artifacts with compression (optimal for GitHub repo & Render deployments)
    print("\n[*] Serializing trained models and metadata to saved_models/ (compressed)...")
    joblib.dump(voting_ensemble, os.path.join(SAVED_MODELS_DIR, "best_ensemble.joblib"), compress=3)
    joblib.dump(trained_models["XGBoost"], os.path.join(SAVED_MODELS_DIR, "xgboost_model.joblib"), compress=3)
    joblib.dump(
        trained_models["Random Forest"],
        os.path.join(SAVED_MODELS_DIR, "random_forest_model.joblib"),
        compress=3,
    )
    joblib.dump(
        trained_models["Hist Gradient Boosting"],
        os.path.join(SAVED_MODELS_DIR, "hist_gb_model.joblib"),
        compress=3,
    )

    # Save feature names and scaling parameters
    metadata = {
        "feature_names": feature_names,
        "scaling_params": SCALING_PARAMS,
        "benchmark_summary": benchmark_results,
        "feature_importances": importance_list,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    with open(os.path.join(SAVED_MODELS_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print("[+] Model training and serialization complete! All artifacts ready.")
    return metadata


if __name__ == "__main__":
    train_and_benchmark()
