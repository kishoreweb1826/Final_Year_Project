package com.organicfarm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Data Transfer Objects for administrative operations.
 */
public class AdminDTO {

    /**
     * Payload for rejecting a farmer registration.
     */
    @Data
    public static class RejectRequest {
        @NotBlank(message = "Rejection reason is required")
        private String reason;
    }
}
