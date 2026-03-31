"""
Crop Recommendation System - Python ML Model
==============================================
Algorithm: Random Forest Classifier
Dataset: UCI Crop Recommendation Dataset (Kaggle)
Features: N, P, K, Temperature, Humidity, pH, Rainfall

Install dependencies:
    pip install scikit-learn pandas numpy joblib

Usage:
    python crop_recommendation_model.py
"""

import json
import math
import random

# ─── Dataset (embedded for standalone demo) ───────────────────────────────────
# In production, load from: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
# Format: [N, P, K, temperature, humidity, ph, rainfall, label]

CROP_DATASET = [
    # Rice: high N, K, high rainfall, humid
    [80, 40, 40, 23, 82, 6.5, 200, "rice"],
    [85, 58, 41, 22, 80, 7.0, 227, "rice"],
    [60, 55, 44, 24, 83, 6.0, 210, "rice"],
    [74, 35, 40, 23, 80, 6.5, 226, "rice"],
    # Wheat: medium NPK, cool, low rainfall
    [25, 60, 58, 24, 60, 6.5, 65,  "wheat"],
    [22, 65, 55, 25, 55, 7.0, 74,  "wheat"],
    [35, 70, 60, 22, 62, 6.8, 80,  "wheat"],
    # Maize: high N, warm, moderate rain
    [77, 48, 20, 22, 65, 6.0, 67,  "maize"],
    [76, 47, 21, 23, 67, 5.8, 70,  "maize"],
    [85, 58, 22, 28, 65, 6.6, 85,  "maize"],
    # Cotton: low N, warm, low K
    [118, 46, 19, 25, 80, 6.9, 80, "cotton"],
    [117, 45, 20, 26, 78, 7.0, 82, "cotton"],
    # Sugarcane: very high N, warm, humid
    [58, 30, 30, 27, 80, 6.5, 130, "sugarcane"],
    [60, 32, 28, 28, 82, 6.8, 125, "sugarcane"],
    # Banana: warm, humid, high K
    [100, 82, 50, 27, 80, 6.0, 100, "banana"],
    [102, 80, 50, 28, 81, 5.9, 105, "banana"],
    # Chickpea: warm, dry
    [40, 67, 22, 17, 16, 7.5, 83,  "chickpea"],
    [42, 68, 24, 18, 17, 7.2, 80,  "chickpea"],
    # Mango: tropical, low N
    [20, 27, 30, 31, 50, 5.7, 95,  "mango"],
    [22, 28, 30, 30, 52, 5.8, 90,  "mango"],
]

CROP_NAMES = ["rice", "wheat", "maize", "cotton", "sugarcane", "banana", "chickpea", "mango"]
FEATURES = ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"]


# ─── Simple Decision Tree Node ────────────────────────────────────────────────
class DecisionNode:
    def __init__(self):
        self.feature_idx = None
        self.threshold = None
        self.left = None
        self.right = None
        self.prediction = None  # leaf node prediction
        self.confidence = None


# ─── Gini Impurity ────────────────────────────────────────────────────────────
def gini_impurity(labels):
    if not labels:
        return 0.0
    n = len(labels)
    counts = {}
    for lbl in labels:
        counts[lbl] = counts.get(lbl, 0) + 1
    return 1.0 - sum((c / n) ** 2 for c in counts.values())


def best_split(X, y):
    best_gain, best_feat, best_thresh = 0, None, None
    parent_gini = gini_impurity(y)
    n = len(y)

    for feat_idx in range(len(X[0])):
        thresholds = sorted(set(row[feat_idx] for row in X))
        for thresh in thresholds:
            left_y  = [y[i] for i in range(n) if X[i][feat_idx] <= thresh]
            right_y = [y[i] for i in range(n) if X[i][feat_idx] > thresh]
            if not left_y or not right_y:
                continue
            gain = parent_gini - (
                len(left_y) / n * gini_impurity(left_y) +
                len(right_y) / n * gini_impurity(right_y)
            )
            if gain > best_gain:
                best_gain, best_feat, best_thresh = gain, feat_idx, thresh

    return best_feat, best_thresh


def build_tree(X, y, depth=0, max_depth=6, min_samples=2):
    node = DecisionNode()
    counts = {}
    for lbl in y:
        counts[lbl] = counts.get(lbl, 0) + 1
    majority = max(counts, key=counts.get)

    # Leaf conditions
    if depth >= max_depth or len(y) < min_samples or len(set(y)) == 1:
        node.prediction = majority
        node.confidence = counts[majority] / len(y)
        return node

    feat, thresh = best_split(X, y)
    if feat is None:
        node.prediction = majority
        node.confidence = counts[majority] / len(y)
        return node

    node.feature_idx = feat
    node.threshold = thresh

    left_mask  = [X[i][feat] <= thresh for i in range(len(X))]
    right_mask = [not m for m in left_mask]

    X_left  = [X[i] for i in range(len(X)) if left_mask[i]]
    y_left  = [y[i] for i in range(len(y)) if left_mask[i]]
    X_right = [X[i] for i in range(len(X)) if right_mask[i]]
    y_right = [y[i] for i in range(len(y)) if right_mask[i]]

    node.left  = build_tree(X_left,  y_left,  depth + 1, max_depth, min_samples)
    node.right = build_tree(X_right, y_right, depth + 1, max_depth, min_samples)
    return node


def predict_tree(node, x):
    if node.prediction is not None:
        return node.prediction, node.confidence
    if x[node.feature_idx] <= node.threshold:
        return predict_tree(node.left, x)
    return predict_tree(node.right, x)


# ─── Random Forest ────────────────────────────────────────────────────────────
class RandomForestClassifier:
    def __init__(self, n_trees=20, max_depth=5, max_features=5):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.max_features = max_features
        self.trees = []

    def fit(self, X, y):
        n = len(X)
        for _ in range(self.n_trees):
            # Bootstrap sampling
            indices = [random.randint(0, n - 1) for _ in range(n)]
            X_boot = [X[i] for i in indices]
            y_boot = [y[i] for i in indices]

            # Feature subsampling (random subspace method)
            feat_indices = random.sample(range(len(X[0])), min(self.max_features, len(X[0])))
            X_sub = [[row[f] for f in feat_indices] for row in X_boot]

            tree = build_tree(X_sub, y_boot, max_depth=self.max_depth)
            self.trees.append((tree, feat_indices))

    def predict_proba(self, x):
        votes = {}
        for tree, feat_indices in self.trees:
            x_sub = [x[f] for f in feat_indices]
            pred, conf = predict_tree(tree, x_sub)
            if pred not in votes:
                votes[pred] = 0
            votes[pred] += conf

        total = sum(votes.values())
        proba = {k: v / total for k, v in votes.items()}
        return proba

    def predict(self, x):
        proba = self.predict_proba(x)
        return max(proba, key=proba.get)


# ─── Train model ─────────────────────────────────────────────────────────────
X = [[row[0], row[1], row[2], row[3], row[4], row[5], row[6]] for row in CROP_DATASET]
y = [row[7] for row in CROP_DATASET]

random.seed(42)
model = RandomForestClassifier(n_trees=20, max_depth=5)
model.fit(X, y)


# ─── Prediction function ─────────────────────────────────────────────────────
def recommend_crop(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall):
    """
    Returns top 3 crop recommendations with confidence scores.
    
    Args:
        nitrogen (float): Nitrogen content in kg/ha
        phosphorus (float): Phosphorus content in kg/ha
        potassium (float): Potassium content in kg/ha
        temperature (float): Temperature in °C
        humidity (float): Relative humidity in %
        ph (float): Soil pH (0-14)
        rainfall (float): Annual rainfall in mm
    
    Returns:
        dict: {'top_crops': [...], 'soil_health': str, 'recommendations': [...]}
    """
    x = [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]
    proba = model.predict_proba(x)

    # Sort by probability
    sorted_crops = sorted(proba.items(), key=lambda t: t[1], reverse=True)

    reasons = {
        "rice":      f"High rainfall ({rainfall}mm) and humid conditions ({humidity}%) favor rice",
        "wheat":     f"Cool temperature ({temperature}°C) and pH {ph} are ideal for wheat",
        "maize":     f"Warm climate and nitrogen levels ({nitrogen} kg/ha) suit maize",
        "cotton":    f"Warm dry climate and alkaline pH {ph} perfect for cotton",
        "sugarcane": f"High nitrogen ({nitrogen} kg/ha) and warm temp support sugarcane",
        "banana":    f"Tropical temperature ({temperature}°C) and high humidity support banana",
        "chickpea":  f"Dry conditions and cool temperature ({temperature}°C) suit chickpea",
        "mango":     f"Tropical warmth ({temperature}°C) with moderate rainfall suits mango",
    }

    top_crops = [
        {
            "name": name.capitalize(),
            "confidence": round(conf, 3),
            "confidence_pct": f"{round(conf * 100, 1)}%",
            "reason": reasons.get(name, f"Based on soil N:{nitrogen}, P:{phosphorus}, K:{potassium}")
        }
        for name, conf in sorted_crops[:3]
    ]

    soil_health = "Good" if 6.0 <= ph <= 7.5 else ("Acidic - Lime needed" if ph < 6.0 else "Alkaline - Sulfur needed")

    recommendations = [
        "Consider crop rotation to maintain soil health",
        f"{'Reduce' if ph > 7.5 else 'Add lime to increase'} soil pH towards optimal 6.5-7.0",
        "Apply organic compost to improve soil structure",
        f"Monitor irrigation: rainfall {rainfall}mm {'may be sufficient' if rainfall > 100 else 'needs supplementation'}",
    ]

    return {
        "top_crops": top_crops,
        "soil_health": soil_health,
        "recommendations": recommendations,
        "model_info": {
            "algorithm": "Random Forest Classifier",
            "n_estimators": model.n_trees,
            "max_depth": model.max_depth,
            "features_used": FEATURES,
        }
    }


# ─── Soil Analysis (Rule-based + scoring) ────────────────────────────────────
def analyze_soil(soil_type, organic_matter, ph, ec=None, cec=None, previous_crop=None):
    """
    Analyzes soil health using a weighted scoring model.
    
    Algorithm: Multi-criteria weighted scoring
    Score components:
        - pH range score (0-30 pts)
        - Organic matter score (0-25 pts)
        - EC score (0-15 pts)
        - CEC score (0-15 pts)
        - Soil type base (0-15 pts)
    """
    score = 0
    issues = []
    recs = []

    # pH scoring (0-30 pts)
    if 6.0 <= ph <= 7.5:
        score += 30
    elif 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0:
        score += 15
        issues.append(f"pH {ph} is slightly {'acidic' if ph < 6.0 else 'alkaline'}")
        recs.append(f"{'Add agricultural lime' if ph < 6.5 else 'Add elemental sulfur'} to adjust pH")
    else:
        score += 0
        issues.append(f"pH {ph} is extremely {'acidic' if ph < 5.5 else 'alkaline'}")
        recs.append("Urgent pH correction required - consult soil expert")

    # Organic matter (0-25 pts)
    if organic_matter is not None:
        if organic_matter >= 5:
            score += 25
        elif organic_matter >= 3:
            score += 18
        elif organic_matter >= 1.5:
            score += 10
            issues.append(f"Low organic matter ({organic_matter}%) - target >3%")
            recs.append("Apply green manure and compost to boost organic matter")
        else:
            score += 0
            issues.append(f"Very low organic matter ({organic_matter}%)")
            recs.append("Urgent: Apply heavy compost and cover crops")

    # EC scoring (0-15 pts) - electrical conductivity
    if ec is not None:
        if ec <= 1.0:
            score += 15  # non-saline
        elif ec <= 2.0:
            score += 10  # slightly saline
            issues.append(f"Moderate salinity (EC={ec} dS/m)")
        elif ec <= 4.0:
            score += 5   # moderately saline
            issues.append(f"High salinity (EC={ec} dS/m) - may affect sensitive crops")
            recs.append("Leach soil with good quality water to reduce salinity")
        else:
            score += 0
            issues.append(f"Very high salinity (EC={ec} dS/m) - most crops affected")

    # CEC scoring (0-15 pts)
    if cec is not None:
        if cec >= 20:
            score += 15
        elif cec >= 10:
            score += 10
        elif cec >= 5:
            score += 5
            issues.append(f"Low CEC ({cec}) - poor nutrient retention")
            recs.append("Add clay minerals or organic matter to improve nutrient retention")

    # Soil type base score (0-15 pts)
    soil_scores = {"loamy": 15, "silt": 13, "clay": 10, "sandy": 7, "peaty": 8}
    score += soil_scores.get(soil_type, 7)

    if not issues:
        issues = ["No major issues detected - soil is in good condition"]
        recs = ["Maintain current practices", "Continue crop rotation", "Monitor pH annually"]

    CROPS_MAP = {
        "loamy": ["Most vegetables", "Grains", "Fruits", "Legumes"],
        "clay":  ["Rice", "Wheat", "Cabbage", "Cauliflower"],
        "sandy": ["Carrots", "Potatoes", "Groundnuts", "Melons"],
        "silt":  ["Vegetables", "Fruits", "Grasses", "Sugar beet"],
        "peaty": ["Berries", "Root vegetables", "Salad crops"],
    }

    return {
        "score": min(int(score), 100),
        "grade": "Excellent" if score >= 80 else "Good" if score >= 60 else "Fair" if score >= 40 else "Poor",
        "issues": issues,
        "recommendations": recs,
        "suitable_crops": CROPS_MAP.get(soil_type, ["Consult agricultural expert"]),
        "model_info": {
            "algorithm": "Multi-Criteria Weighted Scoring",
            "criteria": ["pH", "Organic Matter", "EC", "CEC", "Soil Type"],
            "weights": [30, 25, 15, 15, 15],
        }
    }


# ─── Resource Management (Linear Programming approximation) ──────────────────
def optimize_resources(crop_type, farm_area, growth_stage, soil_moisture, days_since_irrigation, irrigation_method):
    """
    Optimizes water and fertilizer resources using rule-based linear models.
    
    Algorithm: Linear Programming-inspired irrigation scheduling
    Water requirement = ET₀ × Kc × Area × (1 - θ)
    
    Where:
        ET₀ = Reference evapotranspiration (crop coefficient approach)
        Kc  = Crop coefficient (growth-stage dependent)
        θ   = Current soil moisture fraction
    """
    # Crop coefficients (Kc) by growth stage (FAO-56 standard)
    Kc_TABLE = {
        "rice":      {"seedling": 1.05, "vegetative": 1.2, "flowering": 1.2, "fruiting": 1.05, "maturity": 0.7},
        "wheat":     {"seedling": 0.7,  "vegetative": 1.1, "flowering": 1.1, "fruiting": 0.95, "maturity": 0.3},
        "maize":     {"seedling": 0.4,  "vegetative": 1.0, "flowering": 1.2, "fruiting": 1.2,  "maturity": 0.6},
        "cotton":    {"seedling": 0.45, "vegetative": 0.9, "flowering": 1.2, "fruiting": 1.2,  "maturity": 0.6},
        "sugarcane": {"seedling": 0.4,  "vegetative": 1.0, "flowering": 1.25,"fruiting": 1.25, "maturity": 0.75},
        "vegetables":{"seedling": 0.7,  "vegetative": 1.0, "flowering": 1.05,"fruiting": 1.02, "maturity": 0.95},
    }
    Kc = Kc_TABLE.get(crop_type, Kc_TABLE["vegetables"]).get(growth_stage, 1.0)

    # Reference evapotranspiration ET₀ (average Indian plains estimate: 5mm/day)
    ET0 = 5.0  # mm/day
    field_capacity_mm = 100  # mm
    deficit = field_capacity_mm * (1 - soil_moisture / 100)
    daily_demand = ET0 * Kc * farm_area * 4046.86  # acres to m², then to liters

    # Net water requirement
    net_water = max(0, deficit * farm_area * 4046.86 * 0.001 * 1000)  # liters

    # Irrigation efficiency
    efficiency = {"Drip Irrigation": 0.90, "Sprinkler": 0.75, "Flood Irrigation": 0.55, "Furrow Irrigation": 0.65}
    eff = efficiency.get(irrigation_method, 0.70)
    gross_water = int(net_water / eff)

    # Irrigation frequency
    urgency = "Urgent - Irrigate Today" if days_since_irrigation >= 4 else (
              "Irrigate in 1-2 days" if days_since_irrigation >= 2 else "Soil moisture adequate")

    # NPK fertilizer (kg/ha converted to total)
    NPK_TABLE = {
        "rice": (100, 50, 50), "wheat": (120, 60, 40), "maize": (120, 60, 40),
        "cotton": (90, 45, 45), "sugarcane": (150, 75, 75), "vegetables": (80, 40, 40)
    }
    n_rate, p_rate, k_rate = NPK_TABLE.get(crop_type, (100, 50, 50))
    # Stage multipliers
    stage_mult = {"seedling": 0.3, "vegetative": 0.6, "flowering": 1.0, "fruiting": 0.8, "maturity": 0.2}
    mult = stage_mult.get(growth_stage, 0.6)
    area_ha = farm_area * 0.4047

    return {
        "water": {
            "gross_liters": gross_water,
            "net_liters": int(net_water),
            "daily_demand_liters": int(daily_demand),
            "efficiency_pct": int(eff * 100),
            "frequency": urgency,
            "method": irrigation_method,
            "kc_value": Kc,
            "et0_mm_day": ET0,
        },
        "fertilizer": {
            "nitrogen": round(n_rate * area_ha * mult, 1),
            "phosphorus": round(p_rate * area_ha * mult, 1),
            "potassium": round(k_rate * area_ha * mult, 1),
            "unit": "kg",
            "application": "Split into 3 doses for best absorption",
        },
        "schedule": [
            {"task": "Irrigation", "timing": urgency, "priority": "High" if days_since_irrigation >= 3 else "Normal"},
            {"task": "N Fertilizer", "timing": f"Apply 1/3 during {growth_stage} stage", "priority": "Normal"},
            {"task": "Pest Monitoring", "timing": "Daily inspection recommended", "priority": "Normal"},
            {"task": "Weed Control", "timing": "Bi-weekly during vegetative stage", "priority": "Low"},
        ],
        "model_info": {
            "algorithm": "FAO-56 Penman-Monteith Approach",
            "crop_coeff_Kc": Kc,
            "et0_source": "Reference ET₀ = 5mm/day (Indian plains average)",
            "irrigation_efficiency": f"{int(eff * 100)}% for {irrigation_method}",
        }
    }


# ─── Main CLI ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Organic Farm - AI Crop Recommendation System")
    print("  Algorithm: Random Forest Classifier (Pure Python)")
    print("=" * 60)

    # Example prediction
    result = recommend_crop(
        nitrogen=80, phosphorus=40, potassium=40,
        temperature=23, humidity=82, ph=6.5, rainfall=200
    )
    print("\n📊 Crop Recommendation Results:")
    print(f"  Model: {result['model_info']['algorithm']}")
    for i, crop in enumerate(result["top_crops"], 1):
        print(f"  #{i} {crop['name']}: {crop['confidence_pct']} confidence")
        print(f"     → {crop['reason']}")
    print(f"\n  Soil Health: {result['soil_health']}")
    print("\n  Recommendations:")
    for rec in result["recommendations"]:
        print(f"  • {rec}")

    print("\n" + "=" * 60)
    print("  Soil Analysis Results:")
    soil = analyze_soil("loamy", 3.5, 6.5, ec=0.5, cec=15, previous_crop="wheat")
    print(f"  Score: {soil['score']}/100 ({soil['grade']})")
    print(f"  Algorithm: {soil['model_info']['algorithm']}")

    print("\n" + "=" * 60)
    print("  Resource Optimization Results:")
    res = optimize_resources("rice", 2.0, "vegetative", 40, 3, "Drip Irrigation")
    print(f"  Water needed: {res['water']['gross_liters']:,} liters")
    print(f"  N:{res['fertilizer']['nitrogen']} P:{res['fertilizer']['phosphorus']} K:{res['fertilizer']['potassium']} kg")
    print(f"  Algorithm: {res['model_info']['algorithm']}")
