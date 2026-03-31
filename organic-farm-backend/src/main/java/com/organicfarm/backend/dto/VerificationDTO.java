package com.organicfarm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTOs for the email verification flow (send OTP, verify OTP, resend OTP).
 */
public class VerificationDTO {

    /** Request body for POST /api/verification/send */
    @Data
    public static class SendRequest {
        @NotBlank
        @Email
        @Size(max = 150)
        private String email;
    }

    /** Request body for POST /api/verification/verify */
    @Data
    public static class VerifyRequest {
        @NotBlank
        @Email
        @Size(max = 150)
        private String email;

        @NotBlank
        @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
        @Pattern(regexp = "\\d{6}", message = "OTP must be exactly 6 digits")
        private String otp;
    }

    /** Generic API response message */
    @Data
    public static class MessageResponse {
        private final String message;
        private final boolean success;
        private Long cooldownSeconds; // seconds until user may resend again

        public MessageResponse(String message, boolean success) {
            this.message = message;
            this.success = success;
        }
    }

    /** Verification status response */
    @Data
    public static class StatusResponse {
        private final boolean emailVerified;
        private final String email;
    }
}
