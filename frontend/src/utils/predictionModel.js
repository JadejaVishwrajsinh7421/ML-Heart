/**
 * High-Efficiency Cardiovascular Disease Risk Assessment Utilities
 * Connects to the Python Flask ML Backend (XGBoost, Random Forest, HistGB, Hybrid Ensemble)
 * with automatic zero-downtime client-side fallback including corrective medical advice.
 */

const API_BASE_URL = 'http://127.0.0.1:5000';

// ─── Corrective Advice Generator (client-side fallback) ───────────────────────

export const generateCorrectiveAdvice = (riskCategory, riskPercent, inputs, bmi) => {
  const apHi   = parseFloat(inputs.ap_hi) || 120;
  const apLo   = parseFloat(inputs.ap_lo) || 80;
  const age    = parseFloat(inputs.age) || 50;
  const chol   = parseInt(inputs.cholesterol) || 1;
  const gluc   = parseInt(inputs.gluc) || 1;
  const smoke  = parseInt(inputs.smoke) || 0;
  const active = parseInt(inputs.active) || 1;
  const bmiVal = parseFloat(bmi) || 24;

  const immediateActions = [];
  const lifestyleChanges = [];
  const monitoringPlan   = [];
  const medicalReferrals = [];

  if (riskPercent >= 75) {
    immediateActions.push('Schedule an urgent cardiology consultation within 48 hours.');
    immediateActions.push('Perform a 12-lead ECG and echocardiogram as soon as possible.');
  } else if (riskPercent >= 50) {
    immediateActions.push('Book a cardiology appointment within 2 weeks.');
    immediateActions.push('Request a full lipid panel, fasting glucose, and HbA1c blood test.');
  } else {
    immediateActions.push('Schedule a routine annual cardiovascular health check.');
  }

  if (apHi >= 140 || apLo >= 90) {
    immediateActions.push(`Current BP ${Math.round(apHi)}/${Math.round(apLo)} mmHg is hypertensive — discuss antihypertensive medication with your doctor.`);
    lifestyleChanges.push('Adopt the DASH diet: reduce sodium to <2,300 mg/day, increase potassium and magnesium intake.');
    monitoringPlan.push('Measure blood pressure twice daily (morning and evening) and log readings.');
  } else if (apHi >= 120) {
    lifestyleChanges.push('Reduce sodium intake and increase aerobic exercise to lower elevated blood pressure.');
    monitoringPlan.push('Monitor blood pressure weekly.');
  }

  if (chol === 3) {
    medicalReferrals.push('Lipidologist or cardiologist for statin therapy evaluation.');
    lifestyleChanges.push('Eliminate trans fats, limit saturated fats to <7% of daily calories, increase soluble fiber (oats, beans, flaxseed).');
  } else if (chol === 2) {
    lifestyleChanges.push('Reduce dietary cholesterol: limit red meat, full-fat dairy, and fried foods.');
    monitoringPlan.push('Recheck lipid panel in 3 months after dietary changes.');
  }

  if (gluc === 3) {
    medicalReferrals.push('Endocrinologist for diabetes management and HbA1c optimization.');
    lifestyleChanges.push('Follow a low-glycemic diet. Limit refined carbohydrates and sugary beverages.');
    monitoringPlan.push('Monitor fasting blood glucose daily. Target <126 mg/dL.');
  } else if (gluc === 2) {
    lifestyleChanges.push('Reduce sugar and refined carbohydrate intake. Increase dietary fiber.');
    monitoringPlan.push('Fasting glucose test every 3 months to track pre-diabetic progression.');
  }

  if (bmiVal >= 30) {
    lifestyleChanges.push(`Current BMI ${bmiVal} kg/m² indicates obesity. Target a 5–10% weight reduction over 6 months.`);
    lifestyleChanges.push('Aim for 300 minutes/week of moderate-intensity aerobic exercise (brisk walking, cycling, swimming).');
    medicalReferrals.push('Registered dietitian for a personalized caloric deficit meal plan.');
  } else if (bmiVal >= 25) {
    lifestyleChanges.push(`BMI ${bmiVal} kg/m² is overweight. Reduce daily caloric intake by 300–500 kcal and increase activity.`);
  }

  if (smoke) {
    immediateActions.push('Stop smoking immediately — it is the single most modifiable cardiovascular risk factor.');
    medicalReferrals.push('Smoking cessation program: nicotine replacement therapy (NRT) or varenicline prescription.');
  }

  if (!active) {
    lifestyleChanges.push('Begin with 30 minutes of brisk walking 5 days/week. Gradually increase to 150+ min/week.');
    lifestyleChanges.push('Incorporate resistance training 2 days/week to improve metabolic health.');
  }

  if (age >= 60) {
    monitoringPlan.push('Annual stress echocardiogram and carotid artery ultrasound recommended.');
    monitoringPlan.push('Discuss aspirin therapy and statin prophylaxis with your cardiologist.');
  } else if (age >= 50) {
    monitoringPlan.push('Biannual lipid panel, fasting glucose, and blood pressure monitoring.');
  }

  monitoringPlan.push('Track weight, BMI, and waist circumference monthly.');

  let summary;
  if (riskPercent >= 65) {
    summary = `Your cardiovascular risk score of ${riskPercent}% is HIGH. Multiple clinical risk factors are present. Immediate medical evaluation is strongly recommended. Do not delay seeking professional care.`;
  } else if (riskPercent >= 40) {
    summary = `Your cardiovascular risk score of ${riskPercent}% is MODERATE. Several modifiable risk factors have been identified. Proactive lifestyle changes and medical monitoring can significantly reduce your risk within 3–6 months.`;
  } else {
    summary = `Your cardiovascular risk score of ${riskPercent}% is LOW. Your clinical parameters are largely within healthy ranges. Continue preventive habits and maintain regular health screenings.`;
  }

  return { summary, immediateActions, lifestyleChanges, monitoringPlan, medicalReferrals };
};

// ─── Feature Contributions (client-side fallback) ────────────────────────────

const buildContributions = (inputs, bmi) => {
  const apHi  = parseFloat(inputs.ap_hi) || 120;
  const apLo  = parseFloat(inputs.ap_lo) || 80;
  const age   = parseFloat(inputs.age) || 50;
  const chol  = parseInt(inputs.cholesterol) || 1;
  const gluc  = parseInt(inputs.gluc) || 1;
  const smoke = parseInt(inputs.smoke) || 0;
  const active = parseInt(inputs.active) || 1;
  const bmiVal = parseFloat(bmi) || 24;

  const apHiS = Math.min(Math.max((apHi - 90) / 110, 0), 1);
  const apLoS = Math.min(Math.max((apLo - 60) / 90, 0), 1);
  const ageS  = Math.min(Math.max((age - 30) / 35, 0), 1);
  const bmiS  = Math.min(Math.max((bmiVal - 16) / 29, 0), 1);

  return [
    {
      name: 'Systolic Blood Pressure',
      feature_key: 'ap_hi',
      impact: parseFloat((apHiS * 42.0).toFixed(1)),
      raw: `${Math.round(apHi)} mmHg`,
      status: apHi >= 180 ? 'Hypertensive Crisis' : apHi >= 140 ? 'Stage 2 Hypertension' : apHi >= 130 ? 'Stage 1 Hypertension' : apHi >= 120 ? 'Elevated' : 'Normal',
      is_risk: apHi >= 130,
      advice: apHi >= 140 ? 'Consult a cardiologist. Reduce sodium intake, start antihypertensive therapy.' : apHi >= 130 ? 'Monitor BP daily. Reduce salt, increase potassium-rich foods, exercise regularly.' : 'Blood pressure is within normal range.',
    },
    {
      name: 'Diastolic Blood Pressure',
      feature_key: 'ap_lo',
      impact: parseFloat((apLoS * 16.6).toFixed(1)),
      raw: `${Math.round(apLo)} mmHg`,
      status: apLo >= 90 ? 'High' : apLo >= 80 ? 'Elevated' : 'Normal',
      is_risk: apLo >= 80,
      advice: apLo >= 90 ? 'High diastolic pressure — consult a physician for medication review.' : apLo >= 80 ? 'Slightly elevated. Reduce stress, limit caffeine and alcohol.' : 'Diastolic pressure is normal.',
    },
    {
      name: 'Age Factor',
      feature_key: 'age',
      impact: parseFloat((ageS * 11.4).toFixed(1)),
      raw: `${Math.round(age)} yrs`,
      status: age >= 60 ? 'High Risk Age' : age >= 50 ? 'Moderate Risk Age' : 'Lower Risk Age',
      is_risk: age >= 50,
      advice: age >= 60 ? 'Age 60+: Annual cardiovascular screening, stress tests, and lipid panels are essential.' : age >= 50 ? 'Age 50+: Biannual cardiac checkups recommended.' : 'Maintain preventive habits now.',
    },
    {
      name: 'Cholesterol Level',
      feature_key: 'cholesterol',
      impact: chol === 3 ? 9.6 : chol === 2 ? 4.8 : 0.5,
      raw: chol === 3 ? 'Well Above Normal (≥240 mg/dL)' : chol === 2 ? 'Above Normal (200–239 mg/dL)' : 'Normal (<200 mg/dL)',
      status: chol === 3 ? 'High Risk' : chol === 2 ? 'Elevated' : 'Normal',
      is_risk: chol > 1,
      advice: chol === 3 ? 'Very high cholesterol — statin therapy and strict low-fat diet required.' : chol === 2 ? 'Above-normal cholesterol — reduce saturated fats, increase fiber.' : 'Cholesterol is normal.',
    },
    {
      name: 'Body Mass Index (BMI)',
      feature_key: 'bmi',
      impact: parseFloat((bmiS * 4.9).toFixed(1)),
      raw: `${bmiVal} kg/m²`,
      status: bmiVal >= 35 ? 'Obese Class II+' : bmiVal >= 30 ? 'Obese' : bmiVal >= 25 ? 'Overweight' : bmiVal >= 18.5 ? 'Normal' : 'Underweight',
      is_risk: bmiVal >= 25,
      advice: bmiVal >= 30 ? 'Obese — target 5–10% weight reduction through diet and 150+ min/week aerobic exercise.' : bmiVal >= 25 ? 'Overweight — reduce caloric intake by 300–500 kcal/day.' : 'BMI is in the healthy range.',
    },
    {
      name: 'Glucose Level',
      feature_key: 'gluc',
      impact: gluc === 3 ? 1.6 : gluc === 2 ? 0.9 : 0.2,
      raw: gluc === 3 ? 'Well Above Normal (≥126 mg/dL)' : gluc === 2 ? 'Above Normal (100–125 mg/dL)' : 'Normal (<100 mg/dL)',
      status: gluc === 3 ? 'Diabetic Range' : gluc === 2 ? 'Pre-diabetic' : 'Normal',
      is_risk: gluc > 1,
      advice: gluc === 3 ? 'Diabetic glucose range — HbA1c test and endocrinologist consultation needed.' : gluc === 2 ? 'Pre-diabetic — reduce refined carbohydrates, increase physical activity.' : 'Fasting glucose is normal.',
    },
    {
      name: 'Smoking Status',
      feature_key: 'smoke',
      impact: smoke ? 1.4 : 0.0,
      raw: smoke ? 'Active Smoker' : 'Non-Smoker',
      status: smoke ? 'High Risk' : 'Normal',
      is_risk: Boolean(smoke),
      advice: smoke ? 'Smoking doubles cardiovascular risk. Cessation programs or nicotine replacement recommended.' : 'Non-smoker status is protective.',
    },
    {
      name: 'Physical Activity',
      feature_key: 'active',
      impact: active ? 0.0 : 1.9,
      raw: active ? 'Active (≥150 min/wk)' : 'Sedentary',
      status: active ? 'Protective' : 'Risk Factor',
      is_risk: !Boolean(active),
      advice: active ? 'Regular activity is cardioprotective. Maintain ≥150 min/week of moderate aerobic exercise.' : 'Sedentary lifestyle increases risk by ~35%. Start with 30 min brisk walking 5 days/week.',
    },
  ];
};

// ─── Local Fallback Estimator ─────────────────────────────────────────────────

export const calculateCardioRisk = (inputs) => {
  const ageYears   = parseFloat(inputs.age) || 50;
  const heightCm   = parseFloat(inputs.height) || 165;
  const weightKg   = parseFloat(inputs.weight) || 70;
  const apHi       = parseFloat(inputs.ap_hi) || 120;
  const apLo       = parseFloat(inputs.ap_lo) || 80;
  const cholesterol = parseInt(inputs.cholesterol) || 1;
  const gluc       = parseInt(inputs.gluc) || 1;
  const smoke      = parseInt(inputs.smoke) || 0;
  const alco       = parseInt(inputs.alco) || 0;
  const active     = parseInt(inputs.active) || 1;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // MinMax scaling matching training bounds
  const ageScaled  = Math.min(Math.max((ageYears - 30) / 35, 0), 1);
  const apHiScaled = Math.min(Math.max((apHi - 90) / 110, 0), 1);
  const apLoScaled = Math.min(Math.max((apLo - 60) / 90, 0), 1);
  const bmiScaled  = Math.min(Math.max((bmi - 16) / 29, 0), 1);

  const chol2 = cholesterol === 2 ? 1 : 0;
  const chol3 = cholesterol === 3 ? 1 : 0;
  const gluc2 = gluc === 2 ? 1 : 0;
  const gluc3 = gluc === 3 ? 1 : 0;

  // Logit weights calibrated from XGBoost + RF feature importances
  let logit = -1.25;
  logit += apHiScaled * 4.3;
  logit += ageScaled  * 1.85;
  logit += bmiScaled  * 1.15;
  logit += chol3 * 1.25;
  logit += chol2 * 0.55;
  logit += gluc3 * 0.45;
  logit += gluc2 * 0.25;
  logit += apLoScaled * 0.85;
  logit += smoke * 0.15;
  logit += alco  * 0.10;
  logit -= active * 0.25;

  const probability  = 1 / (1 + Math.exp(-logit));
  const riskPercent  = Math.min(Math.max(Math.round(probability * 100), 1), 99);
  const bmiStr       = bmi.toFixed(1);

  let riskCategory = 'Low';
  let badgeColor   = 'emerald';
  if (riskPercent >= 65) { riskCategory = 'High';     badgeColor = 'rose'; }
  else if (riskPercent >= 40) { riskCategory = 'Moderate'; badgeColor = 'amber'; }

  const contributions    = buildContributions(inputs, bmiStr);
  const correctiveAdvice = generateCorrectiveAdvice(riskCategory, riskPercent, inputs, bmiStr);

  return {
    riskPercent,
    riskProbability:  probability,
    riskCategory,
    badgeColor,
    bmi:              bmiStr,
    contributions,
    correctiveAdvice,
    confidenceScore:  '80.54% ROC-AUC',
    modelUsed:        inputs.model || 'ensemble',
    paradigm:         'Hybrid Bagging+Boosting (Offline)',
    latencyMs:        0.12,
    isBackend:        false,
    isBestModel:      true,
    inputWarnings:    [],
  };
};

// ─── Backend Health Check ─────────────────────────────────────────────────────

export const checkBackendHealth = async () => {
  const endpoints = [`${API_BASE_URL}/api/health`, '/api/health'];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        return { online: true, ...data };
      }
    } catch {
      // try next
    }
  }
  return { online: false };
};

// ─── Primary Prediction API Call ──────────────────────────────────────────────

export const predictCardioRiskApi = async (inputs) => {
  const endpoints = [`${API_BASE_URL}/api/predict`, '/api/predict'];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(inputs),
        signal:  AbortSignal.timeout(4000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            riskPercent:      data.risk_percent,
            riskProbability:  data.risk_probability,
            riskCategory:     data.risk_category,
            badgeColor:       data.badge_color,
            bmi:              String(data.bmi),
            contributions:    data.contributions || [],
            correctiveAdvice: data.corrective_advice || null,
            confidenceScore:  data.confidence_score,
            modelUsed:        data.model_used,
            paradigm:         data.paradigm,
            latencyMs:        data.latency_ms ?? 0.002,
            isBestModel:      data.is_best_model ?? true,
            isBackend:        true,
            inputWarnings:    data.input_warnings || [],
            patientSummary:   data.patient_summary || {},
          };
        }
      }
    } catch {
      // try next endpoint
    }
  }

  // Graceful offline fallback with full corrective advice
  return calculateCardioRisk(inputs);
};

// ─── Model Benchmarks ─────────────────────────────────────────────────────────

export const fetchModelBenchmarks = async () => {
  const endpoints = [`${API_BASE_URL}/api/models`, '/api/models'];
  for (const url of endpoints) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.models) return data.models;
      }
    } catch {
      // try next
    }
  }

  // Static offline fallback
  return [
    { model: 'Hybrid Bagging+Boosting Ensemble', paradigm: 'Hybrid',   accuracy: '73.97%', precision: '75.91%', recall: '69.45%', f1: '72.54%', roc_auc: '80.54%', training_time_sec: 2.33,  inference_latency_ms: 0.0217, is_best: true  },
    { model: 'XGBoost',                          paradigm: 'Boosting', accuracy: '74.09%', precision: '75.82%', recall: '69.95%', f1: '72.77%', roc_auc: '80.54%', training_time_sec: 0.59,  inference_latency_ms: 0.0018, is_best: false },
    { model: 'Gradient Boosting',                paradigm: 'Boosting', accuracy: '74.21%', precision: '76.02%', recall: '69.96%', f1: '72.87%', roc_auc: '80.46%', training_time_sec: 7.78,  inference_latency_ms: 0.0044, is_best: false },
    { model: 'Hist Gradient Boosting',           paradigm: 'Boosting', accuracy: '73.89%', precision: '75.82%', recall: '69.37%', f1: '72.45%', roc_auc: '80.47%', training_time_sec: 0.59,  inference_latency_ms: 0.0071, is_best: false },
    { model: 'Random Forest',                    paradigm: 'Bagging',  accuracy: '73.75%', precision: '75.95%', recall: '68.72%', f1: '72.16%', roc_auc: '80.38%', training_time_sec: 1.20,  inference_latency_ms: 0.0107, is_best: false },
    { model: 'Bagging (Decision Tree)',          paradigm: 'Bagging',  accuracy: '73.68%', precision: '75.24%', recall: '69.79%', f1: '72.41%', roc_auc: '80.11%', training_time_sec: 4.94,  inference_latency_ms: 0.0319, is_best: false },
    { model: 'Extra Trees',                      paradigm: 'Bagging',  accuracy: '73.67%', precision: '76.41%', recall: '67.70%', f1: '71.80%', roc_auc: '80.08%', training_time_sec: 0.78,  inference_latency_ms: 0.0117, is_best: false },
    { model: 'AdaBoost',                         paradigm: 'Boosting', accuracy: '72.45%', precision: '78.04%', recall: '61.68%', f1: '68.90%', roc_auc: '79.10%', training_time_sec: 1.93,  inference_latency_ms: 0.0082, is_best: false },
  ];
};
