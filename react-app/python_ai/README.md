# Python AI Models — Organic Farm Platform

## Overview
These Python scripts implement the core ML algorithms behind the **AI Farming Tools** section.

## Scripts

### 1. `crop_recommendation_model.py`
- **Algorithm**: Random Forest Classifier (Pure Python, no sklearn)
- **Models implemented from scratch**:
  - Decision Tree with Gini Impurity splitting
  - Bootstrap sampling (Bagging)
  - Random subspace method (Feature subsampling)
- **Features**: N, P, K, Temperature, Humidity, pH, Rainfall
- **Output**: Top 3 crops with confidence scores

### 2. `soil_disease_model.py`
- **Algorithm 1**: Gaussian Naive Bayes for disease detection
  - Formula: `P(class|x) ∝ P(class) × ∏ P(xi|class)`
  - Gaussian probability density for continuous features
- **Algorithm 2**: Multiple Linear Regression for price prediction
  - Formula: `Price = β₀ + β₁×Month + β₂×Rainfall + β₃×Temp + β₄×Supply`

## Installation
```bash
pip install scikit-learn pandas numpy joblib
```

## Usage
```bash
python crop_recommendation_model.py
python soil_disease_model.py
```

## Integration with Spring Boot
The Python models can be served as a microservice using FastAPI:
```bash
pip install fastapi uvicorn
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

The React frontend calls these via the `aiApi` service in `src/services/api.js`.

## Algorithms Summary

| Tool | Algorithm | Technique |
|------|-----------|-----------|
| Crop Recommendation | Random Forest | Ensemble of Decision Trees |
| Soil Analysis | Weighted Scoring | Multi-criteria analysis |
| Disease Detection | Naive Bayes | Probabilistic classifier |
| Price Prediction | Linear Regression | Multiple regression |
| Resource Management | FAO-56 Penman-Monteith | Crop coefficient method |
| Weather | Open-Meteo API | Real-time meteorological data |
