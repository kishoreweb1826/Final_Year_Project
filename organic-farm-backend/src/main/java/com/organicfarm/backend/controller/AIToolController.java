package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.AIToolDTO;
import com.organicfarm.backend.security.UserDetailsImpl;
import com.organicfarm.backend.service.AIToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

/**
 * AI Tools REST API
 *
 * All endpoints are public (no auth required) so farmers can use them
 * without logging in. However, if a user IS logged in, their userId
 * is captured and stored in the ai_tool_logs table for analytics.
 *
 * API Base: /api/ai-tools
 */
@RestController
@RequestMapping("/api/ai-tools")
@RequiredArgsConstructor
public class AIToolController {

    private final AIToolService aiToolService;

    /**
     * POST /api/ai-tools/crop-recommendation
     * Input: soil NPK, temperature, humidity, pH, rainfall, location
     * Returns: ranked crop recommendations with confidence scores
     */
    @PostMapping("/crop-recommendation")
    public ResponseEntity<AIToolDTO.CropResponse> cropRecommendation(
            @RequestBody AIToolDTO.CropRequest req,
            @AuthenticationPrincipal UserDetailsImpl user) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(aiToolService.getCropRecommendation(req, userId));
    }

    /**
     * POST /api/ai-tools/resource-management
     * Input: crop type, farm area, growth stage, soil moisture, irrigation details
     * Returns: water/fertilizer requirements, farm schedule, cost estimate
     */
    @PostMapping("/resource-management")
    public ResponseEntity<AIToolDTO.ResourceResponse> resourceManagement(
            @RequestBody AIToolDTO.ResourceRequest req,
            @AuthenticationPrincipal UserDetailsImpl user) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(aiToolService.getResourceManagement(req, userId));
    }

    /**
     * POST /api/ai-tools/weather-forecast
     * Input: location string
     * Returns: 7-day weather forecast
     *
     * NOTE: Currently returns simulated data.
     * Replace with real weather API in AIToolService.simulatedWeatherForecast()
     */
    @PostMapping("/weather-forecast")
    public ResponseEntity<AIToolDTO.WeatherResponse> weatherForecast(
            @RequestBody AIToolDTO.WeatherRequest req,
            @AuthenticationPrincipal UserDetailsImpl user) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(aiToolService.getWeatherForecast(req, userId));
    }

    /**
     * POST /api/ai-tools/soil-analysis
     * Input: soil type, organic matter %, pH, EC, CEC, previous crop
     * Returns: soil health score, issues, recommendations, suitable crops
     */
    @PostMapping("/soil-analysis")
    public ResponseEntity<AIToolDTO.SoilResponse> soilAnalysis(
            @RequestBody AIToolDTO.SoilRequest req,
            @AuthenticationPrincipal UserDetailsImpl user) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(aiToolService.getSoilAnalysis(req, userId));
    }

    /**
     * POST /api/ai-tools/analyze
     * Comprehensive soil and environment analysis
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AIToolDTO.AnalyzeResponse> analyze(
            AIToolDTO.AnalyzeRequest req,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl user) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(aiToolService.getAnalyzeSoilEnvironment(req, userId));
    }
}
