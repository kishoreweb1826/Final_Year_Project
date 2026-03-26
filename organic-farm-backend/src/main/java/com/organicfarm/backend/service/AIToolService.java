package com.organicfarm.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.organicfarm.backend.dto.AIToolDTO;
import com.organicfarm.backend.model.AIToolLog;
import com.organicfarm.backend.model.User;
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
        List<AIToolDTO.CropResult> crops = new ArrayList<>();
        crops.add(new AIToolDTO.CropResult());
        crops.get(0).setName("Rice");
        crops.get(0).setConfidence(0.92);
        crops.get(0).setReason("Optimal NPK ratio and high rainfall");

        AIToolDTO.CropResult w = new AIToolDTO.CropResult();
        w.setName("Wheat");
        w.setConfidence(0.75);
        w.setReason("Good temperature and pH levels");
        AIToolDTO.CropResult c = new AIToolDTO.CropResult();
        c.setName("Cotton");
        c.setConfidence(0.68);
        c.setReason("Suitable climate conditions");
        crops.add(w);
        crops.add(c);

        if (req.getRainfall() != null && req.getRainfall() > 200) {
            crops.get(0).setConfidence(0.95);
            crops.get(0).setReason("High rainfall ideal for rice");
        } else if (req.getTemperature() != null && req.getTemperature() < 25) {
            crops.set(0, w);
            w.setConfidence(0.90);
            w.setReason("Cool temperature perfect for wheat");
        } else if (req.getPh() != null && req.getPh() > 7) {
            crops.set(0, c);
            c.setConfidence(0.88);
            c.setReason("Alkaline soil suits cotton");
        }
        crops.sort(Comparator.comparingDouble(AIToolDTO.CropResult::getConfidence).reversed());

        String soilHealth = (req.getPh() != null && req.getPh() >= 6 && req.getPh() <= 7.5)
                ? "Good"
                : "Needs Improvement";

        AIToolDTO.CropResponse resp = new AIToolDTO.CropResponse();
        resp.setRecommendedCrops(crops.subList(0, Math.min(3, crops.size())));
        resp.setSoilHealth(soilHealth);
        resp.setRecommendations(List.of(
                "Consider crop rotation for better soil health",
                "Monitor pH levels regularly",
                "Use organic fertilizers to maintain soil quality"));
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
        cropsMap.put("loamy", List.of("Most vegetables", "Grains", "Fruits"));
        cropsMap.put("clay", List.of("Rice", "Wheat", "Cabbage"));
        cropsMap.put("sandy", List.of("Carrots", "Potatoes", "Groundnuts"));
        cropsMap.put("silt", List.of("Vegetables", "Fruits", "Grasses"));
        cropsMap.put("peaty", List.of("Berries", "Root vegetables"));

        int score = 70;
        List<String> issues = new ArrayList<>();
        List<String> recs = new ArrayList<>();
        double ph = req.getSoilPh() != null ? req.getSoilPh() : 7.0;
        double om = req.getOrganicMatter() != null ? req.getOrganicMatter() : 3.0;

        if (ph < 6) {
            issues.add("Soil is acidic");
            recs.add("Add lime to increase pH");
            score -= 10;
        } else if (ph > 7.5) {
            issues.add("Soil is alkaline");
            recs.add("Add sulfur/organic matter to decrease pH");
            score -= 10;
        }
        if (om < 3) {
            issues.add("Low organic matter content");
            recs.add("Incorporate compost and green manure");
            score -= 15;
        }
        if (issues.isEmpty()) {
            issues.add("No major issues detected");
            recs.add("Soil health is good — maintain current practices");
            recs.add("Continue crop rotation");
        }

        AIToolDTO.SoilResponse resp = new AIToolDTO.SoilResponse();
        resp.setScore(Math.max(score, 40));
        resp.setIssues(issues);
        resp.setRecommendations(recs);
        resp.setSuitableCrops(cropsMap.getOrDefault(req.getSoilType(), List.of("Consult agricultural expert")));
        return resp;
    }

    // ── Audit Logging ─────────────────────────────────────────────────
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
