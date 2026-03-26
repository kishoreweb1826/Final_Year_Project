package com.organicfarm.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Stores AI Tool query logs for analytics and future ML model training.
 * Each row tracks one request (tool type, inputs, and the result summary).
 *
 * NOTE: The actual AI inference is handled by the service layer.
 * This table acts as an audit log and leaves space for plugging in
 * real ML models (e.g. Python microservice) in the future.
 */
@Entity
@Table(name = "ai_tool_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIToolLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Which tool was used */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AIToolType toolType;

    /** FK to logged-in user (nullable for anonymous usage) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /** JSON-serialized input parameters */
    @Column(columnDefinition = "TEXT")
    private String inputPayload;

    /** JSON-serialized result / recommendation */
    @Column(columnDefinition = "TEXT")
    private String resultPayload;

    /** Processing time in milliseconds */
    private Long processingTimeMs;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ─── Placeholder for future real model metadata ──────────
    /** Version of the AI model used (e.g. "rule-based-v1", "ml-model-v2") */
    @Column(length = 50)
    @Builder.Default
    private String modelVersion = "rule-based-v1";

    public enum AIToolType {
        CROP_RECOMMENDATION,
        RESOURCE_MANAGEMENT,
        WEATHER_FORECAST,
        SOIL_ANALYSIS
        // Add more AI tools here as they are integrated
    }
}
