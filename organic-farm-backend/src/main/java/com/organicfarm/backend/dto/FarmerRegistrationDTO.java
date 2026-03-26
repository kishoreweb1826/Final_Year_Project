package com.organicfarm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for farmer registration form submission
 */
@Data
public class FarmerRegistrationDTO {

    // Personal Info
    @NotBlank
    @Size(max = 80)
    private String firstName;

    @NotBlank
    @Size(max = 80)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit phone number")
    private String phone;

    // Farm Info
    @NotBlank
    private String farmName;

    @NotBlank
    private String farmAddress;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    @Pattern(regexp = "^\\d{6}$", message = "Enter a valid 6-digit pincode")
    private String pincode;

    @DecimalMin("0.1")
    private BigDecimal farmSize;

    private List<String> cropTypes;

    // Certification
    @NotBlank
    private String certificationNumber;

    private LocalDate certificationDate;

    @NotBlank
    private String certifyingAuthority;

    // Bank Details
    private String bankName;
    private String accountNumber;

    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format")
    private String ifscCode;

    private String accountHolderName;
}
