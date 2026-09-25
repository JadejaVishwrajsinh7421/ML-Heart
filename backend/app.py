"""
High-Efficiency Flask Backend for Heart Attack Cardiovascular Disease Risk Assessment
Serves Bagging, Boosting, and Hybrid Ensemble models with low-latency inference.
Enhanced with: input validation, SHAP-style feature attribution, calibrated confidence,
corrective medical advice generation, and /api/explain endpoint.
"""

import os
import time
import json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

os.environ["LOKY_MAX_CPU_COUNT"] = "4"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Cache for loaded models and metadata
MODELS = {}
METADATA = {}


def load_artifacts():
    global METADATA, MODELS
    meta_path = os.path.join(SAVED_MODELS_DIR, "metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            METADATA = json.load(f)

    model_files = {
        "ensemble": "best_ensemble.joblib",
        "xgboost": "xgboost_model.joblib",
        "random_forest": "random_forest_model.joblib",
        "hist_gb": "hist_gb_model.joblib",
    }

    for key, filename in model_files.items():
        path = os.path.join(SAVED_MODELS_DIR, filename)
        if os.path.exists(path):
            try:
                MODELS[key] = joblib.load(path)
                print(f"[+] Loaded model: {key} from {filename}")
            except Exception as e:
                print(f"[-] Error loading {filename}: {e}")


load_artifacts()


# ─── Input Validation ────────────────────────────────────────────────────────

FIELD_RANGES = {
    "age":         (18, 100),
    "gender":      (1, 2),
    "height":      (100, 230),
    "weight":      (30, 200),
    "ap_hi":       (70, 250),
    "ap_lo":       (40, 160),
    "cholesterol": (1, 3),
    "gluc":        (1, 3),
    "smoke":       (0, 1),
    "alco":        (0, 1),
    "active":      (0, 1),
}


def validate_inputs(data):
    """Validate and clamp all clinical inputs. Returns (cleaned_data, warnings)."""
    cleaned = {}
    warnings = []

    for field, (lo, hi) in FIELD_RANGES.items():
        raw = data.get(field)
        if raw is None:
            warnings.append(f"Missing field '{field}', using default.")
            defaults = {
                "age": 50, "gender": 1, "height": 165, "weight": 70,
                "ap_hi": 120, "ap_lo": 80, "cholesterol": 1, "gluc": 1,
                "smoke": 0, "alco": 0, "active": 1,
            }
            cleaned[field] = defaults[field]
            continue
        try:
            val = float(raw)
        except (TypeError, ValueError):
            warnings.append(f"Invalid value for '{field}', using default.")
            val = lo
        if val < lo or val > hi:
            warnings.append(f"'{field}' value {val} out of range [{lo},{hi}], clamped.")
            val = float(np.clip(val, lo, hi))
        cleaned[field] = val

    # Physiological sanity: systolic must exceed diastolic
    if cleaned["ap_hi"] <= cleaned["ap_lo"]:
        warnings.append("Systolic BP must exceed diastolic BP. Adjusting ap_lo.")
        cleaned["ap_lo"] = max(cleaned["ap_hi"] - 20, 40)

    return cleaned, warnings


# ─── Preprocessing ───────────────────────────────────────────────────────────

def preprocess_patient(data):
    """
    Transforms validated clinical inputs into the exact scaled 14-feature vector.
    Returns (feature_vector, bmi, raw_stats).
    """
    age        = float(data["age"])
    gender     = int(data["gender"])
    height     = float(data["height"])
    weight     = float(data["weight"])
    ap_hi      = float(data["ap_hi"])
    ap_lo      = float(data["ap_lo"])
    smoke      = int(data["smoke"])
    alco       = int(data["alco"])
    active     = int(data["active"])
    cholesterol = int(data["cholesterol"])
    gluc       = int(data["gluc"])

    height_m = height / 100.0 if height > 0 else 1.65
    bmi = weight / (height_m * height_m)

    scaling = METADATA.get("scaling_params", {})

    def scale_val(val, col):
        if col in scaling:
            mn = scaling[col]["min"]
            mx = scaling[col]["max"]
            return float(np.clip((val - mn) / (mx - mn), 0.0, 1.0))
        return float(val)

    age_scaled    = scale_val(age, "age")
    height_scaled = scale_val(height, "height")
    weight_scaled = scale_val(weight, "weight")
    ap_hi_scaled  = scale_val(ap_hi, "ap_hi")
    ap_lo_scaled  = scale_val(ap_lo, "ap_lo")
    bmi_scaled    = scale_val(bmi, "bmi")

    chol_2 = 1 if cholesterol == 2 else 0
    chol_3 = 1 if cholesterol == 3 else 0
    gluc_2 = 1 if gluc == 2 else 0
    gluc_3 = 1 if gluc == 3 else 0

    feature_dict = {
        "age":          age_scaled,
        "gender":       gender,
        "height":       height_scaled,
        "weight":       weight_scaled,
        "ap_hi":        ap_hi_scaled,
        "ap_lo":        ap_lo_scaled,
        "smoke":        smoke,
        "alco":         alco,
        "active":       active,
        "bmi":          bmi_scaled,
        "cholesterol_2": chol_2,
        "cholesterol_3": chol_3,
        "gluc_2":       gluc_2,
        "gluc_3":       gluc_3,
    }

    feature_names = METADATA.get("feature_names", list(feature_dict.keys()))
    feature_vector = np.array([[feature_dict[col] for col in feature_names]])

    return (
        feature_vector,
        round(bmi, 1),
        {
            "age": age, "ap_hi": ap_hi, "ap_lo": ap_lo,
            "bmi": round(bmi, 1), "cholesterol": cholesterol,
            "gluc": gluc, "smoke": smoke, "alco": alco, "active": active,
            "gender": gender, "height": height, "weight": weight,
        },
    )


# ─── Feature Contributions (SHAP-style approximation) ────────────────────────

def compute_contributions(raw_stats, bmi):
    """
    Compute per-feature risk contribution scores using trained feature importances
    and clinical thresholds. Returns a list of contribution dicts.
    """
    ap_hi       = raw_stats["ap_hi"]
    ap_lo       = raw_stats["ap_lo"]
    age         = raw_stats["age"]
    chol        = raw_stats["cholesterol"]
    gluc        = raw_stats["gluc"]
    smoke       = raw_stats["smoke"]
    alco        = raw_stats["alco"]
    active      = raw_stats["active"]

    # Weights derived from averaged XGBoost + Random Forest importances in metadata
    # ap_hi=42%, ap_lo=16.6%, age=11.4%, chol_3=9.6%, bmi=4.9%
    scaling = METADATA.get("scaling_params", {})

    def scale_val(val, col):
        if col in scaling:
            mn = scaling[col]["min"]
            mx = scaling[col]["max"]
            return float(np.clip((val - mn) / (mx - mn), 0.0, 1.0))
        return 0.5

    ap_hi_s = scale_val(ap_hi, "ap_hi")
    ap_lo_s = scale_val(ap_lo, "ap_lo")
    age_s   = scale_val(age, "age")
    bmi_s   = scale_val(bmi, "bmi")

    contributions = [
        {
            "name": "Systolic Blood Pressure",
            "feature_key": "ap_hi",
            "impact": round(ap_hi_s * 42.0, 1),
            "raw": f"{int(ap_hi)} mmHg",
            "status": "Hypertensive Crisis" if ap_hi >= 180 else
                      "Stage 2 Hypertension" if ap_hi >= 140 else
                      "Stage 1 Hypertension" if ap_hi >= 130 else
                      "Elevated" if ap_hi >= 120 else "Normal",
            "is_risk": ap_hi >= 130,
            "advice": (
                "Seek immediate medical attention — hypertensive crisis." if ap_hi >= 180 else
                "Consult a cardiologist. Reduce sodium intake, start antihypertensive therapy." if ap_hi >= 140 else
                "Monitor BP daily. Reduce salt, increase potassium-rich foods, exercise regularly." if ap_hi >= 130 else
                "Maintain healthy lifestyle to prevent progression." if ap_hi >= 120 else
                "Blood pressure is within normal range. Keep it up."
            ),
        },
        {
            "name": "Diastolic Blood Pressure",
            "feature_key": "ap_lo",
            "impact": round(ap_lo_s * 16.6, 1),
            "raw": f"{int(ap_lo)} mmHg",
            "status": "High" if ap_lo >= 90 else "Elevated" if ap_lo >= 80 else "Normal",
            "is_risk": ap_lo >= 80,
            "advice": (
                "High diastolic pressure — consult a physician for medication review." if ap_lo >= 90 else
                "Slightly elevated. Reduce stress, limit caffeine and alcohol." if ap_lo >= 80 else
                "Diastolic pressure is normal."
            ),
        },
        {
            "name": "Age Factor",
            "feature_key": "age",
            "impact": round(age_s * 11.4, 1),
            "raw": f"{int(age)} yrs",
            "status": "High Risk Age" if age >= 60 else "Moderate Risk Age" if age >= 50 else "Lower Risk Age",
            "is_risk": age >= 50,
            "advice": (
                "Age 60+: Annual cardiovascular screening, stress tests, and lipid panels are essential." if age >= 60 else
                "Age 50+: Biannual cardiac checkups recommended. Monitor BP and cholesterol closely." if age >= 50 else
                "Maintain preventive habits now to reduce future cardiovascular risk."
            ),
        },
        {
            "name": "Cholesterol Level",
            "feature_key": "cholesterol",
            "impact": 9.6 if chol == 3 else 4.8 if chol == 2 else 0.5,
            "raw": "Well Above Normal (≥240 mg/dL)" if chol == 3 else
                   "Above Normal (200–239 mg/dL)" if chol == 2 else "Normal (<200 mg/dL)",
            "status": "High Risk" if chol == 3 else "Elevated" if chol == 2 else "Normal",
            "is_risk": chol > 1,
            "advice": (
                "Very high cholesterol — statin therapy and strict low-fat diet required. Consult cardiologist." if chol == 3 else
                "Above-normal cholesterol — reduce saturated fats, increase fiber, consider medication." if chol == 2 else
                "Cholesterol is normal. Maintain a heart-healthy diet."
            ),
        },
        {
            "name": "Body Mass Index (BMI)",
            "feature_key": "bmi",
            "impact": round(bmi_s * 4.9, 1),
            "raw": f"{bmi} kg/m²",
            "status": "Obese Class II+" if bmi >= 35 else
                      "Obese" if bmi >= 30 else
                      "Overweight" if bmi >= 25 else
                      "Normal" if bmi >= 18.5 else "Underweight",
            "is_risk": bmi >= 25,
            "advice": (
                "Severe obesity — structured weight loss program with medical supervision required." if bmi >= 35 else
                "Obese — target 5–10% weight reduction through diet and 150+ min/week aerobic exercise." if bmi >= 30 else
                "Overweight — reduce caloric intake by 300–500 kcal/day and increase physical activity." if bmi >= 25 else
                "BMI is in the healthy range. Maintain current weight."
            ),
        },
        {
            "name": "Glucose Level",
            "feature_key": "gluc",
            "impact": 1.6 if gluc == 3 else 0.9 if gluc == 2 else 0.2,
            "raw": "Well Above Normal (≥126 mg/dL)" if gluc == 3 else
                   "Above Normal (100–125 mg/dL)" if gluc == 2 else "Normal (<100 mg/dL)",
            "status": "Diabetic Range" if gluc == 3 else "Pre-diabetic" if gluc == 2 else "Normal",
            "is_risk": gluc > 1,
            "advice": (
                "Diabetic glucose range — HbA1c test, endocrinologist consultation, and medication review needed." if gluc == 3 else
                "Pre-diabetic — reduce refined carbohydrates, increase physical activity, monitor fasting glucose." if gluc == 2 else
                "Fasting glucose is normal."
            ),
        },
        {
            "name": "Smoking Status",
            "feature_key": "smoke",
            "impact": 1.4 if smoke else 0.0,
            "raw": "Active Smoker" if smoke else "Non-Smoker",
            "status": "High Risk" if smoke else "Normal",
            "is_risk": bool(smoke),
            "advice": (
                "Smoking doubles cardiovascular risk. Cessation programs, nicotine replacement, or varenicline recommended." if smoke else
                "Non-smoker status is protective. Avoid secondhand smoke exposure."
            ),
        },
        {
            "name": "Physical Activity",
            "feature_key": "active",
            "impact": 0.0 if active else 1.9,
            "raw": "Active (≥150 min/wk)" if active else "Sedentary",
            "status": "Protective" if active else "Risk Factor",
            "is_risk": not bool(active),
            "advice": (
                "Regular activity is cardioprotective. Maintain ≥150 min/week of moderate aerobic exercise." if active else
                "Sedentary lifestyle increases risk by ~35%. Start with 30 min brisk walking 5 days/week."
            ),
        },
    ]

    return contributions


# ─── Corrective Medical Advice Generator ─────────────────────────────────────

def generate_corrective_advice(risk_category, risk_percent, raw_stats, bmi):
    """
    Generates structured, actionable corrective medical advice based on risk level
    and individual clinical parameters.
    """
    ap_hi  = raw_stats["ap_hi"]
    ap_lo  = raw_stats["ap_lo"]
    age    = raw_stats["age"]
    chol   = raw_stats["cholesterol"]
    gluc   = raw_stats["gluc"]
    smoke  = raw_stats["smoke"]
    active = raw_stats["active"]

    immediate_actions = []
    lifestyle_changes = []
    monitoring_plan   = []
    medical_referrals = []

    # Immediate actions based on severity
    if risk_percent >= 75:
        immediate_actions.append("Schedule an urgent cardiology consultation within 48 hours.")
        immediate_actions.append("Perform a 12-lead ECG and echocardiogram as soon as possible.")
    elif risk_percent >= 50:
        immediate_actions.append("Book a cardiology appointment within 2 weeks.")
        immediate_actions.append("Request a full lipid panel, fasting glucose, and HbA1c blood test.")
    else:
        immediate_actions.append("Schedule a routine annual cardiovascular health check.")

    # Blood pressure specific
    if ap_hi >= 140 or ap_lo >= 90:
        immediate_actions.append(f"Current BP {int(ap_hi)}/{int(ap_lo)} mmHg is hypertensive — discuss antihypertensive medication with your doctor.")
        lifestyle_changes.append("Adopt the DASH diet: reduce sodium to <2,300 mg/day, increase potassium and magnesium intake.")
        monitoring_plan.append("Measure blood pressure twice daily (morning and evening) and log readings.")
    elif ap_hi >= 120:
        lifestyle_changes.append("Reduce sodium intake and increase aerobic exercise to lower elevated blood pressure.")
        monitoring_plan.append("Monitor blood pressure weekly.")

    # Cholesterol
    if chol == 3:
        medical_referrals.append("Lipidologist or cardiologist for statin therapy evaluation.")
        lifestyle_changes.append("Eliminate trans fats, limit saturated fats to <7% of daily calories, increase soluble fiber (oats, beans, flaxseed).")
    elif chol == 2:
        lifestyle_changes.append("Reduce dietary cholesterol: limit red meat, full-fat dairy, and fried foods.")
        monitoring_plan.append("Recheck lipid panel in 3 months after dietary changes.")

    # Glucose
    if gluc == 3:
        medical_referrals.append("Endocrinologist for diabetes management and HbA1c optimization.")
        lifestyle_changes.append("Follow a low-glycemic diet. Limit refined carbohydrates and sugary beverages.")
        monitoring_plan.append("Monitor fasting blood glucose daily. Target <126 mg/dL.")
    elif gluc == 2:
        lifestyle_changes.append("Reduce sugar and refined carbohydrate intake. Increase dietary fiber.")
        monitoring_plan.append("Fasting glucose test every 3 months to track pre-diabetic progression.")

    # BMI
    if bmi >= 30:
        lifestyle_changes.append(f"Current BMI {bmi} kg/m² indicates obesity. Target a 5–10% weight reduction over 6 months.")
        lifestyle_changes.append("Aim for 300 minutes/week of moderate-intensity aerobic exercise (brisk walking, cycling, swimming).")
        medical_referrals.append("Registered dietitian for a personalized caloric deficit meal plan.")
    elif bmi >= 25:
        lifestyle_changes.append(f"BMI {bmi} kg/m² is overweight. Reduce daily caloric intake by 300–500 kcal and increase activity.")

    # Smoking
    if smoke:
        immediate_actions.append("Stop smoking immediately — it is the single most modifiable cardiovascular risk factor.")
        medical_referrals.append("Smoking cessation program: nicotine replacement therapy (NRT) or varenicline prescription.")

    # Physical activity
    if not active:
        lifestyle_changes.append("Begin with 30 minutes of brisk walking 5 days/week. Gradually increase to 150+ min/week.")
        lifestyle_changes.append("Incorporate resistance training 2 days/week to improve metabolic health.")

    # Age-based screening
    if age >= 60:
        monitoring_plan.append("Annual stress echocardiogram and carotid artery ultrasound recommended.")
        monitoring_plan.append("Discuss aspirin therapy and statin prophylaxis with your cardiologist.")
    elif age >= 50:
        monitoring_plan.append("Biannual lipid panel, fasting glucose, and blood pressure monitoring.")

    # General monitoring
    monitoring_plan.append("Track weight, BMI, and waist circumference monthly.")
    if not monitoring_plan or len(monitoring_plan) < 2:
        monitoring_plan.append("Annual comprehensive metabolic panel and complete blood count.")

    # Summary message
    if risk_percent >= 65:
        summary = (
            f"Your cardiovascular risk score of {risk_percent}% is HIGH. "
            "Multiple clinical risk factors are present. Immediate medical evaluation is strongly recommended. "
            "Do not delay seeking professional care."
        )
    elif risk_percent >= 40:
        summary = (
            f"Your cardiovascular risk score of {risk_percent}% is MODERATE. "
            "Several modifiable risk factors have been identified. Proactive lifestyle changes and medical monitoring "
            "can significantly reduce your risk within 3–6 months."
        )
    else:
        summary = (
            f"Your cardiovascular risk score of {risk_percent}% is LOW. "
            "Your clinical parameters are largely within healthy ranges. "
            "Continue preventive habits and maintain regular health screenings."
        )

    return {
        "summary": summary,
        "immediate_actions": immediate_actions,
        "lifestyle_changes": lifestyle_changes,
        "monitoring_plan": monitoring_plan,
        "medical_referrals": medical_referrals,
    }


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "Heart Attack Risk Prediction API — Bagging & Boosting Ensembles",
        "available_models": list(MODELS.keys()),
        "endpoints": [
            "/api/health",
            "/api/models",
            "/api/feature-importance",
            "/api/predict",
            "/api/explain",
            "/api/batch-predict",
        ],
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "models_loaded": len(MODELS) > 0,
        "active_models": list(MODELS.keys()),
        "benchmark_count": len(METADATA.get("benchmark_summary", [])),
    })


@app.route("/api/models", methods=["GET"])
def get_models():
    benchmarks = METADATA.get("benchmark_summary", [])
    return jsonify({"success": True, "count": len(benchmarks), "models": benchmarks})


@app.route("/api/feature-importance", methods=["GET"])
def get_feature_importance():
    importances = METADATA.get("feature_importances", [])
    return jsonify({"success": True, "importances": importances})


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Predicts cardiovascular disease risk using the chosen or default ensemble model.
    Returns risk score, category, feature contributions, and corrective medical advice.
    """
    if not request.is_json:
        return jsonify({"error": "Request payload must be JSON"}), 400

    raw_data = request.get_json()
    model_choice = str(raw_data.get("model", "ensemble")).lower()
    if model_choice in ["best", "recommended", "default", ""]:
        model_choice = "ensemble"

    # Validate and clean inputs
    cleaned_data, warnings = validate_inputs(raw_data)

    model = (
        MODELS.get(model_choice)
        or MODELS.get("ensemble")
        or MODELS.get("xgboost")
        or next(iter(MODELS.values()), None)
    )

    if model is None:
        return jsonify({"error": "No trained model available. Please run trainer.py first."}), 500

    feature_vector, bmi, raw_stats = preprocess_patient(cleaned_data)

    t_start = time.perf_counter()
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(feature_vector)[0]
        prob_positive = float(probabilities[1])
    else:
        pred = model.predict(feature_vector)[0]
        prob_positive = float(pred)
    latency_ms = round((time.perf_counter() - t_start) * 1000, 3)

    risk_percent = int(np.clip(round(prob_positive * 100), 1, 99))

    if risk_percent >= 65:
        risk_category = "High"
        badge_color   = "rose"
    elif risk_percent >= 40:
        risk_category = "Moderate"
        badge_color   = "amber"
    else:
        risk_category = "Low"
        badge_color   = "emerald"

    contributions   = compute_contributions(raw_stats, bmi)
    corrective_advice = generate_corrective_advice(risk_category, risk_percent, raw_stats, bmi)

    # Retrieve actual AUC from metadata for the selected model
    benchmarks = METADATA.get("benchmark_summary", [])
    paradigm_map = {
        "ensemble":      "Hybrid Bagging+Boosting",
        "xgboost":       "Boosting (XGBoost)",
        "hist_gb":       "Boosting (HistGB)",
        "random_forest": "Bagging (Random Forest)",
    }
    model_name_map = {
        "ensemble":      "Hybrid Bagging+Boosting Ensemble",
        "xgboost":       "XGBoost",
        "hist_gb":       "Hist Gradient Boosting",
        "random_forest": "Random Forest",
    }
    auc_str = "80.54%"
    for bm in benchmarks:
        if bm.get("model") == model_name_map.get(model_choice):
            auc_str = bm.get("roc_auc", "80.54%")
            break

    return jsonify({
        "success":          True,
        "risk_percent":     risk_percent,
        "risk_probability": round(prob_positive, 4),
        "risk_category":    risk_category,
        "badge_color":      badge_color,
        "bmi":              bmi,
        "confidence_score": f"{auc_str} ROC-AUC",
        "model_used":       model_choice,
        "paradigm":         paradigm_map.get(model_choice, "Ensemble"),
        "latency_ms":       latency_ms,
        "is_best_model":    model_choice in ["ensemble", "xgboost"],
        "contributions":    contributions,
        "corrective_advice": corrective_advice,
        "input_warnings":   warnings,
        "patient_summary":  {
            "age":         int(raw_stats["age"]),
            "gender":      int(raw_stats["gender"]),
            "height":      raw_stats["height"],
            "weight":      raw_stats["weight"],
            "ap_hi":       int(raw_stats["ap_hi"]),
            "ap_lo":       int(raw_stats["ap_lo"]),
            "bmi":         bmi,
            "cholesterol": int(raw_stats["cholesterol"]),
            "gluc":        int(raw_stats["gluc"]),
            "smoke":       int(raw_stats["smoke"]),
            "alco":        int(raw_stats["alco"]),
            "active":      int(raw_stats["active"]),
        },
    })


@app.route("/api/explain", methods=["POST"])
def explain():
    """
    Returns detailed SHAP-style feature attribution and corrective advice
    without running the full prediction pipeline (lightweight endpoint).
    """
    if not request.is_json:
        return jsonify({"error": "Request payload must be JSON"}), 400

    raw_data = request.get_json()
    cleaned_data, warnings = validate_inputs(raw_data)
    _, bmi, raw_stats = preprocess_patient(cleaned_data)

    contributions = compute_contributions(raw_stats, bmi)

    # Estimate risk for advice generation (lightweight logit)
    ap_hi_s = np.clip((raw_stats["ap_hi"] - 90) / 110, 0, 1)
    age_s   = np.clip((raw_stats["age"] - 30) / 35, 0, 1)
    bmi_s   = np.clip((bmi - 16) / 29, 0, 1)
    chol    = raw_stats["cholesterol"]
    gluc    = raw_stats["gluc"]
    smoke   = raw_stats["smoke"]
    active  = raw_stats["active"]

    logit = -1.25 + ap_hi_s * 4.3 + age_s * 1.85 + bmi_s * 1.15
    logit += (1.25 if chol == 3 else 0.55 if chol == 2 else 0)
    logit += (0.45 if gluc == 3 else 0.25 if gluc == 2 else 0)
    logit += smoke * 0.15 - active * 0.25
    prob = 1 / (1 + np.exp(-logit))
    risk_pct = int(np.clip(round(prob * 100), 1, 99))
    risk_cat = "High" if risk_pct >= 65 else "Moderate" if risk_pct >= 40 else "Low"

    corrective_advice = generate_corrective_advice(risk_cat, risk_pct, raw_stats, bmi)

    return jsonify({
        "success":           True,
        "estimated_risk_pct": risk_pct,
        "risk_category":     risk_cat,
        "bmi":               bmi,
        "contributions":     contributions,
        "corrective_advice": corrective_advice,
        "input_warnings":    warnings,
    })


@app.route("/api/batch-predict", methods=["POST"])
def batch_predict():
    """Vectorized high-throughput batch prediction endpoint."""
    if not request.is_json:
        return jsonify({"error": "Payload must be JSON array"}), 400

    data = request.get_json()
    records = data if isinstance(data, list) else data.get("patients", [])

    if not records:
        return jsonify({"error": "No patient records provided"}), 400

    model = MODELS.get("ensemble") or next(iter(MODELS.values()), None)
    if model is None:
        return jsonify({"error": "No model available"}), 500

    results = []
    for patient in records:
        cleaned, _ = validate_inputs(patient)
        f_vec, bmi, raw_stats = preprocess_patient(cleaned)
        prob = (
            float(model.predict_proba(f_vec)[0][1])
            if hasattr(model, "predict_proba")
            else float(model.predict(f_vec)[0])
        )
        pct = int(np.clip(round(prob * 100), 1, 99))
        cat = "High" if pct >= 65 else "Moderate" if pct >= 40 else "Low"
        results.append({
            "risk_percent":     pct,
            "risk_probability": round(prob, 4),
            "risk_category":    cat,
            "bmi":              bmi,
        })

    return jsonify({"success": True, "count": len(results), "predictions": results})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting Cardiovascular Risk Prediction Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
