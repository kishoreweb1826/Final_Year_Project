package com.organicfarm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for the Contact page message form
 */
@Data
public class ContactMessageDTO {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @Size(max = 15)
    private String phone;

    @NotBlank
    @Size(max = 50)
    private String subject;

    @NotBlank
    @Size(min = 10, max = 3000)
    private String message;

    private boolean consent;
}
