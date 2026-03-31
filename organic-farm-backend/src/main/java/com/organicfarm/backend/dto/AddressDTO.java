package com.organicfarm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTOs used by AddressController
 */
public class AddressDTO {

    @Data
    public static class SaveRequest {
        @NotBlank
        @Size(max = 100)
        private String fullName;

        @NotBlank
        private String addressLine;

        @NotBlank
        @Size(max = 100)
        private String city;

        @Size(max = 100)
        private String state;

        @Size(max = 10)
        private String pincode;

        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
        private String phone;

        private boolean isDefault;
    }

    @Data
    public static class Response {
        private Long id;
        private String fullName;
        private String addressLine;
        private String city;
        private String state;
        private String pincode;
        private String phone;
        private boolean isDefault;
        private LocalDateTime createdAt;
    }
}
