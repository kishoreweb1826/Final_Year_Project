package com.organicfarm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request body DTOs for authentication endpoints.
 * AuthResponse now includes emailVerified so the frontend
 * can redirect to OTP screen immediately after registration.
 */
public class AuthDTO {

    @Data
    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 6)
        private String password;

        private boolean rememberMe;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        @Size(max = 100)
        private String name;

        @NotBlank
        @Email
        @Size(max = 150)
        private String email;

        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit phone number")
        private String phone;

        @NotBlank
        @Size(min = 8, max = 100)
        private String password;

        @NotBlank
        private String confirmPassword;

        @NotBlank
        private String userType; // "customer" or "farmer"
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private Long id;
        private String name;
        private String email;
        private String role;
        private boolean emailVerified;

        public AuthResponse(String token, Long id, String name, String email,
                            String role, boolean emailVerified) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.emailVerified = emailVerified;
        }
    }
}
