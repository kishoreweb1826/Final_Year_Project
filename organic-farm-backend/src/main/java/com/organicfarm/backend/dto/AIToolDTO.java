package com.organicfarm.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * DTOs for all AI Tool endpoints.
 *
 * Each inner class represents one AI tool's request/response.
 * The service layer currently uses rule-based logic.
 * TODO: Replace with real ML model calls (e.g. Python microservice via REST)
 */
public class AIToolDTO {

    // ─── Crop Recommendation ─────────────────────────────────

    @Data
    public static class CropRequest {
        private Double nitrogen;
        private Double phosphorus;
        private Double potassium;
        private Double temperature;
        private Double humidity;
        private Double ph;
        private Double rainfall;
        private String location;
    }

    @Data
    public static class CropResult {
        private String name;
        private Double confidence;
        private String reason;
    }

    @Data
    public static class CropResponse {
        private List<CropResult> recommendedCrops;
        private String soilHealth;
        private List<String> recommendations;
        private String modelVersion;

        // ═══════════════════════════════════════════════════════
        // PLACEHOLDER: Future AI Model Integration Point
        // Replace rule-based logic in AIToolService with a call to:
        // POST http://ai-model-service/api/crop-recommendation
        // Pass CropRequest, receive this CropResponse
        // ═══════════════════════════════════════════════════════
    }

    // ─── Resource Management ──────────────────────────────────

    @Data
    public static class ResourceRequest {
        private String cropType;
        private Double farmArea;
        private String growthStage;
        private Double soilMoisture;
        private Integer daysSinceIrrigation;
        private String irrigationMethod;
    }

    @Data
    public static class WaterInfo {
        private String amount;
        private String unit;
        private String frequency;
        private String method;
    }

    @Data
    public static class FertilizerInfo {
        private String nitrogen;
        private String phosphorus;
        private String potassium;
        private String unit;
    }

    @Data
    public static class ScheduleItem {
        private String task;
        private String timing;
    }

    @Data
    public static class CostInfo {
        private String water;
        private String fertilizer;
        private String labor;
        private String total;
    }

    @Data
    public static class ResourceResponse {
        private WaterInfo water;
        private FertilizerInfo fertilizer;
        private List<ScheduleItem> schedule;
        private CostInfo cost;
        private String modelVersion;

        // ═══════════════════════════════════════════════════════
        // PLACEHOLDER: Future AI Model Integration Point
        // Replace rule-based calculation with ML model call
        // ═══════════════════════════════════════════════════════
    }

    // ─── Weather Forecast ─────────────────────────────────────

    @Data
    public static class WeatherRequest {
        private String location;
    }

    @Data
    public static class WeatherDay {
        private String day;
        private Integer tempHigh;
        private Integer tempLow;
        private Integer humidity;
        private Integer rainfall;
        private String condition;
    }

    @Data
    public static class WeatherResponse {
        private String location;
        private List<WeatherDay> forecast;
        private String modelVersion;

        // ═══════════════════════════════════════════════════════
        // PLACEHOLDER: Future AI Model Integration Point
        // Integrate with a real Weather API (e.g. OpenWeatherMap)
        // or an ML forecast model
        // ═══════════════════════════════════════════════════════
    }

    // ─── Soil Analysis ────────────────────────────────────────

    @Data
    public static class SoilRequest {
        private String soilType;
        private Double organicMatter;
        private Double soilPh;
        private Double ec;
        private Double cec;
        private String previousCrop;
    }

    @Data
    public static class SoilResponse {
        private Integer score;
        private List<String> issues;
        private List<String> recommendations;
        private List<String> suitableCrops;
        private String modelVersion;

        // ═══════════════════════════════════════════════════════
        // PLACEHOLDER: Future AI Model Integration Point
        // Integrate with soil analysis ML model trained on
        // agronomic datasets (USDA, ICAR, etc.)
        // ═══════════════════════════════════════════════════════
    }
}
