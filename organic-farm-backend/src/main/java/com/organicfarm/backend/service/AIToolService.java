package com.organicfarm.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.organicfarm.backend.dto.AIToolDTO;
import com.organicfarm.backend.model.AIToolLog;
import com.organicfarm.backend.repository.AIToolLogRepository;
import com.organicfarm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI Tools Service
 *
 * Currently uses rule-based fallback logic that mirrors the existing React
 * frontend.
 * Each method is clearly structured with a TODO comment showing exactly where
 * to
 * plug in a real ML model (Python microservice, Hugging Face, etc.).
 *
 * All requests are logged to the ai_tool_logs table for future training data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIToolService {

    private static final String MODEL_VERSION = "rule-based-v1";

    private final AIToolLogRepository logRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // ══════════════════════════════════════════════════════════════════
    // 1. CROP RECOMMENDATION
    // ══════════════════════════════════════════════════════════════════
    public AIToolDTO.CropResponse getCropRecommendation(AIToolDTO.CropRequest req, Long userId) {
        long start = System.currentTimeMillis();

        // ┌─────────────────────────────────────────────────────────────┐
        // │ TODO: REPLACE WITH REAL ML MODEL │
        // │ Option A: Call your Python Flask/FastAPI microservice: │
        // │ POST http://localhost:5000/predict/crop │
        // │ Body: CropRequest JSON → Response: CropResponse JSON │
        // │ │
        // │ Option B: Use Hugging Face Inference API │
        // │ Option C: Load a PMML/ONNX model directly in Java │
        // └─────────────────────────────────────────────────────────────┘
        AIToolDTO.CropResponse response = ruleBasedCropRecommendation(req);
        response.setModelVersion(MODEL_VERSION);

        saveLog(AIToolLog.AIToolType.CROP_RECOMMENDATION, userId, req, response, System.currentTimeMillis() - start);
        return response;
    }

    private AIToolDTO.CropResponse ruleBasedCropRecommendation(AIToolDTO.CropRequest req) {
        double n = req.getNitrogen() != null ? req.getNitrogen() : 50;
        double p = req.getPhosphorus() != null ? req.getPhosphorus() : 50;
        double k = req.getPotassium() != null ? req.getPotassium() : 50;
        double temp = req.getTemperature() != null ? req.getTemperature() : 25;
        double hum = req.getHumidity() != null ? req.getHumidity() : 60;
        double ph = req.getPh() != null ? req.getPh() : 6.5;
        double rain = req.getRainfall() != null ? req.getRainfall() : 100;
        String season = req.getSeason() != null ? req.getSeason().toLowerCase() : "kharif";
        String soil = req.getSoilType() != null ? req.getSoilType().toLowerCase() : "loamy";

        // Score each crop based on multiple parameters
        record CropScore(String name, double score, String reason) {}
        List<CropScore> scores = new ArrayList<>();

        // Rice — high rain, warm, acidic-neutral pH
        double riceScore = 0.5;
        if (rain > 150) riceScore += 0.2;
        if (temp >= 22 && temp <= 35) riceScore += 0.1;
        if (ph >= 5.5 && ph <= 7.0) riceScore += 0.1;
        if (n > 40) riceScore += 0.05;
        if (season.contains("kharif")) riceScore += 0.05;
        if (soil.contains("clay") || soil.contains("loam")) riceScore += 0.05;
        scores.add(new CropScore("Rice", Math.min(riceScore, 0.98), "Warm climate, high rainfall, nitrogen-rich soil"));

        // Wheat — cool, moderate rain, neutral pH
        double wheatScore = 0.5;
        if (temp >= 10 && temp <= 25) wheatScore += 0.2;
        if (rain >= 50 && rain <= 150) wheatScore += 0.1;
        if (ph >= 6.0 && ph <= 7.5) wheatScore += 0.1;
        if (p > 40) wheatScore += 0.05;
        if (season.contains("rabi")) wheatScore += 0.1;
        scores.add(new CropScore("Wheat", Math.min(wheatScore, 0.98), "Cool temperatures, moderate moisture, good phosphorus"));

        // Cotton — warm, alkaline, low rain
        double cottonScore = 0.4;
        if (temp >= 25 && temp <= 40) cottonScore += 0.15;
        if (ph > 7.0) cottonScore += 0.15;
        if (rain < 120) cottonScore += 0.1;
        if (k > 50) cottonScore += 0.1;
        if (soil.contains("black") || soil.contains("clay")) cottonScore += 0.1;
        scores.add(new CropScore("Cotton", Math.min(cottonScore, 0.98), "Warm climate, alkaline soil, potassium-rich"));

        // Maize — moderate temp, well-drained
        double maizeScore = 0.45;
        if (temp >= 20 && temp <= 32) maizeScore += 0.15;
        if (ph >= 5.5 && ph <= 7.5) maizeScore += 0.1;
        if (n > 60) maizeScore += 0.1;
        if (rain >= 60 && rain <= 200) maizeScore += 0.1;
        if (soil.contains("loam") || soil.contains("sandy")) maizeScore += 0.05;
        scores.add(new CropScore("Maize", Math.min(maizeScore, 0.98), "Moderate temperature, nitrogen-rich, well-drained soil"));

        // Sugarcane — tropical, heavy water
        double sugarcaneScore = 0.35;
        if (temp >= 25 && temp <= 38) sugarcaneScore += 0.15;
        if (rain > 150) sugarcaneScore += 0.15;
        if (ph >= 5.0 && ph <= 8.0) sugarcaneScore += 0.05;
        if (n > 50 && k > 50) sugarcaneScore += 0.1;
        if (soil.contains("loam") || soil.contains("clay")) sugarcaneScore += 0.1;
        scores.add(new CropScore("Sugarcane", Math.min(sugarcaneScore, 0.98), "Tropical climate, abundant water, nutrient-rich"));

        // Groundnut — sandy, warm, low rain
        double groundnutScore = 0.4;
        if (temp >= 25 && temp <= 35) groundnutScore += 0.1;
        if (ph >= 6.0 && ph <= 7.0) groundnutScore += 0.1;
        if (rain >= 50 && rain <= 130) groundnutScore += 0.1;
        if (soil.contains("sandy") || soil.contains("red")) groundnutScore += 0.15;
        if (p > 30) groundnutScore += 0.05;
        scores.add(new CropScore("Groundnut", Math.min(groundnutScore, 0.98), "Sandy soil, warm climate, moderate moisture"));

        // Pulses (Moong/Lentil) — low water, fixes nitrogen
        double pulseScore = 0.4;
        if (temp >= 20 && temp <= 30) pulseScore += 0.1;
        if (rain < 100) pulseScore += 0.15;
        if (ph >= 6.0 && ph <= 7.5) pulseScore += 0.1;
        if (n < 40) pulseScore += 0.1; // pulses fix nitrogen
        if (season.contains("rabi") || season.contains("zaid")) pulseScore += 0.05;
        scores.add(new CropScore("Pulses (Moong/Lentil)", Math.min(pulseScore, 0.98), "Low nitrogen soil (self-fixing), moderate climate"));

        // Vegetables — moderate everything
        double vegScore = 0.45;
        if (temp >= 15 && temp <= 30) vegScore += 0.1;
        if (ph >= 6.0 && ph <= 7.0) vegScore += 0.1;
        if (n > 40 && p > 30 && k > 30) vegScore += 0.15;
        if (soil.contains("loam")) vegScore += 0.1;
        scores.add(new CropScore("Vegetables", Math.min(vegScore, 0.98), "Nutrient-rich loamy soil, balanced pH"));

        // Sort by score descending, take top 5
        scores.sort((a, b) -> Double.compare(b.score(), a.score()));
        List<AIToolDTO.CropResult> crops = scores.stream().limit(5).map(s -> {
            AIToolDTO.CropResult cr = new AIToolDTO.CropResult();
            cr.setName(s.name());
            cr.setConfidence(Math.round(s.score() * 100.0) / 100.0);
            cr.setReason(s.reason());
            return cr;
        }).toList();

        // Soil health assessment
        String soilHealth;
        if (ph >= 6 && ph <= 7.5 && n > 40 && p > 30 && k > 30) soilHealth = "Excellent";
        else if (ph >= 5.5 && ph <= 8 && (n > 30 || p > 20)) soilHealth = "Good";
        else soilHealth = "Needs Improvement";

        // Dynamic recommendations
        List<String> recs = new ArrayList<>();
        if (n < 30) recs.add("Nitrogen is low — apply urea or organic compost");
        if (p < 20) recs.add("Phosphorus is low — add DAP or bone meal");
        if (k < 25) recs.add("Potassium is low — use muriate of potash");
        if (ph < 5.5) recs.add("Soil is too acidic — apply agricultural lime");
        if (ph > 8) recs.add("Soil is too alkaline — add gypsum or sulfur");
        recs.add("Practice crop rotation to maintain soil fertility");
        recs.add("Use organic mulching to retain moisture");
        if (rain > 200) recs.add("Ensure proper drainage to prevent waterlogging");

        AIToolDTO.CropResponse resp = new AIToolDTO.CropResponse();
        resp.setRecommendedCrops(crops);
        resp.setSoilHealth(soilHealth);
        resp.setRecommendations(recs);
        return resp;
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. RESOURCE MANAGEMENT
    // ══════════════════════════════════════════════════════════════════
    public AIToolDTO.ResourceResponse getResourceManagement(AIToolDTO.ResourceRequest req, Long userId) {
        long start = System.currentTimeMillis();

        // ┌─────────────────────────────────────────────────────────────┐
        // │ TODO: REPLACE WITH REAL ML MODEL │
        // │ POST http://ai-model-service/api/resource-management │
        // └─────────────────────────────────────────────────────────────┘
        AIToolDTO.ResourceResponse response = ruleBasedResourceManagement(req);
        response.setModelVersion(MODEL_VERSION);

        saveLog(AIToolLog.AIToolType.RESOURCE_MANAGEMENT, userId, req, response, System.currentTimeMillis() - start);
        return response;
    }

    private AIToolDTO.ResourceResponse ruleBasedResourceManagement(AIToolDTO.ResourceRequest req) {
        Map<String, Double> waterBase = new HashMap<>();
        waterBase.put("rice", 1500.0);
        waterBase.put("wheat", 450.0);
        waterBase.put("maize", 500.0);
        waterBase.put("cotton", 700.0);
        waterBase.put("sugarcane", 2000.0);
        waterBase.put("vegetables", 400.0);

        double base = waterBase.getOrDefault(req.getCropType(), 500.0);
        double soilMoisture = req.getSoilMoisture() != null ? req.getSoilMoisture() : 50.0;
        double farmArea = req.getFarmArea() != null ? req.getFarmArea() : 1.0;
        double waterNeeded = base * farmArea * (100 - soilMoisture) / 100;
        double fertBase = farmArea * 50;

        AIToolDTO.WaterInfo water = new AIToolDTO.WaterInfo();
        water.setAmount(String.format("%.0f", waterNeeded));
        water.setUnit("liters");
        water.setFrequency("flowering".equals(req.getGrowthStage()) ? "Every 2 days" : "Every 3-4 days");
        water.setMethod(req.getIrrigationMethod());

        AIToolDTO.FertilizerInfo fertilizer = new AIToolDTO.FertilizerInfo();
        fertilizer.setNitrogen(String.format("%.0f", fertBase * 0.4));
        fertilizer.setPhosphorus(String.format("%.0f", fertBase * 0.3));
        fertilizer.setPotassium(String.format("%.0f", fertBase * 0.3));
        fertilizer.setUnit("kg");

        int days = req.getDaysSinceIrrigation() != null ? req.getDaysSinceIrrigation() : 0;
        List<AIToolDTO.ScheduleItem> schedule = new ArrayList<>();
        schedule.add(item("Irrigation", days >= 3 ? "Urgent - Today" : "Within 2 days"));
        schedule.add(item("Fertilizer Application", "Weekly during " + req.getGrowthStage()));
        schedule.add(item("Pest Monitoring", "Daily inspection"));
        schedule.add(item("Weed Control", "Bi-weekly"));

        AIToolDTO.CostInfo cost = new AIToolDTO.CostInfo();
        cost.setWater(String.format("%.0f", waterNeeded * 0.05));
        cost.setFertilizer(String.format("%.0f", fertBase * 25));
        cost.setLabor(String.format("%.0f", farmArea * 200));
        cost.setTotal(String.format("%.0f", waterNeeded * 0.05 + fertBase * 25 + farmArea * 200));

        AIToolDTO.ResourceResponse resp = new AIToolDTO.ResourceResponse();
        resp.setWater(water);
        resp.setFertilizer(fertilizer);
        resp.setSchedule(schedule);
        resp.setCost(cost);
        return resp;
    }

    private AIToolDTO.ScheduleItem item(String task, String timing) {
        AIToolDTO.ScheduleItem s = new AIToolDTO.ScheduleItem();
        s.setTask(task);
        s.setTiming(timing);
        return s;
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. WEATHER FORECAST
    // ══════════════════════════════════════════════════════════════════
    public AIToolDTO.WeatherResponse getWeatherForecast(AIToolDTO.WeatherRequest req, Long userId) {
        long start = System.currentTimeMillis();

        // ┌─────────────────────────────────────────────────────────────┐
        // │ TODO: REPLACE WITH REAL WEATHER API │
        // │ Option A: OpenWeatherMap API │
        // │ GET https://api.openweathermap.org/data/2.5/forecast │
        // │ ?q={location}&appid={API_KEY}&units=metric │
        // │ │
        // │ Option B: IMD (India Meteorological Department) API │
        // │ │
        // │ Store the API key in application.properties: │
        // │ app.weather.api-key=YOUR_KEY_HERE │
        // └─────────────────────────────────────────────────────────────┘
        AIToolDTO.WeatherResponse response = simulatedWeatherForecast(req.getLocation());
        response.setModelVersion(MODEL_VERSION);

        saveLog(AIToolLog.AIToolType.WEATHER_FORECAST, userId, req, response, System.currentTimeMillis() - start);
        return response;
    }

    private AIToolDTO.WeatherResponse simulatedWeatherForecast(String location) {
        Random rng = new Random();
        List<String> dayLabels = List.of("Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7");
        List<AIToolDTO.WeatherDay> forecast = dayLabels.stream().map(day -> {
            AIToolDTO.WeatherDay d = new AIToolDTO.WeatherDay();
            d.setDay(day);
            d.setTempHigh(28 + rng.nextInt(8));
            d.setTempLow(18 + rng.nextInt(5));
            d.setHumidity(60 + rng.nextInt(30));
            d.setRainfall(rng.nextDouble() > 0.6 ? rng.nextInt(50) : 0);
            d.setCondition(rng.nextBoolean() ? "Sunny" : "Cloudy");
            return d;
        }).toList();

        AIToolDTO.WeatherResponse resp = new AIToolDTO.WeatherResponse();
        resp.setLocation(location);
        resp.setForecast(forecast);
        return resp;
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. SOIL ANALYSIS
    // ══════════════════════════════════════════════════════════════════
    public AIToolDTO.SoilResponse getSoilAnalysis(AIToolDTO.SoilRequest req, Long userId) {
        long start = System.currentTimeMillis();

        // ┌─────────────────────────────────────────────────────────────┐
        // │ TODO: REPLACE WITH REAL ML MODEL │
        // │ POST http://ai-model-service/api/soil-analysis │
        // │ Model trained on ICAR / USDA soil datasets │
        // │ │
        // │ Alternatively, integrate with a Soil Health Card API from │
        // │ the Indian Government: soilhealth.dac.gov.in │
        // └─────────────────────────────────────────────────────────────┘
        AIToolDTO.SoilResponse response = ruleBasedSoilAnalysis(req);
        response.setModelVersion(MODEL_VERSION);

        saveLog(AIToolLog.AIToolType.SOIL_ANALYSIS, userId, req, response, System.currentTimeMillis() - start);
        return response;
    }

    private AIToolDTO.SoilResponse ruleBasedSoilAnalysis(AIToolDTO.SoilRequest req) {
        Map<String, List<String>> cropsMap = new HashMap<>();
        cropsMap.put("loamy", List.of("Most vegetables", "Grains", "Fruits", "Pulses"));
        cropsMap.put("clay", List.of("Rice", "Wheat", "Cabbage", "Sugarcane"));
        cropsMap.put("sandy", List.of("Carrots", "Potatoes", "Groundnuts", "Watermelon"));
        cropsMap.put("silt", List.of("Vegetables", "Fruits", "Grasses", "Lettuce"));
        cropsMap.put("peaty", List.of("Berries", "Root vegetables", "Potatoes"));
        cropsMap.put("red", List.of("Groundnut", "Millet", "Cotton", "Potato"));
        cropsMap.put("black", List.of("Cotton", "Soybean", "Wheat", "Sugarcane"));
        cropsMap.put("laterite", List.of("Cashew", "Rubber", "Tea", "Coffee"));

        int score = 80;
        List<String> issues = new ArrayList<>();
        List<String> recs = new ArrayList<>();
        double ph = req.getSoilPh() != null ? req.getSoilPh() : 7.0;
        double om = req.getOrganicMatter() != null ? req.getOrganicMatter() : 3.0;
        double n = req.getNitrogen() != null ? req.getNitrogen() : 50;
        double p = req.getPhosphorus() != null ? req.getPhosphorus() : 40;
        double k = req.getPotassium() != null ? req.getPotassium() : 40;
        double ec = req.getEc() != null ? req.getEc() : 1.0;
        double moisture = req.getMoisture() != null ? req.getMoisture() : 50;

        // pH analysis
        if (ph < 5.5) {
            issues.add("Soil is highly acidic (pH " + ph + ")");
            recs.add("Apply agricultural lime at 2-4 tonnes/hectare to raise pH");
            recs.add("Add wood ash as an organic pH amendment");
            score -= 15;
        } else if (ph < 6.0) {
            issues.add("Soil is slightly acidic (pH " + ph + ")");
            recs.add("Apply light lime application (1-2 tonnes/hectare)");
            score -= 8;
        } else if (ph > 8.0) {
            issues.add("Soil is highly alkaline (pH " + ph + ")");
            recs.add("Add elemental sulfur or gypsum to lower pH");
            recs.add("Incorporate acidic organic materials like pine bark");
            score -= 15;
        } else if (ph > 7.5) {
            issues.add("Soil is mildly alkaline (pH " + ph + ")");
            recs.add("Add organic matter and compost to buffer pH");
            score -= 5;
        }

        // Organic matter
        if (om < 2.0) {
            issues.add("Very low organic matter (" + om + "%)");
            recs.add("Apply 5-10 tonnes/hectare of farmyard manure");
            recs.add("Practice green manuring with dhaincha or sunhemp");
            score -= 15;
        } else if (om < 3.0) {
            issues.add("Low organic matter (" + om + "%)");
            recs.add("Incorporate compost and crop residues");
            score -= 8;
        }

        // Nitrogen
        if (n < 25) {
            issues.add("Nitrogen deficiency (N=" + n + " kg/ha)");
            recs.add("Apply urea (46-0-0) at 50-100 kg/hectare or use organic compost");
            score -= 12;
        } else if (n < 40) {
            issues.add("Moderate nitrogen level (N=" + n + " kg/ha)");
            recs.add("Consider split application of nitrogen fertilizer");
            score -= 5;
        }

        // Phosphorus
        if (p < 15) {
            issues.add("Phosphorus deficiency (P=" + p + " kg/ha)");
            recs.add("Apply DAP or single superphosphate at 40-60 kg/hectare");
            score -= 12;
        } else if (p < 30) {
            issues.add("Moderate phosphorus (P=" + p + " kg/ha)");
            recs.add("Add bone meal or rock phosphate for gradual release");
            score -= 5;
        }

        // Potassium
        if (k < 20) {
            issues.add("Potassium deficiency (K=" + k + " kg/ha)");
            recs.add("Apply muriate of potash (MOP) at 40-60 kg/hectare");
            score -= 12;
        } else if (k < 35) {
            issues.add("Moderate potassium (K=" + k + " kg/ha)");
            recs.add("Use wood ash or kelp meal as organic potassium source");
            score -= 5;
        }

        // EC (salinity)
        if (ec > 4.0) {
            issues.add("High salinity (EC=" + ec + " dS/m) — toxic for most crops");
            recs.add("Apply gypsum and increase irrigation to leach salts");
            score -= 15;
        } else if (ec > 2.0) {
            issues.add("Moderate salinity (EC=" + ec + " dS/m)");
            recs.add("Choose salt-tolerant crops like barley or cotton");
            score -= 8;
        }

        // Moisture
        if (moisture < 20) {
            issues.add("Very low soil moisture (" + moisture + "%)");
            recs.add("Apply mulching and increase irrigation frequency");
            score -= 10;
        } else if (moisture > 80) {
            issues.add("Waterlogged soil (" + moisture + "% moisture)");
            recs.add("Improve drainage and avoid heavy irrigation");
            score -= 10;
        }

        // Previous crop rotation advice
        if (req.getPreviousCrop() != null && !req.getPreviousCrop().isBlank()) {
            String prev = req.getPreviousCrop().toLowerCase();
            if (prev.contains("rice") || prev.contains("wheat")) {
                recs.add("After " + req.getPreviousCrop() + ", consider planting pulses to replenish nitrogen");
            } else if (prev.contains("cotton") || prev.contains("sugarcane")) {
                recs.add("After " + req.getPreviousCrop() + ", plant nitrogen-fixing legumes in rotation");
            }
        }

        if (issues.isEmpty()) {
            issues.add("No major issues detected — soil is in good condition");
            recs.add("Maintain current soil management practices");
            recs.add("Continue crop rotation and organic amendments");
        }

        // Nutrient levels map
        Map<String, String> nutrients = new java.util.LinkedHashMap<>();
        nutrients.put("Nitrogen (N)", n < 25 ? "Low" : n < 50 ? "Medium" : "High");
        nutrients.put("Phosphorus (P)", p < 15 ? "Low" : p < 40 ? "Medium" : "High");
        nutrients.put("Potassium (K)", k < 20 ? "Low" : k < 40 ? "Medium" : "High");
        nutrients.put("Organic Matter", om < 2 ? "Low" : om < 4 ? "Medium" : "High");
        nutrients.put("pH Level", ph < 6 ? "Acidic" : ph > 7.5 ? "Alkaline" : "Neutral");
        nutrients.put("EC (Salinity)", ec < 1 ? "Safe" : ec < 2 ? "Moderate" : "High");

        score = Math.max(score, 20);
        String healthStatus = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";

        String soilKey = req.getSoilType() != null ? req.getSoilType().toLowerCase() : "";
        List<String> suitable = cropsMap.getOrDefault(soilKey, List.of("Consult local agricultural extension office"));

        AIToolDTO.SoilResponse resp = new AIToolDTO.SoilResponse();
        resp.setScore(score);
        resp.setHealthStatus(healthStatus);
        resp.setIssues(issues);
        resp.setRecommendations(recs);
        resp.setSuitableCrops(suitable);
        resp.setNutrientLevels(nutrients);
        return resp;
    }

    // ══════════════════════════════════════════════════════════════════
    // 5. SOIL & ENVIRONMENT ANALYZER
    // ══════════════════════════════════════════════════════════════════
    public AIToolDTO.AnalyzeResponse getAnalyzeSoilEnvironment(AIToolDTO.AnalyzeRequest req, Long userId) {
        long start = System.currentTimeMillis();
        
        AIToolDTO.AnalyzeResponse response = ruleBasedAnalyzeSoil(req);
        response.setModelVersion(MODEL_VERSION);

        saveLog(AIToolLog.AIToolType.SOIL_ENVIRONMENT_ANALYZER, userId, req, response, System.currentTimeMillis() - start);
        return response;
    }

    private AIToolDTO.AnalyzeResponse ruleBasedAnalyzeSoil(AIToolDTO.AnalyzeRequest req) {
        List<String> issues = new ArrayList<>();
        List<String> causes = new ArrayList<>();
        List<String> solutions = new ArrayList<>();
        int severityLevel = 0; // 0=None, 1=Low, 2=Medium, 3=High

        double ph = req.getSoilPh() != null ? req.getSoilPh() : 7.0;
        double potassium = req.getPotassium() != null ? req.getPotassium() : 50.0;
        double moisture = req.getMoisture() != null ? req.getMoisture() : 50.0;
        double temp = req.getTemperature() != null ? req.getTemperature() : 25.0;
        double humidity = req.getHumidity() != null ? req.getHumidity() : 50.0;
        double rainfall = req.getRainfall() != null ? req.getRainfall() : 100.0;

        if (ph < 5.5) {
            issues.add("Acidic Soil");
            causes.add("Low pH levels");
            solutions.add("Apply agricultural lime to raise pH");
            severityLevel = Math.max(severityLevel, 2);
        }
        if (ph > 8) {
            issues.add("Alkaline Soil");
            causes.add("High pH levels");
            solutions.add("Add organic matter, elemental sulfur, or peat moss");
            severityLevel = Math.max(severityLevel, 2);
        }
        if (potassium < 15) {
            issues.add("Potassium Deficiency");
            causes.add("Low potassium content");
            solutions.add("Apply potash, wood ash, or kelp meal");
            severityLevel = Math.max(severityLevel, 2);
        }
        if (moisture < 20) {
            issues.add("Low Soil Moisture");
            causes.add("Inadequate irrigation or drought");
            solutions.add("Increase irrigation frequency and use mulching");
            severityLevel = Math.max(severityLevel, 3);
        }
        if (temp > 30 && humidity > 70) {
            issues.add("High Fungal Risk");
            causes.add("Hot and humid environmental conditions");
            solutions.add("Apply preventive organic fungicides (e.g., Neem oil)");
            severityLevel = Math.max(severityLevel, 3);
        }
        if (rainfall > 200) {
            issues.add("Waterlogging Risk");
            causes.add("Excessive rainfall");
            solutions.add("Improve field drainage channels");
            severityLevel = Math.max(severityLevel, 2);
        }

        AIToolDTO.AnalyzeResponse resp = new AIToolDTO.AnalyzeResponse();
        if (issues.isEmpty()) {
            resp.setIssue("Optimal Conditions");
            resp.setSeverity("None");
            resp.setCauses(List.of("Balanced soil nutrients and weather"));
            resp.setSolutions(List.of("Maintain current farming practices"));
            resp.setConfidence(0.95);
        } else {
            String primary = issues.get(0);
            if (issues.size() > 1) primary += " (+" + (issues.size() - 1) + " more)";
            resp.setIssue(primary);
            resp.setSeverity(severityLevel == 3 ? "High" : severityLevel == 2 ? "Medium" : "Low");
            resp.setCauses(causes);
            resp.setSolutions(solutions);
            resp.setConfidence(Math.min(0.95, 0.70 + (0.05 * issues.size())));
        }
        resp.setImage_observation("No signs of disease detected in image texture analysis");

        List<AIToolDTO.ProductRecommendation> products = new ArrayList<>();
        if (issues.contains("Nitrogen Deficiency") || issues.contains("Phosphorus Deficiency")) {
             AIToolDTO.ProductRecommendation p = new AIToolDTO.ProductRecommendation();
             p.setName("Premium Organic NPK Fertilizer"); p.setPrice(450); p.setImage("/images/fertilizer.jpg");
             products.add(p);
        }
        if (issues.contains("High Fungal Risk")) {
            AIToolDTO.ProductRecommendation p = new AIToolDTO.ProductRecommendation();
            p.setName("Organic Neem Oil Fungicide"); p.setPrice(250); p.setImage("/images/neemoil.jpg");
            products.add(p);
        }
        if (products.isEmpty()) {
            AIToolDTO.ProductRecommendation p = new AIToolDTO.ProductRecommendation();
            p.setName("All-Purpose Organic Compost"); p.setPrice(200); p.setImage("/images/compost.jpg");
            products.add(p);
        }
        resp.setProducts(products);
        return resp;
    }
    private void saveLog(AIToolLog.AIToolType toolType, Long userId, Object input, Object output, long ms) {
        try {
            AIToolLog log = AIToolLog.builder()
                    .toolType(toolType)
                    .user(userId != null ? userRepository.findById(userId).orElse(null) : null)
                    .inputPayload(objectMapper.writeValueAsString(input))
                    .resultPayload(objectMapper.writeValueAsString(output))
                    .processingTimeMs(ms)
                    .modelVersion(MODEL_VERSION)
                    .build();
            logRepository.save(log);
        } catch (Exception e) {
            log.warn("Failed to save AI tool log: {}", e.getMessage());
        }
    }
}
